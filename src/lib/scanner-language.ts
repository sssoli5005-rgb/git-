type MatchedArtifactCard = {
  identificationLabel: string;
  nameLabel: string;
  name: string;
  locationLabel: string;
  location: string;
  periodLabel: string;
  period: string;
  detailsLabel: string;
  details: string;
};

export function formatMatchedArtifactCard({
  identificationLabel,
  nameLabel,
  name,
  locationLabel,
  location,
  periodLabel,
  period,
  detailsLabel,
  details,
}: MatchedArtifactCard): string {
  return [
    identificationLabel,
    `${nameLabel}: ${name}`,
    location ? `${locationLabel}: ${location}` : "",
    period ? `${periodLabel}: ${period}` : "",
    details ? `${detailsLabel}: ${details}` : "",
  ].filter(Boolean).join("\n\n");
}

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
