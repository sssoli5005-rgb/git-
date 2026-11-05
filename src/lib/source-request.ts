const SOURCE_REQUEST_PATTERN =
  /(?:\b(?:sources?|references?|citations?)\b|where(?: did you get| is) (?:this )?(?:information|that)|what(?:'s| is) (?:the )?source|مصادر|مصدر|المراجع|مرجع|منين جبت|جبت (?:المعلومة|المعلومات)|جايب(?:ة)? المعلومات|معلوماتك منين|المعلومات منين|المعلومة منين|ايه(?: هي)? مصدر|ما (?:هو )?مصدر|المصدر ايه|من اين جبت|fuentes|referencias|fuente|quelle source|quelles sources|références|quellen|referenzen|fonti|riferimenti|источник|источники|источники информации|出典|情報源|来源|资料来源)/iu;

export function isSourceRequest(content: string): boolean {
  const normalized = content
    .toLocaleLowerCase()
    .replace(/[أإآ]/gu, "ا")
    .replace(/[ًٌٍَُِّْـ]/gu, "");
  return SOURCE_REQUEST_PATTERN.test(normalized);
}
