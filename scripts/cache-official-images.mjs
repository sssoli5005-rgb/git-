import { mkdir, readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const catalogUrl = new URL("../src/data/egypt-monuments-official.json", import.meta.url);
const outputUrl = new URL("../src/data/egypt-monuments-official.json", import.meta.url);
const imagesDirUrl = new URL("../public/egypt-monuments-images/", import.meta.url);
const publicCatalogUrl = new URL("../public/egypt-monuments-official.json", import.meta.url);
const catalog = JSON.parse(await readFile(catalogUrl, "utf8"));
await mkdir(imagesDirUrl, { recursive: true });

const queue = [];
const seen = new Set();
for (const record of catalog.records) {
  record.localImageUrls = [];
  for (const imageUrl of record.imageUrls || []) {
    if (!seen.has(imageUrl)) {
      seen.add(imageUrl);
      queue.push({ imageUrl, record });
    } else {
      const existing = queue.find((item) => item.imageUrl === imageUrl);
      if (existing) record.localImageUrls.push(existing.localUrl);
    }
  }
}

let cursor = 0;
let downloaded = 0;
let failed = 0;

async function cacheImage(item) {
  const hash = createHash("sha1").update(item.imageUrl).digest("hex");
  const localUrl = `/egypt-monuments-images/${hash}.jpg`;
  item.localUrl = localUrl;
  try {
    const response = await fetch(item.imageUrl, {
      headers: { "user-agent": "ATHARA heritage image catalog builder" },
      signal: AbortSignal.timeout(30_000),
    });
    if (!response.ok || Number(response.headers.get("content-length") || 0) > 12_000_000) {
      throw new Error(`HTTP ${response.status}`);
    }
    const input = Buffer.from(await response.arrayBuffer());
    await sharp(input)
      .rotate()
      .resize({ width: 720, height: 720, fit: "inside", withoutEnlargement: true })
      .jpeg({ quality: 82 })
      .toFile(fileURLToPath(new URL(`${hash}.jpg`, imagesDirUrl)));
    downloaded++;
  } catch (error) {
    failed++;
    item.localUrl = "";
    console.error(`Image failed: ${item.imageUrl} - ${error.message}`);
  }
}

async function worker() {
  while (cursor < queue.length) {
    await cacheImage(queue[cursor++]);
  }
}

await Promise.all(Array.from({ length: 12 }, worker));
for (const record of catalog.records) {
  record.localImageUrls = [];
  for (const imageUrl of record.imageUrls || []) {
    const item = queue.find((candidate) => candidate.imageUrl === imageUrl);
    if (item?.localUrl) record.localImageUrls.push(item.localUrl);
  }
}

catalog.cachedImagesAt = new Date().toISOString();
catalog.downloadedImages = downloaded;
catalog.failedImages = failed;
const json = JSON.stringify(catalog, null, 2);
await writeFile(outputUrl, json, "utf8");
await writeFile(publicCatalogUrl, json, "utf8");
console.log(`Cached ${downloaded} official images; ${failed} failed.`);
