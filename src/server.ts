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
    // Handle chat directly at the Worker boundary so the real Cloudflare AI
    // binding is passed explicitly. TanStack/Nitro may create a different
    // Request object for route handlers, so mutating request.runtime is not
    // a reliable way to expose Worker bindings.
    const url = new URL(request.url);
    if (url.pathname === "/api/chat" && request.method === "POST") {
      if (!isValidSession(request.headers.get("cookie"))) {
        return Response.json({ code: "unauthorized" }, { status: 401 });
      }
      const cloudflareAI =
        env && typeof env === "object" && "AI" in env
          ? (env as { AI?: Parameters<typeof handleChatPost>[2] }).AI
          : undefined;
      return handleChatPost(request, fetch, cloudflareAI, env as Record<string, string | undefined>);
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
