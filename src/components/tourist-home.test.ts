import { describe, expect, it } from "vitest";

import {
  formatMatchedArtifactCard,
  needsOfficialArtifactTranslation,
} from "@/lib/scanner-language";

describe("formatMatchedArtifactCard", () => {
  it("keeps catalog identity and location separate from translated description", () => {
    const result = formatMatchedArtifactCard({
      identificationLabel: "تم التعرف على الأثر بنجاح",
      nameLabel: "اسم الأثر",
      name: "Statue of Nephthys",
      locationLabel: "مكان العرض الحالي",
      location: "Mummification Museum, Luxor",
      periodLabel: "الفترة التاريخية",
      period: "",
      detailsLabel: "التفاصيل التاريخية",
      details: "نفثيس وإيزيس رثتا أخاهما أوزيريس.",
    });

    expect(result).toContain("اسم الأثر: Statue of Nephthys");
    expect(result).toContain("مكان العرض الحالي: Mummification Museum, Luxor");
    expect(result).toContain("التفاصيل التاريخية: نفثيس وإيزيس رثتا أخاهما أوزيريس.");
    expect(result.indexOf("اسم الأثر:")).toBeLessThan(result.indexOf("التفاصيل التاريخية:"));
  });
});

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
