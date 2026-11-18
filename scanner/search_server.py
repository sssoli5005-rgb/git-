#!/usr/bin/env python3
"""Local FAISS search service for the ATHARA image scanner."""

from __future__ import annotations

import base64
import io
import json
import logging
import os
import sqlite3
from functools import lru_cache
from pathlib import Path
from typing import Any

import faiss
import numpy as np
import open_clip
import torch
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from PIL import Image, UnidentifiedImageError

LOG = logging.getLogger("athara-search")
logging.basicConfig(level=os.getenv("SCANNER_LOG_LEVEL", "INFO"))
INDEX_DIR = Path(os.getenv("SCANNER_INDEX_DIR", Path(__file__).parent / "index_data")).resolve()
MODEL_NAME = "ViT-B-32"
MODEL_WEIGHTS = "laion2b_s34b_b79k"
MAX_IMAGE_BYTES = 12_000_000
DEVICE_NAME = os.getenv("SCANNER_DEVICE", "auto")

app = FastAPI(title="ATHARA Free Image Index", docs_url=None, redoc_url=None)


class SearchRequest(BaseModel):
    imageBase64: str = Field(min_length=16, max_length=16_500_000)
    mimeType: str = Field(pattern=r"^image/(jpeg|png|webp)$")
    topK: int = Field(default=5, ge=1, le=5)


class IndexRuntime:
    def __init__(self) -> None:
        required = (INDEX_DIR / "index.faiss", INDEX_DIR / "index-map.json", INDEX_DIR / "metadata.sqlite")
        missing = [str(path) for path in required if not path.is_file()]
        if missing:
            raise RuntimeError("Index files are missing: " + ", ".join(missing))
        self.index = faiss.read_index(str(INDEX_DIR / "index.faiss"))
        self.record_ids = json.loads((INDEX_DIR / "index-map.json").read_text(encoding="utf-8"))
        self.db_path = INDEX_DIR / "metadata.sqlite"
        if self.index.ntotal != len(self.record_ids):
            raise RuntimeError("FAISS index and index map have different item counts.")
        self.device = "cuda" if DEVICE_NAME == "auto" and torch.cuda.is_available() else DEVICE_NAME
        if self.device == "auto":
            self.device = "cpu"
        self.model, _, self.preprocess = open_clip.create_model_and_transforms(
            MODEL_NAME, pretrained=MODEL_WEIGHTS, device=self.device
        )
        self.model.eval()
        LOG.info("Loaded %s vectors and OpenCLIP on %s", self.index.ntotal, self.device)

    def encode_image(self, image_bytes: bytes) -> np.ndarray:
        try:
            with Image.open(io.BytesIO(image_bytes)) as image:
                image = image.convert("RGB")
                image.thumbnail((1024, 1024), Image.Resampling.LANCZOS)
                tensor = self.preprocess(image).unsqueeze(0).to(self.device)
        except (UnidentifiedImageError, OSError) as error:
            raise ValueError(f"Invalid image: {error}") from error
        with torch.no_grad():
            vector = self.model.encode_image(tensor)
            vector = vector / vector.norm(dim=-1, keepdim=True)
        return vector.cpu().numpy().astype(np.float32)

    def search(self, vector: np.ndarray, top_k: int) -> list[dict[str, Any]]:
        scores, indexes = self.index.search(vector, min(top_k, self.index.ntotal))
        found: list[dict[str, Any]] = []
        with sqlite3.connect(self.db_path) as connection:
            for score, index_id in zip(scores[0], indexes[0], strict=True):
                if index_id < 0 or index_id >= len(self.record_ids):
                    continue
                record_id = self.record_ids[index_id]
                row = connection.execute(
                    "SELECT metadata_json FROM artifacts WHERE record_id=?", (record_id,)
                ).fetchone()
                if row is None:
                    LOG.error("FAISS map record missing from SQLite: %s", record_id)
                    continue
                metadata = json.loads(row[0])
                found.append({
                    "recordId": record_id,
                    "entityId": metadata.get("entity_id", record_id),
                    "similarity": round(float(score), 6),
                    "metadata": metadata,
                })
        return found


@lru_cache(maxsize=1)
def runtime() -> IndexRuntime:
    return IndexRuntime()


@app.get("/health")
def health() -> dict[str, Any]:
    try:
        index = runtime()
        return {"ok": True, "ready": True, "items": index.index.ntotal, "device": index.device}
    except Exception as error:
        LOG.exception("Scanner index health check failed")
        return {"ok": False, "ready": False, "error": str(error)}


@app.post("/search")
def search(request: SearchRequest) -> dict[str, Any]:
    try:
        image_bytes = base64.b64decode(request.imageBase64, validate=True)
        if not image_bytes or len(image_bytes) > MAX_IMAGE_BYTES:
            raise ValueError("Image is empty or exceeds the 12 MB limit.")
        index = runtime()
        results = index.search(index.encode_image(image_bytes), request.topK)
        top_two_same_entity = len(results) >= 2 and results[0]["entityId"] == results[1]["entityId"]
        return {
            "ok": True,
            "results": results,
            "topTwoSameEntity": top_two_same_entity,
            "threshold": float(os.getenv("SCANNER_MATCH_THRESHOLD", "0.85")),
        }
    except (ValueError, RuntimeError) as error:
        LOG.warning("Image index search rejected: %s", error)
        raise HTTPException(status_code=400, detail=str(error)) from error
    except Exception as error:
        LOG.exception("Image index search failed")
        raise HTTPException(status_code=503, detail="Image index is temporarily unavailable.") from error


def main() -> None:
    import uvicorn

    uvicorn.run(
        "search_server:app",
        host=os.getenv("SCANNER_HOST", "127.0.0.1"),
        port=int(os.getenv("SCANNER_PORT", "8765")),
        reload=False,
    )


if __name__ == "__main__":
    main()
