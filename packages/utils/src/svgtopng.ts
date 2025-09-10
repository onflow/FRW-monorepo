function isSvgUrl(input: string): boolean {
  try {
    return input.toLowerCase().endsWith('.svg');
  } catch {
    return false;
  }
}

export function convertedSVGURL(originalUrl: string): string {
  const trimmed = originalUrl?.trim?.() ?? '';
  if (trimmed.length === 0) return originalUrl;

  if (!isSvgUrl(trimmed)) return originalUrl;

  try {
    const encoded = encodeURIComponent(trimmed);
    return `https://lilico.app/api/svg2png?url=${encoded}`;
  } catch {
    return originalUrl;
  }
}
