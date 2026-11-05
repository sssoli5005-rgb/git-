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
      "GROQ_API_KEY",
      "GROQ_MODEL",
      "GEMINI_API_KEY",
      "GEMINI_MODEL",
      "GEMINI_VISION_MODEL",
      "GEMINI_VISION_FALLBACK_MODEL",
      "OLLAMA_BASE_URL",
      "OLLAMA_VISION_MODEL",
    ]) {
      if (localEnv[key]) {
        process.env[key] = localEnv[key];
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
