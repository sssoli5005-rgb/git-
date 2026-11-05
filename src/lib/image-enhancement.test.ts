import { describe, expect, it } from "vitest";

import {
  createDocumentImageVariant,
  enhanceImageContrast,
  isLikelyMonochrome,
} from "./image-enhancement";

describe("enhanceImageContrast", () => {
  it("improves a dark, low-contrast grayscale image without mutating the original", () => {
    const pixels = new Uint8ClampedArray([
      24, 24, 24, 255, 40, 40, 40, 255, 65, 65, 65, 255, 92, 92, 92, 255,
    ]);

    const enhanced = enhanceImageContrast(pixels);

    expect(enhanced[0]).toBeLessThan(pixels[0]);
    expect(enhanced[12]).toBeGreaterThan(pixels[12]);
    expect(pixels[0]).toBe(24);
    expect(enhanced[3]).toBe(255);
    expect(enhanced[0]).toBe(enhanced[1]);
    expect(enhanced[1]).toBe(enhanced[2]);
  });

  describe("document image preprocessing", () => {
    it("recognizes monochrome book and inscription images without classifying colored scenes", () => {
      expect(
        isLikelyMonochrome(
          new Uint8ClampedArray([40, 42, 38, 255, 218, 204, 176, 255, 232, 215, 188, 255]),
        ),
      ).toBe(true);
      expect(isLikelyMonochrome(new Uint8ClampedArray([240, 20, 12, 255, 5, 90, 210, 255]))).toBe(
        false,
      );
    });

    it("denoises and adaptively thresholds a faded grayscale page without changing alpha", () => {
      const grayscale = new Uint8ClampedArray(
        Array.from({ length: 25 }, (_, index) => {
          const x = index % 5;
          const y = Math.floor(index / 5);
          const value = x >= 1 && x <= 3 && y >= 1 && y <= 3 ? 65 : index % 2 ? 214 : 205;
          return [value, value, value, 255];
        }).flat(),
      );

      const thresholded = createDocumentImageVariant(grayscale, 5, 5);

      expect(thresholded[12 * 4]).toBe(0);
      expect(thresholded[0]).toBe(255);
      expect(thresholded[3]).toBe(255);
      expect(grayscale[12 * 4]).toBe(65);
    });

    it("rejects pixel data with mismatched dimensions", () => {
      expect(() => createDocumentImageVariant(new Uint8ClampedArray(4), 2, 2)).toThrow(
        "Image dimensions do not match the pixel buffer.",
      );
    });
  });

  it("preserves a flat image when contrast stretching cannot reveal more detail", () => {
    const pixels = new Uint8ClampedArray([80, 80, 80, 255, 80, 80, 80, 255]);

    expect(enhanceImageContrast(pixels)).toEqual(pixels);
  });
});
