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
  expect(body.analysis).toContain("لم يتم التأكد من الهوية بدقة");
  expect(body.confidenceByField).toMatchObject({
    identity: "low",
    place: "low",
    period: "low",
  });
}

describe("ATHARA Cloudflare Worker", () => {
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
      visionModel: "@cf/meta/llama-3.2-11b-vision-instruct",
      visionFallbackModel: "@cf/llava-hf/llava-1.5-7b-hf",
    });
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
      { AI: { run }, ASSETS: { fetch: vi.fn() } },
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
    expect(run.mock.calls[0][0]).toBe("@cf/meta/llama-3.2-11b-vision-instruct");
    expect(run.mock.calls[0][1].image).toEqual([104, 101, 108, 108, 111]);
    expect(run.mock.calls[0][1].prompt).toContain("استفد من معرفتك الداخلية");
    expect(run.mock.calls[0][1].prompt).toContain("العنخ");
    expect(run.mock.calls[0][1].prompt).toContain("افحص كل شخصية على حدة");
    expect(run.mock.calls[0][1].prompt).toContain("خطمِه الطويل العريض");
    expect(run.mock.calls[0][1].prompt).toContain("سوبك كهوية محتملة فقط");
    expect(run.mock.calls[0][1].prompt).toContain("لا توجد في هذه الخدمة قاعدة صور متجهية");
    expect(fetchMock.mock.calls.length).toBeGreaterThanOrEqual(6);
    expect(String(fetchMock.mock.calls[0][0])).toContain(
      encodeURIComponent("ancient Egyptian offering scene"),
    );
    expect(fetchMock.mock.calls.some(([url]) => String(url).includes("en.wikipedia.org"))).toBe(true);
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
      expect(body.analysis).toContain("وليست تأكيدًا لمطابقة الصورة");
      expect(fetchMock.mock.calls.some(([url]) => String(url).includes("egymonuments.gov.eg"))).toBe(true);
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
        const searchTerm = new URL(requestUrl).searchParams.get("srsearch")?.toLowerCase() || "";
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
      expect(body.sources).toEqual([]);
      expect(fetchedUrls.length).toBeGreaterThan(0);
      expect(fetchedUrls.some((url) => decodeURIComponent(url).toLowerCase().includes("khufu statue"))).toBe(false);
      expect(run).toHaveBeenCalledOnce();
      expect(body.sources).not.toContainEqual(expect.objectContaining({ url: institutionalUrl }));
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

  it("uses Cloudflare Llama vision as the primary scanner even when chat provider keys exist", async () => {
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
    expect(body.model).toBe("Cloudflare Workers AI - Llama 3.2 11B Vision");
    expect(body.visionDiagnostics).toMatchObject({
      usedFallback: false,
    });
    expect(run).toHaveBeenCalledTimes(1);
    expect(run.mock.calls[0][0]).toBe("@cf/meta/llama-3.2-11b-vision-instruct");
    expect(fetchMock.mock.calls.length).toBeGreaterThanOrEqual(6);
  });

  it("does not use a vision fallback to identify artifacts without reverse-image search", async () => {
    stubEmptyHeritageSearch();
    const run = vi
      .fn()
      .mockRejectedValueOnce(new Error("model license not accepted"))
      .mockResolvedValueOnce({
        response: JSON.stringify({
          visualDescription: "Ancient carved stone",
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
    expect(run).toHaveBeenCalledTimes(2);
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
            expect(systemPrompt).toContain("objectType وmaterial وsymbols وstyle وpossibleLocation");
            expect(systemPrompt).toContain("لا تسمِّ أثرًا أو موقعًا");
            return Response.json({
              candidates: [{ content: { parts: [{ text: JSON.stringify({
                visualDescription: "Small seated bronze figure",
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
          expect(new URL(requestUrl).searchParams.get("departmentId")).toBe("10");
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
        expect(geminiCall).toBe(2);
        expect(fetchMock.mock.calls.some(([input]) => String(input).includes("serpapi.com"))).toBe(false);
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
    const run = vi.fn();
    const response = await worker.fetch(
      post("/api/scan", { image: png, language: "ar", mode: "objects" }),
      { AI: { run }, GROQ_API_KEY: "test-groq-key" },
    );

    expect(response.status).toBe(200);
    expect(run).not.toHaveBeenCalled();
    const groqCalls = vi.mocked(fetch).mock.calls.filter(([input]) =>
      String(input instanceof Request ? input.url : input).includes("api.groq.com"),
    );
    expect(groqCalls.length).toBeGreaterThan(0);
    const body = await response.json();
    expectUnverifiedScan(body);
    expect(body.reverseImageSearchStatus).toBe("unavailable");
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
      expect(run.mock.calls[0][1].prompt).toContain("الهيراطيقية والديموطيقية");
      expect(run.mock.calls[0][1].prompt).toContain("ترجمة حرفية");
      expect(run.mock.calls[0][1].prompt).toContain("أنشئ searchTerms قصيرة ودقيقة");
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
});
