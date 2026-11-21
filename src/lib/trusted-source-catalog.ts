export type ResearchTopic =
  | "egyptology"
  | "archaeology"
  | "world-history"
  | "religion"
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
  {
    domain: "egymonuments.gov.eg",
    name: "وزارة السياحة والآثار المصرية",
    topics: ["egyptology", "archaeology", "world-history", "geography"],
    purpose: "المواقع الأثرية المصرية والمتاحف والتاريخ الرسمي",
  },
  {
    domain: "whc.unesco.org",
    name: "مركز التراث العالمي باليونسكو",
    topics: ["egyptology", "archaeology", "world-history", "geography"],
    purpose: "مواقع التراث العالمي وملفات تسجيلها",
  },
  {
    domain: "unesco.org",
    name: "منظمة اليونسكو",
    topics: ["egyptology", "archaeology", "world-history", "science", "general"],
    purpose: "التراث والثقافة والتعليم والعلوم",
  },
  {
    domain: "ucl.ac.uk",
    name: "جامعة لندن – كلية لندن الجامعية",
    topics: ["egyptology", "archaeology", "world-history", "religion"],
    purpose: "علم المصريات واللغة والآثار وتاريخ المعتقدات",
  },
  {
    domain: "escholarship.org",
    name: "UCLA eScholarship – موسوعة علم المصريات",
    topics: ["egyptology", "archaeology", "world-history", "religion"],
    purpose: "مقالات موسوعة علم المصريات المحكمة، ومنها دراسات الدين والنصوص والطقوس",
  },
  {
    domain: "uee.ucla.edu",
    name: "UCLA Encyclopedia of Egyptology",
    topics: ["egyptology", "archaeology", "world-history", "religion"],
    purpose:
      "دليل للمقالات المحكمة عن الديانة المصرية القديمة؛ النسخ المنشورة محفوظة في eScholarship",
  },
  {
    domain: "thesaurus-linguae-aegyptiae.de",
    name: "Thesaurus Linguae Aegyptiae – Berlin-Brandenburg Academy of Sciences",
    topics: ["egyptology", "world-history"],
    purpose:
      "قاعدة معجمية للنصوص المصرية القديمة؛ تُستخدم كمرجع للبحث عن الكلمات، لا كبديل عن قراءة النص وسياقه أو التحقق الأكاديمي",
  },
  {
    domain: "britishmuseum.org",
    name: "المتحف البريطاني",
    topics: ["egyptology", "archaeology", "world-history"],
    purpose: "فهارس المجموعات والقطع وتاريخها",
  },
  {
    domain: "metmuseum.org",
    name: "متحف المتروبوليتان للفنون",
    topics: ["egyptology", "archaeology", "world-history"],
    purpose: "سجلات القطع والمجموعات الفنية والأثرية",
  },
  {
    domain: "penn.museum",
    name: "متحف بنّ بجامعة بنسلفانيا",
    topics: ["egyptology", "archaeology", "world-history"],
    purpose: "المجموعات والبعثات والآثار",
  },
  {
    domain: "si.edu",
    name: "مؤسسة سميثسونيان",
    topics: ["egyptology", "archaeology", "world-history", "science", "general"],
    purpose: "المتاحف والبحث العلمي والمجموعات",
  },
  {
    domain: "louvre.fr",
    name: "متحف اللوفر",
    topics: ["egyptology", "archaeology", "world-history"],
    purpose: "المجموعات الأثرية والفنية",
  },
  {
    domain: "mfa.org",
    name: "متحف الفنون الجميلة في بوسطن",
    topics: ["egyptology", "archaeology", "world-history"],
    purpose: "المجموعات المصرية القديمة والبحث المتحفي",
  },
  {
    domain: "brooklynmuseum.org",
    name: "متحف بروكلين",
    topics: ["egyptology", "archaeology", "world-history"],
    purpose: "المجموعات المصرية والفن والتاريخ",
  },
  {
    domain: "artic.edu",
    name: "معهد الفن في شيكاغو",
    topics: ["archaeology", "world-history", "general"],
    purpose: "فهارس المجموعات والبحث الفني",
  },
  {
    domain: "clevelandart.org",
    name: "متحف كليفلاند للفنون",
    topics: ["egyptology", "archaeology", "world-history"],
    purpose: "سجلات القطع والمجموعات",
  },
  {
    domain: "ees.ac.uk",
    name: "جمعية استكشاف مصر",
    topics: ["egyptology", "archaeology"],
    purpose: "تقارير الحفائر والبحث المصري القديم",
  },
  {
    domain: "pcma.uw.edu.pl",
    name: "مركز آثار البحر المتوسط بجامعة وارسو",
    topics: ["egyptology", "archaeology"],
    purpose: "تقارير البعثات والتنقيب الأثري",
  },
  {
    domain: "saqqara.uw.edu.pl",
    name: "بعثة جامعة وارسو في سقارة",
    topics: ["egyptology", "archaeology"],
    purpose: "أبحاث سقارة والحفائر",
  },
  {
    domain: "aeraweb.org",
    name: "جمعية أبحاث مصر القديمة",
    topics: ["egyptology", "archaeology"],
    purpose: "أبحاث الجيزة وأهراماتها ومجتمع العمال",
  },
  {
    domain: "isac.uchicago.edu",
    name: "معهد دراسة الثقافات القديمة بجامعة شيكاغو",
    topics: ["egyptology", "archaeology", "world-history"],
    purpose: "النصوص والآثار واللغات القديمة",
  },
  {
    domain: "thebanmappingproject.com",
    name: "مشروع خريطة طيبة",
    topics: ["egyptology", "archaeology"],
    purpose: "خرائط ومقابر طيبة ووادي الملوك",
  },
  {
    domain: "biblegateway.com",
    name: "Bible Gateway",
    topics: ["scripture", "world-history"],
    purpose: "النصوص الكتابية ومقارنة الترجمات",
  },
  {
    domain: "bible.com",
    name: "YouVersion Bible",
    topics: ["scripture"],
    purpose: "النص الكتابي بلغات وترجمات متعددة",
  },
  {
    domain: "quran.com",
    name: "Quran.com",
    topics: ["scripture", "religion"],
    purpose: "النص القرآني والترجمات المعروضة؛ تُنسب التفسيرات إلى مصادرها ولا تُعامل كل ترجمة كتفسير وحيد",
  },
  {
    domain: "sunnah.com",
    name: "Sunnah.com",
    topics: ["scripture", "religion", "world-history"],
    purpose: "مجموعات من الحديث النبوي مع بيانات الكتب والأبواب؛ تُراجع نسبة الحديث ودرجته وسياقه",
  },
  {
    domain: "dar-alifta.org",
    name: "دار الإفتاء المصرية",
    topics: ["religion", "scripture", "world-history"],
    purpose: "فتاوى ومواقف المؤسسة المصرية؛ لا تُعرض بوصفها إجماعًا لكل المذاهب أو المسلمين",
  },
  {
    domain: "sefaria.org",
    name: "Sefaria",
    topics: ["scripture", "religion", "world-history"],
    purpose: "مكتبة رقمية للنصوص اليهودية وترجماتها وشروحها؛ تُميّز النصوص الأصلية عن التعليقات",
  },
  {
    domain: "copticorthodox.church",
    name: "الكنيسة القبطية الأرثوذكسية – الموقع الرسمي",
    topics: ["religion", "world-history"],
    purpose:
      "المصادر الرسمية ومواقف الكنيسة القبطية كما تعرضها الكنيسة، لا بوصفها إجماعًا تاريخيًا",
  },
  {
    domain: "st-takla.org",
    name: "موقع الأنبا تكلا هيمانوت القبطي الأرثوذكسي",
    topics: ["religion", "scripture", "world-history"],
    purpose: "مكتبة ومراجع قبطية بالعربية والإنجليزية؛ تُنسب الآراء العقائدية إلى تقليدها الكنسي",
  },
  {
    domain: "sourcebooks.fordham.edu",
    name: "Fordham University Internet History Sourcebooks",
    topics: ["religion", "scripture", "world-history"],
    purpose: "نصوص تاريخية أولية، ومنها وثائق مجامع أفسس وخلقيدونية",
  },
  {
    domain: "vatican.va",
    name: "الكرسي الرسولي – الفاتيكان",
    topics: ["scripture", "religion", "world-history", "general"],
    purpose: "وثائق وتعاليم ومصادر كاثوليكية رسمية؛ تُعرض بوصفها موقف الكنيسة الكاثوليكية",
  },
  {
    domain: "nae.org",
    name: "الرابطة الوطنية للإنجيليين",
    topics: ["religion"],
    purpose: "تعريف وموقف الرابطة الرسمي؛ لا يُعامل بوصفه ممثلاً لكل الإنجيليين",
  },
  {
    domain: "britannica.com",
    name: "Encyclopaedia Britannica",
    topics: [
      "egyptology",
      "archaeology",
      "world-history",
      "religion",
      "scripture",
      "science",
      "geography",
      "economy",
      "general",
    ],
    purpose: "مرجع موسوعي للخلفية العامة، لا بديل عن النصوص الأولية أو البحث الأكاديمي",
  },
  {
    domain: "oxfordreference.com",
    name: "Oxford Reference",
    topics: ["world-history", "religion", "scripture", "science", "geography", "general"],
    purpose: "تعريفات ومراجع أكاديمية",
  },
  {
    domain: "cambridge.org",
    name: "Cambridge University Press",
    topics: ["world-history", "religion", "scripture", "general"],
    purpose: "كتب وأبحاث أكاديمية محكّمة في التاريخ والدراسات الدينية",
  },
  {
    domain: "loc.gov",
    name: "مكتبة الكونغرس الأمريكي",
    topics: ["world-history", "scripture", "general"],
    purpose: "المجموعات والمخطوطات والوثائق التاريخية",
  },
  {
    domain: "archives.gov",
    name: "الأرشيف الوطني الأمريكي",
    topics: ["world-history", "law", "general"],
    purpose: "الوثائق والسجلات الرسمية",
  },
  {
    domain: "who.int",
    name: "منظمة الصحة العالمية",
    topics: ["health", "science"],
    purpose: "الصحة العامة والتوصيات الدولية",
  },
  {
    domain: "cdc.gov",
    name: "مراكز مكافحة الأمراض والوقاية منها",
    topics: ["health", "science"],
    purpose: "الإرشادات الصحية والبيانات الوبائية",
  },
  {
    domain: "nih.gov",
    name: "المعاهد الوطنية للصحة",
    topics: ["health", "science"],
    purpose: "الأبحاث والموارد الطبية",
  },
  {
    domain: "medlineplus.gov",
    name: "MedlinePlus – المكتبة الوطنية الأمريكية للطب",
    topics: ["health"],
    purpose: "شرح طبي مبسط ومراجَع",
  },
  {
    domain: "nhs.uk",
    name: "هيئة الخدمات الصحية البريطانية",
    topics: ["health"],
    purpose: "معلومات صحية وإرشادات للمرضى",
  },
  {
    domain: "pubmed.ncbi.nlm.nih.gov",
    name: "PubMed – المكتبة الوطنية الأمريكية للطب",
    topics: ["health", "science"],
    purpose: "فهرس الدراسات الطبية والبيولوجية المحكمة",
  },
  {
    domain: "cochranelibrary.com",
    name: "Cochrane Library",
    topics: ["health"],
    purpose: "مراجعات منهجية للأدلة الطبية",
  },
  {
    domain: "bmj.com",
    name: "The BMJ",
    topics: ["health", "science"],
    purpose: "أبحاث ومراجعات طبية",
  },
  {
    domain: "nature.com",
    name: "Nature",
    topics: ["science", "health", "archaeology"],
    purpose: "أبحاث علمية محكّمة",
  },
  {
    domain: "science.org",
    name: "Science",
    topics: ["science", "health", "archaeology"],
    purpose: "أبحاث علمية محكّمة",
  },
  {
    domain: "nasa.gov",
    name: "وكالة ناسا",
    topics: ["science", "geography"],
    purpose: "الفضاء والفلك وعلوم الأرض",
  },
  {
    domain: "webbtelescope.org",
    name: "موقع تلسكوب جيمس ويب الرسمي",
    topics: ["science", "general"],
    purpose: "المهمات والبيانات والصور الرسمية لتلسكوب جيمس ويب",
  },
  {
    domain: "noaa.gov",
    name: "الإدارة الوطنية للمحيطات والغلاف الجوي",
    topics: ["science", "geography"],
    purpose: "الطقس والمناخ والمحيطات",
  },
  {
    domain: "usgs.gov",
    name: "هيئة المسح الجيولوجي الأمريكية",
    topics: ["science", "geography"],
    purpose: "الجيولوجيا والزلازل والموارد الطبيعية",
  },
  {
    domain: "nps.gov",
    name: "هيئة المتنزهات الوطنية الأمريكية",
    topics: ["geography", "world-history", "archaeology"],
    purpose: "المواقع الطبيعية والتاريخية",
  },
  {
    domain: "un.org",
    name: "الأمم المتحدة",
    topics: ["law", "economy", "geography", "world-history", "general"],
    purpose: "الوثائق والاتفاقيات والبيانات الدولية",
  },
  {
    domain: "worldbank.org",
    name: "مجموعة البنك الدولي",
    topics: ["economy", "general"],
    purpose: "بيانات التنمية والاقتصاد",
  },
  {
    domain: "imf.org",
    name: "صندوق النقد الدولي",
    topics: ["economy"],
    purpose: "البيانات والتقارير الاقتصادية والمالية",
  },
  {
    domain: "oecd.org",
    name: "منظمة التعاون الاقتصادي والتنمية",
    topics: ["economy", "education", "general"],
    purpose: "الإحصاءات والسياسات الاقتصادية والتعليمية",
  },
  {
    domain: "eur-lex.europa.eu",
    name: "بوابة التشريعات الرسمية للاتحاد الأوروبي",
    topics: ["law", "economy"],
    purpose: "نصوص القوانين واللوائح الأوروبية",
  },
  {
    domain: "legislation.gov.uk",
    name: "التشريعات البريطانية الرسمية",
    topics: ["law"],
    purpose: "النصوص القانونية والتشريعات",
  },
  {
    domain: "congress.gov",
    name: "الكونغرس الأمريكي",
    topics: ["law", "world-history"],
    purpose: "مشروعات القوانين وسجلات التشريع",
  },
  {
    domain: "gov.uk",
    name: "الحكومة البريطانية",
    topics: ["law", "health", "geography", "general"],
    purpose: "الخدمات والسياسات واللوائح الرسمية",
  },
  {
    domain: "ox.ac.uk",
    name: "جامعة أكسفورد",
    topics: [
      "egyptology",
      "archaeology",
      "world-history",
      "religion",
      "scripture",
      "science",
      "general",
    ],
    purpose: "المراجع والبحوث الأكاديمية",
  },
  {
    domain: "cam.ac.uk",
    name: "جامعة كامبريدج",
    topics: [
      "egyptology",
      "archaeology",
      "world-history",
      "religion",
      "scripture",
      "science",
      "general",
    ],
    purpose: "المراجع والبحوث الأكاديمية",
  },
  {
    domain: "harvard.edu",
    name: "جامعة هارفارد",
    topics: ["egyptology", "archaeology", "world-history", "science", "general"],
    purpose: "المراجع والبحوث الأكاديمية",
  },
  {
    domain: "stanford.edu",
    name: "جامعة ستانفورد",
    topics: ["world-history", "science", "law", "economy", "general"],
    purpose: "البحوث والمراجع الجامعية",
  },
  {
    domain: "mit.edu",
    name: "معهد ماساتشوستس للتكنولوجيا",
    topics: ["science", "technology", "general"],
    purpose: "الأبحاث العلمية والهندسية والتقنية",
  },
] as const;

const TOPIC_RULES: Array<{ topic: ResearchTopic; pattern: RegExp }> = [
  {
    topic: "scripture",
    pattern:
      /(?:إيليا النبي|ايليا النبي|جسد ايليا|قبر ايليا|إيليا|ايليا|إلياس|الياس|Elijah|Elias|يوسف الصديق|يوسف بن يعقوب|جسد يوسف|عظام يوسف|joseph|كتاب مقدس|الكتاب المقدس|الانجيل(?!ي)|إنجيل(?!ي)|انجيل(?!ي)|تكوين|خروج|يشوع|مزامير|مزمور|قال الرب لربي|رسالة بولس|القرآن|القران|قرآن|قران|سورة|آية|آيات|اية|ايات|حديث نبوي|الحديث النبوي|صحيح البخاري|صحيح مسلم|التوراة|الكتاب العبري|التلمود|المشنا|Qur['’]?an|Koran|hadith|Sahih (?:al-)?(?:Bukhari|Muslim)|Torah|Tanakh|Talmud|Mishnah|Vedas?|Upanishads?|Bhagavad Gita|Tripitaka|Dhammapada|Guru Granth Sahib|Avesta|Bible|biblical|scripture|gospel)/iu,
  },
  {
    topic: "health",
    pattern:
      /(?:صحه|صحة|طبي|مرض|دواء|علاج|اعراض|أعراض|جراحه|جراحة|تغذيه|تغذية|حمل|قلب|سكر|ضغط الدم|medical|health|disease|medicine|symptom|treatment|clinical|drug|nutrition)/iu,
  },
  {
    topic: "law",
    pattern:
      /(?:قانون|تشريع|محكمه|محكمة|حكم قضائي|حقوق|عقد|لائحه|لائحة|قانوني|legal|law|regulation|court|legislation|rights|contract)/iu,
  },
  {
    topic: "economy",
    pattern:
      /(?:اقتصاد|اقتصادي|تضخم|سعر صرف|عمله|عملة|بنك|استثمار|بطاله|بطالة|ناتج محلي|economy|economic|inflation|exchange rate|currency|bank|investment|gdp)/iu,
  },
  {
    topic: "egyptology",
    pattern:
      /(?:مصر القديمه|مصر القديمة|معتقدات المصريين القدماء|ديانه المصريين|ديانة المصريين|الدين المصري|المعتقدات المصريه|المعتقدات المصرية|الالهه المصريه|الآلهة المصرية|فرعون|فراعنه|فراعنة|هيروغليف|تحنيط|مومياء|اهرام|أهرام|سقاره|سقارة|الجيزه|الجيزة|الاقصر|الأقصر|اسوان|أسوان|سانت كاترين|سانت كترين|سان كترين|جبل موسى|جبل موسي|ابو سمبل|أبو سمبل|نفرتيتي|توت عنخ|رمسيس|حتشبسوت|خوفو|اخناتون|إخناتون|أخناتون|إمحوتب|ايمحتب|حجر رشيد|روزيته|egyptolog|ancient egyptian religion|egyptian beliefs|pharaoh|hieroglyph|mumm|saqqara|giza|luxor|aswan|tutankhamun|ramesses|nefertiti|hatshepsut|akhenaten|amarna|rosetta|imhotep|djoser|kv62)/iu,
  },
  {
    topic: "archaeology",
    pattern:
      /(?:مكتبة الإسكندرية|مكتبة الاسكندرية|الإسكندرية القديمة|Alexandria|اثار|آثار|اثري|أثري|تنقيب|حفائر|مقبره|مقبرة|معبد|قطعه اثريه|قطعة أثرية|مخطوطه|مخطوطة|نقش|artifact|archaeolog|excavation|tomb|temple|inscription|manuscript)/iu,
  },
  {
    topic: "world-history",
    pattern:
      /(?:تاريخ|حضاره|حضارة|ملوك|امبراطور|إمبراطور|حرب|معركه|معركة|دوله قديمه|دولة قديمة|history|historical|civilization|king|queen|emperor|war|battle)/iu,
  },
  {
    topic: "science",
    pattern:
      /(?:علم|علوم|فيزياء|كيمياء|احياء|أحياء|فضاء|فلك|كوكب|مناخ|تغير مناخي|جيولوجيا|ثقب اسود|ثقب أسود|ثقوب سوداء|الثقوب السوداء|black hole|black holes|science|physics|chemistry|biology|space|astronomy|planet|climate|geology|research)/iu,
  },
  {
    topic: "geography",
    pattern:
      /(?:اين تقع|أين تقع|موقع|مكان|مدينه|مدينة|دوله|دولة|جبل|نهر|بحر|جزيره|جزيرة|طقس|مناخ|خريطه|خريطة|where is|located|geography|mountain|river|sea|island|weather|map)/iu,
  },
];

const ENTITY_ALIASES: Array<{ canonical: string; english: string; aliases: string[] }> = [
  {
    canonical: "الإنجيليين",
    english: "Evangelical Christians",
    aliases: ["الانجليين", "انجليين", "الانجيليين", "انجيليين", "الإنجيليين"],
  },
  {
    canonical: "سانت كاترين",
    english: "Saint Catherine's Monastery and Saint Catherine Area, South Sinai",
    aliases: [
      "سانت كترين",
      "سانت كاثرين",
      "سان كترين",
      "سانتا كترين",
      "دير سانت كترين",
      "سانت كتيرين",
    ],
  },
  {
    canonical: "جبل موسى",
    english: "Jebel Musa / Mount Sinai",
    aliases: ["جبل موسي", "جبل موسا", "جبل موسى", "جبل سينا"],
  },
  { canonical: "سقارة", english: "Saqqara", aliases: ["سقاره", "سقارة", "سقاره"] },
  {
    canonical: "أبو سمبل",
    english: "Abu Simbel",
    aliases: ["ابو سمبل", "ابو سنبل", "ابوسمبل", "ابو سمبل"],
  },
  { canonical: "الأقصر", english: "Luxor", aliases: ["الاقصر", "الأقصر", "الاقصر"] },
  { canonical: "أسوان", english: "Aswan", aliases: ["اسوان", "أسوان"] },
  { canonical: "الجيزة", english: "Giza", aliases: ["الجيزه", "الجيزة"] },
  {
    canonical: "توت عنخ آمون",
    english: "Tutankhamun",
    aliases: ["توت عنخ امون", "توت عنخ آمون", "توتانخ امون", "توت عنخ امن"],
  },
  {
    canonical: "نفرتيتي",
    english: "Nefertiti",
    aliases: ["نفرتيتي", "نفرتيتى", "نفرتيت", "نيفرتيتي", "نيڤرتيتي"],
  },
  { canonical: "خوفو", english: "Khufu / Cheops", aliases: ["خوفو", "خوفه"] },
  {
    canonical: "حجر رشيد",
    english: "Rosetta Stone",
    aliases: ["حجر رشيد", "حجر الرشيد", "Rosetta Stone", "Rosetta"],
  },
  { canonical: "إمحوتب", english: "Imhotep", aliases: ["إمحوتب", "ايمحتب", "إيمحتب", "Imhotep"] },
  {
    canonical: "يوسف الصديق",
    english: "Joseph son of Jacob in the Bible",
    aliases: ["يوسف الصديق", "يوسف بن يعقوب", "جسد يوسف", "عظام يوسف"],
  },
  {
    canonical: "أبو الهول",
    english: "Great Sphinx of Giza",
    aliases: ["ابو الهول", "أبو الهول", "ابوالهول", "ابو هول"],
  },
  {
    canonical: "وادي الملوك",
    english: "Valley of the Kings",
    aliases: ["وادي الملوك", "وادى الملوك", "وادي الملك"],
  },
  {
    canonical: "وادي الملكات",
    english: "Valley of the Queens",
    aliases: ["وادي الملكات", "وادى الملكات", "وادي الملكه"],
  },
  { canonical: "الكرنك", english: "Karnak Temple Complex", aliases: ["الكرنك", "كرنك", "الكرانك"] },
  { canonical: "دهشور", english: "Dahshur", aliases: ["دهشور", "دهشور"] },
  {
    canonical: "تل العمارنة",
    english: "Tell el-Amarna / Amarna",
    aliases: ["تل العمارنه", "العمارنه", "تل العمارنة"],
  },
  { canonical: "معبد فيلة", english: "Philae Temple", aliases: ["معبد فيله", "فيله", "فيلة"] },
  { canonical: "معبد إدفو", english: "Edfu Temple", aliases: ["معبد ادفو", "ادفو", "إدفو"] },
  { canonical: "أبيدوس", english: "Abydos", aliases: ["ابيدوس", "أبيدوس"] },
  { canonical: "معبد دندرة", english: "Dendera Temple", aliases: ["دندره", "دندرة", "معبد دندره"] },
  {
    canonical: "رمسيس الثاني",
    english: "Ramesses II",
    aliases: ["رمسيس الثاني", "رمسيس التاني", "رامسس التاني"],
  },
  {
    canonical: "تحتمس الثالث",
    english: "Thutmose III",
    aliases: ["تحتمس الثالث", "تحتمس التالت", "تحت موس الثالث"],
  },
  {
    canonical: "أمنحتب الثالث",
    english: "Amenhotep III",
    aliases: ["امنحتب الثالث", "امنحتب التالت", "أمنحتب الثالث"],
  },
  { canonical: "أخناتون", english: "Akhenaten", aliases: ["اخناتون", "اخناتن", "أخناتون"] },
  { canonical: "حتشبسوت", english: "Hatshepsut", aliases: ["حتشبسوت", "حتشبسوت"] },
  { canonical: "سنفرو", english: "Sneferu", aliases: ["سنفرو", "سنفرا"] },
  { canonical: "زوسر", english: "Djoser", aliases: ["زوسر", "زوزر"] },
  {
    canonical: "مجمع أفسس",
    english: "Council of Ephesus (431), Cyril of Alexandria",
    aliases: [
      "مجمع أفسس",
      "مجمع افسس",
      "أفسس الأول",
      "افسس الاول",
      "Council of Ephesus",
      "Ephesus",
    ],
  },
  {
    canonical: "مجمع خلقيدونية",
    english: "Council of Chalcedon (451)",
    aliases: [
      "مجمع خلقيدونية",
      "مجمع خلقدونية",
      "مجمع خلقيدون",
      "Council of Chalcedon",
      "Chalcedon",
    ],
  },
  {
    canonical: "كيرلس الإسكندري",
    english: "Cyril of Alexandria",
    aliases: ["كيرلس الإسكندري", "كيرلس السكندري", "كيرلس الاسكندري", "Cyril of Alexandria"],
  },
  {
    canonical: "أوطاخي",
    english: "Eutyches and Eutychianism",
    aliases: ["أوطاخي", "اوطاخي", "أوطاخيوس", "اوطاخيوس", "Eutyches", "Eutychianism"],
  },
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
  const topics = TOPIC_RULES.filter(({ pattern }) => pattern.test(searchable)).map(
    ({ topic }) => topic,
  );
  return topics.length ? [...new Set(topics)] : ["general"];
}

export function getTrustedSourcesForQuestion(question: string): TrustedSource[] {
  const topics = inferResearchTopics(question);
  const matches = TRUSTED_SOURCE_CATALOG.filter((source) =>
    source.topics.some((topic) => topics.includes(topic)),
  );
  const ancientEgyptianLanguageQuestion =
    /(?:هيروغليف|هيراطيق|ديموطيق|اللغة المصرية القديمة|قاموس|معجم|hieroglyph|hieratic|demotic|ancient Egyptian language|dictionary|lexicon|transliteration)/iu.test(
      question,
    );
  if (topics.includes("religion")) {
    const copticTheologyQuestion =
      /(?:مجمع|افسس|ephesus|خلقيدون|chalcedon|كيرلس|cyril|اوطاخ|eutyches|miaphys|monophys)/iu.test(
        question,
      );
    const islamicTextQuestion =
      /(?:الاسلام|الإسلام|مسلم|القرآن|القران|قرآن|قران|حديث نبوي|الحديث النبوي|صحيح البخاري|صحيح مسلم|islam|muslim|qur['’]?an|koran|hadith|sahih)/iu.test(
        question,
      );
    const jewishTextQuestion =
      /(?:يهودي|يهودية|اليهودية|التوراة|التلمود|المشنا|judaism|jewish|torah|tanakh|talmud|mishnah)/iu.test(
        question,
      );
    const christianQuestion =
      /(?:مسيح|المسيحية|انجيلي|انجيليين|انجليين|كاثوليك|كاثوليكي|بروتستانت|christian|evangelical|catholic|protestant)/iu.test(
        question,
      );
    const priority = topics.includes("egyptology")
      ? ancientEgyptianLanguageQuestion
        ? [
          "thesaurus-linguae-aegyptiae.de",
          "uee.ucla.edu",
          "escholarship.org",
          "ucl.ac.uk",
          "isac.uchicago.edu",
        ]
        : [
            "uee.ucla.edu",
            "escholarship.org",
            "ucl.ac.uk",
            "egymonuments.gov.eg",
            "sourcebooks.fordham.edu",
          ]
      : copticTheologyQuestion
        ? [
            "sourcebooks.fordham.edu",
            "copticorthodox.church",
            "st-takla.org",
            "vatican.va",
            "cambridge.org",
            "oxfordreference.com",
            "britannica.com",
          ]
        : islamicTextQuestion
          ? [
              /(?:حديث نبوي|الحديث النبوي|صحيح البخاري|صحيح مسلم|hadith|sahih)/iu.test(question)
                ? "sunnah.com"
                : "quran.com",
              "dar-alifta.org",
              "quran.com",
              "sunnah.com",
              "cambridge.org",
              "oxfordreference.com",
              "britannica.com",
            ]
          : jewishTextQuestion
            ? [
                "sefaria.org",
                "cambridge.org",
                "oxfordreference.com",
                "britannica.com",
                "sourcebooks.fordham.edu",
              ]
            : christianQuestion
              ? [
            "nae.org",
            "vatican.va",
            "britannica.com",
            "cambridge.org",
            "oxfordreference.com",
            "sourcebooks.fordham.edu",
              ]
              : [
                  "britannica.com",
                  "cambridge.org",
                  "oxfordreference.com",
                  "sourcebooks.fordham.edu",
                  "vatican.va",
                  "nae.org",
                  "quran.com",
                  "sefaria.org",
                ];
    matches.sort((first, second) => {
      const firstIndex = priority.indexOf(first.domain);
      const secondIndex = priority.indexOf(second.domain);
      return (
        (firstIndex < 0 ? priority.length : firstIndex) -
        (secondIndex < 0 ? priority.length : secondIndex)
      );
    });
  } else if (topics.includes("egyptology") && ancientEgyptianLanguageQuestion) {
    const priority = [
      "thesaurus-linguae-aegyptiae.de",
      "uee.ucla.edu",
      "escholarship.org",
      "ucl.ac.uk",
      "isac.uchicago.edu",
    ];
    matches.sort((first, second) => {
      const firstIndex = priority.indexOf(first.domain);
      const secondIndex = priority.indexOf(second.domain);
      return (
        (firstIndex < 0 ? priority.length : firstIndex) -
        (secondIndex < 0 ? priority.length : secondIndex)
      );
    });
  }
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
  return (
    TRUSTED_SOURCE_CATALOG.some(
      (source) => host === source.domain || host.endsWith("." + source.domain),
    ) ||
    host.endsWith(".gov") ||
    host.endsWith(".edu") ||
    host.endsWith(".int") ||
    /\.ac\.[a-z]{2,}$/u.test(host)
  );
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

function hasOneEditDifference(first: string, second: string): boolean {
  if (first === second) return true;
  if (Math.abs(first.length - second.length) > 1) return false;
  let left = 0;
  let right = 0;
  let edits = 0;
  while (left < first.length && right < second.length) {
    if (first[left] === second[right]) {
      left += 1;
      right += 1;
      continue;
    }
    edits += 1;
    if (edits > 1) return false;
    if (first.length > second.length) left += 1;
    else if (second.length > first.length) right += 1;
    else {
      left += 1;
      right += 1;
    }
  }
  if (left < first.length || right < second.length) edits += 1;
  return edits <= 1;
}

function matchesKnownAliasWithOneTypo(question: string, alias: string): boolean {
  const questionWords = question.split(/\s+/u);
  const aliasWords = alias.split(/\s+/u);
  if (aliasWords.length > questionWords.length) return false;
  for (let start = 0; start <= questionWords.length - aliasWords.length; start += 1) {
    let hasCorrection = false;
    let matches = true;
    for (let index = 0; index < aliasWords.length; index += 1) {
      const queryWord = questionWords[start + index] ?? "";
      const aliasWord = aliasWords[index] ?? "";
      if (queryWord === aliasWord) continue;
      if (
        queryWord.length >= 4 &&
        aliasWord.length >= 4 &&
        hasOneEditDifference(queryWord, aliasWord)
      ) {
        hasCorrection = true;
        continue;
      }
      matches = false;
      break;
    }
    if (matches && hasCorrection) return true;
  }
  return false;
}

export function correctKnownResearchEntities(
  question: string,
): Array<{ canonical: string; english: string; matched: string }> {
  const normalized = normalizeForMatching(question);
  const corrections: Array<{ canonical: string; english: string; matched: string }> = [];
  for (const entry of ENTITY_ALIASES) {
    const match = entry.aliases.find((alias) => {
      const normalizedAlias = normalizeForMatching(alias);
      return (
        normalized.includes(normalizedAlias) ||
        matchesKnownAliasWithOneTypo(normalized, normalizedAlias)
      );
    });
    if (match)
      corrections.push({ canonical: entry.canonical, english: entry.english, matched: match });
  }
  return corrections;
}

export function buildResearchSearchQuery(question: string, maxLength = 1024): string {
  const corrections = correctKnownResearchEntities(question);
  const entityHints = corrections.map(
    (item) => `Likely intended entity: ${item.canonical} (${item.english})`,
  );
  const topicHints: Record<ResearchTopic, string> = {
    egyptology:
      "Egyptian Ministry of Tourism and Antiquities, UNESCO World Heritage Centre, university Egyptology, museum catalogues, archaeological missions",
    archaeology:
      "official museum collections, archaeological missions, university research, excavation reports",
    "world-history":
      "primary historical documents, university history departments, museum or archive catalogues, established reference works",
    scripture:
      "exact Bible text, book chapter and verse, Bible Gateway, Bible.com; separate scripture from later tradition and archaeological claims",
    religion:
      "primary religious and council texts, official statements of the relevant tradition, and peer-reviewed scholarship; distinguish a church's doctrinal position from historical consensus and explain disputed terms in context",
    health:
      "official health authority guidance, WHO, CDC, NIH, PubMed, systematic reviews and clinical guidelines",
    science:
      "peer-reviewed research, university laboratories, NASA, NOAA, USGS, recognized scientific agencies",
    law: "official legislation, courts, government legal publications, treaty texts and recognized legal references",
    geography:
      "official geographic and heritage authorities, national mapping agencies, UNESCO, government visitor information",
    economy: "official statistics agencies, central banks, IMF, World Bank, OECD",
    general:
      "primary sources, university publications, national libraries and archives, Britannica and Oxford Reference",
  };
  const topics = inferResearchTopics(question);
  const guidance = [...new Set(topics)].map((topic) => topicHints[topic]).join("; ");
  return [
    question.trim(),
    ...entityHints,
    `Research evidence preferences (ranking guidance only; search the entire public web): ${guidance}`,
    "Do not restrict results to a fixed domain list. Include relevant specialist publications, official sources, universities, archives, museums, journals, and other credible sources wherever they are hosted.",
  ]
    .filter(Boolean)
    .join(" ")
    .slice(0, maxLength);
}
export type ResearchTopic =
  | "egyptology"
  | "archaeology"
  | "world-history"
  | "religion"
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
  {
    domain: "egymonuments.gov.eg",
    name: "وزارة السياحة والآثار المصرية",
    topics: ["egyptology", "archaeology", "world-history", "geography"],
    purpose: "المواقع الأثرية المصرية والمتاحف والتاريخ الرسمي",
  },
  {
    domain: "whc.unesco.org",
    name: "مركز التراث العالمي باليونسكو",
    topics: ["egyptology", "archaeology", "world-history", "geography"],
    purpose: "مواقع التراث العالمي وملفات تسجيلها",
  },
  {
    domain: "unesco.org",
    name: "منظمة اليونسكو",
    topics: ["egyptology", "archaeology", "world-history", "science", "general"],
    purpose: "التراث والثقافة والتعليم والعلوم",
  },
  {
    domain: "ucl.ac.uk",
    name: "جامعة لندن – كلية لندن الجامعية",
    topics: ["egyptology", "archaeology", "world-history", "religion"],
    purpose: "علم المصريات واللغة والآثار وتاريخ المعتقدات",
  },
  {
    domain: "escholarship.org",
    name: "UCLA eScholarship – موسوعة علم المصريات",
    topics: ["egyptology", "archaeology", "world-history", "religion"],
    purpose: "مقالات موسوعة علم المصريات المحكمة، ومنها دراسات الدين والنصوص والطقوس",
  },
  {
    domain: "uee.ucla.edu",
    name: "UCLA Encyclopedia of Egyptology",
    topics: ["egyptology", "archaeology", "world-history", "religion"],
    purpose:
      "دليل للمقالات المحكمة عن الديانة المصرية القديمة؛ النسخ المنشورة محفوظة في eScholarship",
  },
  {
    domain: "thesaurus-linguae-aegyptiae.de",
    name: "Thesaurus Linguae Aegyptiae – Berlin-Brandenburg Academy of Sciences",
    topics: ["egyptology", "world-history"],
    purpose:
      "قاعدة معجمية للنصوص المصرية القديمة؛ تُستخدم كمرجع للبحث عن الكلمات، لا كبديل عن قراءة النص وسياقه أو التحقق الأكاديمي",
  },
  {
    domain: "britishmuseum.org",
    name: "المتحف البريطاني",
    topics: ["egyptology", "archaeology", "world-history"],
    purpose: "فهارس المجموعات والقطع وتاريخها",
  },
  {
    domain: "metmuseum.org",
    name: "متحف المتروبوليتان للفنون",
    topics: ["egyptology", "archaeology", "world-history"],
    purpose: "سجلات القطع والمجموعات الفنية والأثرية",
  },
  {
    domain: "penn.museum",
    name: "متحف بنّ بجامعة بنسلفانيا",
    topics: ["egyptology", "archaeology", "world-history"],
    purpose: "المجموعات والبعثات والآثار",
  },
  {
    domain: "si.edu",
    name: "مؤسسة سميثسونيان",
    topics: ["egyptology", "archaeology", "world-history", "science", "general"],
    purpose: "المتاحف والبحث العلمي والمجموعات",
  },
  {
    domain: "louvre.fr",
    name: "متحف اللوفر",
    topics: ["egyptology", "archaeology", "world-history"],
    purpose: "المجموعات الأثرية والفنية",
  },
  {
    domain: "mfa.org",
    name: "متحف الفنون الجميلة في بوسطن",
    topics: ["egyptology", "archaeology", "world-history"],
    purpose: "المجموعات المصرية القديمة والبحث المتحفي",
  },
  {
    domain: "brooklynmuseum.org",
    name: "متحف بروكلين",
    topics: ["egyptology", "archaeology", "world-history"],
    purpose: "المجموعات المصرية والفن والتاريخ",
  },
  {
    domain: "artic.edu",
    name: "معهد الفن في شيكاغو",
    topics: ["archaeology", "world-history", "general"],
    purpose: "فهارس المجموعات والبحث الفني",
  },
  {
    domain: "clevelandart.org",
    name: "متحف كليفلاند للفنون",
    topics: ["egyptology", "archaeology", "world-history"],
    purpose: "سجلات القطع والمجموعات",
  },
  {
    domain: "ees.ac.uk",
    name: "جمعية استكشاف مصر",
    topics: ["egyptology", "archaeology"],
    purpose: "تقارير الحفائر والبحث المصري القديم",
  },
  {
    domain: "pcma.uw.edu.pl",
    name: "مركز آثار البحر المتوسط بجامعة وارسو",
    topics: ["egyptology", "archaeology"],
    purpose: "تقارير البعثات والتنقيب الأثري",
  },
  {
    domain: "saqqara.uw.edu.pl",
    name: "بعثة جامعة وارسو في سقارة",
    topics: ["egyptology", "archaeology"],
    purpose: "أبحاث سقارة والحفائر",
  },
  {
    domain: "aeraweb.org",
    name: "جمعية أبحاث مصر القديمة",
    topics: ["egyptology", "archaeology"],
    purpose: "أبحاث الجيزة وأهراماتها ومجتمع العمال",
  },
  {
    domain: "isac.uchicago.edu",
    name: "معهد دراسة الثقافات القديمة بجامعة شيكاغو",
    topics: ["egyptology", "archaeology", "world-history"],
    purpose: "النصوص والآثار واللغات القديمة",
  },
  {
    domain: "thebanmappingproject.com",
    name: "مشروع خريطة طيبة",
    topics: ["egyptology", "archaeology"],
    purpose: "خرائط ومقابر طيبة ووادي الملوك",
  },
  {
    domain: "biblegateway.com",
    name: "Bible Gateway",
    topics: ["scripture", "world-history"],
    purpose: "النصوص الكتابية ومقارنة الترجمات",
  },
  {
    domain: "bible.com",
    name: "YouVersion Bible",
    topics: ["scripture"],
    purpose: "النص الكتابي بلغات وترجمات متعددة",
  },
  {
    domain: "quran.com",
    name: "Quran.com",
    topics: ["scripture", "religion"],
    purpose: "النص القرآني والترجمات المعروضة؛ تُنسب التفسيرات إلى مصادرها ولا تُعامل كل ترجمة كتفسير وحيد",
  },
  {
    domain: "sunnah.com",
    name: "Sunnah.com",
    topics: ["scripture", "religion", "world-history"],
    purpose: "مجموعات من الحديث النبوي مع بيانات الكتب والأبواب؛ تُراجع نسبة الحديث ودرجته وسياقه",
  },
  {
    domain: "dar-alifta.org",
    name: "دار الإفتاء المصرية",
    topics: ["religion", "scripture", "world-history"],
    purpose: "فتاوى ومواقف المؤسسة المصرية؛ لا تُعرض بوصفها إجماعًا لكل المذاهب أو المسلمين",
  },
  {
    domain: "sefaria.org",
    name: "Sefaria",
    topics: ["scripture", "religion", "world-history"],
    purpose: "مكتبة رقمية للنصوص اليهودية وترجماتها وشروحها؛ تُميّز النصوص الأصلية عن التعليقات",
  },
  {
    domain: "copticorthodox.church",
    name: "الكنيسة القبطية الأرثوذكسية – الموقع الرسمي",
    topics: ["religion", "world-history"],
    purpose:
      "المصادر الرسمية ومواقف الكنيسة القبطية كما تعرضها الكنيسة، لا بوصفها إجماعًا تاريخيًا",
  },
  {
    domain: "st-takla.org",
    name: "موقع الأنبا تكلا هيمانوت القبطي الأرثوذكسي",
    topics: ["religion", "scripture", "world-history"],
    purpose: "مكتبة ومراجع قبطية بالعربية والإنجليزية؛ تُنسب الآراء العقائدية إلى تقليدها الكنسي",
  },
  {
    domain: "sourcebooks.fordham.edu",
    name: "Fordham University Internet History Sourcebooks",
    topics: ["religion", "scripture", "world-history"],
    purpose: "نصوص تاريخية أولية، ومنها وثائق مجامع أفسس وخلقيدونية",
  },
  {
    domain: "vatican.va",
    name: "الكرسي الرسولي – الفاتيكان",
    topics: ["scripture", "religion", "world-history", "general"],
    purpose: "وثائق وتعاليم ومصادر كاثوليكية رسمية؛ تُعرض بوصفها موقف الكنيسة الكاثوليكية",
  },
  {
    domain: "nae.org",
    name: "الرابطة الوطنية للإنجيليين",
    topics: ["religion"],
    purpose: "تعريف وموقف الرابطة الرسمي؛ لا يُعامل بوصفه ممثلاً لكل الإنجيليين",
  },
  {
    domain: "britannica.com",
    name: "Encyclopaedia Britannica",
    topics: [
      "egyptology",
      "archaeology",
      "world-history",
      "religion",
      "scripture",
      "science",
      "geography",
      "economy",
      "general",
    ],
    purpose: "مرجع موسوعي للخلفية العامة، لا بديل عن النصوص الأولية أو البحث الأكاديمي",
  },
  {
    domain: "oxfordreference.com",
    name: "Oxford Reference",
    topics: ["world-history", "religion", "scripture", "science", "geography", "general"],
    purpose: "تعريفات ومراجع أكاديمية",
  },
  {
    domain: "cambridge.org",
    name: "Cambridge University Press",
    topics: ["world-history", "religion", "scripture", "general"],
    purpose: "كتب وأبحاث أكاديمية محكّمة في التاريخ والدراسات الدينية",
  },
  {
    domain: "loc.gov",
    name: "مكتبة الكونغرس الأمريكي",
    topics: ["world-history", "scripture", "general"],
    purpose: "المجموعات والمخطوطات والوثائق التاريخية",
  },
  {
    domain: "archives.gov",
    name: "الأرشيف الوطني الأمريكي",
    topics: ["world-history", "law", "general"],
    purpose: "الوثائق والسجلات الرسمية",
  },
  {
    domain: "who.int",
    name: "منظمة الصحة العالمية",
    topics: ["health", "science"],
    purpose: "الصحة العامة والتوصيات الدولية",
  },
  {
    domain: "cdc.gov",
    name: "مراكز مكافحة الأمراض والوقاية منها",
    topics: ["health", "science"],
    purpose: "الإرشادات الصحية والبيانات الوبائية",
  },
  {
    domain: "nih.gov",
    name: "المعاهد الوطنية للصحة",
    topics: ["health", "science"],
    purpose: "الأبحاث والموارد الطبية",
  },
  {
    domain: "medlineplus.gov",
    name: "MedlinePlus – المكتبة الوطنية الأمريكية للطب",
    topics: ["health"],
    purpose: "شرح طبي مبسط ومراجَع",
  },
  {
    domain: "nhs.uk",
    name: "هيئة الخدمات الصحية البريطانية",
    topics: ["health"],
    purpose: "معلومات صحية وإرشادات للمرضى",
  },
  {
    domain: "pubmed.ncbi.nlm.nih.gov",
    name: "PubMed – المكتبة الوطنية الأمريكية للطب",
    topics: ["health", "science"],
    purpose: "فهرس الدراسات الطبية والبيولوجية المحكمة",
  },
  {
    domain: "cochranelibrary.com",
    name: "Cochrane Library",
    topics: ["health"],
    purpose: "مراجعات منهجية للأدلة الطبية",
  },
  {
    domain: "bmj.com",
    name: "The BMJ",
    topics: ["health", "science"],
    purpose: "أبحاث ومراجعات طبية",
  },
  {
    domain: "nature.com",
    name: "Nature",
    topics: ["science", "health", "archaeology"],
    purpose: "أبحاث علمية محكّمة",
  },
  {
    domain: "science.org",
    name: "Science",
    topics: ["science", "health", "archaeology"],
    purpose: "أبحاث علمية محكّمة",
  },
  {
    domain: "nasa.gov",
    name: "وكالة ناسا",
    topics: ["science", "geography"],
    purpose: "الفضاء والفلك وعلوم الأرض",
  },
  {
    domain: "webbtelescope.org",
    name: "موقع تلسكوب جيمس ويب الرسمي",
    topics: ["science", "general"],
    purpose: "المهمات والبيانات والصور الرسمية لتلسكوب جيمس ويب",
  },
  {
    domain: "noaa.gov",
    name: "الإدارة الوطنية للمحيطات والغلاف الجوي",
    topics: ["science", "geography"],
    purpose: "الطقس والمناخ والمحيطات",
  },
  {
    domain: "usgs.gov",
    name: "هيئة المسح الجيولوجي الأمريكية",
    topics: ["science", "geography"],
    purpose: "الجيولوجيا والزلازل والموارد الطبيعية",
  },
  {
    domain: "nps.gov",
    name: "هيئة المتنزهات الوطنية الأمريكية",
    topics: ["geography", "world-history", "archaeology"],
    purpose: "المواقع الطبيعية والتاريخية",
  },
  {
    domain: "un.org",
    name: "الأمم المتحدة",
    topics: ["law", "economy", "geography", "world-history", "general"],
    purpose: "الوثائق والاتفاقيات والبيانات الدولية",
  },
  {
    domain: "worldbank.org",
    name: "مجموعة البنك الدولي",
    topics: ["economy", "general"],
    purpose: "بيانات التنمية والاقتصاد",
  },
  {
    domain: "imf.org",
    name: "صندوق النقد الدولي",
    topics: ["economy"],
    purpose: "البيانات والتقارير الاقتصادية والمالية",
  },
  {
    domain: "oecd.org",
    name: "منظمة التعاون الاقتصادي والتنمية",
    topics: ["economy", "education", "general"],
    purpose: "الإحصاءات والسياسات الاقتصادية والتعليمية",
  },
  {
    domain: "eur-lex.europa.eu",
    name: "بوابة التشريعات الرسمية للاتحاد الأوروبي",
    topics: ["law", "economy"],
    purpose: "نصوص القوانين واللوائح الأوروبية",
  },
  {
    domain: "legislation.gov.uk",
    name: "التشريعات البريطانية الرسمية",
    topics: ["law"],
    purpose: "النصوص القانونية والتشريعات",
  },
  {
    domain: "congress.gov",
    name: "الكونغرس الأمريكي",
    topics: ["law", "world-history"],
    purpose: "مشروعات القوانين وسجلات التشريع",
  },
  {
    domain: "gov.uk",
    name: "الحكومة البريطانية",
    topics: ["law", "health", "geography", "general"],
    purpose: "الخدمات والسياسات واللوائح الرسمية",
  },
  {
    domain: "ox.ac.uk",
    name: "جامعة أكسفورد",
    topics: [
      "egyptology",
      "archaeology",
      "world-history",
      "religion",
      "scripture",
      "science",
      "general",
    ],
    purpose: "المراجع والبحوث الأكاديمية",
  },
  {
    domain: "cam.ac.uk",
    name: "جامعة كامبريدج",
    topics: [
      "egyptology",
      "archaeology",
      "world-history",
      "religion",
      "scripture",
      "science",
      "general",
    ],
    purpose: "المراجع والبحوث الأكاديمية",
  },
  {
    domain: "harvard.edu",
    name: "جامعة هارفارد",
    topics: ["egyptology", "archaeology", "world-history", "science", "general"],
    purpose: "المراجع والبحوث الأكاديمية",
  },
  {
    domain: "stanford.edu",
    name: "جامعة ستانفورد",
    topics: ["world-history", "science", "law", "economy", "general"],
    purpose: "البحوث والمراجع الجامعية",
  },
  {
    domain: "mit.edu",
    name: "معهد ماساتشوستس للتكنولوجيا",
    topics: ["science", "technology", "general"],
    purpose: "الأبحاث العلمية والهندسية والتقنية",
  },
] as const;

const TOPIC_RULES: Array<{ topic: ResearchTopic; pattern: RegExp }> = [
  {
    topic: "scripture",
    pattern:
      /(?:إيليا النبي|ايليا النبي|جسد ايليا|قبر ايليا|إيليا|ايليا|إلياس|الياس|Elijah|Elias|يوسف الصديق|يوسف بن يعقوب|جسد يوسف|عظام يوسف|joseph|كتاب مقدس|الكتاب المقدس|الانجيل(?!ي)|إنجيل(?!ي)|انجيل(?!ي)|تكوين|خروج|يشوع|مزامير|مزمور|قال الرب لربي|رسالة بولس|القرآن|القران|قرآن|قران|سورة|آية|آيات|اية|ايات|حديث نبوي|الحديث النبوي|صحيح البخاري|صحيح مسلم|التوراة|الكتاب العبري|التلمود|المشنا|Qur['’]?an|Koran|hadith|Sahih (?:al-)?(?:Bukhari|Muslim)|Torah|Tanakh|Talmud|Mishnah|Vedas?|Upanishads?|Bhagavad Gita|Tripitaka|Dhammapada|Guru Granth Sahib|Avesta|Bible|biblical|scripture|gospel)/iu,
  },
  {
    topic: "health",
    pattern:
      /(?:صحه|صحة|طبي|مرض|دواء|علاج|اعراض|أعراض|جراحه|جراحة|تغذيه|تغذية|حمل|قلب|سكر|ضغط الدم|medical|health|disease|medicine|symptom|treatment|clinical|drug|nutrition)/iu,
  },
  {
    topic: "law",
    pattern:
      /(?:قانون|تشريع|محكمه|محكمة|حكم قضائي|حقوق|عقد|لائحه|لائحة|قانوني|legal|law|regulation|court|legislation|rights|contract)/iu,
  },
  {
    topic: "economy",
    pattern:
      /(?:اقتصاد|اقتصادي|تضخم|سعر صرف|عمله|عملة|بنك|استثمار|بطاله|بطالة|ناتج محلي|economy|economic|inflation|exchange rate|currency|bank|investment|gdp)/iu,
  },
  {
    topic: "egyptology",
    pattern:
      /(?:مصر القديمه|مصر القديمة|معتقدات المصريين القدماء|ديانه المصريين|ديانة المصريين|الدين المصري|المعتقدات المصريه|المعتقدات المصرية|الالهه المصريه|الآلهة المصرية|فرعون|فراعنه|فراعنة|هيروغليف|تحنيط|مومياء|اهرام|أهرام|سقاره|سقارة|الجيزه|الجيزة|الاقصر|الأقصر|اسوان|أسوان|سانت كاترين|سانت كترين|سان كترين|جبل موسى|جبل موسي|ابو سمبل|أبو سمبل|نفرتيتي|توت عنخ|رمسيس|حتشبسوت|خوفو|اخناتون|إخناتون|أخناتون|إمحوتب|ايمحتب|حجر رشيد|روزيته|egyptolog|ancient egyptian religion|egyptian beliefs|pharaoh|hieroglyph|mumm|saqqara|giza|luxor|aswan|tutankhamun|ramesses|nefertiti|hatshepsut|akhenaten|amarna|rosetta|imhotep|djoser|kv62)/iu,
  },
  {
    topic: "archaeology",
    pattern:
      /(?:مكتبة الإسكندرية|مكتبة الاسكندرية|الإسكندرية القديمة|Alexandria|اثار|آثار|اثري|أثري|تنقيب|حفائر|مقبره|مقبرة|معبد|قطعه اثريه|قطعة أثرية|مخطوطه|مخطوطة|نقش|artifact|archaeolog|excavation|tomb|temple|inscription|manuscript)/iu,
  },
  {
    topic: "world-history",
    pattern:
      /(?:تاريخ|حضاره|حضارة|ملوك|امبراطور|إمبراطور|حرب|معركه|معركة|دوله قديمه|دولة قديمة|history|historical|civilization|king|queen|emperor|war|battle)/iu,
  },
  {
    topic: "religion",
    pattern:
      /(?:دين|ديني|ديانه|ديانة|معتقد|عقيده|عقيدة|لاهوت|الكنيسه|الكنيسة|قبطي|المسيح|يسوع|كيرلس|اوطاخ|افسس|خلقيدون|طبيعه واحده|طبيعة واحدة|انجيلي|انجيليه|انجيليين|انجليين|كاثوليك|كاثوليكي|بروتستانت|الإسلام|الاسلام|مسلم|القرآن|القران|قرآن|قران|حديث نبوي|الحديث النبوي|الحديث|حديث|صحيح البخاري|صحيح مسلم|يهودي|يهودية|اليهودية|التوراة|التلمود|هندوسي|الهندوسية|بوذي|البوذية|سيخي|الجاينية|الطاوية|الزرادشتية|christian|church|christ|christology|theolog|coptic|cyril|ephesus|chalcedon|eutyches|eutychian|miaphys|monophys|incarnate|hypostasis|nature of christ|evangelical|catholic|protestant|islam|muslim|qur['’]?an|koran|hadith|judaism|jewish|torah|talmud|hindu|buddh|sikh|jain|tao|zoroastr)/iu,
  },
  {
    topic: "science",
    pattern:
      /(?:علم|علوم|فيزياء|كيمياء|احياء|أحياء|فضاء|فلك|كوكب|مناخ|تغير مناخي|جيولوجيا|ثقب اسود|ثقب أسود|ثقوب سوداء|الثقوب السوداء|black hole|black holes|science|physics|chemistry|biology|space|astronomy|planet|climate|geology|research)/iu,
  },
  {
    topic: "geography",
    pattern:
      /(?:اين تقع|أين تقع|موقع|مكان|مدينه|مدينة|دوله|دولة|جبل|نهر|بحر|جزيره|جزيرة|طقس|مناخ|خريطه|خريطة|where is|located|geography|mountain|river|sea|island|weather|map)/iu,
  },
];

const ENTITY_ALIASES: Array<{ canonical: string; english: string; aliases: string[] }> = [
  {
    canonical: "الإنجيليين",
    english: "Evangelical Christians",
    aliases: ["الانجليين", "انجليين", "الانجيليين", "انجيليين", "الإنجيليين"],
  },
  {
    canonical: "سانت كاترين",
    english: "Saint Catherine's Monastery and Saint Catherine Area, South Sinai",
    aliases: [
      "سانت كترين",
      "سانت كاثرين",
      "سان كترين",
      "سانتا كترين",
      "دير سانت كترين",
      "سانت كتيرين",
    ],
  },
  {
    canonical: "جبل موسى",
    english: "Jebel Musa / Mount Sinai",
    aliases: ["جبل موسي", "جبل موسا", "جبل موسى", "جبل سينا"],
  },
  { canonical: "سقارة", english: "Saqqara", aliases: ["سقاره", "سقارة", "سقاره"] },
  {
    canonical: "أبو سمبل",
    english: "Abu Simbel",
    aliases: ["ابو سمبل", "ابو سنبل", "ابوسمبل", "ابو سمبل"],
  },
  { canonical: "الأقصر", english: "Luxor", aliases: ["الاقصر", "الأقصر", "الاقصر"] },
  { canonical: "أسوان", english: "Aswan", aliases: ["اسوان", "أسوان"] },
  { canonical: "الجيزة", english: "Giza", aliases: ["الجيزه", "الجيزة"] },
  {
    canonical: "توت عنخ آمون",
    english: "Tutankhamun",
    aliases: ["توت عنخ امون", "توت عنخ آمون", "توتانخ امون", "توت عنخ امن"],
  },
  {
    canonical: "نفرتيتي",
    english: "Nefertiti",
    aliases: ["نفرتيتي", "نفرتيتى", "نفرتيت", "نيفرتيتي", "نيڤرتيتي"],
  },
  { canonical: "خوفو", english: "Khufu / Cheops", aliases: ["خوفو", "خوفه"] },
  {
    canonical: "حجر رشيد",
    english: "Rosetta Stone",
    aliases: ["حجر رشيد", "حجر الرشيد", "Rosetta Stone", "Rosetta"],
  },
  { canonical: "إمحوتب", english: "Imhotep", aliases: ["إمحوتب", "ايمحتب", "إيمحتب", "Imhotep"] },
  {
    canonical: "يوسف الصديق",
    english: "Joseph son of Jacob in the Bible",
    aliases: ["يوسف الصديق", "يوسف بن يعقوب", "جسد يوسف", "عظام يوسف"],
  },
  {
    canonical: "أبو الهول",
    english: "Great Sphinx of Giza",
    aliases: ["ابو الهول", "أبو الهول", "ابوالهول", "ابو هول"],
  },
  {
    canonical: "وادي الملوك",
    english: "Valley of the Kings",
    aliases: ["وادي الملوك", "وادى الملوك", "وادي الملك"],
  },
  {
    canonical: "وادي الملكات",
    english: "Valley of the Queens",
    aliases: ["وادي الملكات", "وادى الملكات", "وادي الملكه"],
  },
  { canonical: "الكرنك", english: "Karnak Temple Complex", aliases: ["الكرنك", "كرنك", "الكرانك"] },
  { canonical: "دهشور", english: "Dahshur", aliases: ["دهشور", "دهشور"] },
  {
    canonical: "تل العمارنة",
    english: "Tell el-Amarna / Amarna",
    aliases: ["تل العمارنه", "العمارنه", "تل العمارنة"],
  },
  { canonical: "معبد فيلة", english: "Philae Temple", aliases: ["معبد فيله", "فيله", "فيلة"] },
  { canonical: "معبد إدفو", english: "Edfu Temple", aliases: ["معبد ادفو", "ادفو", "إدفو"] },
  { canonical: "أبيدوس", english: "Abydos", aliases: ["ابيدوس", "أبيدوس"] },
  { canonical: "معبد دندرة", english: "Dendera Temple", aliases: ["دندره", "دندرة", "معبد دندره"] },
  {
    canonical: "رمسيس الثاني",
    english: "Ramesses II",
    aliases: ["رمسيس الثاني", "رمسيس التاني", "رامسس التاني"],
  },
  {
    canonical: "تحتمس الثالث",
    english: "Thutmose III",
    aliases: ["تحتمس الثالث", "تحتمس التالت", "تحت موس الثالث"],
  },
  {
    canonical: "أمنحتب الثالث",
    english: "Amenhotep III",
    aliases: ["امنحتب الثالث", "امنحتب التالت", "أمنحتب الثالث"],
  },
  { canonical: "أخناتون", english: "Akhenaten", aliases: ["اخناتون", "اخناتن", "أخناتون"] },
  { canonical: "حتشبسوت", english: "Hatshepsut", aliases: ["حتشبسوت", "حتشبسوت"] },
  { canonical: "سنفرو", english: "Sneferu", aliases: ["سنفرو", "سنفرا"] },
  { canonical: "زوسر", english: "Djoser", aliases: ["زوسر", "زوزر"] },
  {
    canonical: "مجمع أفسس",
    english: "Council of Ephesus (431), Cyril of Alexandria",
    aliases: [
      "مجمع أفسس",
      "مجمع افسس",
      "أفسس الأول",
      "افسس الاول",
      "Council of Ephesus",
      "Ephesus",
    ],
  },
  {
    canonical: "مجمع خلقيدونية",
    english: "Council of Chalcedon (451)",
    aliases: [
      "مجمع خلقيدونية",
      "مجمع خلقدونية",
      "مجمع خلقيدون",
      "Council of Chalcedon",
      "Chalcedon",
    ],
  },
  {
    canonical: "كيرلس الإسكندري",
    english: "Cyril of Alexandria",
    aliases: ["كيرلس الإسكندري", "كيرلس السكندري", "كيرلس الاسكندري", "Cyril of Alexandria"],
  },
  {
    canonical: "أوطاخي",
    english: "Eutyches and Eutychianism",
    aliases: ["أوطاخي", "اوطاخي", "أوطاخيوس", "اوطاخيوس", "Eutyches", "Eutychianism"],
  },
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
  const topics = TOPIC_RULES.filter(({ pattern }) => pattern.test(searchable)).map(
    ({ topic }) => topic,
  );
  return topics.length ? [...new Set(topics)] : ["general"];
}

export function getTrustedSourcesForQuestion(question: string): TrustedSource[] {
  const topics = inferResearchTopics(question);
  const matches = TRUSTED_SOURCE_CATALOG.filter((source) =>
    source.topics.some((topic) => topics.includes(topic)),
  );
  const ancientEgyptianLanguageQuestion =
    /(?:هيروغليف|هيراطيق|ديموطيق|اللغة المصرية القديمة|قاموس|معجم|hieroglyph|hieratic|demotic|ancient Egyptian language|dictionary|lexicon|transliteration)/iu.test(
      question,
    );
  if (topics.includes("religion")) {
    const copticTheologyQuestion =
      /(?:مجمع|افسس|ephesus|خلقيدون|chalcedon|كيرلس|cyril|اوطاخ|eutyches|miaphys|monophys)/iu.test(
        question,
      );
    const islamicTextQuestion =
      /(?:الاسلام|الإسلام|مسلم|القرآن|القران|قرآن|قران|حديث نبوي|الحديث النبوي|صحيح البخاري|صحيح مسلم|islam|muslim|qur['’]?an|koran|hadith|sahih)/iu.test(
        question,
      );
    const jewishTextQuestion =
      /(?:يهودي|يهودية|اليهودية|التوراة|التلمود|المشنا|judaism|jewish|torah|tanakh|talmud|mishnah)/iu.test(
        question,
      );
    const christianQuestion =
      /(?:مسيح|المسيحية|انجيلي|انجيليين|انجليين|كاثوليك|كاثوليكي|بروتستانت|christian|evangelical|catholic|protestant)/iu.test(
        question,
      );
    const priority = topics.includes("egyptology")
      ? ancientEgyptianLanguageQuestion
        ? [
          "thesaurus-linguae-aegyptiae.de",
          "uee.ucla.edu",
          "escholarship.org",
          "ucl.ac.uk",
          "isac.uchicago.edu",
        ]
        : [
            "uee.ucla.edu",
            "escholarship.org",
            "ucl.ac.uk",
            "egymonuments.gov.eg",
            "sourcebooks.fordham.edu",
          ]
      : copticTheologyQuestion
        ? [
            "sourcebooks.fordham.edu",
            "copticorthodox.church",
            "st-takla.org",
            "vatican.va",
            "cambridge.org",
            "oxfordreference.com",
            "britannica.com",
          ]
        : islamicTextQuestion
          ? [
              /(?:حديث نبوي|الحديث النبوي|صحيح البخاري|صحيح مسلم|hadith|sahih)/iu.test(question)
                ? "sunnah.com"
                : "quran.com",
              "dar-alifta.org",
              "quran.com",
              "sunnah.com",
              "cambridge.org",
              "oxfordreference.com",
              "britannica.com",
            ]
          : jewishTextQuestion
            ? [
                "sefaria.org",
                "cambridge.org",
                "oxfordreference.com",
                "britannica.com",
                "sourcebooks.fordham.edu",
              ]
            : christianQuestion
              ? [
            "nae.org",
            "vatican.va",
            "britannica.com",
            "cambridge.org",
            "oxfordreference.com",
            "sourcebooks.fordham.edu",
              ]
              : [
                  "britannica.com",
                  "cambridge.org",
                  "oxfordreference.com",
                  "sourcebooks.fordham.edu",
                  "vatican.va",
                  "nae.org",
                  "quran.com",
                  "sefaria.org",
                ];
    matches.sort((first, second) => {
      const firstIndex = priority.indexOf(first.domain);
      const secondIndex = priority.indexOf(second.domain);
      return (
        (firstIndex < 0 ? priority.length : firstIndex) -
        (secondIndex < 0 ? priority.length : secondIndex)
      );
    });
  } else if (topics.includes("egyptology") && ancientEgyptianLanguageQuestion) {
    const priority = [
      "thesaurus-linguae-aegyptiae.de",
      "uee.ucla.edu",
      "escholarship.org",
      "ucl.ac.uk",
      "isac.uchicago.edu",
    ];
    matches.sort((first, second) => {
      const firstIndex = priority.indexOf(first.domain);
      const secondIndex = priority.indexOf(second.domain);
      return (
        (firstIndex < 0 ? priority.length : firstIndex) -
        (secondIndex < 0 ? priority.length : secondIndex)
      );
    });
  }
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
  return (
    TRUSTED_SOURCE_CATALOG.some(
      (source) => host === source.domain || host.endsWith("." + source.domain),
    ) ||
    host.endsWith(".gov") ||
    host.endsWith(".edu") ||
    host.endsWith(".int") ||
    /\.ac\.[a-z]{2,}$/u.test(host)
  );
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

function hasOneEditDifference(first: string, second: string): boolean {
  if (first === second) return true;
  if (Math.abs(first.length - second.length) > 1) return false;
  let left = 0;
  let right = 0;
  let edits = 0;
  while (left < first.length && right < second.length) {
    if (first[left] === second[right]) {
      left += 1;
      right += 1;
      continue;
    }
    edits += 1;
    if (edits > 1) return false;
    if (first.length > second.length) left += 1;
    else if (second.length > first.length) right += 1;
    else {
      left += 1;
      right += 1;
    }
  }
  if (left < first.length || right < second.length) edits += 1;
  return edits <= 1;
}

function matchesKnownAliasWithOneTypo(question: string, alias: string): boolean {
  const questionWords = question.split(/\s+/u);
  const aliasWords = alias.split(/\s+/u);
  if (aliasWords.length > questionWords.length) return false;
  for (let start = 0; start <= questionWords.length - aliasWords.length; start += 1) {
    let hasCorrection = false;
    let matches = true;
    for (let index = 0; index < aliasWords.length; index += 1) {
      const queryWord = questionWords[start + index] ?? "";
      const aliasWord = aliasWords[index] ?? "";
      if (queryWord === aliasWord) continue;
      if (
        queryWord.length >= 4 &&
        aliasWord.length >= 4 &&
        hasOneEditDifference(queryWord, aliasWord)
      ) {
        hasCorrection = true;
        continue;
      }
      matches = false;
      break;
    }
    if (matches && hasCorrection) return true;
  }
  return false;
}

export function correctKnownResearchEntities(
  question: string,
): Array<{ canonical: string; english: string; matched: string }> {
  const normalized = normalizeForMatching(question);
  const corrections: Array<{ canonical: string; english: string; matched: string }> = [];
  for (const entry of ENTITY_ALIASES) {
    const match = entry.aliases.find((alias) => {
      const normalizedAlias = normalizeForMatching(alias);
      return (
        normalized.includes(normalizedAlias) ||
        matchesKnownAliasWithOneTypo(normalized, normalizedAlias)
      );
    });
    if (match)
      corrections.push({ canonical: entry.canonical, english: entry.english, matched: match });
  }
  return corrections;
}

export function buildResearchSearchQuery(question: string, maxLength = 1024): string {
  const corrections = correctKnownResearchEntities(question);
  const entityHints = corrections.map(
    (item) => `Likely intended entity: ${item.canonical} (${item.english})`,
  );
  const topicHints: Record<ResearchTopic, string> = {
    egyptology:
      "Egyptian Ministry of Tourism and Antiquities, UNESCO World Heritage Centre, university Egyptology, museum catalogues, archaeological missions",
    archaeology:
      "official museum collections, archaeological missions, university research, excavation reports",
    "world-history":
      "primary historical documents, university history departments, museum or archive catalogues, established reference works",
    scripture:
      "exact Bible text, book chapter and verse, Bible Gateway, Bible.com; separate scripture from later tradition and archaeological claims",
    religion:
      "primary religious and council texts, official statements of the relevant tradition, and peer-reviewed scholarship; distinguish a church's doctrinal position from historical consensus and explain disputed terms in context",
    health:
      "official health authority guidance, WHO, CDC, NIH, PubMed, systematic reviews and clinical guidelines",
    science:
      "peer-reviewed research, university laboratories, NASA, NOAA, USGS, recognized scientific agencies",
    law: "official legislation, courts, government legal publications, treaty texts and recognized legal references",
    geography:
      "official geographic and heritage authorities, national mapping agencies, UNESCO, government visitor information",
    economy: "official statistics agencies, central banks, IMF, World Bank, OECD",
    general:
      "primary sources, university publications, national libraries and archives, Britannica and Oxford Reference",
  };
  const topics = inferResearchTopics(question);
  const guidance = [...new Set(topics)].map((topic) => topicHints[topic]).join("; ");
  return [
    question.trim(),
    ...entityHints,
    `Research evidence preferences (ranking guidance only; search the entire public web): ${guidance}`,
    "Do not restrict results to a fixed domain list. Include relevant specialist publications, official sources, universities, archives, museums, journals, and other credible sources wherever they are hosted.",
  ]
    .filter(Boolean)
    .join(" ")
    .slice(0, maxLength);
}
