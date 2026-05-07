export function parseProductImages(image: string | null | undefined): string[] {
  if (!image) return [];

  if (image.includes("||")) {
    return image
      .split("||")
      .map((s) => s.trim())
      .filter(Boolean);
  }

  if (image.startsWith("data:")) {
    return [image];
  }

  return image
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export function serializeProductImages(images: string[]): string {
  return images
    .map((s) => s.trim())
    .filter(Boolean)
    .join("||");
}

export function primaryProductImage(image: string | null | undefined): string {
  return parseProductImages(image)[0] || "";
}

export function featuredProductImage(image: string | null | undefined): string {
  const parsed = parseProductImages(image);
  return parsed[1] || parsed[0] || "";
}
