function percentile(histogram: Uint32Array, pixelCount: number, fraction: number): number {
  const target = Math.max(1, Math.ceil(pixelCount * fraction));
  let cumulative = 0;
  for (let value = 0; value < histogram.length; value += 1) {
    cumulative += histogram[value];
    if (cumulative >= target) return value;
  }
  return histogram.length - 1;
}

export function enhanceImageContrast(pixels: Uint8ClampedArray): Uint8ClampedArray {
  const enhanced = new Uint8ClampedArray(pixels);
  const histogram = new Uint32Array(256);
  const pixelCount = Math.floor(pixels.length / 4);

  for (let offset = 0; offset < pixelCount * 4; offset += 4) {
    const luminance = Math.round(
      pixels[offset] * 0.2126 + pixels[offset + 1] * 0.7152 + pixels[offset + 2] * 0.0722,
    );
    histogram[luminance] += 1;
  }

  const low = percentile(histogram, pixelCount, 0.02);
  const high = percentile(histogram, pixelCount, 0.98);
  if (high - low < 8) return enhanced;

  for (let offset = 0; offset < pixelCount * 4; offset += 4) {
    const luminance =
      pixels[offset] * 0.2126 + pixels[offset + 1] * 0.7152 + pixels[offset + 2] * 0.0722;
    const stretched = Math.max(0, Math.min(255, ((luminance - low) * 255) / (high - low)));
    const adjusted = luminance + (stretched - luminance) * 0.75;
    const scale = luminance > 0 ? adjusted / luminance : 0;

    for (let channel = 0; channel < 3; channel += 1) {
      enhanced[offset + channel] = Math.max(
        0,
        Math.min(255, Math.round(pixels[offset + channel] * scale)),
      );
    }
  }

  return enhanced;
}

export function isLikelyMonochrome(pixels: Uint8ClampedArray): boolean {
  const pixelCount = Math.floor(pixels.length / 4);
  if (!pixelCount) return false;
  let lowSaturationPixels = 0;
  const sampleStep = Math.max(1, Math.floor(pixelCount / 5000));

  for (let pixel = 0; pixel < pixelCount; pixel += sampleStep) {
    const offset = pixel * 4;
    const maximum = Math.max(pixels[offset], pixels[offset + 1], pixels[offset + 2]);
    const minimum = Math.min(pixels[offset], pixels[offset + 1], pixels[offset + 2]);
    if (maximum - minimum <= 48) lowSaturationPixels += 1;
  }

  const sampleCount = Math.ceil(pixelCount / sampleStep);
  return lowSaturationPixels / sampleCount >= 0.88;
}

export function createDocumentImageVariant(
  pixels: Uint8ClampedArray,
  width: number,
  height: number,
): Uint8ClampedArray {
  const pixelCount = width * height;
  if (!width || !height || pixels.length < pixelCount * 4)
    throw new Error("Image dimensions do not match the pixel buffer.");

  const grayscale = new Uint8Array(pixelCount);
  for (let pixel = 0; pixel < pixelCount; pixel += 1) {
    const offset = pixel * 4;
    grayscale[pixel] = Math.round(
      pixels[offset] * 0.2126 + pixels[offset + 1] * 0.7152 + pixels[offset + 2] * 0.0722,
    );
  }

  const denoised = new Uint8Array(pixelCount);
  const neighbors = new Uint8Array(9);
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      let neighborCount = 0;
      for (let dy = -1; dy <= 1; dy += 1) {
        const sampleY = y + dy;
        if (sampleY < 0 || sampleY >= height) continue;
        for (let dx = -1; dx <= 1; dx += 1) {
          const sampleX = x + dx;
          if (sampleX >= 0 && sampleX < width)
            neighbors[neighborCount++] = grayscale[sampleY * width + sampleX];
        }
      }
      for (let index = 1; index < neighborCount; index += 1) {
        const value = neighbors[index];
        let insertion = index - 1;
        while (insertion >= 0 && neighbors[insertion] > value) {
          neighbors[insertion + 1] = neighbors[insertion];
          insertion -= 1;
        }
        neighbors[insertion + 1] = value;
      }
      denoised[y * width + x] = neighbors[Math.floor(neighborCount / 2)];
    }
  }

  const integral = new Float64Array((width + 1) * (height + 1));
  const integralWidth = width + 1;
  for (let y = 1; y <= height; y += 1) {
    let rowSum = 0;
    for (let x = 1; x <= width; x += 1) {
      rowSum += denoised[(y - 1) * width + (x - 1)];
      integral[y * integralWidth + x] = integral[(y - 1) * integralWidth + x] + rowSum;
    }
  }

  const result = new Uint8ClampedArray(pixelCount * 4);
  const radius = Math.max(8, Math.min(20, Math.round(Math.min(width, height) * 0.012)));
  const bias = 7;
  for (let y = 0; y < height; y += 1) {
    const top = Math.max(0, y - radius);
    const bottom = Math.min(height, y + radius + 1);
    for (let x = 0; x < width; x += 1) {
      const left = Math.max(0, x - radius);
      const right = Math.min(width, x + radius + 1);
      const sum =
        integral[bottom * integralWidth + right] -
        integral[top * integralWidth + right] -
        integral[bottom * integralWidth + left] +
        integral[top * integralWidth + left];
      const mean = sum / ((bottom - top) * (right - left));
      const value = denoised[y * width + x] < mean - bias ? 0 : 255;
      const offset = (y * width + x) * 4;
      result[offset] = value;
      result[offset + 1] = value;
      result[offset + 2] = value;
      result[offset + 3] = pixels[offset + 3];
    }
  }

  return result;
}
