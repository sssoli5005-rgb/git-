export type ResearchTopic =
  | "egyptology"
  | "archaeology"
  | "world-history"
  | "scripture"
  | "health"
  | "science"
  | "law"
  | "geography"
  | "economy"
  | "general";

export type TrustedSource = {
  domain: string;
  name: string;
  topics: ResearchTopic[];
  purpose: string;
};

export const TRUSTED_SOURCE_CATALOG: readonly TrustedSource[] = [
  { domain: "egymonuments.gov.eg", name: "وزارة السياحة والآثار المصرية", topics: ["egyptology", "archaeology", "world-history", "geography"], purpose: "المواقع الأثرية المصرية والمتاحف والتاريخ الرسمي" },
  { domain: "whc.unesco.org", name: "مركز التراث العالمي باليونسكو", topics: ["egyptology", "archaeology", "world-history", "geography"], purpose: "مواقع التراث العالمي وملفات تسجيلها" },
  { domain: "unesco.org", name: "منظمة اليونسكو", topics: ["egyptology", "archaeology", "world-history", "science", "general"], purpose: "التراث والثقافة والتعليم والعلوم" },
  { domain: "ucl.ac.uk", name: "جامعة لندن – كلية لندن الجامعية", topics: ["egyptology", "archaeology", "world-history"], purpose: "علم المصريات واللغة والآثار" },
  { domain: "britishmuseum.org", name: "المتحف البريطاني", topics: ["egyptology", "archaeology", "world-history"], purpose: "فهارس المجموعات والقطع وتاريخها" },
  { domain: "metmuseum.org", name: "متحف المتروبوليتان للفنون", topics: ["egyptology", "archaeology", "world-history"], purpose: "سجلات القطع والمجموعات الفنية والأثرية" },
  { domain: "penn.museum", name: "متحف بنّ بجامعة بنسلفانيا", topics: ["egyptology", "archaeology", "world-history"], purpose: "المجموعات والبعثات والآثار" },
  { domain: "si.edu", name: "مؤسسة سميثسونيان", topics: ["egyptology", "archaeology", "world-history", "science", "general"], purpose: "المتاحف والبحث العلمي والمجموعات" },
  { domain: "louvre.fr", name: "متحف اللوفر", topics: ["egyptology", "archaeology", "world-history"], purpose: "المجموعات الأثرية والفنية" },
  { domain: "mfa.org", name: "متحف الفنون الجميلة في بوسطن", topics: ["egyptology", "archaeology", "world-history"], purpose: "المجموعات المصرية القديمة والبحث المتحفي" },
  { domain: "brooklynmuseum.org", name: "متحف بروكلين", topics: ["egyptology", "archaeology", "world-history"], purpose: "المجموعات المصرية والفن والتاريخ" },
  { domain: "artic.edu", name: "معهد الفن في شيكاغو", topics: ["archaeology", "world-history", "general"], purpose: "فهارس المجموعات والبحث الفني" },
  { domain: "clevelandart.org", name: "متحف كليفلاند للفنون", topics: ["egyptology", "archaeology", "world-history"], purpose: "سجلات القطع والمجموعات" },
  { domain: "ees.ac.uk", name: "جمعية استكشاف مصر", topics: ["egyptology", "archaeology"], purpose: "تقارير الحفائر والبحث المصري القديم" },
  { domain: "pcma.uw.edu.pl", name: "مركز آثار البحر المتوسط بجامعة وارسو", topics: ["egyptology", "archaeology"], purpose: "تقارير البعثات والتنقيب الأثري" },
  { domain: "saqqara.uw.edu.pl", name: "بعثة جامعة وارسو في سقارة", topics: ["egyptology", "archaeology"], purpose: "أبحاث سقارة والحفائر" },
  { domain: "aeraweb.org", name: "جمعية أبحاث مصر القديمة", topics: ["egyptology", "archaeology"], purpose: "أبحاث الجيزة وأهراماتها ومجتمع العمال" },
  { domain: "isac.uchicago.edu", name: "معهد دراسة الثقافات القديمة بجامعة شيكاغو", topics: ["egyptology", "archaeology", "world-history"], purpose: "النصوص والآثار واللغات القديمة" },
  { domain: "thebanmappingproject.com", name: "مشروع خريطة طيبة", topics: ["egyptology", "archaeology"], purpose: "خرائط ومقابر طيبة ووادي الملوك" },
  { domain: "biblegateway.com", name: "Bible Gateway", topics: ["scripture", "world-history"], purpose: "النصوص الكتابية ومقارنة الترجمات" },
  { domain: "bible.com", name: "YouVersion Bible", topics: ["scripture"], purpose: "النص الكتابي بلغات وترجمات متعددة" },
  { domain: "vatican.va", name: "الكرسي الرسولي – الفاتيكان", topics: ["scripture", "world-history", "general"], purpose: "وثائق وتعاليم ومصادر كاثوليكية رسمية" },
  { domain: "britannica.com", name: "Encyclopaedia Britannica", topics: ["egyptology", "archaeology", "world-history", "scripture", "science", "geography", "economy", "general"], purpose: "مرجع موسوعي للمعلومات العامة والخلفيات" },
  { domain: "oxfordreference.com", name: "Oxford Reference", topics: ["world-history", "scripture", "science", "geography", "general"], purpose: "تعريفات ومراجع أكاديمية" },
  { domain: "loc.gov", name: "مكتبة الكونغرس الأمريكي", topics: ["world-history", "scripture", "general"], purpose: "المجموعات والمخطوطات والوثائق التاريخية" },
  { domain: "archives.gov", name: "الأرشيف الوطني الأمريكي", topics: ["world-history", "law", "general"], purpose: "الوثائق والسجلات الرسمية" },
  { domain: "who.int", name: "منظمة الصحة العالمية", topics: ["health", "science"], purpose: "الصحة العامة والتوصيات الدولية" },
  { domain: "cdc.gov", name: "مراكز مكافحة الأمراض والوقاية منها", topics: ["health", "science"], purpose: "الإرشادات الصحية والبيانات الوبائية" },
  { domain: "nih.gov", name: "المعاهد الوطنية للصحة", topics: ["health", "science"], purpose: "الأبحاث والموارد الطبية" },
  { domain: "medlineplus.gov", name: "MedlinePlus – المكتبة الوطنية الأمريكية للطب", topics: ["health"], purpose: "شرح طبي مبسط ومراجَع" },
  { domain: "nhs.uk", name: "هيئة الخدمات الصحية البريطانية", topics: ["health"], purpose: "معلومات صحية وإرشادات للمرضى" },
  { domain: "pubmed.ncbi.nlm.nih.gov", name: "PubMed – المكتبة الوطنية الأمريكية للطب", topics: ["health", "science"], purpose: "فهرس الدراسات الطبية والبيولوجية المحكمة" },
  { domain: "cochranelibrary.com", name: "Cochrane Library", topics: ["health"], purpose: "مراجعات منهجية للأدلة الطبية" },
  { domain: "bmj.com", name: "The BMJ", topics: ["health", "science"], purpose: "أبحاث ومراجعات طبية" },
  { domain: "nature.com", name: "Nature", topics: ["science", "health", "archaeology"], purpose: "أبحاث علمية محكّمة" },
  { domain: "science.org", name: "Science", topics: ["science", "health", "archaeology"], purpose: "أبحاث علمية محكّمة" },
  { domain: "nasa.gov", name: "وكالة ناسا", topics: ["science", "geography"], purpose: "الفضاء والفلك وعلوم الأرض" },
  { domain: "webbtelescope.org", name: "موقع تلسكوب جيمس ويب الرسمي", topics: ["science", "general"], purpose: "المهمات والبيانات والصور الرسمية لتلسكوب جيمس ويب" },
  { domain: "noaa.gov", name: "الإدارة الوطنية للمحيطات والغلاف الجوي", topics: ["science", "geography"], purpose: "الطقس والمناخ والمحيطات" },
  { domain: "usgs.gov", name: "هيئة المسح الجيولوجي الأمريكية", topics: ["science", "geography"], purpose: "الجيولوجيا والزلازل والموارد الطبيعية" },
  { domain: "nps.gov", name: "هيئة المتنزهات الوطنية الأمريكية", topics: ["geography", "world-history", "archaeology"], purpose: "المواقع الطبيعية والتاريخية" },
  { domain: "un.org", name: "الأمم المتحدة", topics: ["law", "economy", "geography", "world-history", "general"], purpose: "الوثائق والاتفاقيات والبيانات الدولية" },
  { domain: "worldbank.org", name: "مجموعة البنك الدولي", topics: ["economy", "general"], purpose: "بيانات التنمية والاقتصاد" },
  { domain: "imf.org", name: "صندوق النقد الدولي", topics: ["economy"], purpose: "البيانات والتقارير الاقتصادية والمالية" },
  { domain: "oecd.org", name: "منظمة التعاون الاقتصادي والتنمية", topics: ["economy", "education", "general"], purpose: "الإحصاءات والسياسات الاقتصادية والتعليمية" },
  { domain: "eur-lex.europa.eu", name: "بوابة التشريعات الرسمية للاتحاد الأوروبي", topics: ["law", "economy"], purpose: "نصوص القوانين واللوائح الأوروبية" },
  { domain: "legislation.gov.uk", name: "التشريعات البريطانية الرسمية", topics: ["law"], purpose: "النصوص القانونية والتشريعات" },
  { domain: "congress.gov", name: "الكونغرس الأمريكي", topics: ["law", "world-history"], purpose: "مشروعات القوانين وسجلات التشريع" },
  { domain: "gov.uk", name: "الحكومة البريطانية", topics: ["law", "health", "geography", "general"], purpose: "الخدمات والسياسات واللوائح الرسمية" },
  { domain: "ox.ac.uk", name: "جامعة أكسفورد", topics: ["egyptology", "archaeology", "world-history", "scripture", "science", "general"], purpose: "المراجع والبحوث الأكاديمية" },
  { domain: "cam.ac.uk", name: "جامعة كامبريدج", topics: ["egyptology", "archaeology", "world-history", "scripture", "science", "general"], purpose: "المراجع والبحوث الأكاديمية" },
  { domain: "harvard.edu", name: "جامعة هارفارد", topics: ["egyptology", "archaeology", "world-history", "science", "general"], purpose: "المراجع والبحوث الأكاديمية" },
  { domain: "stanford.edu", name: "جامعة ستانفورد", topics: ["world-history", "science", "law", "economy", "general"], purpose: "البحوث والمراجع الجامعية" },
  { domain: "mit.edu", name: "معهد ماساتشوستس للتكنولوجيا", topics: ["science", "technology", "general"], purpose: "الأبحاث العلمية والهندسية والتقنية" },
] as const;

const TOPIC_RULES: Array<{ topic: ResearchTopic; pattern: RegExp }> = [
  { topic: "scripture", pattern: /(?:يوسف الصديق|يوسف بن يعقوب|جسد يوسف|عظام يوسف|joseph|كتاب مقدس|الكتاب المقدس|الانجيل|إنجيل|انجيل|تكوين|خروج|يشوع|مزامير|رسالة بولس|عقيده مسيحيه|كنيسه|الكنيسة|المسيح|يسوع|مريم العذراء|Bible|biblical|scripture|gospel|christian|church|theology)/iu },
  { topic: "health", pattern: /(?:صحه|صحة|طبي|مرض|دواء|علاج|اعراض|أعراض|جراحه|جراحة|تغذيه|تغذية|حمل|قلب|سكر|ضغط الدم|medical|health|disease|medicine|symptom|treatment|clinical|drug|nutrition)/iu },
  { topic: "law", pattern: /(?:قانون|تشريع|محكمه|محكمة|حكم قضائي|حقوق|عقد|لائحه|لائحة|قانوني|legal|law|regulation|court|legislation|rights|contract)/iu },
  { topic: "economy", pattern: /(?:اقتصاد|اقتصادي|تضخم|سعر صرف|عمله|عملة|بنك|استثمار|بطاله|بطالة|ناتج محلي|economy|economic|inflation|exchange rate|currency|bank|investment|gdp)/iu },
  { topic: "egyptology", pattern: /(?:مصر القديمه|مصر القديمة|فرعون|فراعنه|فراعنة|هيروغليف|تحنيط|مومياء|اهرام|أهرام|سقاره|سقارة|الجيزه|الجيزة|الاقصر|الأقصر|اسوان|أسوان|سانت كاترين|سانت كترين|سان كترين|جبل موسى|جبل موسي|ابو سمبل|أبو سمبل|نفرتيتي|توت عنخ|رمسيس|حتشبسوت|خوفو|egyptolog|pharaoh|hieroglyph|mumm|saqqara|giza|luxor|aswan|tutankhamun|ramesses|nefertiti|hatshepsut)/iu },
  { topic: "archaeology", pattern: /(?:اثار|آثار|اثري|أثري|تنقيب|حفائر|مقبره|مقبرة|معبد|قطعه اثريه|قطعة أثرية|مخطوطه|مخطوطة|نقش|artifact|archaeolog|excavation|tomb|temple|inscription|manuscript)/iu },
  { topic: "world-history", pattern: /(?:تاريخ|حضاره|حضارة|ملوك|امبراطور|إمبراطور|حرب|معركه|معركة|دوله قديمه|دولة قديمة|history|historical|civilization|king|queen|emperor|war|battle)/iu },
  { topic: "science", pattern: /(?:علم|علوم|فيزياء|كيمياء|احياء|أحياء|فضاء|فلك|كوكب|مناخ|تغير مناخي|جيولوجيا|ثقب اسود|ثقب أسود|ثقوب سوداء|الثقوب السوداء|black hole|black holes|science|physics|chemistry|biology|space|astronomy|planet|climate|geology|research)/iu },
  { topic: "geography", pattern: /(?:اين تقع|أين تقع|موقع|مكان|مدينه|مدينة|دوله|دولة|جبل|نهر|بحر|جزيره|جزيرة|طقس|مناخ|خريطه|خريطة|where is|located|geography|mountain|river|sea|island|weather|map)/iu },
];

const ENTITY_ALIASES: Array<{ canonical: string; english: string; aliases: string[] }> = [
  { canonical: "سانت كاترين", english: "Saint Catherine's Monastery and Saint Catherine Area, South Sinai", aliases: ["سانت كترين", "سانت كاثرين", "سان كترين", "سانتا كترين", "دير سانت كترين"] },
  { canonical: "جبل موسى", english: "Jebel Musa / Mount Sinai", aliases: ["جبل موسي", "جبل موسا", "جبل موسى"] },
  { canonical: "سقارة", english: "Saqqara", aliases: ["سقاره", "سقارة"] },
  { canonical: "أبو سمبل", english: "Abu Simbel", aliases: ["ابو سمبل", "ابو سنبل", "ابوسمبل"] },
  { canonical: "الأقصر", english: "Luxor", aliases: ["الاقصر", "الأقصر"] },
  { canonical: "أسوان", english: "Aswan", aliases: ["اسوان", "أسوان"] },
  { canonical: "الجيزة", english: "Giza", aliases: ["الجيزه", "الجيزة"] },
  { canonical: "توت عنخ آمون", english: "Tutankhamun", aliases: ["توت عنخ امون", "توت عنخ آمون", "توتانخ امون"] },
  { canonical: "نفرتيتي", english: "Nefertiti", aliases: ["نفرتيتي", "نفرتيتى"] },
  { canonical: "خوفو", english: "Khufu / Cheops", aliases: ["خوفو", "خوفه"] },
  { canonical: "يوسف الصديق", english: "Joseph son of Jacob in the Bible", aliases: ["يوسف الصديق", "يوسف بن يعقوب", "جسد يوسف", "عظام يوسف"] },
];

function normalizeForMatching(value: string): string {
  return value
    .toLocaleLowerCase()
    .normalize("NFKC")
    .normalize("NFD")
    .replace(/[\u0300-\u036f\u064b-\u065f\u0670]/gu, "")
    .replace(/[أإآٱ]/gu, "ا")
    .replace(/[ىي]/gu, "ي")
    .replace(/ة/gu, "ه")
    .replace(/[ًٌٍَُِّْـ]/gu, "")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .replace(/\s+/gu, " ")
    .trim();
}

export function inferResearchTopics(question: string): ResearchTopic[] {
  const corrections = correctKnownResearchEntities(question);
  const searchable = [
    question,
    ...corrections.map((item) => item.canonical + " " + item.english),
  ].join(" ");
  const topics = TOPIC_RULES.filter(({ pattern }) => pattern.test(searchable)).map(({ topic }) => topic);
  return topics.length ? [...new Set(topics)] : ["general"];
}

export function getTrustedSourcesForQuestion(question: string): TrustedSource[] {
  const topics = inferResearchTopics(question);
  const matches = TRUSTED_SOURCE_CATALOG.filter((source) =>
    source.topics.some((topic) => topics.includes(topic)),
  );
  return matches.length
    ? matches
    : TRUSTED_SOURCE_CATALOG.filter((source) => source.topics.includes("general"));
}

export function getPreferredResearchDomains(question: string, limit = 6): string[] {
  return getTrustedSourcesForQuestion(question)
    .slice(0, limit)
    .map((source) => source.domain);
}

export function isTrustedResearchHost(hostname: string): boolean {
  const host = hostname.toLocaleLowerCase().replace(/\.$/u, "");
  return TRUSTED_SOURCE_CATALOG.some(
    (source) => host === source.domain || host.endsWith("." + source.domain),
  ) ||
    host.endsWith(".gov") ||
    host.endsWith(".edu") ||
    host.endsWith(".int") ||
    /\.ac\.[a-z]{2,}$/u.test(host);
}

export function describeTrustedSourcesForQuestion(question: string, limit = 8): string {
  const sources = getTrustedSourcesForQuestion(question).slice(0, limit);
  const topics = inferResearchTopics(question).join(", ");
  return [
    `Research topic classification: ${topics}.`,
    "Preferred trusted source directory (prioritize these sources when relevant; they are not a substitute for checking the actual page content):",
    ...sources.map((source) => `- ${source.name} (${source.domain}): ${source.purpose}.`),
    "Use primary institutional sources first; use academic or specialist publications for interpretation; use reference encyclopedias for orientation, not as a substitute for primary evidence.",
  ].join("\n");
}

export function correctKnownResearchEntities(question: string): Array<{ canonical: string; english: string; matched: string }> {
  const normalized = normalizeForMatching(question);
  const corrections: Array<{ canonical: string; english: string; matched: string }> = [];
  for (const entry of ENTITY_ALIASES) {
    const match = entry.aliases.find((alias) => normalized.includes(normalizeForMatching(alias)));
    if (match) corrections.push({ canonical: entry.canonical, english: entry.english, matched: match });
  }
  return corrections;
}

export function buildResearchSearchQuery(question: string, maxLength = 1024): string {
  const corrections = correctKnownResearchEntities(question);
  const entityHints = corrections.map((item) =>
    `Likely intended entity: ${item.canonical} (${item.english})`,
  );
  const topicHints: Record<ResearchTopic, string> = {
    egyptology: "Egyptian Ministry of Tourism and Antiquities, UNESCO World Heritage Centre, university Egyptology, museum catalogues, archaeological missions",
    archaeology: "official museum collections, archaeological missions, university research, excavation reports",
    "world-history": "primary historical documents, university history departments, museum or archive catalogues, established reference works",
    scripture: "exact Bible text, book chapter and verse, Bible Gateway, Bible.com; separate scripture from later tradition and archaeological claims",
    health: "official health authority guidance, WHO, CDC, NIH, PubMed, systematic reviews and clinical guidelines",
    science: "peer-reviewed research, university laboratories, NASA, NOAA, USGS, recognized scientific agencies",
    law: "official legislation, courts, government legal publications, treaty texts and recognized legal references",
    geography: "official geographic and heritage authorities, national mapping agencies, UNESCO, government visitor information",
    economy: "official statistics agencies, central banks, IMF, World Bank, OECD",
    general: "primary sources, university publications, national libraries and archives, Britannica and Oxford Reference",
  };
  const topics = inferResearchTopics(question);
  const guidance = [...new Set(topics)].map((topic) => topicHints[topic]).join("; ");
  const domains = getPreferredResearchDomains(question, 4);
  return [
    question.trim(),
    ...entityHints,
    `Research evidence preferences: ${guidance}`,
    `Preferred source domains: ${domains.map((domain) => `site:${domain}`).join(" OR ")}`,
  ].filter(Boolean).join(" ").slice(0, maxLength);
}
