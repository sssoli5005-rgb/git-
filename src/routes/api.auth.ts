import { createFileRoute } from "@tanstack/react-router";
import {
  clearedSessionCookie,
  createSession,
  hasAuthConfiguration,
  isValidSession,
  sessionCookie,
  verifyCredentials,
} from "@/lib/auth";

export const Route = createFileRoute("/api/auth")({
  server: {
    handlers: {
      GET: ({ request }) => {
        const authenticated = isValidSession(request.headers.get("cookie"));
        return Response.json({
          authenticated,
          username: authenticated ? process.env.APP_USERNAME?.trim() ?? null : null,
        });
      },
      POST: async ({ request }) => {
        if (!hasAuthConfiguration()) {
          return Response.json({ code: "auth_not_configured" }, { status: 503 });
        }
        const body = await request.json().catch(() => null) as { username?: unknown; password?: unknown } | null;
        if (typeof body?.username !== "string" || typeof body?.password !== "string") {
          return Response.json({ code: "invalid_request" }, { status: 400 });
        }
        if (!verifyCredentials(body.username, body.password)) {
          console.info("[auth] Login rejected");
          await new Promise((resolve) => setTimeout(resolve, 250));
          return Response.json({ code: "invalid_credentials" }, { status: 401 });
        }
        return new Response(JSON.stringify({ authenticated: true }), {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            "Set-Cookie": sessionCookie(createSession(body.username)),
            "Cache-Control": "no-store",
          },
        });
      },
      DELETE: () =>
        new Response(null, {
          status: 204,
          headers: { "Set-Cookie": clearedSessionCookie(), "Cache-Control": "no-store" },
        }),
    },
  },
});
