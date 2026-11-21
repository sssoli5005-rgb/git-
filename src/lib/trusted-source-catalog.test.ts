import { describe, expect, it } from "vitest";

import {
  TRUSTED_SOURCE_CATALOG,
  buildResearchSearchQuery,
  correctKnownResearchEntities,
  describeTrustedSourcesForQuestion,
  getPreferredResearchDomains,
  inferResearchTopics,
  isTrustedResearchHost,
} from "./trusted-source-catalog";

describe("trusted source directory", () => {
  it("contains a broad, categorized directory of institutions and specialist references", () => {
    expect(TRUSTED_SOURCE_CATALOG.length).toBeGreaterThanOrEqual(40);
    expect(TRUSTED_SOURCE_CATALOG.some((source) => source.domain === "egymonuments.gov.eg")).toBe(
      true,
    );
    expect(TRUSTED_SOURCE_CATALOG.some((source) => source.domain === "whc.unesco.org")).toBe(true);
    expect(
      TRUSTED_SOURCE_CATALOG.some((source) => source.domain === "pubmed.ncbi.nlm.nih.gov"),
    ).toBe(true);
    expect(TRUSTED_SOURCE_CATALOG.some((source) => source.domain === "biblegateway.com")).toBe(
      true,
    );
    expect(TRUSTED_SOURCE_CATALOG.some((source) => source.domain === "nae.org")).toBe(true);
    expect(TRUSTED_SOURCE_CATALOG.some((source) => source.domain === "quran.com")).toBe(true);
    expect(TRUSTED_SOURCE_CATALOG.some((source) => source.domain === "sunnah.com")).toBe(true);
    expect(TRUSTED_SOURCE_CATALOG.some((source) => source.domain === "dar-alifta.org")).toBe(true);
    expect(TRUSTED_SOURCE_CATALOG.some((source) => source.domain === "sefaria.org")).toBe(true);
    expect(
      TRUSTED_SOURCE_CATALOG.some(
        (source) => source.domain === "thesaurus-linguae-aegyptiae.de",
      ),
    ).toBe(true);
  });

  it.each([
    ["ما الموجود في سانت كترين؟", "egyptology"],
    ["ما معنى سفر يشوع 24:32؟", "scripture"],
    ["أين جسد إيليا النبي؟", "scripture"],
    ["في المسيحية ما معنى قال الرب لربي؟", "scripture"],
    ["مين هو الأنبا ساويرس الأنطاكي؟", "religion"],
    ["هل حرق مكتبة الإسكندرية كان متعمدًا؟", "archaeology"],
    ["ما معنى آية الكرسي في القرآن؟", "scripture"],
    ["ما معنى حديث صحيح البخاري؟", "scripture"],
    ["ما المقصود بنص التوراة في اليهودية؟", "scripture"],
    ["ما المقصود بالإنجيل؟", "scripture"],
    ["ما الفرق بين الميافيزية والأوطاخية في مجمع خلقيدونية؟", "religion"],
    ["ايه الفرق بين الانجيليين و الكاثوليك؟", "religion"],
    ["ما الفرق بين الإسلام والبوذية؟", "religion"],
    ["ايه الفرق بين الانجليين و الكاثوليك؟", "religion"],
    ["What do Hindus believe about the Vedas?", "religion"],
    ["ما معتقدات المصريين القدماء عن الآلهة والطقوس؟", "egyptology"],
    ["ما أعراض نقص الحديد؟", "health"],
    ["ما آخر تعديل في قانون العمل؟", "law"],
    ["كيف تتكون الثقوب السوداء؟", "science"],
    ["ما معدل التضخم؟", "economy"],
  ])("classifies research topic for %s", (question, topic) => {
    expect(inferResearchTopics(question)).toContain(topic);
  });

  it("selects subject-relevant sites rather than the same list for every topic", () => {
    expect(getPreferredResearchDomains("ما الموجود في سانت كترين؟")).toContain(
      "egymonuments.gov.eg",
    );
    expect(getPreferredResearchDomains("ما أعراض نقص الحديد؟")).toContain("who.int");
    expect(getPreferredResearchDomains("ما معنى سفر يشوع؟")).toContain("biblegateway.com");
    const quranSources = getPreferredResearchDomains("ما معنى آية الكرسي في القرآن؟");
    expect(quranSources[0]).toBe("quran.com");
    expect(quranSources).toContain("dar-alifta.org");
    const hadithSources = getPreferredResearchDomains("ما معنى حديث صحيح البخاري؟");
    expect(hadithSources[0]).toBe("sunnah.com");
    const jewishTextSources = getPreferredResearchDomains("ما المقصود بنص التوراة في اليهودية؟");
    expect(jewishTextSources[0]).toBe("sefaria.org");
    expect(getPreferredResearchDomains("What do Hindus believe about the Vedas?")).toContain(
      "britannica.com",
    );
    const christologySources = getPreferredResearchDomains(
      "ما الفرق بين الميافيزية والأوطاخية في مجمع خلقيدونية؟",
    );
    expect(christologySources).toContain("sourcebooks.fordham.edu");
    expect(christologySources).toContain("copticorthodox.church");
    expect(christologySources).toContain("st-takla.org");
    expect(christologySources).toContain("vatican.va");
    const denominationSources = getPreferredResearchDomains(
      "ايه الفرق بين الانجيليين و الكاثوليك؟",
    );
    expect(inferResearchTopics("ايه الفرق بين الانجيليين و الكاثوليك؟")).not.toContain("scripture");
    expect(denominationSources).toContain("nae.org");
    expect(denominationSources).toContain("vatican.va");
    expect(denominationSources).toContain("britannica.com");
    const misspelledDenominationSources = getPreferredResearchDomains(
      "ايه الفرق بين الانجليين و الكاثوليك؟",
    );
    expect(misspelledDenominationSources).toContain("nae.org");
    expect(misspelledDenominationSources).toContain("vatican.va");
    expect(inferResearchTopics("ايه الفرق بين الانجليين و الكاثوليك؟")).not.toContain("scripture");
    expect(getPreferredResearchDomains("ما معتقدات المصريين القدماء عن الآلهة والطقوس؟")).toContain(
      "uee.ucla.edu",
    );
    expect(getPreferredResearchDomains("كيف أقرأ العلامات الهيروغليفية؟")[0]).toBe(
      "thesaurus-linguae-aegyptiae.de",
    );
  });

  it.each([
    ["الانجليين", "الإنجيليين", "Evangelical Christians"],
    ["سانت كترين", "سانت كاترين", "Saint Catherine's Monastery"],
    ["نيڤرتيتي", "نفرتيتي", "Nefertiti"],
    ["سانت كتيرين", "سانت كاترين", "Saint Catherine's Monastery"],
    ["جبل موسي", "جبل موسى", "Jebel Musa"],
    ["سقاره", "سقارة", "Saqqara"],
    ["ابو سنبل", "أبو سمبل", "Abu Simbel"],
  ])(
    "suggests a high-confidence spelling/entity correction for %s",
    (query, canonical, english) => {
      const corrections = correctKnownResearchEntities(query);
      expect(corrections[0]?.canonical).toBe(canonical);
      expect(corrections[0]?.english).toContain(english);
      expect(buildResearchSearchQuery(query)).toContain(canonical);
    },
  );

  it("keeps ambiguous or unknown words unchanged instead of inventing a correction", () => {
    expect(correctKnownResearchEntities("محمود في مدينة غير معروفة")).toHaveLength(0);
  });

  it("only approves exact source domains and their subdomains", () => {
    expect(isTrustedResearchHost("www.metmuseum.org")).toBe(true);
    expect(isTrustedResearchHost("whc.unesco.org")).toBe(true);
    expect(isTrustedResearchHost("sourcebooks.fordham.edu")).toBe(true);
    expect(isTrustedResearchHost("copticorthodox.church")).toBe(true);
    expect(isTrustedResearchHost("thesaurus-linguae-aegyptiae.de")).toBe(true);
    expect(isTrustedResearchHost("notmetmuseum.org")).toBe(false);
    expect(isTrustedResearchHost("random.example")).toBe(false);
  });

  it("builds a transparent topic-specific source guide for the model", () => {
    const guide = describeTrustedSourcesForQuestion("ما الموجود في سانت كترين؟");
    expect(guide).toContain("وزارة السياحة والآثار المصرية");
    expect(guide).toContain("مركز التراث العالمي باليونسكو");
    expect(guide).toContain("Research topic classification: egyptology");
  });

  it("distinguishes doctrinal sources from scripture-only sources", () => {
    const guide = describeTrustedSourcesForQuestion(
      "ما الفرق بين ميا فيسيس وأوطاخي في مجمع أفسس وخلقيدونية؟",
    );

    expect(guide).toContain("Research topic classification: religion");
    expect(guide).toContain("نصوص تاريخية أولية");
    expect(guide).toContain("مواقف الكنيسة القبطية");
    expect(guide).not.toContain("Bible Gateway");
  });
});
