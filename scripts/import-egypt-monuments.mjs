const SITEMAP_URLS = [
  "https://egymonuments.gov.eg/ar/sitemap.aspx",
  "https://egymonuments.gov.eg/en/sitemap.aspx",
];
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

const sitemapResults = await Promise.all(SITEMAP_URLS.map(async (sitemapUrl) => {
  try {
    const response = await fetch(sitemapUrl, {
      headers: { "user-agent": "ATHARA bilingual official catalogue importer" },
      signal: AbortSignal.timeout(20000),
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return { sitemapUrl, text: await response.text() };
  } catch (error) {
    console.warn(`Sitemap unavailable: ${sitemapUrl} - ${error.message}`);
    return { sitemapUrl, text: "" };
  }
}));
const discoveredUrls = sitemapResults.flatMap(({ text }) =>
  [...text.matchAll(/<loc>(.*?)<\/loc>/gi)]
    .map((match) => decodeHtml(match[1]).replace(/&amp;/g, "&"))
    .filter((url) => /^https:\/\/egymonuments\.gov\.eg\//i.test(url))
    .filter((url) => {
      const segments = new URL(url).pathname.split("/").filter(Boolean);
      const offset = ["ar", "en"].includes(segments[0]) ? 1 : 0;
      return segments.length > offset + 1 &&
        ["monuments", "archaeological-sites", "museums", "collections"].includes(segments[offset]);
    }),
);
// Prefer the Arabic record when both language variants exist, while retaining
// English-only objects that are absent from the Arabic sitemap.
const urlsByPath = new Map();
for (const url of discoveredUrls) {
  const parsed = new URL(url);
  const path = parsed.pathname.replace(/^\/(?:ar|en)\//i, "/").replace(/\/+$/, "");
  const existing = urlsByPath.get(path);
  if (!existing || /^\/ar\//i.test(parsed.pathname)) urlsByPath.set(path, url);
}
const urls = [...urlsByPath.values()].sort((a, b) => a.localeCompare(b));

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
