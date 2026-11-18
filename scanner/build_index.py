#!/usr/bin/env python3
"""Build a resumable, license-filtered Egyptian-art image index."""

from __future__ import annotations

import argparse
import hashlib
import json
import logging
import os
import re
import sqlite3
import time
from dataclasses import asdict, dataclass
from pathlib import Path
from typing import Any, Iterator
from urllib.parse import unquote, urlparse

import requests

ROOT = Path(__file__).resolve().parent
DEFAULT_OUTPUT = ROOT / "index_data"
MODEL_NAME = "ViT-B-32"
MODEL_WEIGHTS = "laion2b_s34b_b79k"
USER_AGENT = "ATHARA-FreeHeritageIndex/1.0 (open-access research; contact: local project)"
MAX_IMAGE_BYTES = 12_000_000
REQUEST_TIMEOUT = (8, 30)

COMMONS_CATEGORIES = (
    ("Category:Ancient Egyptian art", 1),
    ("Category:Ancient Egyptian artifacts", 1),
    ("Category:Ancient Egyptian culture", 1),
    ("Category:Ancient Egyptian funerary art", 1),
    ("Category:Ancient Egyptian mummies", 1),
    ("Category:Ancient Egyptian sarcophagi", 1),
    ("Category:Ancient Egyptian coffins", 1),
    ("Category:Ancient Egyptian tools", 1),
    ("Category:Ancient Egyptian temples", 1),
    ("Category:Ancient Egyptian architecture", 1),
    ("Category:Ancient Egyptian reliefs", 1),
    ("Category:Ancient Egyptian sculpture", 1),
    ("Category:Pharaohs", 1),
    ("Category:Egyptian temples", 1),
    ("Category:Valley of the Kings", 1),
    ("Category:Karnak Temple", 1),
    ("Category:Luxor Temple", 1),
    ("Category:Abu Simbel temples", 1),
    ("Category:Memphis and its Necropolis", 1),
    ("Category:Egyptian Museum (Cairo)", 1),
)
COMMONS_MAX_CATEGORIES = 4_000
COMMONS_SUBCATEGORY_DEPTH = 2
ALLOWED_LICENSE_TERMS = ("cc0", "ccby", "ccbysa", "publicdomain", "pdold", "pdus", "pdegypt")

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
LOG = logging.getLogger("athara-index")


@dataclass
class ArtifactRecord:
    record_id: str
    entity_id: str
    title_en: str
    title_ar: str
    object_type: str
    institution: str
    city: str
    country: str
    accession_number: str
    period: str
    description: str
    page_url: str
    source: str
    license: str
    license_url: str
    image_url: str

    def to_json(self) -> str:
        return json.dumps(asdict(self), ensure_ascii=False, separators=(",", ":"))


class RequestGate:
    def __init__(self, delay: float) -> None:
        self.delay = max(0.0, delay)
        self.last_request = 0.0

    def wait(self) -> None:
        elapsed = time.monotonic() - self.last_request
        if elapsed < self.delay:
            time.sleep(self.delay - elapsed)
        self.last_request = time.monotonic()


class IndexStore:
    def __init__(self, path: Path) -> None:
        path.parent.mkdir(parents=True, exist_ok=True)
        self.db = sqlite3.connect(path)
        self.db.execute("PRAGMA journal_mode=WAL")
        self.db.execute("PRAGMA synchronous=NORMAL")
        self.db.executescript(
            """
            CREATE TABLE IF NOT EXISTS artifacts (
                record_id TEXT PRIMARY KEY,
                entity_id TEXT NOT NULL,
                image_url TEXT NOT NULL,
                metadata_json TEXT NOT NULL,
                embedding BLOB NOT NULL,
                embedding_dim INTEGER NOT NULL,
                updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            );
            CREATE INDEX IF NOT EXISTS artifacts_entity_id ON artifacts(entity_id);
            CREATE TABLE IF NOT EXISTS checkpoints (
                source TEXT PRIMARY KEY,
                cursor_json TEXT NOT NULL,
                updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            );
            CREATE TABLE IF NOT EXISTS failures (
                failure_key TEXT PRIMARY KEY,
                source TEXT NOT NULL,
                url TEXT NOT NULL,
                reason TEXT NOT NULL,
                attempts INTEGER NOT NULL DEFAULT 1,
                updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            );
            """
        )
        self.db.commit()

    def has_record(self, record_id: str) -> bool:
        return self.db.execute("SELECT 1 FROM artifacts WHERE record_id=?", (record_id,)).fetchone() is not None

    def save_record(self, record: ArtifactRecord, vector: Any) -> None:
        import numpy as np

        vector = np.asarray(vector, dtype=np.float32).reshape(-1)
        self.db.execute(
            """INSERT OR REPLACE INTO artifacts
            (record_id, entity_id, image_url, metadata_json, embedding, embedding_dim)
            VALUES (?, ?, ?, ?, ?, ?)""",
            (record.record_id, record.entity_id, record.image_url, record.to_json(), vector.tobytes(), vector.size),
        )
        self.db.commit()

    def checkpoint(self, source: str, cursor: dict[str, Any]) -> None:
        self.db.execute(
            "INSERT OR REPLACE INTO checkpoints(source,cursor_json,updated_at) VALUES(?,?,CURRENT_TIMESTAMP)",
            (source, json.dumps(cursor, ensure_ascii=False)),
        )
        self.db.commit()

    def get_checkpoint(self, source: str) -> dict[str, Any]:
        row = self.db.execute("SELECT cursor_json FROM checkpoints WHERE source=?", (source,)).fetchone()
        return json.loads(row[0]) if row else {}

    def save_failure(self, source: str, url: str, reason: str) -> None:
        key = hashlib.sha256(f"{source}\n{url}".encode()).hexdigest()
        self.db.execute(
            """INSERT INTO failures(failure_key,source,url,reason) VALUES(?,?,?,?)
            ON CONFLICT(failure_key) DO UPDATE SET reason=excluded.reason,
            attempts=failures.attempts+1, updated_at=CURRENT_TIMESTAMP""",
            (key, source, url, reason[:1000]),
        )
        self.db.commit()

    def close(self) -> None:
        self.db.close()


class IndexBuilder:
    def __init__(self, output: Path, device: str, delay: float, max_items: int | None) -> None:
        self.output = output
        self.output.mkdir(parents=True, exist_ok=True)
        self.store = IndexStore(output / "metadata.sqlite")
        self.session = requests.Session()
        self.session.headers.update({"User-Agent": USER_AGENT, "Accept": "application/json"})
        self.gate = RequestGate(delay)
        self.max_items = max_items
        self.seen_this_run = 0
        self._load_model(device)

    def _load_model(self, requested_device: str) -> None:
        import open_clip
        import torch

        self.device = "cuda" if requested_device == "auto" and torch.cuda.is_available() else requested_device
        if self.device == "auto":
            self.device = "cpu"
        self.model, _, self.preprocess = open_clip.create_model_and_transforms(
            MODEL_NAME, pretrained=MODEL_WEIGHTS, device=self.device
        )
        self.model.eval()
        LOG.info("OpenCLIP %s (%s) ready on %s", MODEL_NAME, MODEL_WEIGHTS, self.device)

    def get_json(self, url: str, params: dict[str, Any] | None = None) -> dict[str, Any]:
        last_error: Exception | None = None
        for attempt in range(4):
            self.gate.wait()
            try:
                response = self.session.get(url, params=params, timeout=REQUEST_TIMEOUT)
                if response.status_code in (429, 500, 502, 503, 504):
                    wait = min(30, int(response.headers.get("Retry-After", 2 ** attempt)))
                    LOG.warning("HTTP %s from %s; retrying in %ss", response.status_code, response.url, wait)
                    time.sleep(wait)
                    continue
                response.raise_for_status()
                return response.json()
            except (requests.RequestException, ValueError) as error:
                last_error = error
                if attempt < 3:
                    time.sleep(min(20, 2 ** attempt))
        raise RuntimeError(f"GET {url} failed after retries: {last_error}") from last_error

    def add_record(self, record: ArtifactRecord) -> bool:
        if self.store.has_record(record.record_id):
            return False
        try:
            self.gate.wait()
            response = self.session.get(record.image_url, timeout=REQUEST_TIMEOUT, stream=True)
            response.raise_for_status()
            content_type = response.headers.get("Content-Type", "").split(";", 1)[0].lower()
            if not content_type.startswith("image/"):
                raise ValueError(f"unexpected image content type: {content_type or 'missing'}")
            chunks = bytearray()
            for chunk in response.iter_content(64 * 1024):
                chunks.extend(chunk)
                if len(chunks) > MAX_IMAGE_BYTES:
                    raise ValueError("image exceeds 12 MB limit")
            if not chunks:
                raise ValueError("empty image response")
            from PIL import Image
            import numpy as np
            import torch

            with Image.open(bytes_view(chunks)) as image:
                image = image.convert("RGB")
                image.thumbnail((1024, 1024), Image.Resampling.LANCZOS)
                tensor = self.preprocess(image).unsqueeze(0).to(self.device)
            with torch.no_grad():
                embedding = self.model.encode_image(tensor)
                embedding = embedding / embedding.norm(dim=-1, keepdim=True)
            self.store.save_record(record, embedding.cpu().numpy().astype(np.float32)[0])
            self.seen_this_run += 1
            if self.seen_this_run % 25 == 0:
                LOG.info("Embedded %d new images in this run", self.seen_this_run)
            return True
        except Exception as error:
            self.store.save_failure(record.source, record.image_url, f"{type(error).__name__}: {error}")
            LOG.warning("Skipping bad image (%s): %s", record.source, error)
            return False

    def met(self) -> None:
        source = "met"
        state = self.store.get_checkpoint(source)
        offset = int(state.get("offset", 0))
        base = "https://collectionapi.metmuseum.org/public/collection/v1.1"
        while self.max_items is None or offset < self.max_items:
            data = self.get_json(f"{base}/search", {"departmentId": 10, "hasImages": "true", "offset": offset, "limit": 100})
            ids = data.get("objectIDs") or []
            if not ids:
                break
            for object_id in ids:
                detail_url = f"{base.rsplit('/v1.1', 1)[0]}/v1/objects/{object_id}"
                try:
                    item = self.get_json(detail_url)
                    offset += 1
                    if item.get("isPublicDomain") is True and item.get("primaryImageSmall"):
                        record = ArtifactRecord(
                            record_id=f"met:{object_id}:primary", entity_id=item.get("objectWikidata_URL", "").rsplit("/", 1)[-1] or f"met:{object_id}",
                            title_en=item.get("title", ""), title_ar="", object_type=item.get("objectName") or item.get("classification", ""),
                            institution="The Metropolitan Museum of Art", city="New York", country="United States",
                            accession_number=item.get("accessionNumber", ""), period=item.get("period") or item.get("objectDate", ""),
                            description=" ".join(filter(None, [item.get("culture"), item.get("medium"), item.get("objectDate")])),
                            page_url=item.get("objectURL", ""), source="The Metropolitan Museum of Art", license="Public Domain (Open Access)",
                            license_url="https://creativecommons.org/publicdomain/zero/1.0/", image_url=item["primaryImageSmall"],
                        )
                        self.add_record(record)
                        for image_index, image_url in enumerate(item.get("additionalImages", [])[:3], start=1):
                            additional = ArtifactRecord(**{**asdict(record), "record_id": f"met:{object_id}:additional:{image_index}", "image_url": image_url})
                            self.add_record(additional)
                except Exception as error:
                    offset += 1
                    self.store.save_failure(source, str(object_id), f"{type(error).__name__}: {error}")
                    LOG.warning("Met object %s failed: %s", object_id, error)
                if offset % 25 == 0:
                    self.store.checkpoint(source, {"offset": offset})
                if self.max_items is not None and offset >= self.max_items:
                    break
            self.store.checkpoint(source, {"offset": offset})
            LOG.info("Met progress: %d / %s IDs", offset, data.get("total", "unknown"))
            if len(ids) < 100:
                break

    def cleveland(self) -> None:
        source = "cleveland"
        state = self.store.get_checkpoint(source)
        skip = int(state.get("skip", 0))
        base = "https://openaccess-api.clevelandart.org/api/artworks/"
        processed = 0
        while self.max_items is None or processed < self.max_items:
            data = self.get_json(base, {
                "department": "Egyptian and Ancient Near Eastern Art", "cc0": "", "has_image": 1,
                "skip": skip, "limit": 100,
                "fields": "id,accession_number,share_license_status,title,title_in_original_language,creation_date,culture,department,collection,type,description,url,images",
            })
            items = data.get("data") or []
            if not items:
                break
            for item in items:
                skip += 1
                processed += 1
                image_url = ((item.get("images") or {}).get("web") or {}).get("url")
                if item.get("share_license_status") != "CC0" or not image_url:
                    continue
                record = ArtifactRecord(
                    record_id=f"cleveland:{item.get('id')}:{hashlib.sha1(image_url.encode()).hexdigest()[:10]}",
                    entity_id=f"cleveland:{item.get('id')}", title_en=item.get("title", ""),
                    title_ar=item.get("title_in_original_language", "") or "", object_type=item.get("type", ""),
                    institution="Cleveland Museum of Art", city="Cleveland", country="United States",
                    accession_number=item.get("accession_number", ""), period=item.get("creation_date", ""),
                    description=" ".join(filter(None, [item.get("description"), ", ".join(item.get("culture") or []), item.get("collection")])),
                    page_url=item.get("url", ""), source="Cleveland Museum of Art", license="CC0",
                    license_url="https://creativecommons.org/publicdomain/zero/1.0/", image_url=image_url,
                )
                self.add_record(record)
                if skip % 25 == 0:
                    self.store.checkpoint(source, {"skip": skip})
                if self.max_items is not None and processed >= self.max_items:
                    break
            self.store.checkpoint(source, {"skip": skip})
            LOG.info("Cleveland progress: %d / %s records", skip, (data.get("info") or {}).get("total", "unknown"))
            if len(items) < 100:
                break

    def commons(self) -> None:
        source = "commons"
        state = self.store.get_checkpoint(source)
        queue = state.get("queue") or [{"category": name, "depth": 0} for name, _ in COMMONS_CATEGORIES]
        current = state.get("current")
        continuation = state.get("continue")
        seen = set(state.get("seen", [])) | {name for name, _ in COMMONS_CATEGORIES}
        processed = 0
        while queue and (self.max_items is None or processed < self.max_items):
            if current is None:
                current = queue.pop(0)
                continuation = None
            category = current["category"]
            params: dict[str, Any] = {
                "action": "query", "list": "categorymembers", "cmtitle": category,
                "cmtype": "file|subcat", "cmlimit": 100, "format": "json",
            }
            if continuation:
                params["cmcontinue"] = continuation
            try:
                data = self.get_json("https://commons.wikimedia.org/w/api.php", params)
            except Exception as error:
                self.store.save_failure(source, category, f"{type(error).__name__}: {error}")
                LOG.warning("Skipping unavailable Commons category %s: %s", category, error)
                current = None
                continuation = None
                self.store.checkpoint(source, {"queue": queue, "current": None, "continue": None, "seen": list(seen)})
                continue
            members = (data.get("query") or {}).get("categorymembers") or []
            file_titles = [member["title"] for member in members if member.get("ns") == 6 and member.get("title")]
            for member in members:
                if (
                    member.get("ns") == 14
                    and current["depth"] < COMMONS_SUBCATEGORY_DEPTH
                    and member.get("title") not in seen
                    and len(seen) < COMMONS_MAX_CATEGORIES
                ):
                    queue.append({"category": member["title"], "depth": current["depth"] + 1})
                    seen.add(member["title"])
            for start in range(0, len(file_titles), 20):
                batch = file_titles[start:start + 20]
                try:
                    info = self.get_json("https://commons.wikimedia.org/w/api.php", {
                        "action": "query", "prop": "imageinfo|pageprops", "titles": "|".join(batch),
                        "iiprop": "url|extmetadata", "iiurlwidth": 1024, "format": "json",
                    })
                except Exception as error:
                    self.store.save_failure(source, "|".join(batch), f"{type(error).__name__}: {error}")
                    LOG.warning("Skipping Commons image batch: %s", error)
                    continue
                for page in (info.get("query") or {}).get("pages", {}).values():
                    image = (page.get("imageinfo") or [{}])[0]
                    metadata = image.get("extmetadata") or {}
                    license_name = html_text((metadata.get("LicenseShortName") or {}).get("value", ""))
                    if not allowed_commons_license(license_name):
                        continue
                    image_url = image.get("thumburl") or image.get("url")
                    if not image_url:
                        continue
                    source_id = page.get("pageid") or hashlib.sha1(page["title"].encode()).hexdigest()[:12]
                    wiki_id = (page.get("pageprops") or {}).get("wikibase_item")
                    record = ArtifactRecord(
                        record_id=f"commons:{source_id}:{hashlib.sha1(image_url.encode()).hexdigest()[:10]}",
                        entity_id=wiki_id or f"commons:{source_id}",
                        title_en=page["title"].removeprefix("File:"), title_ar="",
                        object_type="Ancient Egyptian artifact or artwork",
                        institution=html_text((metadata.get("Institution") or {}).get("value", "")),
                        city="", country="", accession_number="",
                        period=html_text((metadata.get("DateTimeOriginal") or {}).get("value", "")),
                        description=html_text((metadata.get("ImageDescription") or {}).get("value", "")),
                        page_url=image.get("descriptionurl", ""), source="Wikimedia Commons", license=license_name,
                        license_url=(metadata.get("LicenseUrl") or {}).get("value", ""), image_url=image_url,
                    )
                    self.add_record(record)
                    processed += 1
                    if self.max_items is not None and processed >= self.max_items:
                        break
            continuation = (data.get("continue") or {}).get("cmcontinue")
            if not continuation:
                current = None
            self.store.checkpoint(source, {"queue": queue, "current": current, "continue": continuation, "seen": list(seen)})
            LOG.info("Commons progress: %d files in this run; %d categories queued", processed, len(queue))

    def wikidata(self) -> None:
        source = "wikidata"
        state = self.store.get_checkpoint(source)
        offset = int(state.get("offset", 0))
        limit = 100
        processed = 0
        while self.max_items is None or processed < self.max_items:
            query = f"""
                        SELECT ?item ?itemLabel ?itemLabelAr ?itemDescription ?image ?museum ?museumLabel ?inventory ?period WHERE {{
                            ?item wdt:P18 ?image.
                            {{
                                ?item wdt:P2596 wd:Q11768.
                            }} UNION {{
                                ?item wdt:P495 wd:Q79.
                            }} UNION {{
                                ?item wdt:P195 ?egyptianMuseum.
                                ?egyptianMuseum wdt:P17 wd:Q79.
                            }}
                            OPTIONAL {{ ?item wdt:P195 ?museum. }}
              OPTIONAL {{ ?item wdt:P217 ?inventory. }}
              OPTIONAL {{ ?item wdt:P571 ?period. }}
              OPTIONAL {{ ?item rdfs:label ?itemLabelAr. FILTER(LANG(?itemLabelAr) = "ar") }}
              OPTIONAL {{ ?item schema:description ?itemDescription. FILTER(LANG(?itemDescription) = "en") }}
              SERVICE wikibase:label {{ bd:serviceParam wikibase:language "en". }}
            }} ORDER BY ?item LIMIT {limit} OFFSET {offset}
            """
            data = self.get_json("https://query.wikidata.org/sparql", {"query": query, "format": "json"})
            bindings = (data.get("results") or {}).get("bindings") or []
            if not bindings:
                break
            for row in bindings:
                offset += 1
                item_uri = row.get("item", {}).get("value", "")
                entity_id = item_uri.rsplit("/", 1)[-1]
                image_uri = row.get("image", {}).get("value", "")
                filename = unquote(urlparse(image_uri).path.rsplit("/", 1)[-1])
                try:
                    image, license_name, license_url = self.commons_image(filename)
                    if not allowed_commons_license(license_name):
                        continue
                    museum = row.get("museumLabel", {}).get("value", "")
                    record = ArtifactRecord(
                        record_id=f"wikidata:{entity_id}:{hashlib.sha1(image_uri.encode()).hexdigest()[:10]}", entity_id=entity_id,
                        title_en=row.get("itemLabel", {}).get("value", ""),
                        title_ar=row.get("itemLabelAr", {}).get("value", ""),
                        object_type="Ancient Egyptian artifact", institution=museum, city="", country="",
                        accession_number=row.get("inventory", {}).get("value", ""),
                        period=row.get("period", {}).get("value", ""),
                        description=row.get("itemDescription", {}).get("value", ""),
                        page_url=item_uri, source="Wikidata / Wikimedia Commons", license=license_name,
                        license_url=license_url, image_url=image,
                    )
                    self.add_record(record)
                    processed += 1
                except Exception as error:
                    self.store.save_failure(source, item_uri, f"{type(error).__name__}: {error}")
                    LOG.warning("Wikidata image %s failed: %s", entity_id, error)
                if offset % 25 == 0:
                    self.store.checkpoint(source, {"offset": offset})
                if self.max_items is not None and processed >= self.max_items:
                    break
            self.store.checkpoint(source, {"offset": offset})
            LOG.info("Wikidata progress: %d rows processed", offset)
            if len(bindings) < limit:
                break

    def commons_image(self, filename: str) -> tuple[str, str, str]:
        data = self.get_json("https://commons.wikimedia.org/w/api.php", {
            "action": "query", "titles": f"File:{filename}", "prop": "imageinfo",
            "iiprop": "url|extmetadata", "iiurlwidth": 1024, "format": "json",
        })
        page = next(iter((data.get("query") or {}).get("pages", {}).values()), {})
        image = (page.get("imageinfo") or [{}])[0]
        metadata = image.get("extmetadata") or {}
        return (
            image.get("thumburl") or image.get("url", ""),
            html_text((metadata.get("LicenseShortName") or {}).get("value", "")),
            (metadata.get("LicenseUrl") or {}).get("value", ""),
        )

    def rebuild_faiss(self) -> None:
        import faiss
        import numpy as np

        rows = self.store.db.execute(
            "SELECT record_id, embedding, embedding_dim FROM artifacts ORDER BY record_id"
        ).fetchall()
        if not rows:
            raise RuntimeError("No valid licensed images were indexed.")
        dimension = int(rows[0][2])
        index = faiss.IndexFlatIP(dimension)
        mapping: list[str] = []
        batch: list[Any] = []
        for record_id, vector_bytes, vector_dim in rows:
            if int(vector_dim) != dimension:
                LOG.error("Skipping vector with unexpected dimension: %s", record_id)
                continue
            batch.append(np.frombuffer(vector_bytes, dtype=np.float32))
            mapping.append(record_id)
            if len(batch) >= 2048:
                index.add(np.vstack(batch).astype(np.float32))
                batch.clear()
                LOG.info("FAISS vectors: %d / %d", index.ntotal, len(rows))
        if batch:
            index.add(np.vstack(batch).astype(np.float32))
        index_tmp = self.output / "index.faiss.tmp"
        mapping_tmp = self.output / "index-map.json.tmp"
        faiss.write_index(index, str(index_tmp))
        mapping_tmp.write_text(json.dumps(mapping, ensure_ascii=False), encoding="utf-8")
        os.replace(index_tmp, self.output / "index.faiss")
        os.replace(mapping_tmp, self.output / "index-map.json")
        manifest = {
            "model": MODEL_NAME,
            "weights": MODEL_WEIGHTS,
            "dimension": dimension,
            "items": len(mapping),
            "metric": "cosine_similarity_via_normalized_inner_product",
            "threshold_default": 0.85,
            "built_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        }
        (self.output / "manifest.json").write_text(json.dumps(manifest, indent=2), encoding="utf-8")
        LOG.info("Saved %d FAISS vectors to %s", index.ntotal, self.output)

    def close(self) -> None:
        self.store.close()
        self.session.close()


def bytes_view(data: bytearray) -> Any:
    from io import BytesIO
    return BytesIO(data)


def html_text(value: str) -> str:
    import html
    return re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", " ", value or ""))).strip()


def allowed_commons_license(name: str) -> bool:
    normalized = re.sub(r"[^a-z0-9]", "", (name or "").lower())
    if not normalized or "nc" in normalized or "nd" in normalized:
        return False
    return any(normalized.startswith(term) for term in ALLOWED_LICENSE_TERMS)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Build an OpenCLIP/FAISS Egyptian-art image index.")
    parser.add_argument("--output", type=Path, default=DEFAULT_OUTPUT)
    parser.add_argument("--device", choices=("auto", "cpu", "cuda"), default="auto")
    parser.add_argument("--delay", type=float, default=0.15, help="Minimum seconds between API/image requests.")
    parser.add_argument("--max-items", type=int, default=None, help="Optional per-source cap for a quick test build.")
    parser.add_argument("--sources", default="met,cleveland,commons,wikidata")
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    builder = IndexBuilder(args.output, args.device, args.delay, args.max_items)
    try:
        for source in (part.strip().lower() for part in args.sources.split(",")):
            if source not in {"met", "cleveland", "commons", "wikidata"}:
                LOG.warning("Ignoring unsupported or non-free source: %s", source)
                continue
            LOG.info("Starting %s source", source)
            try:
                getattr(builder, source)()
            except Exception as error:
                LOG.exception("Source %s stopped; saved checkpoint can resume it: %s", source, error)
        builder.rebuild_faiss()
    finally:
        builder.close()


if __name__ == "__main__":
    main()
