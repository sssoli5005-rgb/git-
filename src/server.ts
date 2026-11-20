import "./lib/error-capture";
import { handleAtharaApiRequest } from "./lib/athara-api";
import { isValidSession } from "./lib/auth";
import { handleChatPost } from "./routes/api.chat";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m.default ?? m) as ServerEntry,
    );
  }
  return serverEntryPromise;
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!isH3SwallowedErrorBody(body)) return response;

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function isH3SwallowedErrorBody(body: string): boolean {
  try {
    const payload = JSON.parse(body) as { unhandled?: unknown; message?: unknown };
    return payload.unhandled === true && payload.message === "HTTPError";
  } catch {
    return false;
  }
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    // Handle chat directly at the Worker boundary and pass only CHAT_* settings.
    // The scanner's AI binding and SCANNER_* secrets never enter the chat pipeline.
    // TanStack/Nitro may create a different Request object for route handlers, so
    // mutating request.runtime is not a reliable way to expose Worker bindings.
    const url = new URL(request.url);
    if (url.pathname === "/api/chat" && request.method === "POST") {
      if (!isValidSession(request.headers.get("cookie"))) {
        return Response.json({ code: "unauthorized" }, { status: 401 });
      }
      const runtimeEnv = env && typeof env === "object"
        ? env as Record<string, unknown>
        : {};
      const chatEnv: Record<string, string | undefined> = {};
      for (const key of [
        "CHAT_GROQ_API_KEY",
        "CHAT_GROQ_MODEL",
        "CHAT_GEMINI_API_KEY",
        "CHAT_GEMINI_MODEL",
        "CHAT_OPENROUTER_API_KEY",
        "CHAT_OPENROUTER_MODEL",
        "CHAT_OLLAMA_BASE_URL",
        "CHAT_OLLAMA_MODEL",
        "NODE_ENV",
      ]) {
        if (typeof runtimeEnv[key] === "string") chatEnv[key] = runtimeEnv[key] as string;
      }
      // Chat gets its own search adapter. It uses only the dedicated CHAT_WEB_SEARCH
      // interface and never receives scanner credentials, scanner results, or AI models.
      const chatAiBinding = runtimeEnv.AI;
      if (
        chatAiBinding &&
        typeof chatAiBinding === "object" &&
        "websearch" in chatAiBinding &&
        typeof (chatAiBinding as { websearch?: unknown }).websearch === "function"
      ) {
        chatEnv.CHAT_WEB_SEARCH = {
          websearch: (input) =>
            (chatAiBinding as { websearch: (args: typeof input) => Promise<Response> }).websearch(input),
        };
      }
      try {
        // Never pass the scanner's Cloudflare AI binding or scanner credentials to chat.
        return await handleChatPost(request, fetch, chatEnv);
      } catch (error) {
        console.error("[Chat] Unhandled request failure", {
          name: error instanceof Error ? error.name : "unknown",
        });
        return Response.json({ code: "unavailable" }, { status: 503 });
      }
    }

    // Make other Cloudflare bindings available to TanStack route handlers.
    if (env && typeof env === "object" && "AI" in env) {
      const existingRuntime = (request as Request & {
        runtime?: { cloudflare?: { env?: unknown } };
      }).runtime;
      Object.defineProperty(request, "runtime", {
        configurable: true,
        value: {
          ...existingRuntime,
          cloudflare: {
            ...existingRuntime?.cloudflare,
            env,
          },
        },
      });
    }

    const atharaResponse = handleAtharaApiRequest(request, env);
    if (atharaResponse) return atharaResponse;

    try {
      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      return await normalizeCatastrophicSsrResponse(response);
    } catch (error) {
      console.error(error);
      return new Response(renderErrorPage(), {
        status: 500,
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    }
  },
};
