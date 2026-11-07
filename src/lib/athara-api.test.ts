import { describe, expect, it, vi } from "vitest";
import { handleAtharaApiRequest } from "./athara-api";

const png =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+j0ioAAAAASUVORK5CYII=";

describe("ATHARA API dispatch in the production server entry", () => {
  it("dispatches health checks to the Cloudflare Worker", async () => {
    const response = await handleAtharaApiRequest(new Request("https://athara.test/api/health"), {
      AI: { run: vi.fn() },
    });
    expect(response?.status).toBe(200);
    await expect(response?.json()).resolves.toMatchObject({
      ok: true,
      service: "ATHARA",
      aiBound: true,
    });
  });

  it("reads Cloudflare bindings from Nitro's request runtime", async () => {
    const run = vi.fn().mockResolvedValue({
      response: JSON.stringify({
        visualDescription: "شكل حجري",
        objectType: "قطعة غير محددة",
        keywords: ["حجر"],
        periodClues: [],
      }),
    });
    const request = new Request("https://athara.test/api/health");
    Object.defineProperty(request, "runtime", {
      value: { cloudflare: { env: { AI: { run } } } },
    });
    const response = await handleAtharaApiRequest(request);
    expect(response?.status).toBe(200);
    await expect(response?.json()).resolves.toMatchObject({
      ok: true,
      service: "ATHARA",
      aiBound: true,
    });
  });

  it("uses the local Gemma vision model in development without Cloudflare bindings", async () => {
    vi.stubEnv("NODE_ENV", "development");
    try {
      const response = await handleAtharaApiRequest(
        new Request("https://athara.test/api/health"),
        {},
      );
      expect(response?.status).toBe(200);
      await expect(response?.json()).resolves.toMatchObject({
        aiBound: false,
        visionProvider: "Ollama (local)",
        visionModel: "gemma3:4b",
      });
    } finally {
      vi.unstubAllEnvs();
    }
  });

  it("uses Gemini Vision when a Gemini key is configured", async () => {
    vi.stubEnv("GEMINI_API_KEY", "local-test-key");
    try {
      const response = await handleAtharaApiRequest(
        new Request("https://athara.test/api/health"),
        {},
      );
      expect(response?.status).toBe(200);
      await expect(response?.json()).resolves.toMatchObject({
        visionProvider: "Gemini Vision",
        visionModel: "gemini-2.5-flash",
      });
    } finally {
      vi.unstubAllEnvs();
    }
  });

  it("keeps the scanner on Cloudflare vision regardless of a local Groq key", async () => {
    vi.stubEnv("GROQ_API_KEY", "local-test-key");
    try {
      const response = await handleAtharaApiRequest(
        new Request("https://athara.test/api/health"),
        {},
      );
      expect(response?.status).toBe(200);
      await expect(response?.json()).resolves.toMatchObject({
        visionProvider: "Cloudflare Workers AI",
        visionModel: "@cf/meta/llama-3.2-11b-vision-instruct",
      });
    } finally {
      vi.unstubAllEnvs();
    }
  });

  it("returns a visual description without claiming an artifact identity without reverse-image search", async () => {
    vi.stubEnv("GEMINI_API_KEY", "");
    vi.stubEnv("OLLAMA_BASE_URL", "");
    const run = vi.fn().mockResolvedValue({
      response: JSON.stringify({
        visualDescription: "شكل حجري صغير",
        objectType: "قطعة غير محددة",
        keywords: ["حجر"],
        periodClues: [],
      }),
    });
    const response = await handleAtharaApiRequest(
      new Request("https://athara.test/api/scan", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ image: png, language: "ar", mode: "objects" }),
      }),
      { AI: { run } },
    );
    expect(response?.status).toBe(200);
    await expect(response?.json()).resolves.toMatchObject({
      ok: true,
      analysis: expect.stringContaining("شكل حجري صغير"),
      resultType: "unverified",
      reverseImageSearchStatus: "unavailable",
      confidenceByField: expect.objectContaining({ identity: "low" }),
    });
    expect(run).toHaveBeenCalledOnce();
  });

  it("leaves unrelated routes to TanStack Start", () => {
    expect(
      handleAtharaApiRequest(new Request("https://athara.test/api/chat", { method: "POST" }), {}),
    ).toBeNull();
  });
});
