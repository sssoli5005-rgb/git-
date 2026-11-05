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

  it("passes decoded image bytes to the primary Llama vision model", async () => {
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
    expect(body).toMatchObject({ ok: true, resultType: "ai_guess" });
    expect(body.analysis).toContain("تخمين أولي غير موثق");
    const firstCall = run.mock.calls[0][1];
    expect(firstCall.image).toEqual([104, 101, 108, 108, 111]);
    expect(firstCall.prompt).toContain("حلل محتوى الصورة بصريًا");
    expect(run.mock.calls[0][0]).toBe("@cf/meta/llama-3.2-11b-vision-instruct");
    expect(run).toHaveBeenCalledTimes(1);
  });

  it("uses configured local Ollama vision when Cloudflare AI is unavailable", async () => {
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
      expect(body.model).toBe("Ollama - gemma3:4b");
      expect(body.visionDiagnostics).toMatchObject({
        provider: "Ollama (local)",
        usedFallback: false,
      });
      expect(fetchMock).toHaveBeenCalled();
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

  it("searches printed book labels and returns snippets from allowlisted institutions", async () => {
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
      expect(run.mock.calls[0][1].prompt).toContain('"printedLabels"');
      expect(run.mock.calls[0][1].prompt).toContain("العنوان المطبوع");
      expect(fetchedUrls.some((url) => url.includes(encodeURIComponent(printedLabel)))).toBe(true);
      expect(fetchedUrls).toContain(institutionalUrl);
      expect(fetchedUrls.some((url) => url.includes("evil.example"))).toBe(false);
      expect(body).toMatchObject({ trustedSourcesAvailable: true });
      expect(body.analysis).toContain(printedLabel);
      expect(body.analysis).not.toContain("collection record describes an Egyptian statue");
      expect(body.analysis).not.toContain("المصادر:");
      expect(body.sources).toContainEqual(
        expect.objectContaining({
          title: "Egyptian Statue - The Metropolitan Museum of Art",
          url: institutionalUrl,
          trusted: true,
        }),
      );
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
    expect(body.confidenceByField.place).toBe("low");
    expect(body.analysis).toContain("الموقع غير مؤكد بدقة");
    expect(body.analysis).not.toContain("إدفو");
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

  it("falls back to Cloudflare LLaVA if Llama Vision is unavailable", async () => {
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
    expect(body.model).toBe("Cloudflare Workers AI - LLaVA 1.5 7B (fallback)");
    expect(body.visionDiagnostics).toMatchObject({
      usedFallback: true,
      attempts: [
        { model: "@cf/meta/llama-3.2-11b-vision-instruct", reason: "model license not accepted" },
      ],
    });
    expect(run.mock.calls.map(([model]) => model)).toEqual([
      "@cf/meta/llama-3.2-11b-vision-instruct",
      "@cf/llava-hf/llava-1.5-7b-hf",
    ]);
  });

  it("keeps matched catalog sources out of the analysis text", async () => {
    stubEmptyHeritageSearch();
    const catalogUrl = "https://museum.example/artifact";
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
            sourceTitle: "Museum collection",
            sourceUrl: catalogUrl,
          },
        ]),
        ASSETS: { fetch: vi.fn() },
      },
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.analysis).not.toContain(catalogUrl);
    expect(body.sources).toContainEqual(
      expect.objectContaining({ title: "Museum collection", url: catalogUrl }),
    );
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

      expect(response.status).toBe(200);
      expect(run.mock.calls[0][1].prompt).toContain("حلل محتوى الصورة بصريًا");
      expect(run.mock.calls[0][1].prompt).toContain(expectedPrompt);
      expect(run.mock.calls[0][1].prompt).toContain("إذا كان طعامًا فلا تزعم أنه فرعوني");
      expect(run).toHaveBeenCalledTimes(1);
      expect(fetchMock.mock.calls.length).toBeGreaterThanOrEqual(4);
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it("corrects Rosetta Stone identity and separates its historical roles", async () => {
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
    expect(body.analysis).toContain("حجر رشيد (Rosetta Stone)");
    expect(body.analysis).toContain("المتحف البريطاني");
    expect(body.analysis).toContain("196 قبل الميلاد");
    expect(body.analysis).not.toContain("فيلكس رشمر");
    expect(body.analysis).not.toContain("توت عنخ آمون");
  });

  it("corrects Abu Simbel instead of repeating a wrong temple or ruler", async () => {
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
    expect(body.analysis).toContain("معبد أبو سمبل الكبير");
    expect(body.analysis).toContain("رمسيس الثاني");
    expect(body.analysis).toContain("بحيرة ناصر");
    expect(body.analysis).toContain("رع حوراختي");
    expect(body.analysis).not.toContain("معبد لبابة");
    expect(body.analysis).not.toContain("أمنحتب الثالث");
  });

  it("uses Groq vision alongside Gemini for the scanner ensemble", async () => {
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
    expect(groqCalls.length).toBe(1);
    const payload = JSON.parse(String(groqCalls[0][1]?.body));
    expect(payload.messages[0].content[1].type).toBe("image_url");
  });

  it("recognizes Karnak Osiride statues instead of Abu Simbel", async () => {
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
    expect(body.analysis).toContain("الكرنك");
    expect(body.analysis).toContain("الأقصر");
    expect(body.analysis).not.toContain("معبد أبو سمبل الكبير");
    expect(body.analysis).not.toContain("بحيرة ناصر");
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
    expect(body.analysis).not.toContain("قصة تاريخية تخيلية");
    expect(body.analysis).not.toContain("أهمية غير مثبتة");
    expect(body.analysis).not.toContain("تفاصيل ملكية غير مثبتة");
    expect(body.analysis).not.toContain("موقع مختلق");
    expect(body.analysis).toContain("لم يتم التأكد من الهوية");
  });

  it("adds optional Google Vision recognition evidence when configured", async () => {
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
    expect(body.recognitionEngines?.[0]?.engine).toBe("google_vision");
    expect(body.recognitionEngines?.[0]?.bestGuess).toBe("Great Hypostyle Hall");
  });

  it("uses Google Vision or Google Lens Abu Simbel identity before composing history", async () => {
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
    expect(body.analysis).toContain("معبد أبو سمبل الكبير");
    expect(body.analysis).toContain("رمسيس الثاني");
    expect(body.analysis).not.toContain("معبد لبابة");
  });

  it("separates discovery, study, publication and creation attribution", async () => {
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
    expect(body.analysis).not.toContain("المكتشف المؤكد: دارس مدون أسفل اللوحة ليس دليل اكتشاف");
    expect(body.analysis).not.toContain("لا يوجد تعارض");
    expect(run.mock.calls[0][1].prompt).toContain("ميّز المكتشف");
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

  it("returns a clear service error when the AI binding is unavailable", async () => {
    const response = await worker.fetch(
      post("/api/scan", { image: png, language: "ar", mode: "objects" }),
      {
        ASSETS: { fetch: vi.fn() },
      },
    );

    expect(response.status).toBe(503);
    expect(await response.json()).toMatchObject({
      error: "ماسح الصور يحتاج ربط Cloudflare Workers AI. تأكد من إعداد ربط AI في Worker.",
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
