import { describe, expect, it } from "vitest";

import { needsOfficialArtifactTranslation } from "@/lib/scanner-language";

describe("needsOfficialArtifactTranslation", () => {
  it("translates English Ministry pages for the selected interface language", () => {
    expect(
      needsOfficialArtifactTranslation(
        "https://egymonuments.gov.eg/en/collections/statue-of-osiris-6/",
        "ar",
      ),
    ).toBe(true);
    expect(
      needsOfficialArtifactTranslation(
        "https://egymonuments.gov.eg/collections/the-mummy-of-masaharti-7/",
        "es",
      ),
    ).toBe(true);
  });

  it("skips translation when the source already matches or is not a known Ministry page", () => {
    expect(
      needsOfficialArtifactTranslation("https://egymonuments.gov.eg/ar/collections/temple/", "ar"),
    ).toBe(false);
    expect(needsOfficialArtifactTranslation("https://example.org/en/collection/", "ar")).toBe(
      false,
    );
    expect(needsOfficialArtifactTranslation("not a URL", "ar")).toBe(false);
  });
});
