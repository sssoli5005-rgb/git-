const SITEMAP_URL = "https://egymonuments.gov.eg/ar/sitemap.aspx";
const OUTPUT_PATH = new URL("../src/data/egypt-monuments-official.json", import.meta.url);
const CONCURRENCY = 8;
const IMAGES_DIR = new URL("../public/egypt-monuments-images/", import.meta.url);

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function decodeHtml(value) {
  return value
    .replace(/<!DOCTYPE[^>]*>/gi, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&[a-z]+;/gi, " ")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/\s+/g, " ")
    .trim();
}

function metaContent(html, property) {
  const escaped = property.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = html.match(new RegExp(`<meta[^>]+(?:property|name=["']?)${escaped}["']?[^>]+content=["']([^"']+)["']`, "i"))
    || html.match(new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name=["']?)${escaped}["']?`, "i"));
  return match ? decodeHtml(match[1]) : "";
}

function extractTitle(html) {
  const title = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return title ? decodeHtml(title[1]).replace(/\s*[-|]\s*وزارة السياحة والآثار.*$/i, "").trim() : "";
}

function absoluteImageUrl(src, pageUrl) {
  if (!src) return "";
  try {
    return new URL(src.replace(/&amp;/g, "&"), pageUrl).toString();
  } catch {
    return "";
  }
}

function extractImageUrls(html, pageUrl) {
  const urls = [];
  const ogImage = metaContent(html, "og:image");
  if (ogImage) urls.push(absoluteImageUrl(ogImage, pageUrl));
  for (const match of html.matchAll(/<img[^>]+(?:src|data-src)=["']([^"']+)["'][^>]*>/gi)) {
    urls.push(absoluteImageUrl(match[1], pageUrl));
  }
  return [...new Set(urls)].filter((url) =>
    /^https?:\/\//i.test(url)
    && !/\/(?:logo|icon|sprite|avatar|placeholder)[^/]*\.(?:png|jpe?g|svg|webp)/i.test(url)
  ).slice(0, 12);
}

async function fetchPage(url) {
  const response = await fetch(url, { headers: { "user-agent": "ATHARA heritage scanner reference importer" } });
  if (!response.ok) throw new Error(`${response.status} ${url}`);
  return response.text();
}

const sitemap = await fetch(SITEMAP_URL).then((response) => {
  if (!response.ok) throw new Error(`Sitemap returned ${response.status}`);
  return response.text();
});
const urls = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/gi)]
  .map((match) => decodeHtml(match[1]).replace(/&amp;/g, "&"))
  .filter((url) => /^https:\/\/egymonuments\.gov\.eg\/ar\//i.test(url));

const records = [];
let failed = 0;
let cursor = 0;
await import("node:fs/promises").then(({ mkdir }) => mkdir(IMAGES_DIR, { recursive: true }));

async function worker() {
  while (cursor < urls.length) {
    const index = cursor++;
    const url = urls[index];
    try {
      const html = await fetchPage(url);
      const title = metaContent(html, "og:title") || extractTitle(html);
      const description = metaContent(html, "og:description") || metaContent(html, "description");
      const images = extractImageUrls(html, url);
      const pageText = decodeHtml(html);
      if (!title || pageText.length < 80) return;
      records.push({
        id: `egy-monuments-${index + 1}`,
        title,
        description: description || pageText.slice(0, 1200),
        keywords: [...new Set([
          ...title.split(/\s+/).filter((word) => word.length > 3),
          ...url.split("/").filter((part) => part && !["ar", "https:", ""].includes(part)).slice(-2),
        ])].slice(0, 12),
        mode: "both",
        sourceTitle: "وزارة السياحة والآثار المصرية",
        sourceUrl: url,
        imageUrls: images,
        imageUrl: images[0] || "",
      });
    } catch (error) {
      failed++;
      console.error(`Import failed: ${url} - ${error.message}`);
      await delay(500);
    }
  }
}

await Promise.all(Array.from({ length: Math.min(CONCURRENCY, urls.length) }, worker));
records.sort((a, b) => a.sourceUrl.localeCompare(b.sourceUrl, "ar"));
await import("node:fs/promises").then(({ mkdir, writeFile }) =>
  mkdir(new URL("../src/data/", import.meta.url), { recursive: true })
    .then(() => writeFile(OUTPUT_PATH, JSON.stringify({
      source: "https://egymonuments.gov.eg",
      importedAt: new Date().toISOString(),
      count: records.length,
      failed,
      records,
    }, null, 2), "utf8"))
);
console.log(`Imported ${records.length} official Arabic pages; ${failed} failed.`);
