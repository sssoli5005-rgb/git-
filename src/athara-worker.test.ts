import { describe, expect, it, vi } from "vitest";
import worker from "./athara-worker.js";

const png =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+j0ioAAAAASUVORK5CYII=";

function post(path: string, body: unknown) {
  return new Request(`https://athara.test${path}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

function stubEmptyHeritageSearch() {
  const fetchMock = vi.fn().mockResolvedValue(
    new Response(JSON.stringify({ query: { pages: {} } }), {
      status: 200,
      headers: { "content-type": "application/json" },
    }),
  );
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

function expectUnverifiedScan(body: {
  resultType?: string;
  analysis?: string;
  confidenceByField?: Record<string, string>;
}) {
  expect(body.resultType).toBe("unverified");
  expect(body.analysis).toMatch(/لم يتم التأكد من الهوية بدقة|اسم محتمل غير مؤكد/);
  expect(body.confidenceByField).toMatchObject({
    identity: "low",
    place: "low",
    period: "low",
  });
}

describe("ATHARA Cloudflare Worker", () => {
  it("uses Cloudflare Web Search as the search provider when Gemini and Groq keys are absent", async () => {
    const catalogueUrl = "https://egymonuments.gov.eg/ar/collections/wooden-figure-catalogue";
    const websearch = vi.fn(async (args: { gatewayId: string; query: string; provider: string; limit: number }) => {
      expect(args.gatewayId).toBe("default");
      expect(args.provider).toBe("exa");
      expect(args.limit).toBe(10);
      expect(args.query).toContain("painted wooden figure");
      return Response.json({
        items: [{
          title: "Painted wooden Egyptian figure — official collection",
          url: catalogueUrl,
          description: "An ancient Egyptian painted wooden figure recorded in the official collection.",
        }],
      });
    });
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input instanceof Request ? input.url : input);
      if (url === catalogueUrl) return new Response("catalogue temporarily unavailable", { status: 503 });
      if (url.includes("egymonuments.gov.eg") && !url.includes("/ar/collections/")) {
        return new Response("<html><body><a href='/ar/'>Home</a></body></html>", {
          status: 200, headers: { "content-type": "text/html" },
        });
      }
      return Response.json({ data: [], objectIDs: [], query: { pages: {} }, search: [], entities: {} });
    });
    vi.stubGlobal("fetch", fetchMock);
    const aiRun = vi.fn(async (model: string) => {
      if (model === "@cf/moondream/moondream3.1-9B-A2B") {
        return { response: JSON.stringify({
          visualDescription: "A painted wooden figure with a long head covering",
          objectType: "wooden figure",
          material: "painted wood",
          keywords: ["painted wooden figure"],
          searchTerms: ["painted wooden figure"],
        }) };
      }
      throw new Error("No image candidates to embed");
    });
    try {
      const response = await worker.fetch(
        post("/api/scan", { image: png, language: "en", mode: "objects" }),
        {
          AI: { run: aiRun, websearch },
          ASSETS: { fetch: vi.fn(async () => new Response("", { status: 404 })) },
        },
      );
      const body = await response.json();
      expect(response.status).toBe(200);
      expect(websearch).toHaveBeenCalledTimes(1);
      expect(body.identificationStatus).toBe("unverified");
      expect(body.reverseImageSearchStatus).not.toBe("failed");
      expect(body.sources).toContainEqual(expect.objectContaining({
        title: "Painted wooden Egyptian figure — official collection",
        url: catalogueUrl,
        trusted: true,
      }));
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it("uses Gemini's structured Google Search results when the visual model cannot name the artifact", async () => {
    const catalogueUrl = "https://www.metmuseum.org/art/collection/search/544450";
    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input instanceof Request ? input.url : input);
      if (url === "https://generativelanguage.googleapis.com/v1beta/interactions") {
        const requestBody = JSON.parse(String(init?.body));
        expect(requestBody.tools).toEqual([{ type: "google_search" }]);
        expect(requestBody.input).toContain("painted wooden figure");
        return Response.json({
          steps: [
            { type: "google_search_call", arguments: { queries: ["painted wooden figure ancient Egypt museum"] } },
            { type: "google_search_result", result: [{
              title: "Ancient Egyptian wooden figure",
              url: catalogueUrl,
              snippet: "Painted wooden figure from ancient Egypt, in the museum collection.",
            }] },
            { type: "model_output", content: [{ type: "text", text: "Found one collection record." }] },
          ],
        });
      }
      if (url === catalogueUrl) {
        return new Response("temporarily unavailable", { status: 503 });
      }
      return Response.json({ data: [], objectIDs: [], query: { pages: {} }, search: [], entities: {} });
    });
    vi.stubGlobal("fetch", fetchMock);
    const aiRun = vi.fn(async (model: string) => {
      if (model === "@cf/moondream/moondream3.1-9B-A2B") {
        return { response: JSON.stringify({
          visualDescription: "A painted wooden figure wearing a long head covering",
          objectType: "wooden figure",
          material: "painted wood",
          style: "ancient Egyptian funerary sculpture",
          keywords: ["wooden figure", "painted wood"],
          searchTerms: ["painted wooden figure"],
        }) };
      }
      throw new Error("Embeddings not needed in this test");
    });
    try {
      const response = await worker.fetch(
        post("/api/scan", { image: png, language: "en", mode: "objects" }),
        {
          AI: { run: aiRun },
          GEMINI_API_KEY: "gemini-test-key",
          ASSETS: { fetch: vi.fn(async () => new Response("", { status: 404 })) },
        },
      );
      const body = await response.json();
      expect(response.status).toBe(200);
      expect(body.identificationStatus).toBe("unverified");
      expect(body.reverseImageSearchStatus).not.toBe("failed");
      expect(body.sources).toContainEqual(expect.objectContaining({
        title: "Ancient Egyptian wooden figure",
        url: catalogueUrl,
        trusted: true,
      }));
      expect(body.analysis).toContain("Ancient Egyptian wooden figure");
      expect(body.analysis).not.toContain("تعذر إكمال البحث العكسي");
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it("preserves Groq structured browser citations when Gemini quota is exhausted", async () => {
    const catalogueUrl = "https://egymonuments.gov.eg/ar/collections/wooden-statue-example";
    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input instanceof Request ? input.url : input);
      if (url === "https://generativelanguage.googleapis.com/v1beta/interactions") {
        return Response.json({ error: { message: "Gemini quota exhausted" } }, { status: 429 });
      }
      if (url === "https://api.groq.com/openai/v1/chat/completions") {
        const requestBody = JSON.parse(String(init?.body));
        if (requestBody.tools?.some((tool: { type?: string }) => tool.type === "browser_search")) {
          return Response.json({
            choices: [{
              message: {
                content: "Search completed.",
                citations: [{
                  title: "Wooden Egyptian Statue — Ministry collection",
                  url: catalogueUrl,
                  description: "A painted wooden figure in the Egyptian collection.",
                }],
              },
            }],
          });
        }
        return Response.json({
          choices: [{ message: { content: JSON.stringify({ rankedMatches: [] }) } }],
        });
      }
      if (url === catalogueUrl) {
        return new Response("temporarily unavailable", { status: 503 });
      }
      return Response.json({ data: [], objectIDs: [], query: { pages: {} }, search: [], entities: {} });
    });
    vi.stubGlobal("fetch", fetchMock);
    const aiRun = vi.fn(async (model: string) => {
      if (model === "@cf/moondream/moondream3.1-9B-A2B") {
        return { response: JSON.stringify({
          visualDescription: "A painted wooden Egyptian funerary figure",
          objectType: "wooden figure",
          material: "wood",
          searchTerms: ["painted wooden Egyptian statue"],
          keywords: ["painted", "wooden figure"],
        }) };
      }
      throw new Error("Embeddings not needed in this test");
    });
    try {
      const response = await worker.fetch(
        post("/api/scan", { image: png, language: "en", mode: "objects" }),
        {
          AI: { run: aiRun },
          GEMINI_API_KEY: "gemini-test-key",
          GROQ_API_KEY: "groq-test-key",
          ASSETS: { fetch: vi.fn(async () => new Response("", { status: 404 })) },
        },
      );
      const body = await response.json();
      expect(response.status).toBe(200);
      expect(body.identificationStatus).toBe("unverified");
      expect(body.reverseImageSearchStatus).not.toBe("failed");
      expect(body.sources).toContainEqual(expect.objectContaining({
        title: "Wooden Egyptian Statue — Ministry collection",
        url: catalogueUrl,
        trusted: true,
      }));
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it("uses Groq catalogue search when Gemini is unavailable and compares official ministry-hosted reference photos", async () => {
    const catalogueUrl = "https://egymonuments.gov.eg/ar/collections/wooden-statue-of-nephthys";
    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input instanceof Request ? input.url : input);
      if (url === "https://api.groq.com/openai/v1/chat/completions") {
        const body = JSON.parse(String(init?.body));
        if (body.tools?.some((tool: { type?: string }) => tool.type === "browser_search")) {
          expect(body.messages[0].content).toContain("Nephthys");
          expect(body.messages[0].content).toContain("wooden statue");
          return Response.json({
            choices: [{ message: { content:
              "[Wooden Statue of Nephthys](https://egymonuments.gov.eg/ar/collections/wooden-statue-of-nephthys)" } }],
          });
        }
        return Response.json({
          choices: [{ message: { content: JSON.stringify({
            rankedMatches: [{
              candidateId: "C1",
              similarity: 0.94,
              visualEvidence: ["same distinctive crown silhouette", "same profile and shoulder shape"],
            }],
          }) } }],
        });
      }
      if (url === catalogueUrl) {
        return new Response(
          '<html><head><title>Wooden Statue of Nephthys</title>' +
          '<meta property="og:image" content="https://egymonuments.gov.eg/media/nephthys-reference.jpg"></head>' +
          '<body><main><p>A wooden statue of Nephthys displayed at the Luxor Mummification Museum.</p></main></body></html>',
          { status: 200, headers: { "content-type": "text/html; charset=utf-8" } },
        );
      }
      if (url === "https://egymonuments.gov.eg/media/nephthys-reference.jpg") {
        return new Response(new Uint8Array([0xff, 0xd8, 0xff, 0xd9]), {
          status: 200, headers: { "content-type": "image/jpeg" },
        });
      }
      return Response.json({ data: [], objectIDs: [], query: { pages: {} }, search: [], entities: {} });
    });
    vi.stubGlobal("fetch", fetchMock);
    const aiRun = vi.fn(async (model: string) => {
      if (model === "@cf/moondream/moondream3.1-9B-A2B") {
        return { response: JSON.stringify({
          visualDescription: "تمثال خشبي ملون لامرأة بغطاء رأس",
          identity: "تمثال خشبي للمعبودة نفتيس",
          objectType: "wooden statue",
          material: "wood",
          searchTerms: ["wooden statue", "Nephthys"],
          keywords: ["painted wood", "female deity"],
        }) };
      }
      throw new Error("Embedding service unavailable in this test");
    });
    try {
      const response = await worker.fetch(
        post("/api/scan", { image: png, language: "ar", mode: "objects" }),
        {
          AI: { run: aiRun },
          GROQ_API_KEY: "groq-test-key",
          SCANNER_MATCH_THRESHOLD: "0.80",
          ASSETS: { fetch: vi.fn(async () => new Response("", { status: 404 })) },
        },
      );
      const body = await response.json();
      expect(response.status).toBe(200);
      expect(body).toMatchObject({
        ok: true,
        resultType: "reference_match",
        identificationStatus: "confirmed",
        reverseImageSearchStatus: "match",
        matchedArtifact: { name: "Wooden Statue of Nephthys", similarity: 0.94 },
      });
      expect(fetchMock.mock.calls.some(([input]) =>
        String(input instanceof Request ? input.url : input) === "https://egymonuments.gov.eg/media/nephthys-reference.jpg",
      )).toBe(true);
      expect(fetchMock.mock.calls.some(([input]) =>
        String(input instanceof Request ? input.url : input).includes("generativelanguage.googleapis.com/v1beta/interactions"),
      )).toBe(false);
    } finally {
      vi.unstubAllGlobals();
    }
  });

  // Keep the regression suite aligned with trusted visual evidence and isolated free-fallback behavior.
  it("reports the two Cloudflare vision models", async () => {
    const response = await worker.fetch(new Request("https://athara.test/api/health"), {
      AI: { run: vi.fn() },
      ASSETS: { fetch: vi.fn() },
    });
    const body = await response.json();
    expect(response.status).toBe(200);
    expect(body).toMatchObject({
      ok: true,
      service: "ATHARA",
      aiBound: true,
      visionProvider: "Cloudflare Workers AI",
      visionModel: "@cf/moondream/moondream3.1-9B-A2B",
      visionFallbackModel: "@cf/mistralai/mistral-small-3.1-24b-instruct",
      visionFallbackModels: [
        "@cf/mistralai/mistral-small-3.1-24b-instruct",
        "@cf/meta/llama-4-scout-17b-16e-instruct",
      ],
    });
  });

  it("reports when Cloudflare Web Search is genuinely available on the AI binding", async () => {
    const response = await worker.fetch(new Request("https://athara.test/api/health"), {
      AI: {
        run: vi.fn(),
        websearch: vi.fn(),
      },
      ASSETS: { fetch: vi.fn() },
      GEMINI_API_KEY: "gemini-key",
      GROQ_API_KEY: "groq-key",
    });
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.reverseImageSearch).toMatchObject({
      geminiGoogleSearch: true,
      groqBrowserSearch: true,
      cloudflareWebSearch: true,
    });
  });

  it("does not claim Cloudflare Web Search is configured when the binding lacks websearch", async () => {
    const response = await worker.fetch(new Request("https://athara.test/api/health"), {
      AI: { run: vi.fn() },
      ASSETS: { fetch: vi.fn() },
    });
    const body = await response.json();

    expect(body.reverseImageSearch.cloudflareWebSearch).toBe(false);
  });

  it("reports the configured scanner failover order", async () => {
    const response = await worker.fetch(new Request("https://athara.test/api/health"), {
      AI: { run: vi.fn() },
      ASSETS: { fetch: vi.fn() },
      GEMINI_API_KEY: "gemini-key",
      GROQ_API_KEY: "groq-key",
      OLLAMA_BASE_URL: "http://127.0.0.1:11434",
    });
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.visionProviderOrder).toEqual(["Cloudflare", "Gemini", "Groq"]);
    expect(body.visionFallbackOrder).toEqual(["Gemini", "Groq"]);
  });

  it("falls through Gemini and Groq failures to Cloudflare, and stops at the first usable result", async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input instanceof Request ? input.url : input);
      if (url.startsWith("https://generativelanguage.googleapis.com/")) {
        return new Response(JSON.stringify({ error: { message: "Gemini quota exhausted" } }), {
          status: 429, headers: { "content-type": "application/json" },
        });
      }
      if (url === "https://api.groq.com/openai/v1/chat/completions") {
        return new Response(JSON.stringify({ choices: [{ message: { content: "{}" } }] }), {
          status: 200, headers: { "content-type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ query: { pages: {} } }), {
        status: 200, headers: { "content-type": "application/json" },
      });
    });
    vi.stubGlobal("fetch", fetchMock);
    const run = vi.fn().mockResolvedValue({
      response: JSON.stringify({
        visualDescription: "نقش بارز على جدار حجري",
        objectType: "نقش جداري",
        keywords: ["نقش", "حجر"],
      }),
    });
    try {
      const response = await worker.fetch(
        post("/api/scan", { image: png, language: "ar", mode: "objects" }),
        {
          GEMINI_API_KEY: "gemini-key",
          GROQ_API_KEY: "groq-key",
          AI: { run },
          ASSETS: { fetch: vi.fn(async () => new Response("", { status: 404 })) },
        },
      );
      const body = await response.json();
      expect(response.status).toBe(200);
      expect(body.ok).toBe(true);
      expect(body.analysis).toContain("نقش بارز على جدار حجري");
      expect(run).toHaveBeenCalledTimes(1);
      expect(run.mock.calls[0][0]).toBe("@cf/moondream/moondream3.1-9B-A2B");
      expect(fetchMock.mock.calls.some(([input]) =>
        String(input instanceof Request ? input.url : input).includes("generativelanguage.googleapis.com"),
      )).toBe(true);
      expect(fetchMock.mock.calls.some(([input]) =>
        String(input instanceof Request ? input.url : input).includes("api.groq.com"),
      )).toBe(true);
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it("keeps GEMINI_MODEL separate from the scanner vision model", async () => {
    const response = await worker.fetch(new Request("https://athara.test/api/health"), {
      GEMINI_API_KEY: "gemini-key",
      GEMINI_MODEL: "gemini-2.5-flash",
    });
    const body = await response.json();

    expect(body.visionModel).toBe("gemini-3.8-flash");
    expect(body.visionEngines[0].model).toBe("gemini-3.8-flash");
  });

  it("confirms a FAISS match only when the top two results share a source entity", async () => {
    const metadata = {
      title_ar: "قناع توت عنخ آمون",
      title_en: "Tutankhamun's funerary mask",
      institution: "The Egyptian Museum",
      city: "Cairo",
      country: "Egypt",
      accession_number: "JE 60672",
      period: "18th Dynasty",
      description: "Museum catalog description.",
      page_url: "https://egymonuments.gov.eg/ar/collections/tutankhamun-mask/",
      source: "Egyptian Ministry of Tourism and Antiquities",
    };
    const fetchMock = vi.fn(async () => Response.json({
      results: [
        { entityId: "Q123", similarity: 0.91, metadata },
        { entityId: "Q123", similarity: 0.87, metadata },
      ],
      topTwoSameEntity: true,
    }));
    vi.stubGlobal("fetch", fetchMock);
    try {
      const response = await worker.fetch(
        post("/api/scan", { image: png, language: "ar", mode: "objects" }),
        { SCANNER_INDEX_URL: "http://127.0.0.1:8765", SCANNER_INDEX_MATCH_THRESHOLD: "0.85" },
      );
      const body = await response.json();

      expect(body).toMatchObject({
        resultType: "reference_match",
        identificationStatus: "confirmed",
        reverseImageSearchStatus: "match",
        matchedArtifact: {
          name: "قناع توت عنخ آمون",
          museum: "The Egyptian Museum",
          objectNumber: "JE 60672",
          location: "The Egyptian Museum, Cairo, Egypt",
          similarity: 0.91,
        },
        sources: [{ url: metadata.page_url, trusted: true }],
      });
      expect(fetchMock).toHaveBeenCalledOnce();
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it("uses an evidence-qualified artifact identity prompt when FAISS candidates do not agree", async () => {
    const run = vi.fn().mockResolvedValue({
      response: JSON.stringify({ visualDescription: "A gilded funerary mask", objectType: "Mask" }),
    });
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      if (String(input).endsWith("/search")) {
        return Response.json({ results: [
          { entityId: "Q123", similarity: 0.89, metadata: {
            title_en: "Candidate A",
            institution: "The Met",
            page_url: "https://www.metmuseum.org/art/collection/search/123",
            source: "The Metropolitan Museum of Art",
            description: "Museum catalog description.",
          } },
          { entityId: "Q456", similarity: 0.84, metadata: {
            title_en: "Candidate B",
            page_url: "https://www.metmuseum.org/art/collection/search/456",
            source: "The Metropolitan Museum of Art",
          } },
        ] });
      }
      return Response.json({ query: { pages: {} }, search: [] });
    });
    vi.stubGlobal("fetch", fetchMock);
    try {
      const response = await worker.fetch(
        post("/api/scan", { image: png, language: "ar", mode: "objects" }),
        {
          SCANNER_INDEX_URL: "http://127.0.0.1:8765",
          SCANNER_INDEX_MATCH_THRESHOLD: "0.85",
          SCANNER_PROBABLE_THRESHOLD: "0.65",
          AI: { run },
        },
      );
      const body = await response.json();
      const prompt = run.mock.calls[0][1].question as string;

      expect(body.identificationStatus).toBe("probable");
      expect(prompt).toContain("أقرب اسم معروف");
      expect(prompt).toContain("identityEvidence");
      expect(prompt).toContain("احتمال");
      expect(prompt).not.toContain("لا تذكر أسماء أو هوية");
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it("keeps an official catalog text match unverified without an image match", async () => {
    const catalogUrl = "https://egymonuments.gov.eg/ar/archaeological-sites/abu-simbel/";
    const record = {
      id: "abu-simbel",
      title: "أبو سمبل - إكتشف الآثار المصرية",
      description: "معبد أبو سمبل الكبير تم قطعه بالكامل في الجبل. تشتهر واجهته بالتماثيل الأربعة الضخمة جالسة.",
      keywords: ["أبو سمبل"],
      mode: "both",
      sourceTitle: "وزارة السياحة والآثار المصرية",
      sourceUrl: catalogUrl,
      imageUrls: [],
    };
    const distractor = {
      id: "sehel-rock-inscriptions",
      title: "النقوش الصخرية بجزيرة سهيل - إكتشف الآثار المصرية",
      description: "نقوش صخرية هيروغليفية محفورة على الجرانيت في جزيرة سهيل.",
      keywords: ["النقوش الصخرية", "جزيرة سهيل"],
      mode: "both",
      sourceTitle: "وزارة السياحة والآثار المصرية",
      sourceUrl: "https://egymonuments.gov.eg/ar/monuments/rock-inscriptions-of-sehel-island/",
      imageUrls: [],
    };
    const fetchMock = vi.fn(async () => Response.json({ query: { pages: {} }, search: [] }));
    vi.stubGlobal("fetch", fetchMock);
    try {
      const run = vi.fn().mockResolvedValue({
        response: JSON.stringify({
          visualDescription: "واجهة معبد منحوت في الجبل، وتماثيل ضخمة جالسة",
          objectType: "معبد صخري",
          material: "حجر رملي",
          symbols: ["أربعة تماثيل جالسة"],
          style: "نحت صخري ضخم",
          searchTerms: ["rock-cut temple facade", "four seated statues", "منحوت في الجبل"],
          keywords: ["rock-cut", "seated", "facade"],
        }),
      });
      const response = await worker.fetch(
        post("/api/scan", { image: png, language: "ar", mode: "objects" }),
        {
          AI: { run },
          ASSETS: { fetch: vi.fn(async (input: RequestInfo | URL) => {
            if (String(input).endsWith("/egypt-monuments-official.json")) {
              return Response.json({ records: [distractor, record] });
            }
            return new Response("", { status: 404 });
          }) },
        },
      );
      const body = await response.json();

      expect(body.identificationStatus).toBe("unverified");
      expect(body.resultType).toBe("unverified");
      expect(body.matchedArtifact).toBeUndefined();
      expect(body.sources).toContainEqual(expect.objectContaining({
        url: "https://egymonuments.gov.eg/ar/archaeological-sites/abu-simbel",
        trusted: true,
      }));
      expect(body.analysis).not.toContain("confirmed");
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it("uses Groq multimodal comparison when Gemini image matching is unavailable", async () => {
    const candidateUrl = "https://commons.wikimedia.org/wiki/File:Abu_Simbel_temple.jpg";
    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const requestUrl = String(input instanceof Request ? input.url : input);
      if (requestUrl.startsWith("https://generativelanguage.googleapis.com/")) {
        const requestBody = JSON.parse(String(init?.body));
        if (requestBody.systemInstruction) {
          return Response.json({ candidates: [{ content: { parts: [{ text: JSON.stringify({
            visualDescription: "A rock-cut temple facade with four seated colossal statues",
            objectType: "Temple",
            material: "Sandstone",
            symbols: ["four seated figures"],
            style: "Rock-cut Egyptian architecture",
            searchTerms: ["rock-cut temple facade", "four seated colossal statues"],
            keywords: ["rock-cut", "four", "seated", "colossal"],
          }) }] } }] });
        }
        return new Response(JSON.stringify({ error: { message: "Gemini image comparison unavailable" } }), {
          status: 503,
          headers: { "content-type": "application/json" },
        });
      }
      if (requestUrl === "https://api.groq.com/openai/v1/chat/completions") {
        const requestBody = JSON.parse(String(init?.body));
        const content = requestBody.messages?.[0]?.content || [];
        if (Array.isArray(content) && content.some((part) => part.type === "image_url")) {
          expect(content.filter((part) => part.type === "image_url")).toHaveLength(2);
          return Response.json({ choices: [{ message: { content: JSON.stringify({
            rankedMatches: [{
              candidateId: "C1",
              similarity: 0.93,
              visualEvidence: ["four seated colossal statues", "rock-cut temple facade"],
            }],
          }) } }] });
        }
        return Response.json({ choices: [{ message: { content: "A rock-cut temple facade at Abu Simbel." } }] });
      }
      if (requestUrl.startsWith("https://upload.wikimedia.org/")) {
        return new Response(new Uint8Array([0xff, 0xd8, 0xff, 0xd9]), {
          status: 200,
          headers: { "content-type": "image/jpeg" },
        });
      }
      if (requestUrl.includes("commons.wikimedia.org/w/api.php") && requestUrl.includes("generator=search")) {
        return Response.json({ query: { pages: { "123": {
          pageid: 123,
          ns: 6,
          title: "File:Abu Simbel temple.jpg",
          imageinfo: [{
            thumburl: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ab/Abu_Simbel.jpg",
            url: "https://upload.wikimedia.org/wikipedia/commons/a/ab/Abu_Simbel.jpg",
            extmetadata: { ImageDescription: { value: "A rock-cut temple facade with four seated colossal statues at Abu Simbel." } },
          }],
        } } } });
      }
      if (requestUrl.includes("collectionapi.metmuseum.org")) return Response.json({ objectIDs: [] });
      if (requestUrl.includes("wikipedia.org") || requestUrl.includes("wikidata.org") || requestUrl.includes("commons.wikimedia.org")) {
        return Response.json({ query: { pages: {} }, search: [], entities: {} });
      }
      return new Response("<html></html>", { status: 200, headers: { "content-type": "text/html" } });
    });
    vi.stubGlobal("fetch", fetchMock);
    try {
      const response = await worker.fetch(
        post("/api/scan", { image: png, language: "ar", mode: "objects" }),
        { GEMINI_API_KEY: "gemini-key", GROQ_API_KEY: "groq-key", GROQ_MODEL: "qwen/qwen3.8-27b", ASSETS: { fetch: vi.fn(async () => new Response("", { status: 404 })) } },
      );
      const body = await response.json();

      expect(body.identificationStatus).toBe("confirmed");
      expect(body.resultType).toBe("reference_match");
      expect(body.matchedArtifact).toEqual(expect.objectContaining({
        name: "Abu Simbel temple",
        similarity: 0.93,
      }));
      expect(body.visualMatchMethod).toContain("Groq Qwen Vision");
      expect(body.reverseImageSearchStatus).toBe("match");
      expect(fetchMock.mock.calls.some(([input]) =>
        String(input) === "https://api.groq.com/openai/v1/chat/completions",
      )).toBe(true);
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it("falls back from Gemini to Groq when the first provider is rate limited", async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      if (url.startsWith("https://generativelanguage.googleapis.com/")) {
        return new Response(JSON.stringify({ error: { message: "429 Resource exhausted" } }), {
          status: 429,
          headers: { "content-type": "application/json" },
        });
      }
      if (url === "https://api.groq.com/openai/v1/chat/completions") {
        return new Response(JSON.stringify({
          choices: [{ message: { content: JSON.stringify({ visualDescription: "تمثال حجري", objectType: "تمثال", keywords: ["تمثال"], periodClues: [] }) } }],
        }), {
          status: 200,
          headers: { "content-type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ query: { pages: {} } }), {
        status: 200,
        headers: { "content-type": "application/json" },
      });
    });
    vi.stubGlobal("fetch", fetchMock);
    try {
      const response = await worker.fetch(
        post("/api/scan", { image: png, language: "ar", mode: "objects" }),
        {
          GEMINI_API_KEY: "gemini-key",
          GEMINI_VISION_MODEL: "gemini-3.8-flash",
          GROQ_API_KEY: "groq-key",
          GROQ_MODEL: "qwen/qwen3.8-27b",
          ASSETS: { fetch: vi.fn() },
        },
      );
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.resultType).toBe("unverified");
      expect(body.analysis).toContain("تمثال حجري");
      expect(fetchMock.mock.calls.some(([input]) => String(input).startsWith("https://generativelanguage.googleapis.com/"))).toBe(true);
      expect(fetchMock.mock.calls.some(([input]) => String(input) === "https://api.groq.com/openai/v1/chat/completions")).toBe(true);
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it("rejects a scan when the image is missing", async () => {
    const response = await worker.fetch(post("/api/scan", { language: "ar", mode: "objects" }), {
      AI: { run: vi.fn() },
      ASSETS: { fetch: vi.fn() },
    });

    expect(response.status).toBe(400);
  });

  it("rejects unsupported and malformed image data before calling the model", async () => {
    const run = vi.fn();
    const env = { AI: { run }, ASSETS: { fetch: vi.fn() } };

    const unsupported = await worker.fetch(
      post("/api/scan", { image: "data:image/gif;base64,R0lGODlh", language: "ar" }),
      env,
    );
    const malformed = await worker.fetch(
      post("/api/scan", { image: "data:image/png;base64,%%%not-base64%%%", language: "ar" }),
      env,
    );

    expect(unsupported.status).toBe(400);
    expect(malformed.status).toBe(400);
    expect(run).not.toHaveBeenCalled();
  });

  it("rejects a malformed enhanced image before calling the model", async () => {
    const run = vi.fn();
    const response = await worker.fetch(
      post("/api/scan", {
        image: png,
        enhancedImage: "data:image/jpeg;base64,%%%bad%%%",
        language: "ar",
        mode: "objects",
      }),
      { AI: { run }, ASSETS: { fetch: vi.fn() } },
    );

    expect(response.status).toBe(400);
    expect(run).not.toHaveBeenCalled();
  });

  it("rejects a malformed document-preprocessed image before calling the model", async () => {
    const run = vi.fn();
    const response = await worker.fetch(
      post("/api/scan", {
        image: png,
        documentImage: "data:image/png;base64,%%%bad%%%",
        language: "ar",
        mode: "hieroglyphs",
      }),
      { AI: { run }, ASSETS: { fetch: vi.fn() } },
    );

    expect(response.status).toBe(400);
    expect(await response.json()).toMatchObject({
      error: "نسخة تجهيز النقش بصيغة غير مدعومة.",
    });
    expect(run).not.toHaveBeenCalled();
  });

  it("logs full vision provider failures without returning them to the visitor", async () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.startsWith("https://generativelanguage.googleapis.com/")) {
        return new Response(JSON.stringify({ error: { message: "Gemini full quota detail" } }), { status: 503 });
      }
      if (url === "https://api.groq.com/openai/v1/chat/completions") {
        return new Response(JSON.stringify({ error: { message: "Groq full model detail" } }), { status: 404 });
      }
      if (url.endsWith("/api/generate")) {
        return new Response(JSON.stringify({ error: "Ollama full connection detail" }), { status: 503 });
      }
      return new Response("Not found", { status: 404 });
    });
    vi.stubGlobal("fetch", fetchMock);
    try {
      const response = await worker.fetch(
        post("/api/scan", { image: png, language: "ar", mode: "objects" }),
        {
          GEMINI_API_KEY: "gemini-key",
          GEMINI_VISION_MODEL: "gemini-3.8-flash",
          GROQ_API_KEY: "groq-key",
          GROQ_VISION_MODEL: "vision-test-model",
          OLLAMA_BASE_URL: "http://127.0.0.1:11434",
          OLLAMA_VISION_MODEL: "gemma3:4b",
          AI: { run: vi.fn().mockRejectedValue(new Error("Cloudflare full failure detail")) },
        },
      );
      const body = await response.json();
      const logs = errorSpy.mock.calls.map((call) => call.join(" ")).join("\n");
      const visitorResponse = JSON.stringify(body);

      expect(response.status).toBe(200);
      expect(body.analysis).toContain("وصلت الصورة لكن تعذر تحليلها الآن");
      expect(visitorResponse).not.toContain("full quota detail");
      expect(visitorResponse).not.toContain("full model detail");
      expect(visitorResponse).not.toContain("full connection detail");
      expect(logs).toContain("Gemini full quota detail");
      expect(logs).toContain("Groq full model detail");
      expect(logs).toContain("Cloudflare full failure detail");
      expect(logs).toContain("Cloudflare full failure detail");
    } finally {
      vi.unstubAllGlobals();
      errorSpy.mockRestore();
    }
  });

  it("returns a visual description without guessing when reverse-image search is unavailable", async () => {
    const run = vi.fn().mockResolvedValueOnce({
      description: JSON.stringify({
        visualDescription: "شكل صغير مستطيل",
        objectType: "قطعة أثرية محتملة",
        keywords: ["مستطيل", "حجر"],
        periodClues: [],
      }),
    });
    const response = await worker.fetch(
      post("/api/scan", {
        image: png,
        enhancedImage: "data:image/jpeg;base64,aGVsbG8=",
        language: "ar",
        mode: "objects",
      }),
      {
        AI: { run },
        ASSETS: { fetch: vi.fn() },
        SCANNER_FREE_FALLBACK_ENABLED: "false",
      },
    );
    const body = await response.json();
    expect(response.status).toBe(200);
    expect(body).toMatchObject({ ok: true, resultType: "unverified" });
    expect(body.reverseImageSearchStatus).toBe("unavailable");
    expectUnverifiedScan(body);
    expect(body.analysis).toContain("شكل صغير مستطيل");
    expect(body.sources).toEqual([]);
    expect(run).toHaveBeenCalledOnce();
  });

  it("uses local Ollama for a visual description without reverse-image search", async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      if (String(input).endsWith("/api/generate")) {
        const requestBody = JSON.parse(String(init?.body));
        expect(requestBody.model).toBe("gemma3:4b");
        expect(requestBody.images).toEqual([png.split(",")[1]]);
        return new Response(
          JSON.stringify({
            response: JSON.stringify({
              visualDescription: "قطعة حجرية صغيرة",
              objectType: "قطعة أثرية محتملة",
              keywords: ["حجر", "قطعة"],
              periodClues: [],
            }),
          }),
          { status: 200, headers: { "content-type": "application/json" } },
        );
      }
      return new Response(JSON.stringify({ query: { pages: {} } }), {
        status: 200,
        headers: { "content-type": "application/json" },
      });
    });
    vi.stubGlobal("fetch", fetchMock);
    try {
      const response = await worker.fetch(
        post("/api/scan", { image: png, language: "ar", mode: "objects" }),
        {
          OLLAMA_BASE_URL: "http://127.0.0.1:11434",
          OLLAMA_VISION_MODEL: "gemma3:4b",
        },
      );
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body).toMatchObject({ resultType: "unverified", reverseImageSearchStatus: "unavailable" });
      expectUnverifiedScan(body);
      expect(body.analysis).toContain("قطعة حجرية صغيرة");
      expect(fetchMock.mock.calls.some(([input]) => String(input).endsWith("/api/generate"))).toBe(true);
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it("salvages a useful description from truncated JSON without showing raw JSON", async () => {
    stubEmptyHeritageSearch();
    const run = vi.fn().mockResolvedValueOnce({
      response:
        '{"visualDescription":"نقش هيروغليفي غائر على حجر داكن، والأعمدة الرأسية واضحة لكن العلامات صغيرة',
    });
    const response = await worker.fetch(
      post("/api/scan", { image: png, language: "ar", mode: "hieroglyphs" }),
      { AI: { run }, ASSETS: { fetch: vi.fn() } },
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.analysis).toContain(
      "الوصف: نقش هيروغليفي غائر على حجر داكن، والأعمدة الرأسية واضحة لكن العلامات صغيرة",
    );
    expect(body.analysis).not.toContain('{"visualDescription"');
    expect(body.confidenceByField).toEqual({
      inscription: "low",
      translation: "low",
      place: "low",
    });
  });

  it("requests a closest-match reading and search terms in the first image analysis", async () => {
    const fetchMock = stubEmptyHeritageSearch();
    const run = vi.fn().mockResolvedValue({
      response: JSON.stringify({
        visualDescription: "نقش رأسي على حجر داكن",
        visibleText: "صيغة تقديم قربان",
        translation: "تقديم قربان",
        period: "العصر البطلمي المحتمل",
        contextualStory: "صيغة قرابين شائعة في مناظر المعابد",
        searchTerms: ["ancient Egyptian offering scene"],
        keywords: ["offering scene"],
      }),
    });
    const response = await worker.fetch(
      post("/api/scan", {
        image: png,
        enhancedImage: "data:image/jpeg;base64,aGVsbG8=",
        documentImage: "data:image/png;base64,aGVsbG8=",
        language: "ar",
        mode: "hieroglyphs",
      }),
      { AI: { run } },
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.analysis).toContain("الترجمة الحرفية المقترحة: تقديم قربان");
    expect(body.analysis).toContain("الفترة المحتملة:");
    expect(body.analysis).toContain("3. القصة والخلفية التاريخية");
    expect(body.analysis).toContain("صيغة قرابين شائعة في مناظر المعابد");
    expect(run).toHaveBeenCalledTimes(1);
    expect(run.mock.calls[0][0]).toBe("@cf/moondream/moondream3.1-9B-A2B");
    expect(String(run.mock.calls[0][1].image)).toContain("data:image/jpeg;base64,");
    expect(run.mock.calls[0][1].question).toContain("استفد من معرفتك الداخلية");
    expect(run.mock.calls[0][1].question).toContain("العنخ");
    expect(run.mock.calls[0][1].question).toContain("افحص كل شخصية على حدة");
    expect(run.mock.calls[0][1].question).toContain("خطمِه الطويل العريض");
    expect(run.mock.calls[0][1].question).toContain("سوبك كهوية محتملة فقط");
    expect(run.mock.calls[0][1].question).toContain("لا توجد في هذه الخدمة قاعدة صور متجهية");
    expect(fetchMock.mock.calls.length).toBeGreaterThanOrEqual(4);
    expect(String(fetchMock.mock.calls[0][0])).toContain(
      encodeURIComponent("ancient Egyptian offering scene"),
    );
    expect(fetchMock.mock.calls.some(([url]) => String(url).includes("ar.wikipedia.org"))).toBe(true);
  });

  it("does not show ministry home, FAQ, terms, or period pages as artifact evidence", async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input instanceof Request ? input.url : input);
      if (url.includes("egymonuments.gov.eg")) {
        return new Response(
          '<html><body><a href="/ar/">إكتشف الآثار المصرية</a><a href="/ar/faqs">الأسئلة المكررة</a><a href="/ar/terms-and-conditions">الشروط والأحكام</a><a href="/ar/historical-periods/predynastic-period">عصر ما قبل الأسرات</a></body></html>',
          { status: 200, headers: { "content-type": "text/html; charset=utf-8" } },
        );
      }
      return Response.json({ query: { pages: {} }, search: [], entities: {} });
    });
    vi.stubGlobal("fetch", fetchMock);
    try {
      const run = vi.fn().mockResolvedValue({
        response: JSON.stringify({
          visualDescription: "تمثال جانبي بغطاء رأس ملون",
          objectType: "تمثال",
          material: "خشب",
          keywords: ["تمثال", "خشبي", "ملون"],
          periodClues: [],
        }),
      });
      const response = await worker.fetch(
        post("/api/scan", { image: png, language: "ar", mode: "objects" }),
        { AI: { run }, ASSETS: { fetch: vi.fn() }, SCANNER_FREE_FALLBACK_ENABLED: "false" },
      );
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.identificationStatus).toBe("unverified");
      expect(body.sources).toEqual([]);
      expect(body.analysis).not.toContain("الأسئلة المكررة");
      expect(body.analysis).not.toContain("الشروط والأحكام");
      expect(body.analysis).not.toContain("عصر ما قبل الأسرات");
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it("uses official monument records as related context without claiming a visual match", async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const requestUrl = String(input);
      if (requestUrl.includes("egymonuments.gov.eg")) {
        return new Response(
          '<html><body><a href="/ar/archaeological-sites/abu-simbel/">أبو سمبل</a><a href="/ar/archaeological-sites/dahshur/">دهشور</a></body></html>',
          { status: 200, headers: { "content-type": "text/html; charset=utf-8" } },
        );
      }
      return new Response(JSON.stringify({ query: { pages: {} } }), {
        status: 200,
        headers: { "content-type": "application/json" },
      });
    });
    vi.stubGlobal("fetch", fetchMock);
    try {
      const run = vi.fn().mockResolvedValue({
        response: JSON.stringify({
          visualDescription: "واجهة معبد حجرية كبيرة",
          identity: "أبو سمبل",
          objectType: "معبد",
          keywords: ["أبو سمبل", "معبد", "أسوان"],
          periodClues: ["عصر رمسيس الثاني"],
        }),
      });
      const response = await worker.fetch(
        post("/api/scan", { image: png, language: "ar", mode: "objects" }),
        { AI: { run }, ASSETS: { fetch: vi.fn() } },
      );
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body).toMatchObject({ resultType: "unverified", reverseImageSearchStatus: "unavailable" });
      expectUnverifiedScan(body);
      expect(body.analysis).not.toContain("عصر رمسيس الثاني");
      expect(body.sources).toContainEqual(
        expect.objectContaining({ title: "أبو سمبل", trusted: true }),
      );
      expect(body.analysis).toContain("اسم محتمل غير مؤكد: أبو سمبل");
      expect(body.analysis).not.toContain("عصر رمسيس الثاني");
      expect(fetchMock.mock.calls.some(([url]) => String(url).includes("egymonuments.gov.eg"))).toBe(true);
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it("builds a concise name, story, and location answer from a matching official collection page", async () => {
    const collectionUrl = "https://egymonuments.gov.eg/ar/collections/statue-of-nephthys-6";
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const requestUrl = String(input instanceof Request ? input.url : input);
      if (requestUrl.includes("egymonuments.gov.eg")) {
        if (requestUrl === "https://egymonuments.gov.eg/ar/collections") {
          return new Response(
            `<html><body><main><a href="/ar/collections/statue-of-nephthys-6">تمثال نفتيس</a></main></body></html>`,
            { status: 200, headers: { "content-type": "text/html; charset=utf-8" } },
          );
        }
        if (requestUrl === collectionUrl) {
          return new Response(
            `<html><head><title>Wooden Statue of Nephthys</title></head><body><main><p>` +
              `A wooden statue of Nephthys, protective goddess of the dead, is displayed at the ` +
              `Luxor Mummification Museum.</p></main></body></html>`,
            { status: 200, headers: { "content-type": "text/html; charset=utf-8" } },
          );
        }
        return new Response("<html><body><main></main></body></html>", {
          status: 200,
          headers: { "content-type": "text/html; charset=utf-8" },
        });
      }
      return Response.json({ query: { pages: {} }, search: [], entities: {} });
    });
    vi.stubGlobal("fetch", fetchMock);
    try {
      const run = vi.fn().mockResolvedValue({
        response: JSON.stringify({
          visualDescription: "تمثال خشبي صغير لامرأة بغطاء رأس",
          identity: "تمثال خشبي للمعبودة نفتيس",
          identityEvidence: "الهيئة الأنثوية والغطاء المرتبط بنفتيس",
          objectType: "تمثال خشبي",
          material: "خشب",
          possibleLocation: "Luxor Mummification Museum",
          searchTerms: ["Nephthys wooden statue"],
          keywords: ["Nephthys", "wooden statue"],
        }),
      });
      const response = await worker.fetch(
        post("/api/scan", { image: png, language: "ar", mode: "objects" }),
        { AI: { run }, ASSETS: { fetch: vi.fn() } },
      );
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.resultType).toBe("unverified");
      expect(body.analysis).toContain("اسم محتمل غير مؤكد: تمثال خشبي للمعبودة نفتيس");
      expect(body.analysis).toContain("Luxor Mummification Museum");
      expect(body.analysis).toContain("protective goddess of the dead");
      expect(body.sources).toContainEqual(expect.objectContaining({
        url: collectionUrl,
        trusted: true,
      }));
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it("does not search printed labels as a substitute for reverse-image matching", async () => {
    const printedLabel = "Khufu statue catalog 123";
    const institutionalUrl = "https://www.metmuseum.org/art/collection/search/123";
    const fetchedUrls: string[] = [];
    const institutionText =
      "The collection record describes an Egyptian statue, its material, date, and historical context. " +
      "This text is supplied by the museum collection page.";
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const requestUrl = String(input);
      fetchedUrls.push(requestUrl);
      if (requestUrl.includes("wikipedia.org/w/api.php")) {
        const searchTerm = new URL(requestUrl).searchParams.get("gsrsearch")?.toLowerCase() || "";
        if (!searchTerm.includes("khufu statue")) {
          return new Response(JSON.stringify({ query: { pages: {} } }), {
            status: 200,
            headers: { "content-type": "application/json" },
          });
        }
        return new Response(
          JSON.stringify({
            query: {
              pages: {
                1: {
                  title: "Khufu statue",
                  extract: "An encyclopedia result.",
                  extlinks: [
                    { "*": institutionalUrl },
                    { "*": "https://metmuseum.org.evil.example/fake" },
                  ],
                },
              },
            },
          }),
          { status: 200, headers: { "content-type": "application/json" } },
        );
      }
      if (requestUrl.includes("commons.wikimedia.org")) {
        return new Response(JSON.stringify({ query: { pages: {} } }), {
          status: 200,
          headers: { "content-type": "application/json" },
        });
      }
      return new Response(
        `<html><head><title>Egyptian Statue - The Metropolitan Museum of Art</title></head>` +
          `<body><main><p>${institutionText}</p></main></body></html>`,
        { status: 200, headers: { "content-type": "text/html; charset=utf-8" } },
      );
    });
    vi.stubGlobal("fetch", fetchMock);
    try {
      const run = vi.fn().mockResolvedValue({
        response: JSON.stringify({
          visualDescription: "تمثال ظاهر في صفحة مطبوعة من كتاب",
          printedLabels: printedLabel,
          identity: "تمثال محتمل للملك خوفو",
          searchTerms: ["Khufu statue"],
          keywords: ["تمثال", "ملك"],
          periodClues: [],
        }),
      });
      const response = await worker.fetch(
        post("/api/scan", { image: png, language: "ar", mode: "objects" }),
        { AI: { run }, ASSETS: { fetch: vi.fn() } },
      );
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body).toMatchObject({ resultType: "unverified", reverseImageSearchStatus: "unavailable" });
      expectUnverifiedScan(body);
      expect(body.analysis).toContain(printedLabel);
      expect(body.analysis).toContain("اسم محتمل غير مؤكد: تمثال محتمل للملك خوفو");
      expect(body.sources).toContainEqual(expect.objectContaining({ url: institutionalUrl, trusted: true }));
      expect(fetchedUrls.length).toBeGreaterThan(0);
      expect(fetchedUrls.filter((url) => decodeURIComponent(url).includes(printedLabel))).toEqual([]);
      expect(run).toHaveBeenCalledOnce();
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it("does not present a guessed site as certain without visual reference matching", async () => {
    stubEmptyHeritageSearch();
    const run = vi.fn().mockResolvedValue({
      response: JSON.stringify({
        visualDescription: "نقش يظهر قرصًا شمسيًا وجناحين",
        objectType: "نقش مصري قديم",
        identity: "رمز شمسي محتمل",
        place: "معبد إدفو",
        placeEvidence: "أسلوب معماري يشبه معبد إدفو",
        placeType: "معبد",
        siteHistory: "تاريخ معبد إدفو",
        contextualStory: "يرتبط قرص الشمس في الفن المصري بمفاهيم الحماية والملكية.",
        confidenceByField: {
          identity: "high",
          place: "high",
          period: "medium",
        },
        keywords: ["قرص شمسي", "جناحين"],
        periodClues: [],
      }),
    });
    const response = await worker.fetch(
      post("/api/scan", { image: png, language: "ar", mode: "objects" }),
      { AI: { run }, ASSETS: { fetch: vi.fn() } },
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toMatchObject({ resultType: "unverified", reverseImageSearchStatus: "unavailable" });
    expectUnverifiedScan(body);
    expect(body.sources).toEqual([]);
  });

  it("falls back from Moondream to Cloudflare Mistral Vision before using external providers", async () => {
    const fetchMock = stubEmptyHeritageSearch();
    const run = vi.fn()
      .mockRejectedValueOnce(new Error("Moondream inference failed on this request"))
      .mockResolvedValueOnce({
        response: JSON.stringify({
          visualDescription: "تمثال خشبي ملون لامرأة ترتدي غطاء رأس",
          identity: "تمثال خشبي للمعبودة نفتيس",
          objectType: "wooden statue",
          material: "painted wood",
          searchTerms: ["Nephthys", "wooden statue"],
          keywords: ["Nephthys", "painted wood"],
          confidence: "medium",
        }),
      });
    const response = await worker.fetch(
      post("/api/scan", { image: png, language: "ar", mode: "objects" }),
      {
        AI: { run },
        ASSETS: { fetch: vi.fn(async () => new Response("", { status: 404 })) },
      },
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.model).toBe("Cloudflare Workers AI - Mistral Small 3.1");
    expect(body.visionDiagnostics).toMatchObject({
      provider: "Cloudflare Mistral Small 3.1",
      enginesCompleted: 1,
      usedFallback: true,
      failedAttempts: [{
        engine: "@cf/moondream/moondream3.1-9B-A2B",
        category: "request_failed",
      }],
    });
    expect(run).toHaveBeenNthCalledWith(
      2,
      "@cf/mistralai/mistral-small-3.1-24b-instruct",
      expect.objectContaining({
        messages: expect.arrayContaining([
          expect.objectContaining({ role: "user", content: expect.any(Array) }),
        ]),
      }),
      { rejectIfBusy: true },
    );
    expect(run).toHaveBeenCalledTimes(2);
  });

  it("falls back from unavailable Cloudflare Mistral Vision to Llama 4 Scout Vision", async () => {
    stubEmptyHeritageSearch();
    const run = vi.fn()
      .mockRejectedValueOnce(new Error("Moondream busy"))
      .mockRejectedValueOnce(new Error("Unexpected Workers AI model: Mistral Small 3.1"))
      .mockResolvedValueOnce({
        response: JSON.stringify({
          visualDescription: "A painted Egyptian wooden statue",
          identity: "Nephthys statue (possible)",
          objectType: "wooden statue",
          material: "painted wood",
          searchTerms: ["Nephthys", "wooden statue"],
          keywords: ["painted wood", "Nephthys"],
        }),
      });
    const response = await worker.fetch(
      post("/api/scan", { image: png, language: "en", mode: "objects" }),
      {
        AI: { run },
        ASSETS: { fetch: vi.fn(async () => new Response("", { status: 404 })) },
      },
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.model).toBe("Cloudflare Workers AI - Llama 4 Scout");
    expect(body.visionDiagnostics).toMatchObject({
      provider: "Cloudflare Llama 4 Scout",
      enginesCompleted: 1,
      usedFallback: true,
      failedAttempts: [
        {
          engine: "@cf/moondream/moondream3.1-9B-A2B",
          category: "provider_unavailable",
        },
        {
          engine: "@cf/mistralai/mistral-small-3.1-24b-instruct",
          category: "request_failed",
        },
      ],
    });
    expect(run).toHaveBeenNthCalledWith(
      3,
      "@cf/meta/llama-4-scout-17b-16e-instruct",
      expect.objectContaining({
        messages: expect.arrayContaining([
          expect.objectContaining({ role: "user", content: expect.any(Array) }),
        ]),
      }),
      { rejectIfBusy: true },
    );
    expect(run).toHaveBeenCalledTimes(3);
  });

  it("uses Cloudflare Moondream vision as the primary scanner even when chat provider keys exist", async () => {
    const fetchMock = stubEmptyHeritageSearch();
    const run = vi.fn().mockResolvedValue({
      response: JSON.stringify({
        visualDescription: "Hieroglyphic inscription on stone",
        identity: "Possible royal decree",
        keywords: ["inscription", "stone"],
        periodClues: [],
      }),
    });
    const response = await worker.fetch(
      post("/api/scan", { image: png, language: "ar", mode: "hieroglyphs" }),
      { AI: { run }, GEMINI_API_KEY: "chat-key", GROQ_API_KEY: "chat-key" },
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.model).toBe("Cloudflare Workers AI - Moondream 3.1");
    expect(body.visionDiagnostics).toMatchObject({
      usedFallback: false,
    });
    expect(run).toHaveBeenCalledTimes(1);
    expect(run.mock.calls[0][0]).toBe("@cf/moondream/moondream3.1-9B-A2B");
    expect(run).toHaveBeenCalledTimes(1);
  });

  it("does not use a vision fallback to identify artifacts without reverse-image search", async () => {
    stubEmptyHeritageSearch();
    const run = vi.fn().mockResolvedValueOnce({
      answer: JSON.stringify({
        visualDescription: "Ancient carved stone",
        objectType: "carved stone",
        keywords: ["stone"],
        periodClues: [],
      }),
    });
    const response = await worker.fetch(
      post("/api/scan", { image: png, language: "ar", mode: "objects" }),
      { AI: { run } },
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toMatchObject({ resultType: "unverified", reverseImageSearchStatus: "unavailable" });
    expectUnverifiedScan(body);
    expect(body.analysis).toContain("Ancient carved stone");
    expect(run).toHaveBeenCalledTimes(1);
  });

  it("does not return an official catalog match from description keywords alone", async () => {
    stubEmptyHeritageSearch();
    const catalogUrl = "https://egymonuments.gov.eg/ar/monuments/karnak/";
    const run = vi.fn().mockResolvedValueOnce({
      response: JSON.stringify({
        visualDescription: "نقش ملك يقدم قربانًا",
        keywords: ["marker", "king", "offering"],
        periodClues: [],
      }),
    });
    const response = await worker.fetch(
      post("/api/scan", { image: png, language: "ar", mode: "objects" }),
      {
        AI: { run },
        ATHARA_CATALOG_JSON: JSON.stringify([
          {
            id: "catalog-entry",
            title: "نقش مرجعي",
            mode: "objects",
            keywords: ["marker", "king", "offering"],
            description: "وصف موثق للسجل.",
            sourceTitle: "وزارة السياحة والآثار المصرية",
            sourceUrl: catalogUrl,
          },
        ]),
        ASSETS: { fetch: vi.fn() },
      },
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toMatchObject({ resultType: "unverified", reverseImageSearchStatus: "unavailable" });
    expectUnverifiedScan(body);
    expect(body.sources).not.toContainEqual(expect.objectContaining({ url: catalogUrl }));
  });

  it("matches the uploaded image against cached ministry photos with Gemini and returns catalog details", async () => {
    const catalogUrl = "https://egymonuments.gov.eg/ar/monuments/abu-simbel/";
    const officialImageUrl = "https://egymonuments.gov.eg/media/abu-simbel.jpg";
    const localImageUrl = "/egypt-monuments-images/abu-simbel.jpg";
    const referenceImage = new Uint8Array([0xff, 0xd8, 0xff, 0xd9]);
    const geminiPayloads = [
      {
        candidates: [{ content: { parts: [{ text: JSON.stringify({
          visualDescription: "واجهة صخرية تضم أربعة تماثيل ضخمة جالسة",
          keywords: ["واجهة", "تماثيل", "صخرية"],
          searchTerms: ["four seated statues", "rock-cut facade"],
        }) }] } }],
      },
      {
        candidates: [{ content: { parts: [{ text: JSON.stringify({
          matchId: "R1",
          similarity: 0.92,
          visualEvidence: ["four seated colossal figures", "matching rock-cut facade layout"],
        }) }] } }],
      },
    ];
    const fetchMock = vi.fn(async (_input: RequestInfo | URL, init?: RequestInit) => {
      expect(new Headers(init?.headers).get("x-goog-api-key")).toBe("gemini-test-key");
      return new Response(JSON.stringify(geminiPayloads.shift()), {
        status: 200,
        headers: { "content-type": "application/json" },
      });
    });
    vi.stubGlobal("fetch", fetchMock);
    const assetFetch = vi.fn(async (input: RequestInfo | URL) => {
      const requestUrl = String(input);
      if (requestUrl.endsWith("/egypt-monuments-official.json")) {
        return new Response(JSON.stringify({
          records: [{
            id: "abu-simbel-record",
            title: "أبو سمبل",
            mode: "objects",
            keywords: ["واجهة", "تماثيل"],
            description: "معبد أبو سمبل الكبير المنحوت في الصخر، وتزين واجهته تماثيل رمسيس الثاني الأربعة.",
            sourceTitle: "وزارة السياحة والآثار المصرية",
            sourceUrl: catalogUrl,
            imageUrls: [officialImageUrl],
            localImageUrls: [localImageUrl],
          }],
        }), { status: 200, headers: { "content-type": "application/json" } });
      }
      if (requestUrl.endsWith(localImageUrl)) {
        return new Response(referenceImage, { status: 200, headers: { "content-type": "image/jpeg" } });
      }
      return new Response("Not found", { status: 404 });
    });

    try {
      const response = await worker.fetch(
        post("/api/scan", { image: png, language: "ar", mode: "objects" }),
        { GEMINI_API_KEY: "gemini-test-key", ASSETS: { fetch: assetFetch } },
      );
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(assetFetch).toHaveBeenCalledTimes(2);
      expect(fetchMock).toHaveBeenCalledTimes(2);
      expect(body.resultType, JSON.stringify(body)).toBe("reference_match");
      expect(body.analysis).toContain("أبو سمبل");
      expect(body.analysis).toContain("معبد أبو سمبل الكبير المنحوت في الصخر");
      expect(body.sources).toContainEqual(expect.objectContaining({ url: catalogUrl, trusted: true }));
      expect(body.matchedArtifact).toMatchObject({
        name: "أبو سمبل",
        similarity: 0.92,
      });
      expect(fetchMock).toHaveBeenCalledTimes(2);
      const comparisonBody = JSON.parse(String(fetchMock.mock.calls[1][1]?.body));
      expect(comparisonBody.contents[0].parts.filter((part: { inlineData?: unknown }) => part.inlineData)).toHaveLength(2);
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it("does not identify an object when Gemini finds no strong match in ministry photos", async () => {
    const catalogUrl = "https://egymonuments.gov.eg/ar/monuments/abu-simbel/";
    const officialImageUrl = "https://egymonuments.gov.eg/media/abu-simbel.jpg";
    const geminiPayloads = [
      { candidates: [{ content: { parts: [{ text: JSON.stringify({ visualDescription: "تمثال برونزي صغير", keywords: ["تمثال", "برونزي"] }) }] } }] },
      { candidates: [{ content: { parts: [{ text: JSON.stringify({ matchId: "none", similarity: 0.2, visualEvidence: [] }) }] } }] },
    ];
    vi.stubGlobal("fetch", vi.fn(async (input: RequestInfo | URL) => {
      const requestUrl = String(input instanceof Request ? input.url : input);
      if (requestUrl.includes("generativelanguage.googleapis.com")) {
        return new Response(JSON.stringify(geminiPayloads.shift()), {
          status: 200,
          headers: { "content-type": "application/json" },
        });
      }
      if (requestUrl.includes("wikidata.org")) {
        return Response.json({ search: [], entities: {} });
      }
      return Response.json({ objectIDs: [], query: { pages: {} } });
    }));
    const assetFetch = vi.fn(async (input: RequestInfo | URL) => {
      const requestUrl = String(input);
      if (requestUrl.endsWith("/egypt-monuments-official.json")) {
        return new Response(JSON.stringify({ records: [{
          id: "abu-simbel-record",
          title: "أبو سمبل",
          mode: "objects",
          keywords: ["تمثال", "برونزي"],
          description: "قصة رسمية لا يجب عرضها من دون مطابقة الصورة.",
          sourceTitle: "وزارة السياحة والآثار المصرية",
          sourceUrl: catalogUrl,
          imageUrls: [officialImageUrl],
          localImageUrls: ["/egypt-monuments-images/abu-simbel.jpg"],
        }] }), { status: 200, headers: { "content-type": "application/json" } });
      }
      return new Response(new Uint8Array([0xff, 0xd8, 0xff, 0xd9]), { status: 200 });
    });

    try {
      const response = await worker.fetch(
        post("/api/scan", { image: png, language: "ar", mode: "objects" }),
        { GEMINI_API_KEY: "gemini-test-key", ASSETS: { fetch: assetFetch } },
      );
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body).toMatchObject({ resultType: "unverified", reverseImageSearchStatus: "no_match" });
      expectUnverifiedScan(body);
      expect(body.sources).toEqual([]);
    } finally {
      vi.unstubAllGlobals();
    }
  });

    it("searches Met, Commons, and Wikidata in the Worker and returns source-backed candidate matches", async () => {
      let geminiCall = 0;
      const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
        const requestUrl = String(input instanceof Request ? input.url : input);
        if (requestUrl.includes("generativelanguage.googleapis.com")) {
          geminiCall += 1;
          const requestBody = JSON.parse(String(init?.body));
          const promptParts = requestBody.contents[0].parts;
          if (geminiCall === 1) {
            expect(promptParts.some((part: { inlineData?: unknown }) => part.inlineData)).toBe(true);
            const systemPrompt = requestBody.systemInstruction.parts[0].text;
            expect(systemPrompt).toContain("أقرب اسم معروف");
            expect(systemPrompt).toContain("identityEvidence");
            expect(systemPrompt).not.toContain("لا تذكر أسماء أو هوية");
            return Response.json({
              candidates: [{ content: { parts: [{ text: JSON.stringify({
                visualDescription: "Small seated bronze figure",
                identity: "Seated Bronze Figurine",
                objectType: "Figurine",
                material: "Bronze",
                searchTerms: ["ancient Egyptian bronze seated figurine"],
                keywords: ["bronze", "seated figurine"],
              }) }] } }],
            });
          }
          expect(promptParts.filter((part: { inlineData?: unknown }) => part.inlineData)).toHaveLength(2);
          return Response.json({
            candidates: [{ content: { parts: [{ text: JSON.stringify({
              rankedMatches: [{
                candidateId: "C1",
                similarity: 0.91,
                visualEvidence: ["matching seated pose", "same distinctive crown and base"],
              }],
            }) }] } }],
          });
        }
        if (requestUrl.includes("collectionapi.metmuseum.org") && requestUrl.includes("/search?")) {
          const searchUrl = new URL(requestUrl);
          expect(searchUrl.pathname).toBe("/public/collection/v1.1/search");
          expect(searchUrl.searchParams.get("departmentId")).toBe("10");
          expect(searchUrl.searchParams.get("limit")).toBe("4");
          return Response.json({ objectIDs: [123] });
        }
        if (requestUrl.includes("collectionapi.metmuseum.org/")) {
          return Response.json({
            title: "Seated Bronze Figurine",
            accessionNumber: "1980.1",
            objectURL: "https://www.metmuseum.org/art/collection/search/123",
            primaryImageSmall: "https://images.metmuseum.org/CRDImages/ep/original/DP123.jpg",
            objectDescription: "A small bronze figurine in a seated pose.",
            period: "Late Period",
          });
        }
        if (requestUrl.includes("commons.wikimedia.org") || requestUrl.includes("wikidata.org")) {
          return Response.json({ query: { pages: {} }, search: [], entities: {} });
        }
        if (requestUrl.includes("images.metmuseum.org")) {
          return new Response(new Uint8Array([0xff, 0xd8, 0xff, 0xd9]), {
            status: 200,
            headers: { "content-type": "image/jpeg" },
          });
        }
        return Response.json({ query: { pages: {} } });
      });
      vi.stubGlobal("fetch", fetchMock);
      try {
        const response = await worker.fetch(
          post("/api/scan", { image: png, language: "ar", mode: "objects" }),
          {
            GEMINI_API_KEY: "gemini-test-key",
            SCANNER_MATCH_THRESHOLD: "0.80",
            ASSETS: { fetch: vi.fn(async () => new Response("", { status: 404 })) },
          },
        );
        const body = await response.json();

        expect(response.status).toBe(200);
        expect(body).toMatchObject({
          ok: true,
          resultType: "reference_match",
          reverseImageSearchStatus: "match",
          matchedArtifact: {
            name: "Seated Bronze Figurine",
            museum: "The Metropolitan Museum of Art",
            objectNumber: "1980.1",
            similarity: 0.91,
          },
          sources: [{
            url: "https://www.metmuseum.org/art/collection/search/123",
            snippet: "A small bronze figurine in a seated pose. Late Period",
          }],
        });
        expect(geminiCall).toBe(4);
        expect(fetchMock.mock.calls.some(([input]) => String(input).includes("serpapi.com"))).toBe(false);
      } finally {
        vi.unstubAllGlobals();
      }
    });

    it("uses Cleveland image similarity and Cloudflare multimodal embeddings before returning a museum identity and story", async () => {
      let geminiCall = 0;
      const aiRun = vi.fn(async (model: string) => {
        if (model === "@cf/moondream/moondream3.1-9B-A2B") {
          throw new Error("Moondream busy in test");
        }
        if (model === "@cf/google/embeddinggemma-2") {
          return {
            data: [
              { embedding: Array(512).fill(0.25) },
              { embedding: Array(512).fill(0.25) },
            ],
          };
        }
        throw new Error(`Unexpected Workers AI model: ${model}`);
      });
      const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
        const requestUrl = String(input instanceof Request ? input.url : input);
        if (requestUrl.includes("generativelanguage.googleapis.com")) {
          geminiCall += 1;
          if (geminiCall === 1) {
            return Response.json({
              candidates: [{ content: { parts: [{ text: JSON.stringify({
                visualDescription: "Ancient Egyptian seated royal statue",
                identity: "Seated royal statue",
                objectType: "Statue",
                searchTerms: ["Egyptian seated royal statue"],
                keywords: ["seated royal statue"],
              }) }] } }],
            });
          }
          return Response.json({
            candidates: [{ content: { parts: [{ text: JSON.stringify({
              rankedMatches: [{
                candidateId: "C1",
                similarity: 0.93,
                visualEvidence: ["same distinctive crown outline", "same facial and shoulder silhouette"],
              }],
            }) }] } }],
          });
        }
        if (requestUrl.includes("openaccess-api.clevelandart.org/api/artworks") && init?.method === "POST") {
          expect(init.body).toBeInstanceOf(FormData);
          return Response.json({ data: [{
            title: "Royal Figure from Ancient Egypt",
            accession_number: "1925.100",
            url: "https://www.clevelandart.org/art/1925.100",
            images: { web: { url: "https://openaccess-cdn.clevelandart.org/1925.100/1925.100_web.jpg" } },
            current_location: "Gallery 210",
            find_spot: "Thebes, Egypt",
            creation_date: "New Kingdom, 18th Dynasty",
            technique: "Painted limestone",
            did_you_know: "The figure was part of a temple setting.",
            description: "A royal figure from ancient Egypt, catalogued by the Cleveland Museum of Art.",
            provenance: "Acquired by the museum in 1925.",
          }] });
        }
        if (requestUrl.includes("openaccess-cdn.clevelandart.org")) {
          return new Response(new Uint8Array([0xff, 0xd8, 0xff, 0xd9]), {
            status: 200,
            headers: { "content-type": "image/jpeg" },
          });
        }
        if (requestUrl.includes("collectionapi.metmuseum.org") ||
            requestUrl.includes("openaccess-api.clevelandart.org") ||
            requestUrl.includes("api.artic.edu") ||
            requestUrl.includes("commons.wikimedia.org") ||
            requestUrl.includes("wikidata.org") ||
            requestUrl.includes("wikipedia.org")) {
          return Response.json({ data: [], objectIDs: [], query: { pages: {} }, search: [], entities: {} });
        }
        return Response.json({});
      });
      vi.stubGlobal("fetch", fetchMock);
      try {
        const response = await worker.fetch(
          post("/api/scan", { image: png, language: "ar", mode: "objects" }),
          {
            AI: { run: aiRun },
            GEMINI_API_KEY: "gemini-test-key",
            SCANNER_MATCH_THRESHOLD: "0.80",
            ASSETS: { fetch: vi.fn(async () => new Response("", { status: 404 })) },
          },
        );
        const body = await response.json();
        expect(response.status).toBe(200);
        expect(body).toMatchObject({
          ok: true,
          resultType: "reference_match",
          reverseImageSearchStatus: "match",
          matchedArtifact: {
            name: "Royal Figure from Ancient Egypt",
            museum: "Cleveland Museum of Art",
            objectNumber: "1925.100",
            currentLocation: "Gallery 210",
            findSpot: "Thebes, Egypt",
            period: "New Kingdom, 18th Dynasty",
          },
          confidenceByField: { identity: "medium", place: "medium", period: "medium" },
        });
        expect(body.analysis).toContain("اسم القطعة: Royal Figure from Ancient Egypt");
        expect(body.analysis).toContain("مكان العرض حسب سجل المتحف: Gallery 210");
        expect(body.analysis).toContain("سجل الملكية: Acquired by the museum in 1925.");
        expect(aiRun).toHaveBeenCalledWith("@cf/google/embeddinggemma-2", expect.objectContaining({
          messages: expect.any(Array),
          dimensions: 512,
        }));
        expect(geminiCall).toBe(3);
      } finally {
        vi.unstubAllGlobals();
      }
    });

    it("keeps below-threshold visual scores unconfirmed and returns the nearest candidates", async () => {
      let geminiCall = 0;
      vi.stubGlobal("fetch", vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
        const requestUrl = String(input instanceof Request ? input.url : input);
        if (requestUrl.includes("generativelanguage.googleapis.com")) {
          geminiCall += 1;
          return Response.json({
            candidates: [{ content: { parts: [{ text: JSON.stringify(geminiCall === 1
              ? {
                  visualDescription: "Small bronze object",
                  searchTerms: ["ancient Egyptian bronze figurine"],
                }
              : {
                  rankedMatches: [{
                    candidateId: "C1",
                    similarity: 0.79,
                    visualEvidence: ["similar silhouette"],
                  }],
                }) }] } }],
          });

          it("rejects an invalid Cloudflare scanner match threshold explicitly", async () => {
            vi.stubGlobal("fetch", vi.fn(async () => Response.json({
              candidates: [{ content: { parts: [{ text: JSON.stringify({
                visualDescription: "A small object",
                searchTerms: ["ancient Egyptian object"],
              }) }] } }],
            })));
            try {
              const response = await worker.fetch(
                post("/api/scan", { image: png, language: "ar", mode: "objects" }),
                {
                  GEMINI_API_KEY: "gemini-test-key",
                  SCANNER_MATCH_THRESHOLD: "not-a-number",
                  ASSETS: { fetch: vi.fn(async () => new Response("", { status: 404 })) },
                },
              );

              expect(response.status).toBe(503);
              expect(await response.json()).toMatchObject({
                error: "إعداد حدّ المطابقة البصرية غير صالح.",
              });
            } finally {
              vi.unstubAllGlobals();
            }
          });
        }
        if (requestUrl.includes("collectionapi.metmuseum.org") && requestUrl.includes("/search?")) {
          return Response.json({ objectIDs: [123] });
        }
        if (requestUrl.includes("collectionapi.metmuseum.org/")) {
          return Response.json({
            title: "Bronze Object",
            accessionNumber: "1980.2",
            objectURL: "https://www.metmuseum.org/art/collection/search/124",
            primaryImageSmall: "https://images.metmuseum.org/CRDImages/ep/original/DP124.jpg",
          });
        }
        if (requestUrl.includes("images.metmuseum.org")) {
          return new Response(new Uint8Array([0xff, 0xd8, 0xff, 0xd9]), {
            status: 200,
            headers: { "content-type": "image/jpeg" },
          });
        }
        return Response.json({ query: { pages: {} }, search: [], entities: {} });
      }));
      try {
        const response = await worker.fetch(
          post("/api/scan", { image: png, language: "ar", mode: "objects" }),
          {
            GEMINI_API_KEY: "gemini-test-key",
            SCANNER_MATCH_THRESHOLD: "0.80",
            ASSETS: { fetch: vi.fn(async () => new Response("", { status: 404 })) },
          },
        );
        const body = await response.json();

        expect(response.status).toBe(200);
        expect(body).toMatchObject({
          resultType: "unverified",
          reverseImageSearchStatus: "no_match",
          candidates: [{ name: "Bronze Object", similarity: 0.79 }],
          sources: [expect.objectContaining({
            title: "Bronze Object",
            url: "https://www.metmuseum.org/art/collection/search/124",
          })],
        });
        expectUnverifiedScan(body);
        expect(body.matchedArtifact).toBeUndefined();
      } finally {
        vi.unstubAllGlobals();
      }
    });

  it.each([
    ["statue", "تمثال", "تمثال"],
    ["tool or vessel", "أداة أو إناء", "أداة"],
    ["food", "طعام", "طعام"],
  ])("includes visual guidance for %s scans", async (_label, expectedPrompt, visualType) => {
    const fetchMock = stubEmptyHeritageSearch();
    const run = vi.fn().mockResolvedValueOnce({
      response: JSON.stringify({
        visualDescription: "وصف بصري تجريبي",
        objectType: visualType,
        foodAssessment: visualType === "طعام" ? "طبق ومكونات ظاهرة فقط" : "",
        keywords: ["شكل", "تفاصيل"],
        periodClues: [],
      }),
    });
    try {
      const response = await worker.fetch(
        post("/api/scan", { image: png, language: "ar", mode: "objects" }),
        { AI: { run }, ASSETS: { fetch: vi.fn() } },
      );
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body).toMatchObject({ resultType: "unverified", reverseImageSearchStatus: "unavailable" });
      expectUnverifiedScan(body);
      expect(body.analysis).toContain("وصف بصري تجريبي");
      expect(run).toHaveBeenCalledOnce();
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it("does not treat a printed label as an official visual match", async () => {
    stubEmptyHeritageSearch();
    const run = vi.fn().mockResolvedValueOnce({
      response: JSON.stringify({
        identity: "حجر رشمر",
        printedLabels: "Rosetta Stone",
        discoverer: "فيلكس رشمر",
        period: "الملك توت عنخ آمون",
        contextualStory: "نص جنازي لإلهة",
        keywords: ["stone", "three scripts"],
        periodClues: [],
      }),
    });
    const response = await worker.fetch(
      post("/api/scan", { image: png, language: "ar", mode: "objects" }),
      { AI: { run } },
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toMatchObject({ resultType: "unverified", reverseImageSearchStatus: "unavailable" });
    expectUnverifiedScan(body);
    expect(body.analysis).not.toContain("نص جنازي لإلهة");
    expect(body.sources).toEqual([]);
  });

  it("does not trust a model's Abu Simbel guess without an official image match", async () => {
    stubEmptyHeritageSearch();
    const run = vi.fn().mockResolvedValueOnce({
      response: JSON.stringify({
        identity: "معبد لبابة",
        visualDescription: "واجهة صخرية بأربعة تماثيل جالسة كبيرة",
        keywords: ["Abu Simbel", "ramesses"],
        contextualStory: "معبد شيّد في عهد أمنحتب الثالث",
      }),
    });

    const response = await worker.fetch(
      post("/api/scan", { image: png, language: "ar", mode: "objects" }),
      { AI: { run } },
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toMatchObject({ resultType: "unverified", reverseImageSearchStatus: "unavailable" });
    expectUnverifiedScan(body);
    expect(body.analysis).toContain("اسم محتمل غير مؤكد: معبد لبابة");
    expect(body.analysis).not.toContain("أمنحتب الثالث");
    expect(body.sources).toEqual([]);
  });

  it("uses Groq vision for neutral descriptions without reverse-image search", async () => {
    stubEmptyHeritageSearch();
    vi.stubGlobal("fetch", vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input instanceof Request ? input.url : input);
      if (url.includes("api.groq.com")) {
        return new Response(JSON.stringify({
          choices: [{ message: { content: JSON.stringify({
            identity: "واجهة أثرية في مصر",
            keywords: ["Egypt"],
          }) } }],
        }), { status: 200, headers: { "content-type": "application/json" } });
      }
      return new Response(JSON.stringify({ query: { pages: {} } }), {
        status: 200,
        headers: { "content-type": "application/json" },
      });
    }));
    const run = vi.fn().mockRejectedValueOnce(new Error("Cloudflare Moondream busy"));
    const response = await worker.fetch(
      post("/api/scan", { image: png, language: "ar", mode: "objects" }),
      { AI: { run }, GROQ_API_KEY: "test-groq-key" },
    );

    expect(response.status).toBe(200);
    expect(run).toHaveBeenCalledTimes(3);
    const groqCalls = vi.mocked(fetch).mock.calls.filter(([input]) =>
      String(input instanceof Request ? input.url : input).includes("api.groq.com"),
    );
    expect(groqCalls.length).toBeGreaterThan(0);
    const body = await response.json();
    expectUnverifiedScan(body);
    expect(body.reverseImageSearchStatus).toBe("no_match");
    expect(body.analysis).toContain("اسم محتمل غير مؤكد: واجهة أثرية في مصر");
  });

  it("does not recognize a site from a generic Osiride statue description alone", async () => {
    stubEmptyHeritageSearch();
    const run = vi.fn().mockResolvedValueOnce({
      response: JSON.stringify({
        identity: "تماثيل أوزيرية داخل مجمع معابد الكرنك",
        visualDescription: "تماثيل ملكية متقاطعة الذراعين بين أعمدة حجرية",
        keywords: ["Karnak", "Osiride statues", "Luxor"],
        contextualStory: "مجمع الكرنك في الأقصر",
      }),
    });
    const response = await worker.fetch(
      post("/api/scan", { image: png, language: "ar", mode: "objects" }),
      { AI: { run } },
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toMatchObject({ resultType: "unverified", reverseImageSearchStatus: "unavailable" });
    expectUnverifiedScan(body);
    expect(body.analysis).not.toContain("مجمع الكرنك في الأقصر");
    expect(body.sources).toEqual([]);
  });

  it("does not print a model-generated historical story without reverse-image evidence", async () => {
    stubEmptyHeritageSearch();
    const run = vi.fn().mockResolvedValueOnce({
      response: JSON.stringify({
        identity: "معبد وملك غير مثبتين",
        country: "مصر",
        city: "أقصر",
        place: "موقع مختلق",
        period: "الأسرة الثالثة والعشرون",
        contextualStory: "قصة تاريخية تخيلية",
        significance: "أهمية غير مثبتة",
        keyFeatures: "تفاصيل ملكية غير مثبتة",
        keywords: ["temple"],
      }),
    });
    const response = await worker.fetch(
      post("/api/scan", { image: png, language: "ar", mode: "objects" }),
      { AI: { run } },
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toMatchObject({ resultType: "unverified", reverseImageSearchStatus: "unavailable" });
    expectUnverifiedScan(body);
    expect(body.analysis).not.toContain("قصة تاريخية تخيلية");
    expect(body.analysis).not.toContain("موقع مختلق");
    expect(body.analysis).not.toContain("الأسرة الثالثة والعشرون");
    expect(body.sources).toEqual([]);
  });

  it("suppresses empty and unspecified vision fields from the user-facing result", async () => {
    stubEmptyHeritageSearch();
    const run = vi.fn().mockResolvedValueOnce({
      response: JSON.stringify({
        visualDescription: "تمثال جانبي بغطاء رأس ملون",
        objectType: "غير محدد",
        identity: "غير محدد",
        printedLabels: "لا يوجد نص مطبوع",
        printedTextTranslation: "غير محدد",
        visibleText: "غير محدد",
        translation: "غير محدد",
        period: "غير محدد",
      }),
    });
    const response = await worker.fetch(
      post("/api/scan", { image: png, language: "ar", mode: "objects" }),
      { AI: { run } },
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.analysis).toContain("تمثال جانبي بغطاء رأس ملون");
    expect(body.analysis).not.toContain("غير محدد");
    expect(body.analysis).not.toContain("لا يوجد نص مطبوع");
    expect(body.analysis).not.toContain("البيانات المطبوعة:");
    expect(body.analysis).not.toContain("ترجمة النص الظاهر في الصورة:");
  });

  it("does not call Google Vision or SerpApi even if legacy keys are present", async () => {
    const fetchMock = vi.fn(async () => new Response(JSON.stringify({ query: { pages: {} } }), {
      status: 200,
      headers: { "content-type": "application/json" },
    }));
    vi.stubGlobal("fetch", fetchMock);
    const run = vi.fn().mockResolvedValue({
      response: JSON.stringify({
        identity: "واجهة معبد مجهولة",
        visualDescription: "واجهة صخرية",
        keywords: [],
      }),
    });
    const response = await worker.fetch(
      post("/api/scan", { image: png, language: "ar", mode: "objects" }),
      {
        AI: { run },
        GOOGLE_VISION_API_KEY: "ignored-legacy-key",
        SERPAPI_KEY: "ignored-legacy-key",
      },
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toMatchObject({ resultType: "unverified", reverseImageSearchStatus: "unavailable" });
    expectUnverifiedScan(body);
    expect(body.sources).toEqual([]);
    const urls = fetchMock.mock.calls.map(([url]) => String(url));
    expect(urls.every((url) => !/vision\.googleapis\.com|serpapi\.com/.test(url))).toBe(true);
    vi.unstubAllGlobals();
  });

  it("does not expose attribution fields without an official image match", async () => {
    stubEmptyHeritageSearch();
    const run = vi.fn().mockResolvedValueOnce({
      response: JSON.stringify({
        identity: "لوحة أثرية",
        discoverer: "",
        discoveryDate: "",
        studyAttribution: "",
        publicationAttribution: "دارس مدون أسفل اللوحة ليس دليل اكتشاف",
        publicationDate: "1902",
        creationDate: "",
        sourceConflicts: "لا يوجد تعارض بين المصادر",
        keywords: ["لوحة"],
        periodClues: [],
      }),
    });
    const response = await worker.fetch(
      post("/api/scan", { image: png, language: "ar", mode: "objects" }),
      { AI: { run } },
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toMatchObject({ resultType: "unverified", reverseImageSearchStatus: "unavailable" });
    expectUnverifiedScan(body);
    expect(body.analysis).not.toContain("دارس مدون أسفل اللوحة");
    expect(run).toHaveBeenCalledOnce();
  });

  it("uses the hieroglyph-specific prompt for inscription scans", async () => {
    stubEmptyHeritageSearch();
    const run = vi.fn().mockResolvedValueOnce({
      response: JSON.stringify({
        visualDescription: "علامات محفورة",
        visibleText: "",
        keywords: ["علامات", "نقش"],
        periodClues: [],
      }),
    });
    try {
      const response = await worker.fetch(
        post("/api/scan", { image: png, language: "ar", mode: "hieroglyphs" }),
        { AI: { run }, ASSETS: { fetch: vi.fn() } },
      );
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(run.mock.calls[0][1].question).toContain("الهيراطيقية والديموطيقية");
      expect(run.mock.calls[0][1].question).toContain("ترجمة حرفية");
      expect(run.mock.calls[0][1].question).toContain("أنشئ searchTerms قصيرة ودقيقة");
      expect(body.analysis).toContain("لم يتم التأكد من الهوية بدقة");
      expect(body.analysis).not.toContain("قراءة أو ترجمة مخترعة");
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it("returns a readable fallback when no vision provider is configured", async () => {
    const response = await worker.fetch(
      post("/api/scan", { image: png, language: "ar", mode: "objects" }),
      {
        ASSETS: { fetch: vi.fn() },
      },
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({
      resultType: "unverified",
      reverseImageSearchStatus: "unavailable",
      analysis: expect.stringContaining("وصلت الصورة لكن تعذر تحليلها الآن"),
    });
  });

  it("requires a reference before generating an artifact guide", async () => {
    const response = await worker.fetch(post("/api/guide", { artifact: "تمثال", language: "ar" }), {
      AI: { run: vi.fn() },
      ASSETS: { fetch: vi.fn() },
    });

    expect(response.status).toBe(400);
  });

  it("retries a transient Gemini Vision 503 before using the successful response", async () => {
    let geminiCalls = 0;
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input instanceof Request ? input.url : input);
      if (url.startsWith("https://generativelanguage.googleapis.com/")) {
        geminiCalls += 1;
        if (geminiCalls === 1) return new Response(JSON.stringify({ error: { message: "temporary overload" } }), { status: 503 });
        return new Response(JSON.stringify({ candidates: [{ content: { parts: [{ text: JSON.stringify({
          visualDescription: "تمثال مصري قديم بملامح ملكية",
          objectType: "تمثال",
          identity: "تمثال ملكي مصري",
          searchTerms: ["تمثال ملكي مصري"],
        }) }] } }] }), { status: 200, headers: { "content-type": "application/json" } });
      }
      return new Response(JSON.stringify({ query: { pages: {} } }), { status: 200, headers: { "content-type": "application/json" } });
    });
    vi.stubGlobal("fetch", fetchMock);
    const run = vi.fn().mockRejectedValue(new Error("Cloudflare Moondream busy"));
    try {
      const response = await worker.fetch(
        post("/api/scan", { image: png, language: "ar", mode: "objects" }),
        { GEMINI_API_KEY: "gemini-key", GROQ_API_KEY: "groq-key", AI: { run }, ASSETS: { fetch: vi.fn(async () => new Response("", { status: 404 })) } },
      );
      const body = await response.json();
      expect(response.status).toBe(200);
      expect(body.ok).toBe(true);
      expect(geminiCalls).toBe(3);
      expect(body.analysis).toContain("اسم محتمل غير مؤكد: تمثال ملكي مصري");
      expect(body.visionDiagnostics).toMatchObject({ provider: "Gemini", usedFallback: true, fallbackOrder: ["Gemini", "Groq"] });
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it("reports Gemini then Groq as the actual hosted fallback order", async () => {
    const response = await worker.fetch(new Request("https://athara.test/api/health"), { GEMINI_API_KEY: "gemini-key", GROQ_API_KEY: "groq-key" });
    const body = await response.json();
    expect(body.visionProviderOrder).toEqual(["Cloudflare", "Gemini", "Groq"]);
    expect(body.visionFallbackOrder).toEqual(["Gemini", "Groq"]);
  });

});
