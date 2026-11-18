#!/usr/bin/env python3
"""Exercise the local scanner with freely licensed, known Egyptian-art images."""

from __future__ import annotations

import argparse
import base64
import sys
from pathlib import Path
from typing import Any

import requests

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from scanner.build_index import USER_AGENT, allowed_commons_license

COMMONS_API = "https://commons.wikimedia.org/w/api.php"
CASES = (
    ("Tutankhamun mask", "Tutankhamun death mask", ("tutankhamun", "mask")),
    ("Nefertiti bust", "Nefertiti bust", ("nefertiti",)),
    ("Great Sphinx", "Great Sphinx of Giza", ("sphinx",)),
)


def find_free_image(session: requests.Session, query: str, expected_terms: tuple[str, ...]) -> tuple[str, str, bytes]:
    response = session.get(COMMONS_API, params={
        "action": "query",
        "generator": "search",
        "gsrsearch": query,
        "gsrnamespace": 6,
        "gsrlimit": 8,
        "prop": "imageinfo",
        "iiprop": "url|extmetadata",
        "iiurlwidth": 640,
        "format": "json",
    }, timeout=(8, 30))
    response.raise_for_status()
    pages = (response.json().get("query") or {}).get("pages") or {}
    for page in pages.values():
        title = str(page.get("title", ""))
        normalized = title.lower()
        if not all(term in normalized for term in expected_terms):
            continue
        info = (page.get("imageinfo") or [{}])[0]
        license_name = ((info.get("extmetadata") or {}).get("LicenseShortName") or {}).get("value", "")
        if not allowed_commons_license(str(license_name)):
            continue
        image_url = info.get("thumburl") or info.get("url")
        if not image_url:
            continue
        image_response = session.get(image_url, timeout=(8, 30))
        image_response.raise_for_status()
        content_type = image_response.headers.get("Content-Type", "").split(";", 1)[0].lower()
        mime = content_type if content_type in {"image/jpeg", "image/png", "image/webp"} else ""
        if mime and image_response.content:
            return title, mime, image_response.content
    raise RuntimeError(f"No freely licensed image matched {query!r} in Wikimedia Commons.")


def scan(session: requests.Session, app_url: str, title: str, mime: str, image: bytes, timeout: int) -> dict[str, Any]:
    response = session.post(
        f"{app_url.rstrip('/')}/api/scan",
        json={"image": f"data:{mime};base64,{base64.b64encode(image).decode('ascii')}", "language": "ar", "mode": "objects"},
        timeout=(10, timeout),
    )
    response.raise_for_status()
    result = response.json()
    artifact = result.get("matchedArtifact") or {}
    name = artifact.get("name") or ""
    status = result.get("identificationStatus", "unverified")
    print(f"{title}: {status}; {name or 'no confirmed catalog name'}")
    if result.get("sources"):
        print(f"  source: {result['sources'][0].get('url', '')}")
    return result


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--app-url", default="http://127.0.0.1:4173")
    parser.add_argument("--timeout", type=int, default=240)
    parser.add_argument("--only", choices=("mask", "nefertiti", "sphinx"), default=None)
    args = parser.parse_args()

    session = requests.Session()
    session.headers.update({"User-Agent": USER_AGENT})
    selected = [case for case in CASES if args.only is None or args.only in case[0].lower()]
    failures = 0
    for label, query, terms in selected:
        try:
            title, mime, image = find_free_image(session, query, terms)
            result = scan(session, args.app_url, title, mime, image, args.timeout)
            if result.get("identificationStatus") != "confirmed":
                failures += 1
        except Exception as error:
            failures += 1
            print(f"{label}: FAILED: {type(error).__name__}: {error}")
    return 1 if failures else 0


if __name__ == "__main__":
    sys.exit(main())
