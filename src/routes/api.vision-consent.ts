import { createFileRoute } from "@tanstack/react-router";
import { isValidSession } from "@/lib/auth";

const VISION_MODEL = "@cf/meta/llama-3.2-11b-vision-instruct";

type CloudflareAI = {
  run(model: string, input: { prompt: string }): Promise<unknown>;
};

type RequestWithCloudflareRuntime = Request & {
  runtime?: { cloudflare?: { env?: { AI?: CloudflareAI } } };
};

export async function handleVisionConsent(
  request: Request,
  ai: CloudflareAI | undefined,
): Promise<Response> {
  if (!isValidSession(request.headers.get("cookie"))) {
    return Response.json({ code: "unauthorized" }, { status: 401 });
  }

  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) {
    return Response.json({ code: "invalid_origin" }, { status: 403 });
  }

  const body = await request.json().catch(() => null) as { confirmed?: unknown } | null;
  if (body?.confirmed !== true) {
    return Response.json({ code: "confirmation_required" }, { status: 400 });
  }
  if (!ai) {
    return Response.json({ code: "model_unavailable" }, { status: 503 });
  }

  try {
    await ai.run(VISION_MODEL, { prompt: "agree" });
    return Response.json({ accepted: true }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    console.error("[Vision consent] Cloudflare did not accept the model agreement request.");
    return Response.json({ code: "agreement_failed" }, { status: 502 });
  }
}

export const Route = createFileRoute("/api/vision-consent")({
  server: {
    handlers: {
      POST: ({ request }) =>
        handleVisionConsent(
          request,
          (request as RequestWithCloudflareRuntime).runtime?.cloudflare?.env?.AI,
        ),
    },
  },
});