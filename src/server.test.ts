import { afterEach, describe, expect, it, vi } from "vitest";

import server from "./server";
import { createSession } from "./lib/auth";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("production chat research wiring", () => {
  it("routes Saint Catherine through the protected chat and falls back to its official source-backed answer", async () => {
    vi.stubEnv("APP_USERNAME", "athara-test-user");
    vi.stubEnv("APP_SESSION_SECRET", "athara-test-session-secret");

    const sourceUrl = "https://egymonuments.gov.eg/en/world-heritage/saint-catherine-s-monastery-and-its-surrounding-area";
    const excerpt = "Saint Catherine's Monastery was built by order of Byzantine Emperor Justinian I in 548–565 AD. It includes the Church of the Transfiguration and the Church of the Burning Bush, a Fatimid mosque from the 12th century, and a library with 6,000 manuscripts.";
    const websearch = vi.fn(async ({ provider, query }: { provider: "exa" | "linkup" | "ceramic"; query: string }) => {
      expect(query).toContain("سانت كاترين");
      if (provider !== "exa") return Response.json({ items: [] });
      return Response.json({ items: [{
        title: "Saint Catherine’s Monastery and its surrounding area",
        url: sourceUrl,
        description: excerpt,
      }] });
    });
    const fetcher = vi.fn<typeof fetch>(async (input) => {
      const url = new URL(String(input));
      if (url.hostname === "egymonuments.gov.eg" || url.hostname === "whc.unesco.org") {
        return new Response("Access temporarily blocked", { status: 403 });
      }
      if (url.hostname === "ar.wikipedia.org") {
        return Response.json({ query: { search: [] } });
      }
      if (url.hostname === "api.groq.com") {
        return Response.json({
          choices: [{
            finish_reason: "stop",
            message: { content: "No verified live citation was attached." },
          }],
        });
      }
      throw new Error(`Unexpected request to ${url.hostname}.`);
    });
    vi.stubGlobal("fetch", fetcher);

    const token = createSession("athara-test-user");
    const request = new Request("https://athara.test/api/chat", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        cookie: `ekhtaberha_session=${token}`,
      },
      body: JSON.stringify({
        language: "ar",
        messages: [{ role: "user", content: "و ايه الي موجود في سانت كاترين ؟" }],
      }),
    });
    const response = await server.fetch(
      request,
      { CHAT_GROQ_API_KEY: "test-groq-key", AI: { websearch } },
      {},
    );
    const body = await response.text();

    expect(response.status).toBe(200);
    expect(body).toContain("دير سانت كاترين");
    expect(body).toContain("كنيسة العليقة المشتعلة");
    expect(websearch).toHaveBeenCalledTimes(3);
  });


  it("uses Cloudflare Web Search snippets when a trusted source blocks direct page retrieval", async () => {
    vi.stubEnv("APP_USERNAME", "athara-test-user");
    vi.stubEnv("APP_SESSION_SECRET", "athara-test-session-secret");

    const sourceUrl =
      "https://www.biblegateway.com/passage/?search=Joshua+24%3A32&version=NIV";
    const searchExcerpt =
      "Joshua 24:32 states that the bones of Joseph, which the Israelites had brought up from Egypt, were buried at Shechem in the land Jacob bought from the sons of Hamor. The passage connects the burial place with the inheritance of Joseph's descendants.";
    const websearch = vi.fn(async ({ provider }: { provider: "exa" | "linkup" | "ceramic" }) => {
      if (provider !== "exa") return Response.json({ items: [] });
      return Response.json({
        items: [{
          title: "Joshua 24:32 — Joseph's bones buried at Shechem",
          url: sourceUrl,
          description: searchExcerpt,
        }],
      });
    });

    const fetcher = vi.fn<typeof fetch>(async (input, init) => {
      const url = new URL(String(input));
      if (url.hostname === "www.biblegateway.com") {
        return new Response("Access temporarily blocked", { status: 403 });
      }
      if (url.hostname === "api.groq.com") {
        const payload = JSON.parse(String(init?.body)) as {
          messages: { role: string; content: string }[];
          tools?: Array<{ type?: string }>;
        };
        expect(payload.tools).toEqual([{ type: "browser_search" }]);
        expect(payload.messages[0]?.content).toContain("Search-index excerpt");
        expect(payload.messages[0]?.content).toContain("buried at Shechem");
        return Response.json({
          choices: [{
            finish_reason: "stop",
            message: { content: "بحسب سفر يشوع 24:32، دُفنت عظام يوسف في شكيم." },
          }],
        });
      }
      throw new Error(`Unexpected request to ${url.hostname}.`);
    });
    vi.stubGlobal("fetch", fetcher);

    const token = createSession("athara-test-user");
    const request = new Request("https://athara.test/api/chat", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        cookie: `ekhtaberha_session=${token}`,
      },
      body: JSON.stringify({
        language: "ar",
        messages: [{ role: "user", content: "ماذا يقول سفر يشوع 24:32 عن مكان دفن العظام؟" }],
      }),
    });
    const response = await server.fetch(
      request,
      {
        CHAT_GROQ_API_KEY: "test-groq-key",
        AI: { websearch },
      },
      {},
    );
    const body = await response.text();

    expect(response.status).toBe(200);
    expect(body).toContain("بحسب سفر يشوع 24:32، دُفنت عظام يوسف في شكيم.");
    expect(websearch).toHaveBeenCalledTimes(3);
    expect(websearch).toHaveBeenCalledWith(expect.objectContaining({
      gatewayId: "default",
      provider: "exa",
      limit: 6,
    }));
    expect(fetcher).toHaveBeenCalledTimes(2);
  });
});
