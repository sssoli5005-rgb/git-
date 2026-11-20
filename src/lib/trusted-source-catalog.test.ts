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
    expect(TRUSTED_SOURCE_CATALOG.some((source) => source.domain === "egymonuments.gov.eg")).toBe(true);
    expect(TRUSTED_SOURCE_CATALOG.some((source) => source.domain === "whc.unesco.org")).toBe(true);
    expect(TRUSTED_SOURCE_CATALOG.some((source) => source.domain === "pubmed.ncbi.nlm.nih.gov")).toBe(true);
    expect(TRUSTED_SOURCE_CATALOG.some((source) => source.domain === "biblegateway.com")).toBe(true);
  });

  it.each([
    ["ما الموجود في سانت كترين؟", "egyptology"],
    ["ما معنى سفر يشوع 24:32؟", "scripture"],
    ["ما الفرق بين الميافيزية والأوطاخية في مجمع خلقيدونية؟", "religion"],
    ["ما معتقدات المصريين القدماء عن الآلهة والطقوس؟", "egyptology"],
    ["ما أعراض نقص الحديد؟", "health"],
    ["ما آخر تعديل في قانون العمل؟", "law"],
    ["كيف تتكون الثقوب السوداء؟", "science"],
    ["ما معدل التضخم؟", "economy"],
  ])("classifies research topic for %s", (question, topic) => {
    expect(inferResearchTopics(question)).toContain(topic);
  });

  it("selects subject-relevant sites rather than the same list for every topic", () => {
    expect(getPreferredResearchDomains("ما الموجود في سانت كترين؟")).toContain("egymonuments.gov.eg");
    expect(getPreferredResearchDomains("ما أعراض نقص الحديد؟")).toContain("who.int");
    expect(getPreferredResearchDomains("ما معنى سفر يشوع؟")).toContain("biblegateway.com");
    const christologySources = getPreferredResearchDomains(
      "ما الفرق بين الميافيزية والأوطاخية في مجمع خلقيدونية؟",
    );
    expect(christologySources).toContain("sourcebooks.fordham.edu");
    expect(christologySources).toContain("copticorthodox.church");
    expect(christologySources).toContain("st-takla.org");
    expect(christologySources).toContain("vatican.va");
    expect(getPreferredResearchDomains("ما معتقدات المصريين القدماء عن الآلهة والطقوس؟")).toContain(
      "uee.ucla.edu",
    );
  });

  it.each([
    ["سانت كترين", "سانت كاترين", "Saint Catherine's Monastery"],
    ["نيڤرتيتي", "نفرتيتي", "Nefertiti"],
    ["سانت كتيرين", "سانت كاترين", "Saint Catherine's Monastery"],
    ["جبل موسي", "جبل موسى", "Jebel Musa"],
    ["سقاره", "سقارة", "Saqqara"],
    ["ابو سنبل", "أبو سمبل", "Abu Simbel"],
  ])("suggests a high-confidence spelling/entity correction for %s", (query, canonical, english) => {
    const corrections = correctKnownResearchEntities(query);
    expect(corrections[0]?.canonical).toBe(canonical);
    expect(corrections[0]?.english).toContain(english);
    expect(buildResearchSearchQuery(query)).toContain(canonical);
  });

  it("keeps ambiguous or unknown words unchanged instead of inventing a correction", () => {
    expect(correctKnownResearchEntities("محمود في مدينة غير معروفة")).toHaveLength(0);
  });

  it("only approves exact source domains and their subdomains", () => {
    expect(isTrustedResearchHost("www.metmuseum.org")).toBe(true);
    expect(isTrustedResearchHost("whc.unesco.org")).toBe(true);
    expect(isTrustedResearchHost("sourcebooks.fordham.edu")).toBe(true);
    expect(isTrustedResearchHost("copticorthodox.church")).toBe(true);
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
