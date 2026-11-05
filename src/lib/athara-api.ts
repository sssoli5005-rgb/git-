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
  const requestEnvironment = requestEnv && typeof requestEnv === "object" ? requestEnv : null;
  const suppliedEnvironment = suppliedEnv && typeof suppliedEnv === "object" ? suppliedEnv : {};
  const env = Object.assign(Object.create(requestEnvironment), suppliedEnvironment) as Record<
    string,
    unknown
  >;
  for (const key of [
    "GEMINI_API_KEY",
    "GEMINI_VISION_MODEL",
    "GEMINI_VISION_FALLBACK_MODEL",
    "GROQ_API_KEY",
    "OLLAMA_BASE_URL",
    "OLLAMA_VISION_MODEL",
  ]) {
    if (!(key in env) && typeof process !== "undefined" && process.env[key]) {
      env[key] = process.env[key];
    }
  }

  if (!env.AI && typeof process !== "undefined" && process.env.NODE_ENV === "development") {
    env.OLLAMA_BASE_URL ??= "http://127.0.0.1:11434";
    env.OLLAMA_VISION_MODEL ??= "gemma3:4b";
  }

  return atharaWorker.fetch(request, env as Parameters<typeof atharaWorker.fetch>[1]);
}
