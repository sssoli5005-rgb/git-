import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createSession, sessionCookie } from "@/lib/auth";
import { handleVisionConsent } from "./api.vision-consent";

beforeEach(() => {
  vi.stubEnv("APP_USERNAME", "scanner-admin");
  vi.stubEnv("APP_SESSION_SECRET", "test-session-secret");
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

function createRequest(
  body: unknown,
  options: { authenticated?: boolean; origin?: string } = {},
) {
  const headers = new Headers({ "Content-Type": "application/json" });
  if (options.authenticated) {
    headers.set("Cookie", sessionCookie(createSession("scanner-admin")).split(";")[0]);
  }
  if (options.origin) headers.set("Origin", options.origin);
  return new Request("https://athara.test/api/vision-consent", {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
}

describe("vision model consent", () => {
  it("requires a valid app session", async () => {
    const ai = { run: vi.fn() };
    const response = await handleVisionConsent(createRequest({ confirmed: true }), ai);

    expect(response.status).toBe(401);
    expect(ai.run).not.toHaveBeenCalled();
  });

  it("requires an explicit confirmation", async () => {
    const ai = { run: vi.fn() };
    const response = await handleVisionConsent(
      createRequest({ confirmed: false }, { authenticated: true }),
      ai,
    );

    expect(response.status).toBe(400);
    expect(ai.run).not.toHaveBeenCalled();
  });

  it("rejects cross-origin requests", async () => {
    const ai = { run: vi.fn() };
    const response = await handleVisionConsent(
      createRequest({ confirmed: true }, { authenticated: true, origin: "https://attacker.test" }),
      ai,
    );

    expect(response.status).toBe(403);
    expect(ai.run).not.toHaveBeenCalled();
  });

  it("sends the one-time agreement prompt only after confirmation", async () => {
    const ai = { run: vi.fn().mockResolvedValue({ response: "accepted" }) };
    const response = await handleVisionConsent(
      createRequest({ confirmed: true }, { authenticated: true, origin: "https://athara.test" }),
      ai,
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ accepted: true });
    expect(ai.run).toHaveBeenCalledOnce();
    expect(ai.run).toHaveBeenCalledWith("@cf/meta/llama-3.2-11b-vision-instruct", {
      prompt: "agree",
    });
  });
});