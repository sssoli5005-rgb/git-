import atharaWorker from "../athara-worker.js";

const ATHARA_API_PATHS = new Set(["/api/health", "/api/scan", "/api/guide"]);

type CloudflareRequest = Request & {
  runtime?: {
    cloudflare?: {
      env?: unknown;
    };
  };
};

/**
 * Dispatch ATHARA's AI endpoints before TanStack's server router.
 * Nitro attaches Cloudflare bindings to the incoming request runtime.
 */
export function handleAtharaApiRequest(
  request: Request,
  suppliedEnv?: unknown,
): Promise<Response> | null {
  const { pathname } = new URL(request.url);
  if (!ATHARA_API_PATHS.has(pathname)) return null;

  const requestEnv = (request as CloudflareRequest).runtime?.cloudflare?.env;
  const requestEnvironment = requestEnv && typeof requestEnv === "object"
    ? requestEnv as Record<string, unknown>
    : {};
  const suppliedEnvironment = suppliedEnv && typeof suppliedEnv === "object"
    ? suppliedEnv as Record<string, unknown>
    : {};
  const env: Record<string, unknown> = {};

  // The scanner receives only scanner credentials/configuration and its own
  // Cloudflare resources. Chat credentials are deliberately not forwarded.
  const scannerKeys = [
    "SCANNER_GEMINI_API_KEY",
    "SCANNER_GEMINI_VISION_MODEL",
    "SCANNER_GEMINI_VISION_FALLBACK_MODEL",
    "SCANNER_GROQ_API_KEY",
    "SCANNER_GROQ_MODEL",
    "SCANNER_GROQ_VISION_MODEL",
    "SCANNER_GROQ_WEB_SEARCH_MODEL",
    "SCANNER_OPENROUTER_API_KEY",
    "SCANNER_OLLAMA_BASE_URL",
    "SCANNER_OLLAMA_VISION_MODEL",
    "SCANNER_QWEN_VISION_MODEL",
    "SCANNER_INTERNVL_VISION_MODEL",
    "SCANNER_INDEX_URL",
    "SCANNER_INDEX_TIMEOUT_MS",
    "SCANNER_INDEX_MATCH_THRESHOLD",
    "SCANNER_PROBABLE_THRESHOLD",
    "SCANNER_MATCH_THRESHOLD",
    "SCANNER_FREE_FALLBACK_ENABLED",
    "ATHARA_CATALOG_JSON",
    "NODE_ENV",
  ];
  for (const key of ["AI", "ASSETS", "SCANNER_CACHE"]) {
    if (key in suppliedEnvironment) env[key] = suppliedEnvironment[key];
    else if (key in requestEnvironment) env[key] = requestEnvironment[key];
  }
  for (const key of scannerKeys) {
    if (key in suppliedEnvironment) env[key] = suppliedEnvironment[key];
    else if (key in requestEnvironment) env[key] = requestEnvironment[key];
    else if (typeof process !== "undefined" && process.env[key]) env[key] = process.env[key];
  }

  if (!env.AI && typeof process !== "undefined" && process.env.NODE_ENV === "development") {
    env.SCANNER_OLLAMA_BASE_URL ??= "http://127.0.0.1:11434";
    env.SCANNER_OLLAMA_VISION_MODEL ??= "gemma3:4b";
  }

  return atharaWorker.fetch(request, env as Parameters<typeof atharaWorker.fetch>[1]);
}
