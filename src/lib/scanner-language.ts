export function needsOfficialArtifactTranslation(sourceUrl: string, language: string) {
  try {
    const url = new URL(sourceUrl);
    if (url.hostname !== "egymonuments.gov.eg") return false;
    const locale =
      url.pathname.match(/^\/(ar|en)(?:\/|$)/)?.[1] ??
      (url.pathname.startsWith("/collections/") ? "en" : null);
    return Boolean(locale && locale !== language);
  } catch {
    return false;
  }
}
