// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { loadEnv, type ConfigEnv } from "vite";

export default async (configEnv: ConfigEnv) => {
  {
    const localEnv = loadEnv(configEnv.mode, process.cwd(), "");
    for (const key of [
      "APP_USERNAME",
      "ADMIN_PASSWORD",
      "APP_PASSWORD_HASH",
      "APP_SESSION_SECRET",
      "CHAT_GROQ_API_KEY",
      "CHAT_GROQ_MODEL",
      "CHAT_GEMINI_API_KEY",
      "CHAT_GEMINI_MODEL",
      "CHAT_OPENROUTER_API_KEY",
      "CHAT_OPENROUTER_MODEL",
      "CHAT_OLLAMA_BASE_URL",
      "CHAT_OLLAMA_MODEL",
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
    ]) {
      if (localEnv[key]) {
        process.env[key] = localEnv[key];
      } else if (["CHAT_GROQ_API_KEY", "CHAT_GEMINI_API_KEY", "SCANNER_GROQ_API_KEY", "SCANNER_GEMINI_API_KEY"].includes(key)) {
        // Legacy keys keep existing local installs working during migration.
        // Set dedicated CHAT_* / SCANNER_* keys to give each pipeline its own quota.
        const legacyKey = key.includes("GROQ") ? "GROQ_API_KEY" : "GEMINI_API_KEY";
        if (localEnv[legacyKey]) process.env[key] = localEnv[legacyKey];
      } else if (key === "SCANNER_OPENROUTER_API_KEY" && localEnv.OPENROUTER_API_KEY) {
        process.env[key] = localEnv.OPENROUTER_API_KEY;
      } else if (["APP_USERNAME", "ADMIN_PASSWORD", "APP_PASSWORD_HASH", "APP_SESSION_SECRET"].includes(key)) {
        delete process.env[key];
      }
    }
  }

  return defineConfig({
    vite: {
      build: {
        rolldownOptions: {
          // Cloudflare resolves this Workers runtime module at deployment time.
          external: ["cloudflare:workers"],
        },
      },
      server: {
        host: "127.0.0.1",
        allowedHosts: [".ts.net", ".trycloudflare.com"],
      },
      preview: {
        host: "127.0.0.1",
        allowedHosts: [".ts.net", ".trycloudflare.com"],
      },
    },
    tanstackStart: {
      // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
      // nitro/vite builds from this
      server: { entry: "server" },
    },
  })(configEnv);
};
