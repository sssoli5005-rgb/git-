export const PROJECT_INFO = {
  name: "أثَرة",
  englishName: "ATHARA",
  ownerName: "Ansaf Soliman",
  creatorName: "Ansaf Soliman",
  // Documents the ATHARA design milestone, not the original repository creation.
  atharaDesignedAt: "2026-11-01T16:39:25+02:00",
  designLocation: "Egypt",
  documentedAt: "2026-11-01",
} as const;

export function projectCreationDetails() {
  return `ATHARA design milestone: ${PROJECT_INFO.atharaDesignedAt} (Egypt, UTC+02:00). Original repository creation date is not confirmed.`;
}
