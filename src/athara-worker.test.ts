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

  it("does not run an AI guess when reverse-image search is unavailable", async () => {
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
    expect(body.analysis).toBe("");
    expect(body.sources).toEqual([]);
    expect(run).not.toHaveBeenCalled();
  });

  it("does not use local Ollama to identify artifacts without reverse-image search", async () => {
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
      expect(body.analysis).toBe("");
      expect(fetchMock).not.toHaveBeenCalled();
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

  it("queries the official Egyptian monuments archive for image matches before generic web sources", async () => {
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
      expect(body.sources).toEqual([]);
      expect(fetchMock.mock.calls.some(([url]) => String(url).includes("egymonuments.gov.eg"))).toBe(false);
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
      expect(body.analysis).toBe("");
      expect(body.sources).toEqual([]);
      expect(fetchedUrls).toEqual([]);
      expect(run).not.toHaveBeenCalled();
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
    expect(body.analysis).toBe("");
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
    expect(body.analysis).toBe("");
    expect(run).not.toHaveBeenCalled();
  });

  it("uses an official visual-search URL match and keeps source URLs out of analysis", async () => {
    const catalogUrl = "https://egymonuments.gov.eg/ar/monuments/karnak/";
    const imageUrl = "https://egymonuments.gov.eg/media/karnak.jpg";
    vi.stubGlobal("fetch", vi.fn(async (input: RequestInfo | URL) => {
      const requestUrl = String(input instanceof Request ? input.url : input);
      if (requestUrl.includes("vision.googleapis.com")) {
        return new Response(JSON.stringify({
          responses: [{
            webDetection: {
              pagesWithMatchingImages: [{ pageTitle: "معبد الكرنك", url: catalogUrl }],
            },
          }],
        }), { status: 200, headers: { "content-type": "application/json" } });
      }
      return new Response(JSON.stringify({ query: { pages: {} } }), {
        status: 200,
        headers: { "content-type": "application/json" },
      });
    }));
    const run = vi.fn().mockResolvedValueOnce({
      response: JSON.stringify({
        visualDescription: "نقش ملك يقدم قربانًا",
        keywords: ["marker", "king", "offering"],
        contextualStory: "قصة مولدة غير مثبتة",
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
            imageUrls: [imageUrl],
            localImageUrls: ["/egypt-monuments-images/karnak.jpg"],
            sourceTitle: "وزارة السياحة والآثار المصرية",
            sourceUrl: catalogUrl,
          },
        ]),
        ASSETS: { fetch: vi.fn() },
        GOOGLE_VISION_API_KEY: "test-server-key",
      },
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.resultType).toBe("reference_match");
    expect(body.analysis).toContain("وصف موثق للسجل.");
    expect(body.analysis).not.toContain("قصة مولدة غير مثبتة");
    expect(body.analysis).not.toContain(catalogUrl);
    expect(body.sources).toContainEqual(
      expect.objectContaining({ title: "وزارة السياحة والآثار المصرية", url: catalogUrl }),
    );
    expect(body.referenceImages).toEqual(["/egypt-monuments-images/karnak.jpg"]);
    expect(run).not.toHaveBeenCalled();
    vi.unstubAllGlobals();
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
    expect(body.analysis).toBe("");
    expect(body.sources).not.toContainEqual(expect.objectContaining({ url: catalogUrl }));
  });

  it("uploads the image to Google Lens and maps its visual match to an official catalog record", async () => {
    const catalogUrl = "https://egymonuments.gov.eg/ar/monuments/karnak/";
    let uploadedImageSize = 0;
    let searchedImageId = "";
    vi.stubGlobal("fetch", vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const requestUrl = String(input instanceof Request ? input.url : input);
      if (requestUrl === "https://serpapi.com/image") {
        const formData = init?.body as FormData;
        const upload = formData.get("image");
        uploadedImageSize = upload instanceof Blob ? upload.size : 0;
        return new Response(JSON.stringify({ image_id: "uploaded-image-id" }), {
          status: 200,
          headers: { "content-type": "application/json" },
        });
      }
      if (requestUrl.startsWith("https://serpapi.com/search?")) {
        searchedImageId = new URL(requestUrl).searchParams.get("image_id") || "";
        return new Response(JSON.stringify({
          visual_matches: [{
            title: "معبد الكرنك",
            source: "وزارة السياحة والآثار المصرية",
            link: catalogUrl,
          }],
        }), { status: 200, headers: { "content-type": "application/json" } });
      }
      return new Response(JSON.stringify({ query: { pages: {} } }), {
        status: 200,
        headers: { "content-type": "application/json" },
      });
    }));

    try {
      const run = vi.fn().mockResolvedValueOnce({
        response: JSON.stringify({ visualDescription: "واجهة معبد حجري", keywords: [] }),
      });
      const response = await worker.fetch(
        post("/api/scan", {
          image: png,
          searchImage: "data:image/jpeg;base64,aGVsbG8=",
          language: "ar",
          mode: "objects",
        }),
        {
          AI: { run },
          SERPAPI_KEY: "test-server-key",
          ATHARA_CATALOG_JSON: JSON.stringify([
            {
              id: "karnak-record",
              title: "معبد الكرنك",
              mode: "objects",
              keywords: ["الكرنك"],
              description: "وصف رسمي لمجمع معابد الكرنك.",
              sourceTitle: "وزارة السياحة والآثار المصرية",
              sourceUrl: catalogUrl,
            },
          ]),
          ASSETS: { fetch: vi.fn() },
        },
      );
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(uploadedImageSize).toBeGreaterThan(0);
      expect(uploadedImageSize).toBeLessThanOrEqual(500_000);
      expect(searchedImageId).toBe("uploaded-image-id");
      expect(body.resultType, JSON.stringify(body)).toBe("reference_match");
      expect(body.analysis).toContain("وصف رسمي لمجمع معابد الكرنك.");
      expect(body.sources).toContainEqual(expect.objectContaining({ url: catalogUrl }));
      expect(run).not.toHaveBeenCalled();
    } finally {
      vi.unstubAllGlobals();
    }
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
          matchStrength: "high",
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
      { candidates: [{ content: { parts: [{ text: JSON.stringify({ matchId: "none", matchStrength: "uncertain", visualEvidence: [] }) }] } }] },
    ];
    vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify(geminiPayloads.shift()), {
      status: 200,
      headers: { "content-type": "application/json" },
    })));
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
      expect(body.analysis).toBe("");
      expect(body.sources).toEqual([]);
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
      expect(fetchMock.mock.calls).toHaveLength(0);
      expect(body).toMatchObject({ resultType: "unverified", reverseImageSearchStatus: "unavailable" });
      expect(body.analysis).toBe("");
      expect(run).not.toHaveBeenCalled();
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
    expect(body.analysis).toBe("");
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
    expect(body.analysis).toBe("");
    expect(body.sources).toEqual([]);
  });

  it("does not call Groq vision without reverse-image search for artifact scans", async () => {
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
    expect(groqCalls.length).toBe(0);
    expect(await response.json()).toMatchObject({
      resultType: "unverified",
      reverseImageSearchStatus: "unavailable",
      analysis: "",
    });
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
    expect(body.analysis).toBe("");
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
    expect(body.analysis).toBe("");
    expect(body.sources).toEqual([]);
  });

  it("does not show generic Google Vision labels without an official visual match", async () => {
    vi.stubGlobal("fetch", vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input instanceof Request ? input.url : input);
      if (url.includes("vision.googleapis.com")) {
        return new Response(JSON.stringify({
          responses: [{
            webDetection: {
              bestGuessLabels: [{ label: "Great Hypostyle Hall" }],
              webEntities: [{ description: "Karnak" }],
            },
          }],
        }), { status: 200, headers: { "content-type": "application/json" } });
      }
      return new Response(JSON.stringify({ query: { pages: {} } }), {
        status: 200,
        headers: { "content-type": "application/json" },
      });
    }));
    const run = vi.fn().mockResolvedValue({
      response: JSON.stringify({
        identity: "صالة أعمدة",
        keywords: ["Karnak"],
      }),
    });
    const response = await worker.fetch(
      post("/api/scan", { image: png, language: "ar", mode: "objects" }),
      {
        AI: { run },
        GOOGLE_VISION_API_KEY: "test-server-key",
      },
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toMatchObject({ resultType: "unverified", reverseImageSearchStatus: "no_match" });
    expect(body.analysis).toBe("");
    expect(body.sources).toEqual([]);
  });

  it("does not trust a generic Vision landmark guess as an official image match", async () => {
    vi.stubGlobal("fetch", vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input instanceof Request ? input.url : input);
      if (url.includes("vision.googleapis.com")) {
        return new Response(JSON.stringify({
          responses: [{
            webDetection: {
              bestGuessLabels: [{ label: "Abu Simbel temples" }],
              webEntities: [{ description: "Abu Simbel" }],
            },
            landmarkAnnotations: [{ description: "Abu Simbel", score: 0.98 }],
          }],
        }), { status: 200, headers: { "content-type": "application/json" } });
      }
      return new Response(JSON.stringify({ query: { pages: {} } }), {
        status: 200,
        headers: { "content-type": "application/json" },
      });
    }));
    const run = vi.fn().mockResolvedValue({
      response: JSON.stringify({
        identity: "واجهة معبد مجهولة",
        visualDescription: "واجهة صخرية بأربعة تماثيل ضخمة",
        keywords: [],
      }),
    });
    const response = await worker.fetch(
      post("/api/scan", { image: png, language: "ar", mode: "objects" }),
      { AI: { run }, GOOGLE_VISION_API_KEY: "test-server-key" },
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toMatchObject({ resultType: "unverified", reverseImageSearchStatus: "no_match" });
    expect(body.analysis).toBe("");
    expect(body.sources).toEqual([]);
    expect(body.reverseImageSearchStatus).toBe("no_match");
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
    expect(body.analysis).toBe("");
    expect(run).not.toHaveBeenCalled();
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

  it("returns no artifact guess when reverse-image search is unavailable", async () => {
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
      analysis: "",
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
