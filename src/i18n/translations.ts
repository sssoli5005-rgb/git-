import type { Category } from "../lib/reflection";

export const LANGUAGES = [
  { code: "ar", label: "العربية", dir: "rtl" },
  { code: "en", label: "English", dir: "ltr" },
  { code: "fr", label: "Français", dir: "ltr" },
  { code: "es", label: "Español", dir: "ltr" },
  { code: "it", label: "Italiano", dir: "ltr" },
  { code: "de", label: "Deutsch", dir: "ltr" },
  { code: "ru", label: "Русский", dir: "ltr" },
  { code: "ja", label: "日本語", dir: "ltr" },
  { code: "zh", label: "中文", dir: "ltr" },
] as const;

export type LangCode = (typeof LANGUAGES)[number]["code"];

export const tourismCopy = {
  ar: {
    brand: "دليل مصر الذكي",
    brandSub: "اكتشف حكاية كل أثر",
    home: "الرئيسية",
    discover: "اكتشف",
    stories: "حكايات مصر",
    askGuide: "اسأل المرشد",
    language: "اللغة",
    menu: "القائمة",
    musicPlay: "تشغيل الموسيقى",
    musicMute: "كتم الموسيقى",
    musicError: "تعذر تشغيل الصوت على هذا الجهاز.",
    eyebrow: "رحلتك إلى قلب الحضارة تبدأ هنا",
    heroTitle: "مش مجرد زيارة...",
    heroAccent: " دي حكاية هتعيشها.",
    heroText:
      "وجّه كاميرتك للنقوش والآثار، واكتشف الحكايات والمعاني وراء كل تفصيلة — بلغتك ومن مكانك.",
    scanNow: "ابدأ الاستكشاف بالكاميرا",
    explore: "اكتشف التراث",
    trustNote: "معلومات موثقة وتمييز واضح بين الحقيقة والرواية",
    ancientEgypt: "الحضارة المصرية القديمة",
    thousandsYears: "آلاف السنين من الحضارة",
    historyAroundYou: "التاريخ حواليك في كل خطوة",
    tagline: "اصوّر .. اكتشف .. اعرف الحكاية",
    scanTitle: "خلّي الأثر يحكيلك حكايته",
    scanText: "افتح الكاميرا ووجّهها ناحية نقش أو قطعة أثرية لبدء رحلة التعرف.",
    openCamera: "افتح الكاميرا",
    discoverLabel: "بوابتك إلى الماضي",
    discoverTitle: "اكتشف مصر من زاوية جديدة",
    discoverText: "من النقوش والقطع الأثرية إلى الحكايات والعادات اللي صنعت هويتنا.",
    searchPlaceholder: "ابحث عن أثر أو نقش أو حكاية...",
    artifacts: "الآثار",
    artifactsDesc: "أدوات وتماثيل وقطع من الحياة اليومية",
    hieroglyphs: "الكتابة الهيروغليفية",
    hieroglyphsDesc: "الرموز والنقوش ومعانيها الموثقة",
    stories: "حكايات وأسرار",
    storiesDesc: "روايات تاريخية وأساطير مع توضيح الفرق",
    heritage: "التراث المصري",
    heritageDesc: "عادات وأكلات وجذور ثقافية",
    storyLabel: "حكاية من أرض مصر",
    storyTitle: "كل حجر وراه حكاية",
    storyText:
      "مش هدفنا نعرض معلومة وخلاص؛ هدفنا نفهمك السياق، ونحكيلك إزاي عاش الناس وفكروا وصنعوا حضارتهم.",
    askAboutStory: "اسأل عن الحكاية",
    storyArtCaption: "أسرار الحضارة المصرية",
    howLabel: "بخطوات بسيطة",
    howTitle: "رحلتك تبدأ بثلاث خطوات",
    stepOne: "وجّه الكاميرا",
    stepOneText: "قرّب من النقش أو القطعة وخليها واضحة في إطار التصوير.",
    stepTwo: "راجع نتيجة التعرف",
    stepTwoText: "هنعرض درجة الثقة والمعلومات المتاحة، ولو مش متأكدين هنقولك.",
    stepThree: "اسمع الحكاية بلغتك",
    stepThreeText: "اقرأ التفاصيل أو اسأل المرشد الرقمي عن أي نقطة.",
    footerText: "رفيقك لاكتشاف الحضارة المصرية — معرفة باحترام ودقة.",
    chatTitle: "اسأل المرشد الذكي",
    chatBadge: "مرشدك السياحي الرقمي",
    chatPlaceholder: "اسأل عن أثر أو مكان أو حكاية…",
    scannerEyebrow: "ماسح الآثار",
    cameraTitle: "وجّه الكاميرا نحو الأثر",
    close: "إغلاق",
    capturedImage: "الصورة الملتقطة",
    cameraUnavailable: "الكاميرا مش متاحة",
    cameraPermission: "اسمح للمتصفح باستخدام الكاميرا أو افتح الموقع من موبايلك عبر اتصال آمن.",
    cameraTip: "حاول تخلي النقش أو القطعة في منتصف الإطار وبإضاءة واضحة.",
    recognitionLater:
      "تم التقاط الصورة. التعرف الأثري الفعلي لسه محتاج قاعدة بيانات موثقة ومحرك مطابقة؛ مش هنخمن اسم الأثر أو ترجمته.",
    retake: "إعادة التصوير",
    capture: "التقاط الصورة",
  },
  en: {
    brand: "Egypt Smart Guide",
    brandSub: "Discover every artifact's story",
    home: "Home",
    discover: "Discover",
    stories: "Egyptian stories",
    askGuide: "Ask the guide",
    language: "Language",
    menu: "Menu",
    musicPlay: "Play music",
    musicMute: "Mute music",
    musicError: "Audio could not be played on this device.",
    eyebrow: "Your journey into civilization starts here",
    heroTitle: "More than a visit...",
    heroAccent: " a story to experience.",
    heroText:
      "Point your camera at inscriptions and artifacts to explore the stories and meanings behind every detail — in your language.",
    scanNow: "Explore with camera",
    explore: "Explore heritage",
    trustNote: "Verified information, with facts and legends clearly distinguished",
    ancientEgypt: "Ancient Egyptian civilization",
    thousandsYears: "Thousands of years of civilization",
    historyAroundYou: "History around you at every step",
    tagline: "Scan .. Discover .. Hear the story",
    scanTitle: "Let the artifact tell its story",
    scanText: "Open the camera and point it at an inscription or artifact to begin exploring.",
    openCamera: "Open camera",
    discoverLabel: "Your gateway to the past",
    discoverTitle: "Discover Egypt from a new perspective",
    discoverText:
      "From hieroglyphs and artifacts to the stories and traditions that shaped our identity.",
    searchPlaceholder: "Search artifacts, inscriptions or stories...",
    artifacts: "Artifacts",
    artifactsDesc: "Objects, statues and pieces of daily life",
    hieroglyphs: "Hieroglyphics",
    hieroglyphsDesc: "Verified symbols, inscriptions and meanings",
    stories: "Stories & mysteries",
    storiesDesc: "Historical accounts and legends, clearly labeled",
    heritage: "Egyptian heritage",
    heritageDesc: "Traditions, food and cultural roots",
    storyLabel: "A story from Egypt",
    storyTitle: "Every stone has a story",
    storyText:
      "We do more than display facts. We explain the context and explore how people lived, thought and shaped their civilization.",
    askAboutStory: "Ask about the story",
    storyArtCaption: "Secrets of ancient Egypt",
    howLabel: "A simple journey",
    howTitle: "Your journey in three steps",
    stepOne: "Point your camera",
    stepOneText: "Frame the inscription or artifact clearly.",
    stepTwo: "Review the result",
    stepTwoText: "See confidence and available information. If uncertain, we will say so.",
    stepThree: "Hear the story",
    stepThreeText: "Read details or ask the digital guide in your language.",
    footerText: "Your companion to Egyptian civilization — knowledge with care and accuracy.",
    chatTitle: "Ask the smart guide",
    chatBadge: "Your digital travel guide",
    chatPlaceholder: "Ask about an artifact, place or story…",
    scannerEyebrow: "Artifact scanner",
    cameraTitle: "Point your camera at an artifact",
    close: "Close",
    capturedImage: "Captured image",
    cameraUnavailable: "Camera unavailable",
    cameraPermission:
      "Allow camera access or open this site on your phone using a secure connection.",
    cameraTip: "Keep the inscription or object centered and well lit.",
    recognitionLater:
      "Image captured. Real artifact identification still needs a verified database and matching engine; we will not guess an artifact name or translation.",
    retake: "Retake",
    capture: "Capture",
  },
  fr: {
    brand: "Guide intelligent d’Égypte",
    brandSub: "Découvrez l’histoire de chaque objet",
    home: "Accueil",
    discover: "Découvrir",
    stories: "Récits d’Égypte",
    askGuide: "Interroger le guide",
    language: "Langue",
    menu: "Menu",
    musicPlay: "Activer la musique",
    musicMute: "Couper la musique",
    musicError: "Le son n’a pas pu être lu sur cet appareil.",
    eyebrow: "Votre voyage au cœur de la civilisation commence ici",
    heroTitle: "Plus qu’une visite…",
    heroAccent: " une histoire à vivre.",
    heroText:
      "Pointez votre caméra vers les inscriptions et les objets pour découvrir leur histoire et leur sens, dans votre langue.",
    scanNow: "Explorer avec la caméra",
    explore: "Explorer le patrimoine",
    trustNote: "Informations vérifiées, faits et légendes clairement distingués",
    ancientEgypt: "L’Égypte ancienne",
    thousandsYears: "Des millénaires de civilisation",
    historyAroundYou: "L’histoire à chaque pas",
    tagline: "Scannez .. Découvrez .. Écoutez l’histoire",
    scanTitle: "Laissez l’objet raconter son histoire",
    scanText: "Ouvrez la caméra et pointez-la vers une inscription ou un objet.",
    openCamera: "Ouvrir la caméra",
    discoverLabel: "Votre porte vers le passé",
    discoverTitle: "Découvrez l’Égypte autrement",
    discoverText: "Des hiéroglyphes aux objets, jusqu’aux récits et traditions.",
    searchPlaceholder: "Rechercher un objet, une inscription ou un récit…",
    artifacts: "Objets antiques",
    artifactsDesc: "Objets, statues et vie quotidienne",
    hieroglyphs: "Hiéroglyphes",
    hieroglyphsDesc: "Symboles et sens vérifiés",
    stories: "Récits et mystères",
    storiesDesc: "Récits historiques et légendes identifiés",
    heritage: "Patrimoine égyptien",
    heritageDesc: "Traditions, cuisine et racines culturelles",
    storyLabel: "Un récit d’Égypte",
    storyTitle: "Chaque pierre a son histoire",
    storyText:
      "Nous expliquons le contexte et la manière dont les anciens vivaient et ont façonné leur civilisation.",
    askAboutStory: "Poser une question",
    storyArtCaption: "Les secrets de l’Égypte ancienne",
    howLabel: "En trois étapes",
    howTitle: "Votre voyage commence ici",
    stepOne: "Pointez la caméra",
    stepOneText: "Cadrez clairement l’inscription ou l’objet.",
    stepTwo: "Vérifiez le résultat",
    stepTwoText: "Consultez le niveau de confiance. En cas de doute, nous le signalons.",
    stepThree: "Écoutez l’histoire",
    stepThreeText: "Lisez les détails ou interrogez le guide dans votre langue.",
    footerText: "Votre compagnon pour découvrir l’Égypte — avec soin et précision.",
    chatTitle: "Interroger le guide intelligent",
    chatBadge: "Votre guide touristique numérique",
    chatPlaceholder: "Question sur un objet, un lieu ou un récit…",
    scannerEyebrow: "Scanner d’objets",
    cameraTitle: "Pointez la caméra vers l’objet",
    close: "Fermer",
    capturedImage: "Image capturée",
    cameraUnavailable: "Caméra indisponible",
    cameraPermission:
      "Autorisez l’accès à la caméra ou ouvrez le site sur mobile via une connexion sécurisée.",
    cameraTip: "Centrez l’inscription et assurez un bon éclairage.",
    recognitionLater:
      "Image capturée. L’identification réelle nécessite une base vérifiée et un moteur de correspondance. Aucune supposition ne sera faite.",
    retake: "Reprendre",
    capture: "Capturer",
  },
  es: {
    brand: "Guía inteligente de Egipto",
    brandSub: "Descubre la historia de cada pieza",
    home: "Inicio",
    discover: "Descubrir",
    stories: "Historias de Egipto",
    askGuide: "Preguntar al guía",
    language: "Idioma",
    menu: "Menú",
    musicPlay: "Activar música",
    musicMute: "Silenciar música",
    musicError: "No se pudo reproducir el audio en este dispositivo.",
    eyebrow: "Tu viaje al corazón de la civilización empieza aquí",
    heroTitle: "Más que una visita...",
    heroAccent: " una historia que vivir.",
    heroText:
      "Apunta tu cámara a inscripciones y objetos antiguos para descubrir sus historias y significados en tu idioma.",
    scanNow: "Explorar con cámara",
    explore: "Explorar el patrimonio",
    trustNote: "Información verificada; hechos y leyendas claramente diferenciados",
    ancientEgypt: "Antiguo Egipto",
    thousandsYears: "Miles de años de civilización",
    historyAroundYou: "Historia a cada paso",
    tagline: "Enfoca .. Descubre .. Conoce la historia",
    scanTitle: "Deja que el objeto cuente su historia",
    scanText: "Abre la cámara y apunta a una inscripción o pieza arqueológica.",
    openCamera: "Abrir cámara",
    discoverLabel: "Tu puerta al pasado",
    discoverTitle: "Descubre Egipto desde otra perspectiva",
    discoverText: "Desde jeroglíficos y objetos hasta relatos y tradiciones.",
    searchPlaceholder: "Busca una pieza, inscripción o historia...",
    artifacts: "Piezas arqueológicas",
    artifactsDesc: "Objetos, estatuas y vida cotidiana",
    hieroglyphs: "Jeroglíficos",
    hieroglyphsDesc: "Símbolos y significados verificados",
    stories: "Historias y misterios",
    storiesDesc: "Relatos históricos y leyendas identificadas",
    heritage: "Patrimonio egipcio",
    heritageDesc: "Tradiciones, comida y raíces culturales",
    storyLabel: "Una historia de Egipto",
    storyTitle: "Cada piedra tiene una historia",
    storyText:
      "Explicamos el contexto y cómo vivían las personas que construyeron esta civilización.",
    askAboutStory: "Pregunta por la historia",
    storyArtCaption: "Secretos del antiguo Egipto",
    howLabel: "Un viaje sencillo",
    howTitle: "Tu viaje en tres pasos",
    stepOne: "Apunta la cámara",
    stepOneText: "Encuadra claramente la inscripción o el objeto.",
    stepTwo: "Revisa el resultado",
    stepTwoText: "Consulta el nivel de confianza. Si hay dudas, lo indicaremos.",
    stepThree: "Escucha la historia",
    stepThreeText: "Lee los detalles o pregunta al guía en tu idioma.",
    footerText: "Tu compañero para descubrir Egipto, con cuidado y precisión.",
    chatTitle: "Pregunta al guía inteligente",
    chatBadge: "Tu guía turístico digital",
    chatPlaceholder: "Pregunta por una pieza, un lugar o una historia…",
    scannerEyebrow: "Escáner arqueológico",
    cameraTitle: "Apunta la cámara al objeto",
    close: "Cerrar",
    capturedImage: "Imagen capturada",
    cameraUnavailable: "Cámara no disponible",
    cameraPermission:
      "Permite el acceso a la cámara o abre el sitio en tu móvil con conexión segura.",
    cameraTip: "Centra la inscripción y procura que haya buena luz.",
    recognitionLater:
      "Imagen capturada. La identificación real necesita una base verificada y un motor de coincidencias. No inventaremos resultados.",
    retake: "Repetir",
    capture: "Capturar",
  },
  de: {
    brand: "Ägyptischer Smart-Guide",
    brandSub: "Entdecke die Geschichte jedes Fundstücks",
    home: "Start",
    discover: "Entdecken",
    stories: "Geschichten Ägyptens",
    askGuide: "Guide fragen",
    language: "Sprache",
    menu: "Menü",
    musicPlay: "Musik einschalten",
    musicMute: "Musik stummschalten",
    musicError: "Audio konnte auf diesem Gerät nicht abgespielt werden.",
    eyebrow: "Deine Reise ins Herz der Zivilisation beginnt hier",
    heroTitle: "Mehr als ein Besuch …",
    heroAccent: " eine Geschichte zum Erleben.",
    heroText:
      "Richte deine Kamera auf Inschriften und Artefakte und entdecke ihre Geschichten und Bedeutungen in deiner Sprache.",
    scanNow: "Mit Kamera entdecken",
    explore: "Kulturerbe entdecken",
    trustNote: "Geprüfte Informationen; Fakten und Legenden klar getrennt",
    ancientEgypt: "Das alte Ägypten",
    thousandsYears: "Tausende Jahre Zivilisation",
    historyAroundYou: "Geschichte bei jedem Schritt",
    tagline: "Erfassen .. Entdecken .. Geschichte erleben",
    scanTitle: "Lass das Artefakt seine Geschichte erzählen",
    scanText: "Öffne die Kamera und richte sie auf eine Inschrift oder ein Artefakt.",
    openCamera: "Kamera öffnen",
    discoverLabel: "Dein Tor zur Vergangenheit",
    discoverTitle: "Entdecke Ägypten aus einer neuen Perspektive",
    discoverText: "Von Hieroglyphen und Artefakten bis zu Geschichten und Traditionen.",
    searchPlaceholder: "Artefakt, Inschrift oder Geschichte suchen …",
    artifacts: "Artefakte",
    artifactsDesc: "Gegenstände, Statuen und Alltag",
    hieroglyphs: "Hieroglyphen",
    hieroglyphsDesc: "Geprüfte Symbole und Bedeutungen",
    stories: "Geschichten und Geheimnisse",
    storiesDesc: "Historische Berichte und gekennzeichnete Legenden",
    heritage: "Ägyptisches Kulturerbe",
    heritageDesc: "Traditionen, Küche und kulturelle Wurzeln",
    storyLabel: "Eine Geschichte aus Ägypten",
    storyTitle: "Jeder Stein hat eine Geschichte",
    storyText:
      "Wir erklären den historischen Kontext und wie Menschen lebten und ihre Zivilisation prägten.",
    askAboutStory: "Zur Geschichte fragen",
    storyArtCaption: "Geheimnisse des alten Ägyptens",
    howLabel: "Einfach erklärt",
    howTitle: "Deine Reise in drei Schritten",
    stepOne: "Kamera ausrichten",
    stepOneText: "Richte die Inschrift oder das Objekt klar im Bild aus.",
    stepTwo: "Ergebnis prüfen",
    stepTwoText: "Sieh dir die Vertrauensstufe an. Unsicherheiten werden gekennzeichnet.",
    stepThree: "Geschichte erleben",
    stepThreeText: "Lies Details oder frage den digitalen Guide in deiner Sprache.",
    footerText: "Dein Begleiter zur Entdeckung Ägyptens — sorgfältig und genau.",
    chatTitle: "Frage den intelligenten Guide",
    chatBadge: "Dein digitaler Reiseführer",
    chatPlaceholder: "Frage zu einem Artefakt, Ort oder einer Geschichte …",
    scannerEyebrow: "Artefakt-Scanner",
    cameraTitle: "Kamera auf das Artefakt richten",
    close: "Schließen",
    capturedImage: "Aufgenommenes Bild",
    cameraUnavailable: "Kamera nicht verfügbar",
    cameraPermission:
      "Erlaube den Kamerazugriff oder öffne die Website mobil über eine sichere Verbindung.",
    cameraTip: "Zentriere die Inschrift und achte auf gutes Licht.",
    recognitionLater:
      "Bild aufgenommen. Eine echte Identifikation benötigt eine geprüfte Datenbank und Abgleichlogik. Wir raten keine Ergebnisse.",
    retake: "Erneut aufnehmen",
    capture: "Aufnehmen",
  },
  zh: {
    brand: "埃及智能导览",
    brandSub: "探索每件文物背后的故事",
    home: "首页",
    discover: "探索",
    stories: "埃及故事",
    askGuide: "咨询导览",
    language: "语言",
    menu: "菜单",
    musicPlay: "播放音乐",
    musicMute: "静音",
    musicError: "此设备无法播放音频。",
    eyebrow: "通往文明核心的旅程从这里开始",
    heroTitle: "不只是一次参观……",
    heroAccent: " 更是一段亲身体验的故事。",
    heroText: "将摄像头对准铭文和文物，用你的语言探索每个细节背后的故事与含义。",
    scanNow: "使用相机探索",
    explore: "探索文化遗产",
    trustNote: "经过核实的信息，明确区分史实与传说",
    ancientEgypt: "古埃及文明",
    thousandsYears: "数千年的文明历史",
    historyAroundYou: "历史就在每一步",
    tagline: "扫描 .. 探索 .. 聆听故事",
    scanTitle: "让文物讲述自己的故事",
    scanText: "打开摄像头，对准铭文或文物，开始探索。",
    openCamera: "打开相机",
    discoverLabel: "通往过去的大门",
    discoverTitle: "从全新视角探索埃及",
    discoverText: "从象形文字和文物，到塑造文化身份的故事与传统。",
    searchPlaceholder: "搜索文物、铭文或故事……",
    artifacts: "文物",
    artifactsDesc: "器物、雕像与日常生活用品",
    hieroglyphs: "象形文字",
    hieroglyphsDesc: "经过核实的符号、铭文及含义",
    stories: "故事与奥秘",
    storiesDesc: "明确标注的历史记载与传说",
    heritage: "埃及文化遗产",
    heritageDesc: "传统、美食与文化根源",
    storyLabel: "来自埃及的故事",
    storyTitle: "每一块石头都有故事",
    storyText: "我们不仅展示事实，还解释历史背景，探索古人如何生活、思考并创造文明。",
    askAboutStory: "询问这个故事",
    storyArtCaption: "古埃及文明的奥秘",
    howLabel: "简单三步",
    howTitle: "三步开启探索之旅",
    stepOne: "对准摄像头",
    stepOneText: "将铭文或文物清晰地置于画面中央。",
    stepTwo: "查看识别结果",
    stepTwoText: "查看可信度；如有不确定之处，我们会明确说明。",
    stepThree: "聆听故事",
    stepThreeText: "阅读详情，或用你的语言向数字导览提问。",
    footerText: "探索埃及文明的伙伴——严谨、尊重与准确。",
    chatTitle: "咨询智能导览",
    chatBadge: "你的数字旅行导览",
    chatPlaceholder: "询问文物、地点或故事……",
    scannerEyebrow: "文物扫描器",
    cameraTitle: "将摄像头对准文物",
    close: "关闭",
    capturedImage: "已拍摄的图像",
    cameraUnavailable: "摄像头不可用",
    cameraPermission: "请允许摄像头权限，或通过安全连接在手机上打开网站。",
    cameraTip: "将铭文置于画面中央，并确保光线充足。",
    recognitionLater: "图像已拍摄。真实文物识别仍需经过核实的数据库和匹配引擎；我们不会猜测结果。",
    retake: "重新拍摄",
    capture: "拍摄",
  },

  it: {
    brand: "Guida intelligente dell’Egitto",
    brandSub: "Scopri la storia di ogni reperto",
    home: "Home",
    discover: "Scopri",
    stories: "Storie d’Egitto",
    askGuide: "Chiedi alla guida",
    language: "Lingua",
    menu: "Menu",
    musicPlay: "Attiva la musica",
    musicMute: "Disattiva la musica",
    musicError: "Impossibile riprodurre l’audio su questo dispositivo.",
    eyebrow: "Il tuo viaggio nel cuore della civiltà inizia qui",
    heroTitle: "Non è solo una visita...",
    heroAccent: " è una storia da vivere.",
    heroText:
      "Inquadra con la fotocamera iscrizioni e reperti e scopri le storie e i significati dietro ogni dettaglio, nella tua lingua.",
    scanNow: "Esplora con la fotocamera",
    explore: "Esplora il patrimonio",
    trustNote: "Informazioni verificate, con fatti e leggende chiaramente distinti",
    ancientEgypt: "Antica civiltà egizia",
    thousandsYears: "Migliaia di anni di civiltà",
    historyAroundYou: "La storia a ogni passo",
    tagline: "Inquadra .. Scopri .. Ascolta la storia",
    scanTitle: "Lascia che il reperto racconti la sua storia",
    scanText: "Apri la fotocamera e puntala verso un’iscrizione o un reperto per iniziare.",
    openCamera: "Apri la fotocamera",
    discoverLabel: "La tua porta sul passato",
    discoverTitle: "Scopri l’Egitto da una nuova prospettiva",
    discoverText:
      "Dai geroglifici e reperti alle storie e tradizioni che hanno plasmato la nostra identità.",
    searchPlaceholder: "Cerca un reperto, un’iscrizione o una storia...",
    artifacts: "Reperti",
    artifactsDesc: "Oggetti, statue e testimonianze della vita quotidiana",
    hieroglyphs: "Geroglifici",
    hieroglyphsDesc: "Simboli, iscrizioni e significati verificati",
    stories: "Storie e misteri",
    storiesDesc: "Racconti storici e leggende chiaramente indicati",
    heritage: "Patrimonio egiziano",
    heritageDesc: "Tradizioni, cucina e radici culturali",
    storyLabel: "Una storia dalla terra d’Egitto",
    storyTitle: "Ogni pietra ha una storia",
    storyText:
      "Non ci limitiamo a mostrare informazioni: spieghiamo il contesto e raccontiamo come vivevano, pensavano e crearono la loro civiltà le persone del passato.",
    askAboutStory: "Chiedi informazioni sulla storia",
    storyArtCaption: "I segreti dell’antico Egitto",
    howLabel: "In pochi semplici passi",
    howTitle: "Il tuo viaggio inizia in tre passaggi",
    stepOne: "Inquadra con la fotocamera",
    stepOneText: "Avvicinati all’iscrizione o al reperto e mantienilo nitido nell’inquadratura.",
    stepTwo: "Controlla il risultato",
    stepTwoText:
      "Mostreremo il livello di affidabilità e le informazioni disponibili. Se non siamo certi, te lo diremo.",
    stepThree: "Ascolta la storia nella tua lingua",
    stepThreeText: "Leggi i dettagli o chiedi qualsiasi cosa alla guida digitale.",
    footerText:
      "Il tuo compagno per scoprire la civiltà egizia: conoscenza, rispetto e precisione.",
    chatTitle: "Chiedi alla guida intelligente",
    chatBadge: "La tua guida turistica digitale",
    chatPlaceholder: "Chiedi di un reperto, un luogo o una storia…",
    scannerEyebrow: "Scanner dei reperti",
    cameraTitle: "Punta la fotocamera verso il reperto",
    close: "Chiudi",
    capturedImage: "Immagine acquisita",
    cameraUnavailable: "Fotocamera non disponibile",
    cameraPermission:
      "Consenti al browser di usare la fotocamera oppure apri il sito dal telefono tramite una connessione sicura.",
    cameraTip:
      "Tieni l’iscrizione o l’oggetto al centro dell’inquadratura e assicurati che ci sia luce.",
    recognitionLater:
      "Immagine acquisita. Per identificare davvero un reperto servono un database verificato e un motore di confronto: non inventeremo nomi o traduzioni.",
    retake: "Scatta di nuovo",
    capture: "Scatta",
  },
  ru: {
    brand: "Умный гид по Египту",
    brandSub: "Узнайте историю каждого артефакта",
    home: "Главная",
    discover: "Открыть",
    stories: "Истории Египта",
    askGuide: "Спросить гида",
    language: "Язык",
    menu: "Меню",
    musicPlay: "Включить музыку",
    musicMute: "Выключить звук",
    musicError: "Не удалось воспроизвести звук на этом устройстве.",
    eyebrow: "Путешествие в сердце цивилизации начинается здесь",
    heroTitle: "Это больше, чем экскурсия…",
    heroAccent: " это история, которую вы проживёте.",
    heroText:
      "Направьте камеру на надписи и артефакты, чтобы узнать истории и значения каждой детали на вашем языке.",
    scanNow: "Исследовать с камерой",
    explore: "Изучить наследие",
    trustNote: "Проверенная информация с чётким разделением фактов и легенд",
    ancientEgypt: "Древнеегипетская цивилизация",
    thousandsYears: "Тысячи лет истории",
    historyAroundYou: "История на каждом шагу",
    tagline: "Сканируйте .. Открывайте .. Узнавайте историю",
    scanTitle: "Позвольте артефакту рассказать свою историю",
    scanText: "Откройте камеру и наведите её на надпись или артефакт, чтобы начать знакомство.",
    openCamera: "Открыть камеру",
    discoverLabel: "Ваш путь в прошлое",
    discoverTitle: "Откройте Египет с новой стороны",
    discoverText: "От иероглифов и артефактов до историй и традиций, сформировавших нашу культуру.",
    searchPlaceholder: "Найти артефакт, надпись или историю…",
    artifacts: "Артефакты",
    artifactsDesc: "Предметы, статуи и свидетельства повседневной жизни",
    hieroglyphs: "Иероглифы",
    hieroglyphsDesc: "Проверенные символы, надписи и их значения",
    stories: "Истории и загадки",
    storiesDesc: "Исторические свидетельства и легенды с чёткими пометками",
    heritage: "Наследие Египта",
    heritageDesc: "Традиции, кухня и культурные корни",
    storyLabel: "История с земли Египта",
    storyTitle: "У каждого камня есть своя история",
    storyText:
      "Мы не просто показываем факты: мы объясняем исторический контекст и рассказываем, как люди жили, думали и создавали свою цивилизацию.",
    askAboutStory: "Спросить об этой истории",
    storyArtCaption: "Тайны Древнего Египта",
    howLabel: "Всего несколько шагов",
    howTitle: "Ваше путешествие начинается с трёх шагов",
    stepOne: "Наведите камеру",
    stepOneText: "Подойдите ближе и чётко поместите надпись или предмет в кадр.",
    stepTwo: "Проверьте результат",
    stepTwoText:
      "Мы покажем уровень достоверности и доступные сведения. Если уверенности нет, мы сообщим об этом.",
    stepThree: "Узнайте историю на своём языке",
    stepThreeText: "Читайте подробности или задавайте вопросы цифровому гиду.",
    footerText: "Ваш проводник по цивилизации Египта — знания, уважение и точность.",
    chatTitle: "Спросить умного гида",
    chatBadge: "Ваш цифровой туристический гид",
    chatPlaceholder: "Спросите об артефакте, месте или истории…",
    scannerEyebrow: "Сканер артефактов",
    cameraTitle: "Направьте камеру на артефакт",
    close: "Закрыть",
    capturedImage: "Снимок сделан",
    cameraUnavailable: "Камера недоступна",
    cameraPermission:
      "Разрешите браузеру доступ к камере или откройте сайт на телефоне через защищённое соединение.",
    cameraTip: "Расположите надпись или предмет по центру кадра и обеспечьте хорошее освещение.",
    recognitionLater:
      "Снимок сделан. Для настоящего распознавания нужен проверенный каталог и механизм сопоставления. Мы не будем угадывать название или перевод.",
    retake: "Сделать снимок снова",
    capture: "Сфотографировать",
  },
  ja: {
    brand: "エジプト・スマートガイド",
    brandSub: "遺物ひとつひとつの物語を発見",
    home: "ホーム",
    discover: "発見する",
    stories: "エジプトの物語",
    askGuide: "ガイドに質問",
    language: "言語",
    menu: "メニュー",
    musicPlay: "音楽を再生",
    musicMute: "音楽をミュート",
    musicError: "この端末では音声を再生できません。",
    eyebrow: "文明の中心への旅はここから始まります",
    heroTitle: "ただの観光ではありません…",
    heroAccent: " 心に残る物語を体験しましょう。",
    heroText:
      "カメラを碑文や遺物に向けると、細部に隠された物語や意味をあなたの言語で知ることができます。",
    scanNow: "カメラで探検する",
    explore: "文化遺産を探る",
    trustNote: "事実と伝説を明確に区別した、確認済みの情報",
    ancientEgypt: "古代エジプト文明",
    thousandsYears: "何千年にもわたる文明",
    historyAroundYou: "一歩ごとに出会う歴史",
    tagline: "撮影 .. 発見 .. 物語を知る",
    scanTitle: "遺物にその物語を語ってもらいましょう",
    scanText: "カメラを開き、碑文や遺物に向けて探検を始めましょう。",
    openCamera: "カメラを開く",
    discoverLabel: "過去への入り口",
    discoverTitle: "新しい視点でエジプトを発見",
    discoverText: "ヒエログリフや遺物から、文化を形づくった物語や伝統まで。",
    searchPlaceholder: "遺物、碑文、物語を検索…",
    artifacts: "遺物",
    artifactsDesc: "道具、彫像、日常生活の品々",
    hieroglyphs: "ヒエログリフ",
    hieroglyphsDesc: "確認された文字、碑文、その意味",
    stories: "物語と謎",
    storiesDesc: "史実と伝説を明確に区別した物語",
    heritage: "エジプトの文化遺産",
    heritageDesc: "伝統、食文化、文化的ルーツ",
    storyLabel: "エジプトの地から届く物語",
    storyTitle: "石のひとつひとつに物語があります",
    storyText:
      "情報を並べるだけではありません。歴史的背景を説明し、人々がどのように暮らし、考え、文明を築いたのかを紹介します。",
    askAboutStory: "この物語について質問",
    storyArtCaption: "古代エジプトの秘密",
    howLabel: "簡単なステップ",
    howTitle: "旅は3つのステップで始まります",
    stepOne: "カメラを向ける",
    stepOneText: "碑文や遺物に近づき、画面の中ではっきりと捉えてください。",
    stepTwo: "認識結果を確認",
    stepTwoText: "信頼度と利用可能な情報を表示します。不確かな場合は、そのことを明示します。",
    stepThree: "あなたの言語で物語を知る",
    stepThreeText: "詳しい説明を読んだり、デジタルガイドに質問したりできます。",
    footerText: "エジプト文明を発見するパートナー。知識、敬意、正確さを大切にします。",
    chatTitle: "スマートガイドに質問",
    chatBadge: "あなたのデジタル観光ガイド",
    chatPlaceholder: "遺物、場所、物語について質問…",
    scannerEyebrow: "遺物スキャナー",
    cameraTitle: "遺物にカメラを向けてください",
    close: "閉じる",
    capturedImage: "撮影した画像",
    cameraUnavailable: "カメラを利用できません",
    cameraPermission:
      "ブラウザーにカメラの使用を許可するか、安全な接続でスマートフォンからサイトを開いてください。",
    cameraTip: "碑文や対象物を画面中央に置き、明るい場所で撮影してください。",
    recognitionLater:
      "画像を撮影しました。実際の遺物を特定するには、検証済みデータベースと照合システムが必要です。名称や翻訳を推測することはありません。",
    retake: "撮り直す",
    capture: "撮影する",
  },
} as const;

export const scannerDiagnosticsCopy = {
  ar: {
    modelLabel: "النموذج المستخدم",
    geminiLabel: "Gemini",
    groqLabel: "Groq",
    httpStatus: "رمز الاستجابة",
    noHttpStatus: "تعذر الاتصال بالخدمة",
    fallback: "النموذج الأساسي ماكملش؛ تم استخدام النموذج الاحتياطي.",
    notConfigured: "خدمة تحليل الصور مش متوصلة على الخادم.",
    network_error: "مشكلة اتصال",
    authentication_error: "مفتاح Gemini أو صلاحياته غير صحيحة",
    rate_limited: "تم تجاوز حد الطلبات المجاني لهذه الخدمة",
    provider_unavailable: "خدمة Gemini غير متاحة مؤقتًا",
    provider_error: "رفضت خدمة Gemini الطلب",
  },
  en: {
    modelLabel: "Model used",
    geminiLabel: "Gemini",
    groqLabel: "Groq",
    httpStatus: "HTTP",
    noHttpStatus: "no response",
    fallback: "The primary vision model failed; the fallback model was used.",
    notConfigured: "The image-analysis service is not connected on the server.",
    network_error: "Connection problem",
    authentication_error: "Gemini key or permissions are invalid",
    rate_limited: "This provider's free request quota was exceeded",
    provider_unavailable: "Gemini is temporarily unavailable",
    provider_error: "Gemini rejected the request",
  },
  fr: {
    modelLabel: "Modèle utilisé",
    geminiLabel: "Gemini",
    groqLabel: "Groq",
    httpStatus: "HTTP",
    noHttpStatus: "aucune réponse",
    fallback: "Le modèle de vision principal a échoué ; le modèle de secours a été utilisé.",
    notConfigured: "Le service d’analyse d’images n’est pas connecté au serveur.",
    network_error: "Problème de connexion",
    authentication_error: "Clé Gemini ou autorisations incorrectes",
    rate_limited: "Le quota gratuit de ce service est dépassé",
    provider_unavailable: "Gemini est temporairement indisponible",
    provider_error: "Gemini a refusé la requête",
  },
  es: {
    modelLabel: "Modelo utilizado",
    geminiLabel: "Gemini",
    groqLabel: "Groq",
    httpStatus: "HTTP",
    noHttpStatus: "sin respuesta",
    fallback: "El modelo visual principal falló; se utilizó el modelo alternativo.",
    notConfigured: "El servicio de análisis de imágenes no está conectado al servidor.",
    network_error: "Problema de conexión",
    authentication_error: "La clave o los permisos de Gemini no son válidos",
    rate_limited: "Se superó la cuota gratuita de este servicio",
    provider_unavailable: "Gemini no está disponible temporalmente",
    provider_error: "Gemini rechazó la solicitud",
  },
  it: {
    modelLabel: "Modello utilizzato",
    geminiLabel: "Gemini",
    groqLabel: "Groq",
    httpStatus: "HTTP",
    noHttpStatus: "nessuna risposta",
    fallback: "Il modello visivo principale non ha funzionato; è stato usato quello alternativo.",
    notConfigured: "Il servizio di analisi delle immagini non è collegato al server.",
    network_error: "Problema di connessione",
    authentication_error: "Chiave Gemini o autorizzazioni non valide",
    rate_limited: "È stato superato il limite gratuito di questo servizio",
    provider_unavailable: "Gemini è temporaneamente non disponibile",
    provider_error: "Gemini ha rifiutato la richiesta",
  },
  de: {
    modelLabel: "Verwendetes Modell",
    geminiLabel: "Gemini",
    groqLabel: "Groq",
    httpStatus: "HTTP",
    noHttpStatus: "keine Antwort",
    fallback: "Das primäre Bildmodell ist fehlgeschlagen; das Ersatzmodell wurde verwendet.",
    notConfigured: "Der Bildanalysedienst ist nicht mit dem Server verbunden.",
    network_error: "Verbindungsproblem",
    authentication_error: "Gemini-Schlüssel oder Berechtigungen sind ungültig",
    rate_limited: "Das kostenlose Kontingent dieses Dienstes ist ausgeschöpft",
    provider_unavailable: "Gemini ist vorübergehend nicht verfügbar",
    provider_error: "Gemini hat die Anfrage abgelehnt",
  },
  ru: {
    modelLabel: "Использованная модель",
    geminiLabel: "Gemini",
    groqLabel: "Groq",
    httpStatus: "HTTP",
    noHttpStatus: "нет ответа",
    fallback: "Основная модель анализа изображений не сработала; использована резервная.",
    notConfigured: "Сервис анализа изображений не подключен к серверу.",
    network_error: "Проблема соединения",
    authentication_error: "Неверный ключ Gemini или недостаточно прав",
    rate_limited: "Бесплатный лимит этого сервиса исчерпан",
    provider_unavailable: "Gemini временно недоступен",
    provider_error: "Gemini отклонил запрос",
  },
  ja: {
    modelLabel: "使用モデル",
    geminiLabel: "Gemini",
    groqLabel: "Groq",
    httpStatus: "HTTP",
    noHttpStatus: "応答なし",
    fallback: "メインの画像モデルが失敗したため、代替モデルを使用しました。",
    notConfigured: "画像分析サービスがサーバーに接続されていません。",
    network_error: "接続の問題",
    authentication_error: "Geminiキーまたは権限が無効です",
    rate_limited: "このサービスの無料利用上限に達しました",
    provider_unavailable: "Geminiは一時的に利用できません",
    provider_error: "Geminiがリクエストを拒否しました",
  },
  zh: {
    modelLabel: "使用的模型",
    geminiLabel: "Gemini",
    groqLabel: "Groq",
    httpStatus: "HTTP",
    noHttpStatus: "无响应",
    fallback: "主视觉模型失败，已使用备用模型。",
    notConfigured: "图像分析服务尚未连接到服务器。",
    network_error: "连接问题",
    authentication_error: "Gemini 密钥或权限无效",
    rate_limited: "已超出此服务的免费请求额度",
    provider_unavailable: "Gemini 暂时不可用",
    provider_error: "Gemini 拒绝了此请求",
  },
} as const;

export const scannerWikipediaCopy = {
  ar: "تعذر الوصول لويكيبيديا كفهرس بحث دلوقتي؛ ده مش معناه إن المصادر المؤسسية غير متاحة.",
  en: "Wikipedia search is temporarily unavailable; institutional sources may still be available.",
  fr: "La recherche Wikipédia est temporairement indisponible ; des sources institutionnelles peuvent rester accessibles.",
  es: "La búsqueda de Wikipedia no está disponible temporalmente; aún puede haber fuentes institucionales.",
  it: "La ricerca su Wikipedia non è disponibile; potrebbero esserci comunque fonti istituzionali.",
  de: "Die Wikipedia-Suche ist vorübergehend nicht verfügbar; institutionelle Quellen können dennoch verfügbar sein.",
  ru: "Поиск в Википедии временно недоступен; институциональные источники могут быть доступны.",
  ja: "Wikipedia検索は一時的に利用できませんが、機関の資料は利用できる場合があります。",
  zh: "维基百科搜索暂时不可用，但仍可能找到机构来源。",
} as const;

export const scannerResultCopy = {
  ar: {
    title: "نتيجة تحليل الصورة",
    references: "نتائج البحث والمراجع",
    showReferences: "عرض المصادر عند الحاجة",
  },
  en: {
    title: "Image analysis result",
    references: "Search results and references",
    showReferences: "Show sources if needed",
  },
  fr: {
    title: "Résultat de l’analyse de l’image",
    references: "Résultats de recherche et références",
    showReferences: "Afficher les sources si nécessaire",
  },
  es: {
    title: "Resultado del análisis de imagen",
    references: "Resultados de búsqueda y referencias",
    showReferences: "Mostrar fuentes si es necesario",
  },
  it: {
    title: "Risultato dell’analisi dell’immagine",
    references: "Risultati di ricerca e riferimenti",
    showReferences: "Mostra le fonti se necessario",
  },
  de: {
    title: "Ergebnis der Bildanalyse",
    references: "Suchergebnisse und Quellen",
    showReferences: "Quellen bei Bedarf anzeigen",
  },
  ru: {
    title: "Результат анализа изображения",
    references: "Результаты поиска и источники",
    showReferences: "Показать источники при необходимости",
  },
  ja: {
    title: "画像分析の結果",
    references: "検索結果と参考資料",
    showReferences: "必要に応じて出典を表示",
  },
  zh: {
    title: "图像分析结果",
    references: "搜索结果和参考资料",
    showReferences: "按需显示来源",
  },
} as const;

export const scannerCopy = {
  ar: {
    confidenceTitle: "درجة الثقة التقديرية لكل معلومة",
    confidenceIdentity: "التعرّف على القطعة",
    confidencePlace: "تحديد المكان",
    confidencePeriod: "تحديد العصر",
    confidenceInscription: "قراءة النقش",
    confidenceTranslation: "ترجمة النقش",
    confidenceHigh: "مرتفعة",
    confidenceMedium: "متوسطة",
    confidenceLow: "منخفضة",
    confidenceUnavailable: "غير متاحة",
    placeUnconfirmed: "الموقع غير مؤكد بدقة؛ مفيش مطابقة بصرية مرجعية موثوقة للصورة.",
    referenceDisclaimer:
      "المصادر المؤسسية ونتائج البحث مرتبطة بكلمات الصورة، لكنها لا تؤكد أن الصورة للقطعة نفسها.",
    institutionalSource: "مصدر مؤسسي مرتبط بكلمات البحث",
    noSources: "لم نعثر على مراجع مناسبة. نتيجة النموذج تظل تخمينًا أوليًا غير موثق.",
  },
  en: {
    confidenceTitle: "Estimated confidence by detail",
    confidenceIdentity: "Artifact identification",
    confidencePlace: "Place identification",
    confidencePeriod: "Period identification",
    confidenceInscription: "Inscription reading",
    confidenceTranslation: "Inscription translation",
    confidenceHigh: "High",
    confidenceMedium: "Medium",
    confidenceLow: "Low",
    confidenceUnavailable: "Unavailable",
    placeUnconfirmed:
      "The location is uncertain; no reliable visual reference match is available for this image.",
    referenceDisclaimer:
      "Institutional sources and search results are related to the image's search terms; they do not confirm the image shows that artifact.",
    institutionalSource: "Institutional source related to the search terms",
    noSources:
      "No relevant references were found. The model's result remains an unverified initial guess.",
  },
  fr: {
    confidenceTitle: "Niveau de confiance estimé par détail",
    confidenceIdentity: "Identification de l’objet",
    confidencePlace: "Identification du lieu",
    confidencePeriod: "Identification de la période",
    confidenceInscription: "Lecture de l’inscription",
    confidenceTranslation: "Traduction de l’inscription",
    confidenceHigh: "Élevé",
    confidenceMedium: "Moyen",
    confidenceLow: "Faible",
    confidenceUnavailable: "Indisponible",
    placeUnconfirmed:
      "Le lieu est incertain ; aucune correspondance visuelle de référence fiable n’est disponible pour cette image.",
    referenceDisclaimer:
      "Les sources institutionnelles et résultats de recherche sont liés aux termes de l’image, sans confirmer qu’elle montre cet objet.",
    institutionalSource: "Source institutionnelle liée aux termes recherchés",
    noSources:
      "Aucune référence pertinente n’a été trouvée. Le résultat reste une hypothèse non vérifiée.",
  },
  es: {
    confidenceTitle: "Confianza estimada por dato",
    confidenceIdentity: "Identificación del objeto",
    confidencePlace: "Identificación del lugar",
    confidencePeriod: "Identificación del período",
    confidenceInscription: "Lectura de la inscripción",
    confidenceTranslation: "Traducción de la inscripción",
    confidenceHigh: "Alta",
    confidenceMedium: "Media",
    confidenceLow: "Baja",
    confidenceUnavailable: "No disponible",
    placeUnconfirmed:
      "El lugar no está confirmado; no hay una comparación visual de referencia fiable para esta imagen.",
    referenceDisclaimer:
      "Las fuentes institucionales y los resultados de búsqueda se relacionan con los términos de la imagen, pero no confirman que sea ese objeto.",
    institutionalSource: "Fuente institucional relacionada con los términos de búsqueda",
    noSources:
      "No se encontraron referencias pertinentes. El resultado sigue siendo una hipótesis sin verificar.",
  },
  it: {
    confidenceTitle: "Attendibilità stimata per dettaglio",
    confidenceIdentity: "Identificazione del reperto",
    confidencePlace: "Identificazione del luogo",
    confidencePeriod: "Identificazione del periodo",
    confidenceInscription: "Lettura dell’iscrizione",
    confidenceTranslation: "Traduzione dell’iscrizione",
    confidenceHigh: "Alta",
    confidenceMedium: "Media",
    confidenceLow: "Bassa",
    confidenceUnavailable: "Non disponibile",
    placeUnconfirmed:
      "Il luogo non è confermato; non è disponibile un confronto visivo di riferimento affidabile per questa immagine.",
    referenceDisclaimer:
      "Le fonti istituzionali e i risultati di ricerca sono collegati ai termini dell’immagine, ma non ne confermano la corrispondenza.",
    institutionalSource: "Fonte istituzionale collegata ai termini di ricerca",
    noSources:
      "Non sono stati trovati riferimenti pertinenti. Il risultato resta un’ipotesi non verificata.",
  },
  de: {
    confidenceTitle: "Geschätzte Sicherheit je Angabe",
    confidenceIdentity: "Objektidentifikation",
    confidencePlace: "Ortsbestimmung",
    confidencePeriod: "Zeitliche Einordnung",
    confidenceInscription: "Lesung der Inschrift",
    confidenceTranslation: "Übersetzung der Inschrift",
    confidenceHigh: "Hoch",
    confidenceMedium: "Mittel",
    confidenceLow: "Niedrig",
    confidenceUnavailable: "Nicht verfügbar",
    placeUnconfirmed:
      "Der Ort ist nicht bestätigt; für dieses Bild liegt kein zuverlässiger visueller Referenzabgleich vor.",
    referenceDisclaimer:
      "Institutionelle Quellen und Suchergebnisse beziehen sich auf die Suchbegriffe des Bildes, bestätigen aber keine visuelle Übereinstimmung.",
    institutionalSource: "Institutionelle Quelle zu den Suchbegriffen",
    noSources:
      "Es wurden keine passenden Quellen gefunden. Das Ergebnis bleibt eine ungeprüfte Vermutung.",
  },
  ru: {
    confidenceTitle: "Оценка уверенности по каждому пункту",
    confidenceIdentity: "Определение предмета",
    confidencePlace: "Определение места",
    confidencePeriod: "Определение периода",
    confidenceInscription: "Чтение надписи",
    confidenceTranslation: "Перевод надписи",
    confidenceHigh: "Высокая",
    confidenceMedium: "Средняя",
    confidenceLow: "Низкая",
    confidenceUnavailable: "Нет данных",
    placeUnconfirmed:
      "Место не подтверждено; для этого изображения нет надежного визуального сравнения с эталоном.",
    referenceDisclaimer:
      "Источники учреждений и результаты поиска связаны с поисковыми словами изображения, но не подтверждают совпадение.",
    institutionalSource: "Источник учреждения по поисковым словам",
    noSources: "Подходящие источники не найдены. Результат остается непроверенным предположением.",
  },
  ja: {
    confidenceTitle: "項目ごとの推定信頼度",
    confidenceIdentity: "遺物の特定",
    confidencePlace: "場所の特定",
    confidencePeriod: "時代の特定",
    confidenceInscription: "碑文の解読",
    confidenceTranslation: "碑文の翻訳",
    confidenceHigh: "高",
    confidenceMedium: "中",
    confidenceLow: "低",
    confidenceUnavailable: "未評価",
    placeUnconfirmed: "場所は未確認です。この画像に対する信頼できる視覚的な照合結果はありません。",
    referenceDisclaimer:
      "機関の情報や検索結果は画像の検索語に関連するもので、写っている品との一致を確認するものではありません。",
    institutionalSource: "検索語に関連する機関の情報",
    noSources: "関連する資料は見つかりませんでした。モデルの結果は未検証の初期推定です。",
  },
  zh: {
    confidenceTitle: "各项信息的估计置信度",
    confidenceIdentity: "文物识别",
    confidencePlace: "地点识别",
    confidencePeriod: "年代判断",
    confidenceInscription: "铭文识读",
    confidenceTranslation: "铭文翻译",
    confidenceHigh: "高",
    confidenceMedium: "中",
    confidenceLow: "低",
    confidenceUnavailable: "暂无",
    placeUnconfirmed: "地点尚未确认；此图像没有可靠的视觉参考匹配结果。",
    referenceDisclaimer: "机构资料和搜索结果与图像搜索词相关，但不能确认图中就是该文物。",
    institutionalSource: "与搜索词相关的机构来源",
    noSources: "未找到相关参考资料。模型结果仍是未经核实的初步猜测。",
  },
} as const;

export interface Mood {
  feel: string;
  fact: string;
  assumption: string;
  questions: [string, string];
  step: string;
}

export interface Dict {
  nav: { features: string; how: string };
  meta: { language: string };
  badge: string;
  title: string;
  subtitle: string;
  ctaPrimary: string;
  ctaSecondary: string;
  heroNote: string;
  privacy: string;
  always: string;
  languages: string;
  auth: {
    title: string;
    username: string;
    password: string;
    submit: string;
    invalid: string;
    unavailable: string;
    signingIn: string;
    logout: string;
  };
  chat: {
    title: string;
    badge: string;
    user1: string;
    ai1: string;
    user2: string;
    ai2: string;
    input: string;
    send: string;
    error: string;
    welcome: string;
    disclosure: string;
    privacyLink: string;
    home: string;
    conversations: string;
    newConversation: string;
    noConversations: string;
    stop: string;
    setupNeeded: string;
    rateLimited: string;
    invalidKey: string;
    modelUnavailable: string;
    invalidRequest: string;
    providerError: string;
    heritageSearchFailed: string;
    sourcesLabel: string;
    incompleteResponse: string;
    timeout: string;
    sending: string;
  };
  reflection: {
    demoNote: string;
    experiencing: string;
    facts: string;
    questions: string;
    step: string;
    moods: Record<Category, Mood>;
  };
  features: {
    title: string;
    subtitle: string;
    items: { title: string; desc: string }[];
  };
  how: { title: string; subtitle: string; steps: { title: string; desc: string }[] };
  principles: { title: string; items: string[] };
  cta: { title: string; text: string; button: string; note: string };
  footer: { tagline: string; note: string; rights: string };
  projectAdmin: { label: string; admin: string; created: string };
}

export const chatQuickReplies: Partial<
  Record<
    LangCode,
    {
      greeting: string;
      greetingWithOptionalName: string;
      checkIn: string;
      checkInFeminine: string;
      checkInWithName: string;
      userFeelsWell: string;
      userFeelsWellFeminine: string;
      userFeelsWellAndChecksIn: string;
      userFeelsWellAndChecksInFeminine: string;
      nameAcknowledgement: string;
      nameIntroduction: string;
      assistantName: string;
      assistantFatigueAnswer: string;
      assistantFatigueAnswerWithName: string;
      userIntroducedName: string;
      problemOpening: string;
      relationshipOpening: string;
      crushOpening: string;
      crushOpeningWithLocation: string;
      crushLocationCorrection: string;
      peaceGreeting: string;
      blackPsychology: string;
      askIfTheyTalk: string;
      firstApproachTip: string;
      crushGiftAdvice: string;
      unansweredMessage: string;
    }
  >
> = {
  ar: {
    greeting: "أهلًا!",
    greetingWithOptionalName: "أهلًا، الاسم اختياري. ممكن أعرف اسمك؟",
    checkIn: "أنا تمام، وإنت؟",
    checkInFeminine: "أنا تمام، وإنتِ؟",
    checkInWithName: "أهلًا يا {name}، أنا تمام الحمد لله 😊 وإنت أخبارك إيه؟",
    userFeelsWell: "حلو، الحمد لله إنك بخير.",
    userFeelsWellFeminine: "حلو إنك بخير.",
    userFeelsWellAndChecksIn: "أنا تمام، شكرًا! تحب نتكلم في إيه؟",
    userFeelsWellAndChecksInFeminine: "أنا تمام، شكرًا! تحبي نتكلم في إيه؟",
    nameAcknowledgement: "تمام، أشكر إنك شاركتني اسمك.",
    nameIntroduction: "يسعدني تعرفي عليّ يا {name}.",
    assistantName: "أنا اختبرها. نبدأ بإيه؟",
    assistantFatigueAnswer: "أنا اختبرها، ومش بتعب زي البشر.",
    assistantFatigueAnswerWithName: "أهلًا يا {name} 😊 أنا اختبرها، ومش بتعب زي البشر.",
    userIntroducedName: "أهلًا يا {name}. إيه اللي شاغل بالك؟",
    problemOpening: "احكيلي براحتك، إيه اللي حصل؟",
    relationshipOpening: "حلو، إيه اللي جمعكم؟",
    crushOpening: "الإعجاب ساعات بيخلّي الواحد يحتار. تعرفوا بعض منين؟",
    crushOpeningWithLocation: "طالما بتتقابلوا في الكلية، بتتكلموا مع بعض ولا لسه؟",
    crushLocationCorrection: "صح، كان واضح من كلامك إنكم في الكلية. بتتكلموا مع بعض ولا لسه؟",
    peaceGreeting: "وعليكم السلام! أخبارك إيه؟",
    blackPsychology:
      "علم النفس الأسود تعبير منتشر على الإنترنت، لكنه مش فرع علمي مستقل أو تخصص أكاديمي معترف به. غالبًا بيقصدوا بيه أساليب تلاعب أو تأثير غير أخلاقي. المهم فهم العلامات للحماية، مش لاستغلال خوف أو ضعف أي حد.",
    askIfTheyTalk: "بتتكلموا مع بعض دلوقتي ولا لسه؟",
    firstApproachTip:
      "ممكن تكون البداية بتحية بسيطة في وقت مناسب، وبعدها نشوف هل الطرف التاني بيكمل الكلام ومرتاح للتواصل. لو الردود قصيرة ومش بيكمل الحوار، الأفضل نسيب له مساحة من غير إلحاح.",
    crushGiftAdvice:
      "مش ممكن نعرف هتقبلها ولا لأ. وبما إن كلامكم قليل، الهدية ممكن تحرجها أو تحسسها إن فيه انتظار لرد. الأحسن تزودوا الكلام الأول، ولو الهدية بقت مناسبة بعدين، تكون بسيطة ومن غير ضغط.",
    unansweredMessage:
      "ممكن يكون الطرف التاني مشغول، أو مش عارف يرد، أو مش حابب يكمل الكلام؛ عدم الرد لوحده مش كفاية نعرف السبب. الأفضل تجنب إرسال رسائل ورا بعض. لو الموضوع مهم، ممكن تبعت رسالة واحدة هادية بعد وقت مناسب، وبعدها تكون فيه مساحة للطرف التاني.",
  },
};

const baseTranslations = {
  ar: {
    nav: { features: "المميزات", how: "كيف تعمل" },
    meta: { language: "اختيار اللغة" },
    badge: "مساحتك الآمنة للتفكير والتعبير",
    title: "اتكلم براحتك... هنا هتلاقي مساحة تفهم فيها نفسك.",
    subtitle:
      "مساحة ذكية تساعدك تفهم مشاعرك، وترتب أفكارك، وتشوف المواقف من زوايا مختلفة، وتاخد قراراتك بوعي أكبر — من غير أحكام، وبالطريقة اللي تناسبك.",
    ctaPrimary: "ابدأ محادثة",
    heroNote: "مساحتك للكلام، والفهم، واكتشاف حلول جديدة.",
    ctaSecondary: "كيف تعمل؟",
    privacy: "الموقع لا يحفظ المحادثة",
    always: "متاح 24/7",
    languages: "6 لغات",
    auth: {
      title: "تسجيل الدخول",
      username: "اسم المستخدم",
      password: "كلمة المرور",
      submit: "تسجيل الدخول",
      invalid: "اسم المستخدم أو كلمة المرور غير صحيحة.",
      unavailable: "لم يتم إعداد تسجيل الدخول بعد. راجع إعداد الخادم الآمن.",
      signingIn: "جاري تسجيل الدخول...",
      logout: "تسجيل الخروج",
    },
    chat: {
      title: "اتكلم براحتك... هنا هتلاقي مساحة تفهم فيها نفسك.",
      badge: "AI Assistant",
      home: "الصفحة الرئيسية",
      conversations: "محادثاتي",
      newConversation: "محادثة جديدة",
      noConversations: "ابدأ محادثة جديدة",
      stop: "إيقاف الرد",
      user1: "لا أستطيع أن أقرر، ماذا أفعل؟",
      ai1: "خلينا نفهم الوضع خطوة بخطوة ونشوف الخيارات بهدوء.",
      user2: "أشعر بالحيرة وأحتاج مساحة أفكر فيها بصراحة.",
      ai2: "أنا هنا معاك. احكيلي أكتر عن اللي بيدور في بالك، من غير أحكام.",
      input: "اكتب ما يدور في ذهنك…",
      send: "إرسال",
      error: "حصلت مشكلة في الاتصال. جرّب تاني.",
      welcome: "أهلًا بك. احكيلي إيه اللي شاغل بالك، ونفكر فيه سوا.",
      disclosure:
        "محادثتك تُرسل إلى مزود الذكاء الاصطناعي المحلي على جهازك دون إرسالها إلى خدمة خارجية.",
      privacyLink: "AI Assistant",
      setupNeeded: "المساعد غير متصل حاليًا. تحقق من إعدادات مزود الذكاء الاصطناعي المحلي وشغّله.",
      rateLimited: "الخادم مشغول حاليًا. حاول مرة أخرى بعد قليل.",
      invalidKey: "إعدادات الاتصال غير صالحة حاليًا.",
      modelUnavailable: "النموذج المستخدم غير متاح حاليًا. تحقق من إعداداته على جهازك.",
      invalidRequest: "تعذر إرسال الطلب إلى المساعد الذكي. تحقق من إعدادات المزود.",
      providerError:
        "حصلت مشكلة مؤقتة في الاتصال بالمساعد. رسالتك لسه موجودة في مربع الكتابة؛ جرّبي الإرسال تاني بعد لحظة.",
      heritageSearchFailed:
        "ماقدرتش أوصل لمصادر موثوقة كفاية للإجابة دلوقتي. جرّبي تاني بعد شوية أو غيّري صياغة السؤال.",
      sourcesLabel: "المصادر",
      incompleteResponse:
        "الرد ماكملش دلوقتي. سؤالك لسه مكتوب في مربع الرسالة؛ جرّبي الإرسال تاني من غير ما تعيدي كتابته.",
      timeout: "المساعد اتأخر في الرد. جرّب تاني بعد شوية.",
      sending: "جاري التفكير...",
    },
    reflection: {
      demoNote: "نقاط تأمل تساعدك على ترتيب أفكارك بهدوء.",
      experiencing: "ما يبدو أنك تمر به",
      facts: "الحقائق التي يمكنك الاعتماد عليها",
      questions: "أسئلة للتأمل",
      step: "خطوة صغيرة للمضي قدمًا",
      moods: {
        decision: {
          feel: "أي شعور مصاحب لك عند التفكير في القرار؟",
          fact: "ما الذي حدث فعلًا؟",
          assumption: "ما الافتراض الذي تعتمد عليه؟",
          questions: ["ما الخيارات المتاحة أمامك؟", "ما نتيجة كل خيار على المدى القريب؟"],
          step: "اختر خطوة صغيرة تساعدك على توضيح القرار.",
        },
        anxiety: {
          feel: "ما الذي تشعر به في جسدك الآن؟",
          fact: "ما الحدث الذي أثار القلق؟",
          assumption: "ما أسوأ تفسير خطر على بالك؟",
          questions: ["ماذا يمكنك تأكيده بالأدلة؟", "ما أقل خطوة ستجعلك أكثر هدوءًا؟"],
          step: "خصّص دقيقة واحدة للتنفس ببطء ثم حدّد أول إجراء.",
        },
        sadness: {
          feel: "كيف تصف الحزن الذي تشعر به؟",
          fact: "ما الموقف الذي دفعك لهذا الشعور؟",
          assumption: "ما الشيء الذي تستنتجه عن نفسك؟",
          questions: ["ما الذي تحتاج إليه الآن؟", "من يمكنه تقديم الدعم لك؟"],
          step: "اتصل بشخص تثق به أو خصص وقتًا لرعاية نفسك.",
        },
        anger: {
          feel: "أين يظهر الغضب بداخلك؟",
          fact: "ما الذي حدث وما الذي انتهاك؟",
          assumption: "ما الحدود التي شعرت بأنها تجاوزت؟",
          questions: ["ما الحد الذي يحتاج إلى حماية؟", "كيف تعبر عن غضبك دون إيذاء؟"],
          step: "ابتعد قليلًا، ثم عبّر عن احتياجك بوضوح وهدوء.",
        },
        loneliness: {
          feel: "كيف تشعر الوحدة في هذه اللحظة؟",
          fact: "ما الموقف الذي جعلك تشعر بالانفصال؟",
          assumption: "ما الاعتقاد الذي يحملك على الانسحاب؟",
          questions: ["من تشعر بالأمان عنده؟", "ما تواصل صغير يمكن أن تبدأ به؟"],
          step: "أرسل رسالة بسيطة لشخص موثوق.",
        },
        overwhelm: {
          feel: "ما الإحساس الذي يسيطر عليك الآن؟",
          fact: "ما المهمات أو المواقف المتراكمة؟",
          assumption: "ما الذي تحاول إنجازه دفعة واحدة؟",
          questions: ["ما أهم شيء يحتاج اهتمامًا الآن؟", "ما الذي يمكن تأجيله أو تفويضه؟"],
          step: "اختر مهمة واحدة يمكن إتمامها في عشرة دقائق.",
        },
        positive: {
          feel: "ما الشعور الإيجابي الذي تلاحظه؟",
          fact: "ما الذي ساهم في ظهور هذا الشعور؟",
          assumption: "ما الذي تتعلمه عن احتياجاتك؟",
          questions: ["كيف يمكن تكرار هذا الموقف؟", "ما الذي تشعر بالامتنان له؟"],
          step: "سجّل سبب شعورك الجيد وشارك اللحظة مع شخص تحبه.",
        },
        general: {
          feel: "ما الشعور الذي تريد تسميته؟",
          fact: "ما الواقعة التي تراه مرتبطًا بها؟",
          assumption: "ما الفكرة التي قد تحتاج إلى مراجعة؟",
          questions: ["ما الذي تعرفه يقينًا؟", "ما الخطوة التي يمكن أن تساعدك؟"],
          step: "حدد خطوة صغيرة واقعية يمكنك تجربتها اليوم.",
        },
      },
    },
    features: {
      title: "مساحة تفهمك",
      subtitle: "خطوات بسيطة تساعدك على رؤية نفسك ومواقفك بوضوح أكبر.",
      items: [
        {
          title: "افهم مشاعرك",
          desc: "مساحة للتعبير عن اللي جواك.",
        },
        {
          title: "شوف الصورة أوضح",
          desc: "ساعد نفسك على فهم المواقف من زوايا مختلفة.",
        },
        {
          title: "اختار خطوتك",
          desc: "فكّر في الخيارات المتاحة واتخذ قرارك بوعي.",
        },
      ],
    },
    how: {
      title: "كيف تعمل اختبرها؟",
      subtitle: "مساحة بسيطة تساعدك تمر بخطوات واضحة من التعبير إلى القرار.",
      steps: [
        { title: "احكي اللي في بالك", desc: "اكتب مشاعرك وفكرك بحرية ومن غير أحكام." },
        { title: "افهم من زوايا مختلفة", desc: "استكشف الموقف وتأكد من الحقائق والافتراضات." },
        { title: "خذ خطوة مناسبة", desc: "اختر خطوة صغيرة يمكنك تنفيذها بوعي وثقة." },
      ],
    },
    principles: {
      title: "بمساحة آمنة ومن غير أحكام",
      items: ["تعبير حر", "فهم أكبر لنفسك", "خطوات عملية"],
    },
    cta: {
      title: "جاهز تبدأ؟",
      text: "اكتب اللي شاغلك دلوقتي وخُد أول خطوة نحو وضوح أكبر.",
      button: "ابدأ محادثة",
      note: "مساحتك للكلام والفهم واكتشاف حلول جديدة.",
    },
    footer: {
      tagline: "اختبرها، مساحة لفهم نفسك واتخاذ قرارك بوعي.",
      note: "المحادثات مصممة للدعم والتأمل وليست بديلًا للمتخصصين.",
      rights: "جميع الحقوق محفوظة.",
    },
    projectAdmin: { label: "إدارة المشروع", admin: "Admin:", created: "Created & Developed by" },
  },

  en: {
    nav: { features: "Features", how: "How it works" },
    meta: { language: "Change language" },
    badge: "Your safe space to think and feel",
    title: "Talk it through. Feel understood. Decide with clarity.",
    subtitle:
      "Ekhtaberha is an AI companion for emotional support, self-reflection, and better decisions — in your language, at your pace.",
    ctaPrimary: "Start a conversation",
    heroNote: "A space for conversation, understanding, and new possibilities.",
    ctaSecondary: "See how it works",
    privacy: "Not saved by this site",
    always: "Here 24/7",
    languages: "6 languages",
    auth: {
      title: "Sign in",
      username: "Username",
      password: "Password",
      submit: "Sign in",
      invalid: "The username or password is incorrect.",
      unavailable: "Login has not been configured yet. Check the secure server settings.",
      signingIn: "Signing in...",
      logout: "Log out",
    },
    chat: {
      title: "A gentle conversation",
      badge: "AI Assistant",
      home: "Home",
      conversations: "Conversations",
      newConversation: "New conversation",
      noConversations: "No conversations yet.",
      stop: "Stop response",
      user1: "I can't decide whether to take the new job or stay.",
      ai1: "That sounds like a heavy decision. What matters most to you right now — growth, security, or something else?",
      user2: "Honestly… I want room to grow, but I'm scared of failing.",
      ai2: "It's brave to name that fear. Let's look at what failing would actually look like — and what you'd still have either way.",
      input: "Write what's on your mind…",
      send: "Send",
      error: "There was a connection problem. Please try again.",
      welcome: "Hi. Tell me what's on your mind, and we can think it through together.",
      disclosure:
        "Your messages are sent to Ollama running locally on your device. No external API key is required, and the Qwen2.5:14B model stays on your machine.",
      privacyLink: "AI Assistant",
      setupNeeded:
        "Chat is not connected. Install Ollama, run ollama run qwen2.5:14b, and restart the server.",
      rateLimited:
        "The local server is temporarily unavailable or reached a limit. Please wait a moment and try again.",
      invalidKey: "The Ollama setup is not valid. Check the local server and model name.",
      modelUnavailable:
        "The Qwen2.5:14B model is not available locally. Run ollama run qwen2.5:14b and try again.",
      invalidRequest:
        "Ollama rejected the request format. Check the model name and server settings.",
      providerError:
        "Ollama rejected the request or encountered an error. Check the local server and try again.",
      heritageSearchFailed:
        "I couldn't reach enough trusted sources to answer right now. Please try again later or rephrase the question.",
      sourcesLabel: "Sources",
      incompleteResponse:
        "The reply couldn't finish just now. Your message is still in the input box; try sending it again shortly without retyping it.",
      timeout: "Ollama took too long to respond. Please try again shortly.",
      sending: "Thinking...",
    },
    reflection: {
      demoNote: "Rule-based demo response — not a real AI",
      experiencing: "What you seem to be experiencing",
      facts: "Facts vs. assumptions",
      questions: "Gentle questions",
      step: "One small practical step",
      moods: {
        decision: {
          feel: "You seem to be standing at a crossroads, carrying an important choice.",
          fact: "Fact: you wrote that you're torn between two or more options.",
          assumption:
            "Assumption to check: that everything has to be resolved in one single decision right now.",
          questions: [
            "If fear weren't a factor, what would you choose?",
            "What makes each option hard for you?",
          ],
          step: "Draw two columns — what you gain and what you lose with each option — leave it overnight, then reread it.",
        },
        anxiety: {
          feel: "Anxiety seems to be taking up space in your mind right now.",
          fact: "Fact: you wrote that you feel afraid or anxious about something specific.",
          assumption: "Assumption to check: that the worst-case scenario is the most likely one.",
          questions: [
            "What's the first sentence that appears when the worry starts?",
            "If the worst happened, what would you actually do?",
          ],
          step: "Take three slow breaths (one every six seconds), then write the fear in a single sentence.",
        },
        sadness: {
          feel: "Your heart sounds heavy today, and something seems worth grieving.",
          fact: "Fact: you wrote that you feel sad or low.",
          assumption: "Assumption to check: that this feeling will stay exactly as it is forever.",
          questions: [
            "Who or what is this sadness protecting?",
            "What helped you feel even slightly better on a similar day before?",
          ],
          step: "Choose one small comfort today: a warm drink, a short walk, or a message to someone safe.",
        },
        anger: {
          feel: "There seems to be anger inside you trying to say something important.",
          fact: "Fact: you wrote that you feel angry or worked up about a situation.",
          assumption: "Assumption to check: that the other person acted badly on purpose.",
          questions: [
            "What boundary did this anger signal was crossed?",
            "What would need to happen for you to calm down?",
          ],
          step: "Write the angry message you'll never send, then delete it — anger quiets down when it's heard.",
        },
        loneliness: {
          feel: "You seem to feel alone, even with people around.",
          fact: "Fact: you wrote that you feel lonely or unheard.",
          assumption: "Assumption to check: that no one cares or is able to be with you.",
          questions: [
            "Who is the one person you'd feel safe reaching out to today?",
            "What kind of closeness fits you: talking, quiet presence, or doing something together?",
          ],
          step: 'Send a one-line message to someone you trust: "Hey, you crossed my mind."',
        },
        overwhelm: {
          feel: "It sounds like many burdens are piling up at the same time.",
          fact: "Fact: you wrote that you're tired, exhausted, or under pressure.",
          assumption: "Assumption to check: that everything must be done today, all at once.",
          questions: [
            "Which single item, if done, would lighten most of the load?",
            "What could be postponed without guilt?",
          ],
          step: "Brain-dump everything into one list, then pick only three items for today.",
        },
        positive: {
          feel: "There seems to be something genuinely good in your day worth pausing on.",
          fact: "Fact: you wrote that you feel happy, grateful, or proud.",
          assumption:
            "Assumption to check: that joy matters less than our worries — it deserves to be lived fully too.",
          questions: [
            "What made this feeling possible?",
            "How could you save this moment for a harder day?",
          ],
          step: "Write in one sentence why you're smiling, and keep it somewhere you can return to.",
        },
        general: {
          feel: "You seem to be carrying something and want to understand it calmly.",
          fact: "Fact: these are the words you just wrote.",
          assumption:
            "Assumption to check: that the meaning of what you feel is already clear — sometimes it needs to be named first.",
          questions: [
            "If these words had a color, what color would they be today?",
            "Which smallest detail of this feels most important?",
          ],
          step: 'Finish the sentence: "What I really want right now is…" and type it in the box.',
        },
      },
    },
    features: {
      title: "Three ways Ekhtaberha helps",
      subtitle: "One companion, three kinds of support — from a heavy heart to a clear mind.",
      items: [
        {
          title: "Emotional support",
          desc: "Vent freely and feel heard. The assistant listens without judgment and helps you name what you feel.",
        },
        {
          title: "Self-reflection",
          desc: "Guided questions and gentle prompts that help you understand your patterns, values, and needs.",
        },
        {
          title: "Decision clarity",
          desc: "Weigh options side by side, explore trade-offs, and reach choices that align with who you are.",
        },
      ],
    },
    how: {
      title: "How it works",
      subtitle: "Three gentle steps, in whichever language feels most natural.",
      steps: [
        {
          title: "Share what's on your mind",
          desc: "Type in any of the six languages — a worry, a feeling, or a decision you're facing.",
        },
        {
          title: "Explore with gentle questions",
          desc: "The assistant calmly reflects your thoughts back and asks what matters most to you.",
        },
        {
          title: "Leave with clarity",
          desc: "End every conversation with words for how you feel and a next step you trust.",
        },
      ],
    },
    principles: {
      title: "Built on care",
      items: [
        "No judgment — every feeling is welcome.",
        "This site does not save your chat after you close the page.",
        "Support, not diagnosis — always human-first.",
      ],
    },
    cta: {
      title: "Ready to test it — Ekhtaberha?",
      text: "The name says it all: try it, and feel what it's like to be truly heard.",
      button: "Try Ekhtaberha now",
      note: "Free to try آ· No account needed",
    },
    footer: {
      tagline: "An AI companion for your emotional well-being.",
      note: "Ekhtaberha offers supportive conversation, not medical advice. In a crisis, please contact your local emergency services.",
      rights: "آ© 2026 Ekhtaberha. All rights reserved.",
    },
    projectAdmin: {
      label: "Project administration",
      admin: "Admin:",
      created: "Created & Developed by",
    },
  },

  fr: {
    nav: { features: "Fonctionnalitأ©s", how: "Comment أ§a marche" },
    meta: { language: "Changer de langue" },
    badge: "Votre espace sأ»r pour penser et ressentir",
    title: "Parlez-en. Sentez-vous compris. Dأ©cidez avec clartأ©.",
    subtitle:
      "Ekhtaberha est un compagnon IA pour le soutien أ©motionnel, l'introspection et de meilleures dأ©cisions — dans votre langue, أ  votre rythme.",
    ctaPrimary: "Commencer une conversation",
    heroNote: "Votre espace pour parler, comprendre et découvrir de nouvelles solutions.",
    ctaSecondary: "Comment أ§a marche",
    privacy: "Non conservأ© sur ce site",
    always: "Disponible 24h/24",
    languages: "6 langues",
    auth: {
      title: "Connexion",
      username: "Nom dâ€™utilisateur",
      password: "Mot de passe",
      submit: "Se connecter",
      invalid: "Le nom dâ€™utilisateur ou le mot de passe est incorrect.",
      unavailable:
        "La connexion nâ€™est pas encore configurأ©e. Vأ©rifiez les paramأ¨tres sأ©curisأ©s du serveur.",
      signingIn: "Connexion...",
      logout: "Se dأ©connecter",
    },
    chat: {
      title: "Une conversation bienveillante",
      badge: "AI Assistant",
      home: "Accueil",
      conversations: "Mes conversations",
      newConversation: "Nouvelle conversation",
      noConversations: "Aucune conversation pour le moment.",
      stop: "Arrأھter la rأ©ponse",
      user1: "Je n'arrive pas أ  choisir : le nouveau poste ou rester ?",
      ai1: "Cela semble أھtre une dأ©cision lourde. Qu'est-ce qui compte le plus pour vous — أ©voluer, la sأ©curitأ©, ou autre chose ?",
      user2: "Honnأھtement… j'ai envie de grandir, mais j'ai peur d'أ©chouer.",
      ai2: "Il est courageux de nommer cette peur. Voyons ce que « أ©chouer آ» signifierait vraiment — et ce qu'il vous resterait dans les deux cas.",
      input: "أ‰crivez ce que vous avez sur le cإ“ur…",
      send: "Envoyer",
      error: "Un problأ¨me de connexion est survenu. Rأ©essayez.",
      welcome: "Bonjour. Dites-moi ce qui vous prأ©occupe, et rأ©flأ©chissons-y ensemble.",
      disclosure:
        "Vos messages sont envoyأ©s أ  Ollama, qui tourne localement sur votre appareil. Aucune clأ© API externe n'est requise, et le modأ¨le Qwen2.5:14B reste sur votre machine.",
      privacyLink: "AI Assistant",
      setupNeeded:
        "Le chat n'est pas connectأ©. Installez Ollama, exأ©cutez ollama run qwen2.5:14b, puis redأ©marrez le serveur.",
      rateLimited:
        "Le serveur local est temporairement indisponible ou a atteint une limite. Rأ©essayez dans un instant.",
      invalidKey:
        "La configuration Ollama n'est pas valide. Vأ©rifiez le serveur local et le nom du modأ¨le.",
      modelUnavailable:
        "Le modأ¨le Qwen2.5:14B n'est pas disponible localement. Exأ©cutez ollama run qwen2.5:14b puis rأ©essayez.",
      invalidRequest:
        "Ollama a refusأ© le format de la demande. Vأ©rifiez le nom du modأ¨le et la configuration du serveur.",
      providerError:
        "Ollama a refusأ© la demande ou rencontrأ© une erreur. Vأ©rifiez le serveur local et rأ©essayez.",
      heritageSearchFailed:
        "Impossible d'accأ©der أ  suffisamment de sources fiables pour rأ©pondre. Rأ©essayez plus tard ou reformulez la question.",
      sourcesLabel: "Sources",
      incompleteResponse:
        "La réponse n’a pas pu se terminer. Votre message est toujours dans le champ de saisie ; réessayez sans le retaper.",
      timeout: "Ollama a mis trop de temps أ  rأ©pondre. Rأ©essayez dans un instant.",
      sending: "Rأ©flexion en cours...",
    },
    reflection: {
      demoNote: "Rأ©ponse de dأ©monstration أ  base de rأ¨gles — pas une vraie IA",
      experiencing: "Ce que vous semblez traverser",
      facts: "Faits vs. hypothأ¨ses",
      questions: "Questions douces",
      step: "Un petit pas concret",
      moods: {
        decision: {
          feel: "Vous semblez أھtre أ  un carrefour, portant un choix important.",
          fact: "Fait : vous أ©crivez que vous hأ©sitez entre deux options ou plus.",
          assumption:
            "Hypothأ¨se أ  vأ©rifier : que tout doive أھtre rأ©glأ© en une seule dأ©cision maintenant.",
          questions: [
            "Si la peur n'existait pas, que choisiriez-vous ?",
            "Qu'est-ce qui rend chaque option difficile pour vous ?",
          ],
          step: "Tracez deux colonnes — ce que vous gagnez et ce que vous perdez avec chaque option — laissez reposer la nuit, puis relisez.",
        },
        anxiety: {
          feel: "L'anxiأ©tأ© semble occuper votre esprit en ce moment.",
          fact: "Fait : vous أ©crivez que vous ressentez de la peur ou de l'inquiأ©tude.",
          assumption: "Hypothأ¨se أ  vأ©rifier : que le pire scأ©nario soit le plus probable.",
          questions: [
            "Quelle est la premiأ¨re phrase qui apparaأ®t quand l'inquiأ©tude commence ?",
            "Si le pire arrivait, que feriez-vous concrأ¨tement ?",
          ],
          step: "Prenez trois respirations lentes (une toutes les six secondes), puis أ©crivez la peur en une seule phrase.",
        },
        sadness: {
          feel: "Votre cإ“ur semble lourd aujourd'hui, et quelque chose mأ©rite d'أھtre pleurأ©.",
          fact: "Fait : vous أ©crivez que vous vous sentez triste ou أ  plat.",
          assumption:
            "Hypothأ¨se أ  vأ©rifier : que ce sentiment restera exactement ainsi pour toujours.",
          questions: [
            "Qui ou quoi cette tristesse protأ¨ge-t-elle ?",
            "Qu'est-ce qui vous avait aidأ©, mأھme un peu, lors d'un jour semblable ?",
          ],
          step: "Choisissez un petit rأ©confort aujourd'hui : une boisson chaude, une courte marche, ou un message أ  une personne de confiance.",
        },
        anger: {
          feel: "De la colأ¨re semble أھtre en vous, essayant de dire quelque chose d'important.",
          fact: "Fait : vous أ©crivez que vous أھtes en colأ¨re ou agitأ© أ  propos d'une situation.",
          assumption: "Hypothأ¨se أ  vأ©rifier : que l'autre ait agi mal intentionnellement.",
          questions: [
            "Quelle limite cette colأ¨re signale-t-elle comme franchie ?",
            "Que devrait-il se passer pour que vous vous calmiez ?",
          ],
          step: "أ‰crivez le message fأ¢chأ© que vous n'enverrez jamais, puis effacez-le — la colأ¨re s'apaise quand elle est entendue.",
        },
        loneliness: {
          feel: "Vous semblez vous sentir seul, mأھme entourأ© de gens.",
          fact: "Fait : vous أ©crivez que vous vous sentez seul ou pas أ©coutأ©.",
          assumption:
            "Hypothأ¨se أ  vأ©rifier : que personne ne s'en soucie ou ne peut أھtre avec vous.",
          questions: [
            "Auprأ¨s de qui vous sentiriez-vous en sأ©curitأ© pour أ©crire aujourd'hui ?",
            "Quel type de proximitأ© vous ressemble : parler, prأ©sence silencieuse, ou faire quelque chose ensemble ?",
          ],
          step: "Envoyez un message d'une ligne أ  quelqu'un de confiance : « Salut, tu m'as traversأ© l'esprit. آ»",
        },
        overwhelm: {
          feel: "Il semble que beaucoup de charges s'accumulent en mأھme temps.",
          fact: "Fait : vous أ©crivez que vous أھtes fatiguأ©, أ©puisأ© ou sous pression.",
          assumption:
            "Hypothأ¨se أ  vأ©rifier : que tout doive أھtre fait aujourd'hui, tout أ  la fois.",
          questions: [
            "Quelle seule tأ¢che, si elle أ©tait faite, allأ©gerait l'essentiel ?",
            "Qu'est-ce qui pourrait أھtre reportأ© sans culpabilitأ© ?",
          ],
          step: "Videz tout ce qui occupe l'esprit dans une seule liste, puis n'en gardez que trois pour aujourd'hui.",
        },
        positive: {
          feel: "Il semble y avoir quelque chose de vraiment beau dans votre journأ©e, digne d'une pause.",
          fact: "Fait : vous أ©crivez que vous vous sentez heureux, reconnaissant ou fier.",
          assumption:
            "Hypothأ¨se أ  vأ©rifier : que la joie compte moins que les soucis — elle mأ©rite aussi d'أھtre vأ©cue.",
          questions: [
            "Qu'est-ce qui a rendu ce sentiment possible ?",
            "Comment garder ce moment pour un jour plus dur ?",
          ],
          step: "أ‰crivez en une phrase pourquoi vous souriez, et conservez-la quelque part oأ¹ vous pourrez revenir.",
        },
        general: {
          feel: "Vous semblez porter quelque chose et vouloir le comprendre calmement.",
          fact: "Fait : voici les mots que vous venez d'أ©crire.",
          assumption:
            "Hypothأ¨se أ  vأ©rifier : que le sens de ce que vous ressentez est dأ©jأ  clair — il faut parfois le nommer d'abord.",
          questions: [
            "Si ces mots avaient une couleur, laquelle serait-ce aujourd'hui ?",
            "Quel plus petit dأ©tail vous semble le plus important ?",
          ],
          step: "Complأ©tez la phrase : « Ce que je veux vraiment maintenant, c'est… آ» et tapez-la dans la zone.",
        },
      },
    },
    features: {
      title: "Trois faأ§ons dont Ekhtaberha aide",
      subtitle: "Un compagnon, trois formes de soutien — du cإ“ur lourd أ  l'esprit clair.",
      items: [
        {
          title: "Soutien أ©motionnel",
          desc: "Exprimez-vous librement et sentez-vous أ©coutأ©. L'assistant أ©coute sans juger et vous aide أ  nommer vos أ©motions.",
        },
        {
          title: "Introspection",
          desc: "Des questions guidأ©es et des invitations douces pour comprendre vos schأ©mas, vos valeurs et vos besoins.",
        },
        {
          title: "Clartأ© dأ©cisionnelle",
          desc: "Comparez vos options, explorez les compromis et prenez des dأ©cisions fidأ¨les أ  qui vous أھtes.",
        },
      ],
    },
    how: {
      title: "Comment أ§a marche",
      subtitle: "Trois أ©tapes douces, dans la langue qui vous semble la plus naturelle.",
      steps: [
        {
          title: "Partagez ce que vous ressentez",
          desc: "أ‰crivez dans l'une des six langues — une inquiأ©tude, une أ©motion ou une dأ©cision أ  prendre.",
        },
        {
          title: "Explorez avec des questions douces",
          desc: "L'assistant reflأ¨te vos pensأ©es avec calme et vous demande ce qui compte le plus.",
        },
        {
          title: "Terminez avec clartأ©",
          desc: "Chaque conversation se termine par des mots pour vos أ©motions et une prochaine أ©tape en laquelle vous avez confiance.",
        },
      ],
    },
    principles: {
      title: "Conأ§u avec bienveillance",
      items: [
        "Sans jugement — chaque أ©motion est la bienvenue.",
        "Ce site ne conserve pas la conversation aprأ¨s la fermeture de la page.",
        "Du soutien, pas un diagnostic — l'humain d'abord.",
      ],
    },
    cta: {
      title: "Prأھt أ  l'essayer — Ekhtaberha ?",
      text: "Le nom dit tout : essayez-le et ressentez ce que c'est d'أھtre vraiment أ©coutأ©.",
      button: "Essayer Ekhtaberha",
      note: "Gratuit آ· Aucun compte requis",
    },
    footer: {
      tagline: "Un compagnon IA pour votre bien-أھtre أ©motionnel.",
      note: "Ekhtaberha propose des conversations de soutien, pas des conseils mأ©dicaux. En cas de crise, contactez les services d'urgence.",
      rights: "آ© 2026 Ekhtaberha. Tous droits rأ©servأ©s.",
    },
    projectAdmin: {
      label: "Administration du projet",
      admin: "Admin:",
      created: "Created & Developed by",
    },
  },

  es: {
    nav: { features: "Funciones", how: "Cأ³mo funciona" },
    meta: { language: "Cambiar idioma" },
    badge: "Tu espacio seguro para pensar y sentir",
    title: "Habla con libertad. Siأ©ntete comprendido. Decide con claridad.",
    subtitle:
      "Ekhtaberha es un acompaأ±ante de IA para el apoyo emocional, la reflexiأ³n personal y mejores decisiones — en tu idioma y a tu ritmo.",
    ctaPrimary: "Iniciar una conversación",
    heroNote: "Tu espacio para hablar, comprender y descubrir nuevas soluciones.",
    ctaSecondary: "Cأ³mo funciona",
    privacy: "No se guarda en este sitio",
    always: "Disponible 24/7",
    languages: "6 idiomas",
    auth: {
      title: "Iniciar sesiأ³n",
      username: "Nombre de usuario",
      password: "Contraseأ±a",
      submit: "Iniciar sesiأ³n",
      invalid: "El nombre de usuario o la contraseأ±a son incorrectos.",
      unavailable:
        "El inicio de sesiأ³n aأ؛n no estأ، configurado. Revisa los ajustes seguros del servidor.",
      signingIn: "Iniciando sesiأ³n...",
      logout: "Cerrar sesiأ³n",
    },
    chat: {
      title: "Una conversaciأ³n amable",
      badge: "AI Assistant",
      home: "Inicio",
      conversations: "Mis conversaciones",
      newConversation: "Nueva conversaciأ³n",
      noConversations: "Todavأ­a no hay conversaciones.",
      stop: "Detener respuesta",
      user1: "No logro decidir: آ؟el trabajo nuevo o quedarme donde estoy?",
      ai1: "Suena a una decisiأ³n difأ­cil. آ؟Quأ© es lo mأ،s importante para ti ahora mismo: crecer, la estabilidad, u otra cosa?",
      user2: "La verdad… quiero espacio para crecer, pero me da miedo fracasar.",
      ai2: "Es valiente nombrar ese miedo. Veamos cأ³mo serأ­a «fracasarآ» en realidad — y quأ© te quedarأ­a en ambos casos.",
      input: "Escribe lo que tienes en mente…",
      send: "Enviar",
      error: "Hubo un problema de conexiأ³n. Intأ©ntalo de nuevo.",
      welcome: "Hola. Cuأ©ntame quأ© te preocupa y lo pensamos juntos.",
      disclosure:
        "Tus mensajes se envأ­an a Ollama, que se ejecuta localmente en tu dispositivo. No se necesita una clave API externa y el modelo Qwen2.5:14B permanece en tu mأ،quina.",
      privacyLink: "AI Assistant",
      setupNeeded:
        "El chat no estأ، conectado. Instala Ollama, ejecuta ollama run qwen2.5:14b y reinicia el servidor.",
      rateLimited:
        "El servidor local estأ، temporalmente no disponible o ha alcanzado un lأ­mite. Prueba de nuevo en un momento.",
      invalidKey:
        "La configuraciأ³n de Ollama no es vأ،lida. Revisa el servidor local y el nombre del modelo.",
      modelUnavailable:
        "El modelo Qwen2.5:14B no estأ، disponible localmente. Ejecuta ollama run qwen2.5:14b e intأ©ntalo otra vez.",
      invalidRequest:
        "Ollama rechazأ³ el formato de la solicitud. Revisa el nombre del modelo y la configuraciأ³n del servidor.",
      providerError:
        "Ollama rechazأ³ la solicitud o devolviأ³ un error. Revisa el servidor local e intأ©ntalo de nuevo.",
      heritageSearchFailed:
        "No pude acceder a suficientes fuentes fiables para responder ahora. Intأ©ntalo mأ،s tarde o reformula la pregunta.",
      sourcesLabel: "Fuentes",
      incompleteResponse:
        "La respuesta no pudo terminarse. Tu mensaje sigue en el cuadro de texto; vuelve a enviarlo en un momento sin escribirlo otra vez.",
      timeout: "Ollama tardأ³ demasiado en responder. Intأ©ntalo de nuevo en un momento.",
      sending: "Pensando...",
    },
    reflection: {
      demoNote: "Respuesta de demostraciأ³n basada en reglas — no es una IA real",
      experiencing: "Lo que parece que estأ،s viviendo",
      facts: "Hechos vs. suposiciones",
      questions: "Preguntas amables",
      step: "Un pequeأ±o paso prأ،ctico",
      moods: {
        decision: {
          feel: "Parece que estأ،s ante una encrucijada, con una decisiأ³n importante entre manos.",
          fact: "Hecho: escribiste que dudas entre dos o mأ،s opciones.",
          assumption:
            "Suposiciأ³n a comprobar: que todo deba resolverse en una sola decisiأ³n ahora mismo.",
          questions: [
            "Si el miedo no contara, آ؟quأ© elegirأ­as?",
            "آ؟Quأ© hace difأ­cil para ti cada opciأ³n?",
          ],
          step: "Dibuja dos columnas — lo que ganas y lo que pierdes con cada opciأ³n — dأ©jala reposar una noche y vuelve a leerla.",
        },
        anxiety: {
          feel: "Parece que la ansiedad estأ، ocupando espacio en tu mente ahora mismo.",
          fact: "Hecho: escribiste que sientes miedo o preocupaciأ³n por algo concreto.",
          assumption: "Suposiciأ³n a comprobar: que el peor escenario sea el mأ،s probable.",
          questions: [
            "آ؟Quأ© frase aparece primero cuando empieza la preocupaciأ³n?",
            "Si ocurriera lo peor, آ؟quأ© harأ­as en realidad?",
          ],
          step: "Respira lento tres veces (una cada seis segundos) y luego escribe el miedo en una sola frase.",
        },
        sadness: {
          feel: "Tu corazأ³n suena pesado hoy, y algo parece digno de duelo.",
          fact: "Hecho: escribiste que te sientes triste o desanimado.",
          assumption:
            "Suposiciأ³n a comprobar: que este sentimiento se quedarأ، exactamente igual para siempre.",
          questions: [
            "آ؟A quiأ©n o a quأ© protege esta tristeza?",
            "آ؟Quأ© te ayudأ³, aunque fuera un poco, en un dأ­a parecido?",
          ],
          step: "Elige una pequeأ±a comodidad hoy: una bebida caliente, una caminata corta o un mensaje a alguien de confianza.",
        },
        anger: {
          feel: "Parece haber enojo dentro de ti intentando decir algo importante.",
          fact: "Hecho: escribiste que te sientes enojado o alterado por una situaciأ³n.",
          assumption: "Suposiciأ³n a comprobar: que la otra persona actuأ³ mal a propأ³sito.",
          questions: [
            "آ؟Quأ© lأ­mite seأ±ala este enojo que fue cruzado?",
            "آ؟Quأ© tendrأ­a que pasar para que te calmaras?",
          ],
          step: "Escribe el mensaje enojado que nunca enviarأ،s y luego bأ³rralo — el enojo se calma cuando se le escucha.",
        },
        loneliness: {
          feel: "Parece que te sientes solo, incluso con gente alrededor.",
          fact: "Hecho: escribiste que te sientes solo o no escuchado.",
          assumption:
            "Suposiciأ³n a comprobar: que a nadie le importe o que nadie pueda acompaأ±arte.",
          questions: [
            "آ؟Con quiأ©n te sentirأ­as seguro para escribir hoy?",
            "آ؟Quأ© tipo de cercanأ­a va contigo: hablar, presencia silenciosa o hacer algo juntos?",
          ],
          step: "Envأ­a un mensaje de una lأ­nea a alguien de confianza: «Hola, me acordأ© de ti.آ»",
        },
        overwhelm: {
          feel: "Parece que muchas cargas se acumulan al mismo tiempo.",
          fact: "Hecho: escribiste que estأ،s cansado, agotado o bajo presiأ³n.",
          assumption: "Suposiciأ³n a comprobar: que todo deba hacerse hoy, todo a la vez.",
          questions: [
            "آ؟Quأ© أ؛nica tarea, si se hiciera, aliviarأ­a la mayor parte?",
            "آ؟Quأ© podrأ­a posponerse sin culpa?",
          ],
          step: "Vacأ­a todo lo que llevas en mente en una sola lista y elige solo tres cosas para hoy.",
        },
        positive: {
          feel: "Parece que hay algo genuinamente bueno en tu dأ­a que merece una pausa.",
          fact: "Hecho: escribiste que te sientes feliz, agradecido u orgulloso.",
          assumption:
            "Suposiciأ³n a comprobar: que la alegrأ­a importa menos que las preocupaciones — tambiأ©n merece vivirse.",
          questions: [
            "آ؟Quأ© hizo posible este sentimiento?",
            "آ؟Cأ³mo podrأ­as guardar este momento para un dأ­a mأ،s difأ­cil?",
          ],
          step: "Escribe en una frase por quأ© sonrأ­es y guأ،rdala en algأ؛n lugar al que puedas volver.",
        },
        general: {
          feel: "Parece que llevas algo contigo y quieres entenderlo con calma.",
          fact: "Hecho: estas son las palabras que acabas de escribir.",
          assumption:
            "Suposiciأ³n a comprobar: que el significado de lo que sientes ya estأ، claro — a veces necesita ser nombrado primero.",
          questions: [
            "Si estas palabras tuvieran un color, آ؟cuأ،l serأ­a hoy?",
            "آ؟Quأ© detalle mأ­nimo te parece el mأ،s importante?",
          ],
          step: "Termina la frase: «Lo que de verdad quiero ahora es…آ» y escrأ­bela en el recuadro.",
        },
      },
    },
    features: {
      title: "Tres formas en que Ekhtaberha te ayuda",
      subtitle: "Un acompaأ±ante, tres tipos de apoyo — del corazأ³n pesado a la mente clara.",
      items: [
        {
          title: "Apoyo emocional",
          desc: "Exprأ©sate con libertad y siأ©ntete escuchado. El asistente escucha sin juzgar y te ayuda a nombrar lo que sientes.",
        },
        {
          title: "Reflexiأ³n personal",
          desc: "Preguntas guiadas e invitaciones amables para comprender tus patrones, valores y necesidades.",
        },
        {
          title: "Claridad para decidir",
          desc: "Compara opciones, explora los compromisos y llega a decisiones coherentes con quiأ©n eres.",
        },
      ],
    },
    how: {
      title: "Cأ³mo funciona",
      subtitle: "Tres pasos amables, en el idioma que te resulte mأ،s natural.",
      steps: [
        {
          title: "Comparte lo que te preocupa",
          desc: "Escribe en cualquiera de los seis idiomas: una preocupaciأ³n, un sentimiento o una decisiأ³n que enfrentas.",
        },
        {
          title: "Explora con preguntas amables",
          desc: "El asistente refleja tus pensamientos con calma y te pregunta quأ© es lo que mأ،s te importa.",
        },
        {
          title: "Termina con claridad",
          desc: "Cierra cada conversaciأ³n con palabras para lo que sientes y un siguiente paso en el que confأ­es.",
        },
      ],
    },
    principles: {
      title: "Creado con cuidado",
      items: [
        "Sin juicios — cada emociأ³n es bienvenida.",
        "Tus palabras se mantienen privadas.",
        "Apoyo, no diagnأ³stico — las personas primero.",
      ],
    },
    cta: {
      title: "آ؟Listo para probarlo — Ekhtaberha?",
      text: "El nombre lo dice todo: pruأ©balo y siente lo que es ser verdaderamente escuchado.",
      button: "Prueba Ekhtaberha",
      note: "Gratis para probar آ· Sin cuenta",
    },
    footer: {
      tagline: "Un acompaأ±ante de IA para tu bienestar emocional.",
      note: "Ekhtaberha ofrece conversaciones de apoyo, no consejos mأ©dicos. En una crisis, contacta a los servicios de emergencia locales.",
      rights: "آ© 2026 Ekhtaberha. Todos los derechos reservados.",
    },
    projectAdmin: {
      label: "Administración del proyecto",
      admin: "Admin:",
      created: "Created & Developed by",
    },
  },

  de: {
    nav: { features: "Funktionen", how: "So funktioniert es" },
    meta: { language: "Sprache أ¤ndern" },
    badge: "Dein sicherer Raum zum Denken und Fأ¼hlen",
    title: "Sprich es aus. Fأ¼hl dich verstanden. Entscheide mit Klarheit.",
    subtitle:
      "Ekhtaberha ist ein KI-Begleiter fأ¼r emotionale Unterstأ¼tzung, Selbstreflexion und bessere Entscheidungen — in deiner Sprache, in deinem Tempo.",
    ctaPrimary: "Gespräch beginnen",
    heroNote: "Dein Raum zum Sprechen, Verstehen und Entdecken neuer Lösungen.",
    ctaSecondary: "So funktioniert es",
    privacy: "Wird hier nicht gespeichert",
    always: "Rund um die Uhr da",
    languages: "6 Sprachen",
    auth: {
      title: "Anmelden",
      username: "Benutzername",
      password: "Passwort",
      submit: "Anmelden",
      invalid: "Benutzername oder Passwort ist falsch.",
      unavailable:
        "Die Anmeldung ist noch nicht eingerichtet. Prأ¼fe die sicheren Servereinstellungen.",
      signingIn: "Anmeldung lأ¤uft...",
      logout: "Abmelden",
    },
    chat: {
      title: "Ein sanftes Gesprأ¤ch",
      badge: "AI Assistant",
      home: "Startseite",
      conversations: "Meine Gesprأ¤che",
      newConversation: "Neues Gesprأ¤ch",
      noConversations: "Noch keine Gesprأ¤che.",
      stop: "Antwort stoppen",
      user1: "Ich kann mich nicht entscheiden: neuer Job oder bleiben?",
      ai1: "Das klingt nach einer schweren Entscheidung. Was ist dir gerade am wichtigsten — Wachstum, Sicherheit oder etwas anderes?",
      user2: "Ehrlich gesagt… ich will Raum zum Wachsen, aber ich habe Angst zu scheitern.",
      ai2: "Es ist mutig, diese Angst zu benennen. Schauen wir an, wie Scheitern wirklich aussehen wأ¼rde — und was dir in beiden Fأ¤llen bleibt.",
      input: "Schreib, was dich beschأ¤ftigt…",
      send: "Senden",
      error: "Es gab ein Verbindungsproblem. Bitte versuche es erneut.",
      welcome:
        "Hallo. Erzأ¤hl mir, was dich beschأ¤ftigt, dann denken wir gemeinsam darأ¼ber nach.",
      disclosure:
        "Deine Nachrichten werden an Ollama gesendet, das lokal auf deinem Gerأ¤t lأ¤uft. Es ist kein externer API-Schlأ¼ssel nأ¶tig, und das Qwen2.5:14B-Modell bleibt auf deinem Rechner.",
      privacyLink: "AI Assistant",
      setupNeeded:
        "Der Chat ist nicht verbunden. Installiere Ollama, fأ¼hre ollama run qwen2.5:14b aus und starte den Server neu.",
      rateLimited:
        "Der lokale Server ist vorأ¼bergehend nicht verfأ¼gbar oder hat ein Limit erreicht. Bitte versuche es in einem Moment erneut.",
      invalidKey:
        "Die Ollama-Konfiguration ist ungأ¼ltig. Prأ¼fe den lokalen Server und den Modellnamen.",
      modelUnavailable:
        "Das Qwen2.5:14B-Modell ist lokal nicht verfأ¼gbar. Fأ¼hre ollama run qwen2.5:14b aus und versuche es erneut.",
      invalidRequest:
        "Ollama hat das Anfrageformat abgelehnt. Prأ¼fe Modellnamen und Servereinstellungen.",
      providerError:
        "Ollama hat die Anfrage abgelehnt oder einen Fehler gemeldet. Prأ¼fe den lokalen Server und versuche es erneut.",
      heritageSearchFailed:
        "Ich konnte gerade nicht auf genügend vertrauenswürdige Quellen zugreifen. Bitte versuche es später erneut oder formuliere die Frage um.",
      sourcesLabel: "Quellen",
      incompleteResponse:
        "Die Antwort konnte gerade nicht beendet werden. Deine Nachricht steht noch im Eingabefeld; versuche es gleich erneut, ohne sie neu einzugeben.",
      timeout:
        "Ollama hat zu lange fأ¼r eine Antwort gebraucht. Bitte versuche es gleich noch einmal.",
      sending: "Denkt nach...",
    },
    reflection: {
      demoNote: "Regelbasierte Demo-Antwort — keine echte KI",
      experiencing: "Was du offenbar durchmachst",
      facts: "Fakten vs. Annahmen",
      questions: "Sanfte Fragen",
      step: "Ein kleiner praktischer Schritt",
      moods: {
        decision: {
          feel: "Du stehst offenbar an einer Wegkreuzung und trأ¤gst eine wichtige Entscheidung.",
          fact: "Fakt: Du schreibst, dass du zwischen zwei oder mehr Optionen schwankst.",
          assumption:
            "Annahme zum Prأ¼fen: dass sich alles in einer einzigen Entscheidung jetzt klأ¤ren muss.",
          questions: [
            "Wأ¤re die Angst kein Faktor — was wأ¼rdest du wأ¤hlen?",
            "Was macht jede Option fأ¼r dich schwer?",
          ],
          step: "Zeichne zwei Spalten — was du mit jeder Option gewinnst und verlierst — lass sie أ¼ber Nacht ruhen und lies sie dann erneut.",
        },
        anxiety: {
          feel: "Eine Angst scheint gerade viel Platz in deinem Kopf einzunehmen.",
          fact: "Fakt: Du schreibst, dass du dich vor etwas Bestimmtem fأ¼rchtest oder dir Sorgen machst.",
          assumption:
            "Annahme zum Prأ¼fen: dass das Schlimmste, was passieren kann, auch am wahrscheinlichsten ist.",
          questions: [
            "Welcher Satz erscheint zuerst, wenn die Sorge beginnt?",
            "Wenn das Schlimmste eintrأ¤te — was wأ¼rdest du konkret tun?",
          ],
          step: "Atme dreimal langsam (etwa alle sechs Sekunden) und schreib die Angst in einem einzigen Satz auf.",
        },
        sadness: {
          feel: "Dein Herz klingt heute schwer, und etwas scheint ein echtes Bedauern wert.",
          fact: "Fakt: Du schreibst, dass du traurig oder niedergeschlagen bist.",
          assumption: "Annahme zum Prأ¼fen: dass dieses Gefأ¼hl fأ¼r immer genau so bleibt.",
          questions: [
            "Wen oder was beschأ¼tzt diese Traurigkeit?",
            "Was hat dir an einem أ¤hnlichen Tag geholfen, auch nur ein bisschen?",
          ],
          step: "Wأ¤hl heute einen kleinen Trost: ein warmes Getrأ¤nk, einen kurzen Spaziergang oder eine Nachricht an jemanden Vertrautes.",
        },
        anger: {
          feel: "In dir scheint أ„rger zu stecken, der etwas Wichtiges sagen will.",
          fact: "Fakt: Du schreibst, dass du wegen einer Situation wأ¼tend oder aufgebracht bist.",
          assumption:
            "Annahme zum Prأ¼fen: dass die andere Person absichtlich schlecht gehandelt hat.",
          questions: [
            "Welche Grenze zeigt dieser أ„rger als أ¼berschritten?",
            "Was mأ¼sste geschehen, damit du zur Ruhe kommst?",
          ],
          step: "Schreib die wأ¼tende Nachricht, die du nie sendest, und lأ¶sch sie dann — أ„rger legt sich, wenn er gehأ¶rt wird.",
        },
        loneliness: {
          feel: "Du fأ¼hlst dich offenbar allein, selbst unter Menschen.",
          fact: "Fakt: Du schreibst, dass du dich einsam fأ¼hlst oder nicht gehأ¶rt.",
          assumption:
            "Annahme zum Prأ¼fen: dass es niemandem wichtig ist oder niemand bei dir sein kann.",
          questions: [
            "Bei wem wأ¼rdest du dich heute sicher melden?",
            "Welche Art von Nأ¤he passt zu dir: reden, stille Anwesenheit oder etwas gemeinsam tun?",
          ],
          step: "Schick eine Einzeilennachricht an jemanden, dem du vertraust: â€‍Hallo, du warst mir im Kopf.“",
        },
        overwhelm: {
          feel: "Es klingt, als wأ¼rden viele Lasten gleichzeitig aufeinander stappen.",
          fact: "Fakt: Du schreibst, dass du mأ¼de, erschأ¶pft oder unter Druck bist.",
          assumption:
            "Annahme zum Prأ¼fen: dass alles heute und alles auf einmal erledigt werden muss.",
          questions: [
            "Welcher einzige Punkt wأ¼rde, erledigt, die meiste Last nehmen?",
            "Was kأ¶nnte ohne schlechtes Gewissen verschoben werden?",
          ],
          step: "Schreib alles, was dich beschأ¤ftigt, in eine einzige Liste — und such dir fأ¼r heute nur drei Punkte aus.",
        },
        positive: {
          feel: "In deinem Tag scheint etwas echt Schأ¶nes, das eine Pause wert ist.",
          fact: "Fakt: Du schreibst, dass du glأ¼cklich, dankbar oder stolz bist.",
          assumption:
            "Annahme zum Prأ¼fen: dass Freude weniger zأ¤hlt als Sorgen — auch sie verdient, gelebt zu werden.",
          questions: [
            "Was hat dieses Gefأ¼hl mأ¶glich gemacht?",
            "Wie kأ¶nntest du diesen Moment fأ¼r einen schwereren Tag aufheben?",
          ],
          step: "Schreib in einem Satz, warum du lأ¤chelst, und bewahr ihn an einem Ort auf, zu dem du zurأ¼ckkommst.",
        },
        general: {
          feel: "Du trأ¤gst offenbar etwas mit dir herum und mأ¶chtest es in Ruhe verstehen.",
          fact: "Fakt: Das sind die Worte, die du gerade geschrieben hast.",
          assumption:
            "Annahme zum Prأ¼fen: dass die Bedeutung dessen, was du fأ¼hlst, schon klar ist — manchmal muss sie erst benannt werden.",
          questions: [
            "Hأ¤tten diese Worte eine Farbe — welche wأ¤re es heute?",
            "Welches kleinste Detail scheint dir am wichtigsten?",
          ],
          step: "Vervollstأ¤ndige den Satz: â€‍Was ich jetzt wirklich will, ist …“ und tippe ihn in das Feld.",
        },
      },
    },
    features: {
      title: "Drei Wege, wie Ekhtaberha hilft",
      subtitle:
        "Ein Begleiter, drei Arten von Unterstأ¼tzung — vom schweren Herzen zum klaren Kopf.",
      items: [
        {
          title: "Emotionale Unterstأ¼tzung",
          desc: "Sprich frei und fأ¼hl dich gehأ¶rt. Der Assistent hأ¶rt ohne Urteil zu und hilft dir, Gefأ¼hle zu benennen.",
        },
        {
          title: "Selbstreflexion",
          desc: "Gefأ¼hrte Fragen und sanfte Impulse, die dir helfen, deine Muster, Werte und Bedأ¼rfnisse zu verstehen.",
        },
        {
          title: "Entscheidungsklarheit",
          desc: "Wأ¤ge Optionen gegenأ¼ber, entdecke Abwأ¤gungen und triff Entscheidungen, die zu dir passen.",
        },
      ],
    },
    how: {
      title: "So funktioniert es",
      subtitle: "Drei sanfte Schritte, in der Sprache, die sich fأ¼r dich natأ¼rlich anfأ¼hlt.",
      steps: [
        {
          title: "Teil mit, was dich beschأ¤ftigt",
          desc: "Schreib in einer der sechs Sprachen — eine Sorge, ein Gefأ¼hl oder eine Entscheidung.",
        },
        {
          title: "Erkunde mit sanften Fragen",
          desc: "Der Assistent spiegelt deine Gedanken ruhig wider und fragt, was dir am wichtigsten ist.",
        },
        {
          title: "Verlasse das Gesprأ¤ch mit Klarheit",
          desc: "Beende jedes Gesprأ¤ch mit Worten fأ¼r dein Gefأ¼hl und einem nأ¤chsten Schritt, dem du vertraust.",
        },
      ],
    },
    principles: {
      title: "Mit Fأ¼rsorge gebaut",
      items: [
        "Kein Urteil — jedes Gefأ¼hl ist willkommen.",
        "Diese Website speichert den Chat nach dem Schlieأںen der Seite nicht.",
        "Unterstأ¼tzung statt Diagnose — der Mensch steht immer zuerst.",
      ],
    },
    cta: {
      title: "Bereit, es zu testen — Ekhtaberha?",
      text: "Der Name sagt alles: Probier es aus und spأ¼r, wie es ist, wirklich gehأ¶rt zu werden.",
      button: "Jetzt Ekhtaberha testen",
      note: "Kostenlos zum Ausprobieren آ· Kein Konto nأ¶tig",
    },
    footer: {
      tagline: "Ein KI-Begleiter fأ¼r dein emotionales Wohlbefinden.",
      note: "Ekhtaberha bietet unterstأ¼tzende Gesprأ¤che, keine medizinische Beratung. Wende dich im Notfall an den أ¶rtlichen Notdienst.",
      rights: "آ© 2026 Ekhtaberha. Alle Rechte vorbehalten.",
    },
    projectAdmin: {
      label: "Projektverwaltung",
      admin: "Admin:",
      created: "Created & Developed by",
    },
  },

  zh: {
    nav: { features: "هٹںèƒ½", how: "ن½؟ç”¨و–¹ه¼ڈ" },
    meta: { language: "é€‰و‹©è¯­è¨€" },
    badge: "ن¸€ن¸ھهڈ¯ن»¥ه®‰ه؟ƒو€‌è€ƒن¸ژو„ںهڈ—çڑ„ç©؛é—´",
    title: "è¯´ه‡؛و‌¥ï¼Œè¢«çگ†è§£ï¼Œه¸¦ç‌€و¸…و™°هپڑه†³ه®ڑم€‚",
    subtitle:
      "Ekhtaberha وک¯ن¸€ن½چ AI ن¼™ن¼´ï¼Œن¸؛ن½ وڈگن¾›وƒ…و„ںو”¯وŒپم€پè‡ھوˆ‘هڈچو€‌ن¸ژه†³ç­–ه¸®هٹ©——ç”¨ن½ çڑ„è¯­è¨€ï¼ŒوŒ‰ن½ çڑ„èٹ‚ه¥ڈم€‚",
    ctaPrimary: "开始对话",
    heroNote: "在这里倾诉、理解，并发现新的解决方案。",
    ctaSecondary: "ن؛†è§£ه·¥ن½œهژںçگ†",
    privacy: "وœ¬ç«™ن¸چن؟‌ه­کèپٹه¤©è®°ه½•",
    always: "ه…¨ه¤©ه€™é™ھن¼´",
    languages: "6 ç§چè¯­è¨€",
    auth: {
      title: "ç™»ه½•",
      username: "ç”¨وˆ·هگچ",
      password: "ه¯†ç پ",
      submit: "ç™»ه½•",
      invalid: "ç”¨وˆ·هگچوˆ–ه¯†ç پن¸چو­£ç،®م€‚",
      unavailable: "ç™»ه½•ه°ڑوœھé…چç½®ï¼Œè¯·و£€وں¥وœچهٹ،ه™¨çڑ„ه®‰ه…¨è®¾ç½®م€‚",
      signingIn: "و­£هœ¨ç™»ه½•...",
      logout: "é€€ه‡؛ç™»ه½•",
    },
    chat: {
      title: "ن¸€و®µو¸©وں”çڑ„ه¯¹è¯‌",
      badge: "AI Assistant",
      home: "é¦–é،µ",
      conversations: "وˆ‘çڑ„ه¯¹è¯‌",
      newConversation: "و–°ه»؛ه¯¹è¯‌",
      noConversations: "è؟کو²،وœ‰ه¯¹è¯‌م€‚",
      stop: "هپœو­¢ه›‍ه¤چ",
      user1: "وˆ‘و— و³•ه†³ه®ڑï¼ڑوژ¥هڈ—و–°ه·¥ن½œï¼Œè؟کوک¯ç•™هœ¨çژ°هœ¨è؟™ن»½ï¼ں",
      ai1: "è؟™هگ¬èµ·و‌¥وک¯ن¸ھè‰°éڑ¾çڑ„وٹ‰و‹©م€‚ه¯¹ن½ و‌¥è¯´ï¼Œو­¤هˆ»وœ€é‡چè¦پçڑ„وک¯ن»€ن¹ˆ——وˆگé•؟م€په®‰ç¨³ï¼Œè؟کوک¯هˆ«çڑ„ï¼ں",
      user2: "è¯´ه®‍è¯‌……وˆ‘وƒ³è¦پوˆگé•؟çڑ„ç©؛é—´ï¼Œن½†ه®³و€•ه¤±è´¥م€‚",
      ai2: "èƒ½è¯´ه‡؛è؟™ن»½وپگوƒ§ه·²ç»ڈه¾ˆه‹‡و•¢م€‚وˆ‘ن»¬ن¸€èµ·çœ‹çœ‹م€Œه¤±è´¥م€چç©¶ç«ںن¼ڑوک¯ن»€ن¹ˆو ·——ن»¥هڈٹو— è®؛ه“ھç§چé€‰و‹©ï¼Œن½ ن»چç„¶و‹¥وœ‰ن»€ن¹ˆم€‚",
      input: "ه†™ن¸‹ن½ ه؟ƒن¸­çڑ„وƒ³و³•……",
      send: "هڈ‘é€پ",
      error: "è؟‍وژ¥ه‡؛çژ°é—®é¢کï¼Œè¯·é‡چè¯•م€‚",
      welcome: "ن½ ه¥½م€‚ه‘ٹè¯‰وˆ‘وœ€è؟‘هœ¨وƒ³ن»€ن¹ˆï¼Œوˆ‘ن»¬هڈ¯ن»¥ن¸€èµ·و¢³çگ†ن¸€ن¸‹م€‚",
      disclosure:
        "ن½ çڑ„و¶ˆوپ¯ن¼ڑهڈ‘é€پهˆ°وœ¬وœ؛è؟گè،Œçڑ„ Ollamaم€‚و— éœ€ه¤–éƒ¨ API ه¯†é’¥ï¼ŒQwen2.5:14B و¨،ه‍‹ن¹ںن¼ڑن؟‌ç•™هœ¨ن½ çڑ„è®¾ه¤‡ن¸ٹم€‚",
      privacyLink: "AI Assistant",
      setupNeeded:
        "èپٹه¤©ه°ڑوœھè؟‍وژ¥م€‚è¯·ه…ˆه®‰è£… Ollamaï¼Œè؟گè،Œ ollama run qwen2.5:14bï¼Œç„¶هگژé‡چهگ¯وœچهٹ،ه™¨م€‚",
      rateLimited: "وœ¬هœ°وœچهٹ،ه™¨وڑ‚و—¶ن¸چهڈ¯ç”¨وˆ–è¾¾هˆ°ن؛†é™گهˆ¶ï¼Œè¯·ç¨چهگژه†چè¯•م€‚",
      invalidKey: "Ollama é…چç½®و— و•ˆم€‚è¯·و£€وں¥وœ¬هœ°وœچهٹ،ه™¨ه’Œو¨،ه‍‹هگچç§°م€‚",
      modelUnavailable:
        "Qwen2.5:14B و¨،ه‍‹ه½“ه‰چهœ¨وœ¬وœ؛ن¸چهڈ¯ç”¨م€‚è¯·ه…ˆè؟گè،Œ ollama run qwen2.5:14b هگژه†چè¯•م€‚",
      invalidRequest: "Ollama و‹’ç»‌ن؛†è¯·و±‚و ¼ه¼ڈï¼Œè¯·و£€وں¥و¨،ه‍‹هگچç§°ه’Œوœچهٹ،ه™¨è®¾ç½®م€‚",
      providerError:
        "Ollama و‹’ç»‌ن؛†è¯·و±‚وˆ–è؟”ه›‍ن؛†é”™è¯¯م€‚è¯·و£€وں¥وœ¬هœ°وœچهٹ،ه™¨هگژé‡چè¯•م€‚",
      heritageSearchFailed: "目前无法找到足够可靠的信息来源。请稍后重试，或换一种方式提问。",
      sourcesLabel: "来源",
      incompleteResponse: "回复暂时未能完成。你的消息仍在输入框中，请稍后重试，无需重新输入。",
      timeout: "Ollama ه“چه؛”و—¶é—´è؟‡é•؟ï¼Œè¯·ç¨چهگژé‡چè¯•م€‚",
      sending: "و­£هœ¨و€‌è€ƒ...",
    },
    reflection: {
      demoNote: "هں؛ن؛ژè§„هˆ™çڑ„و¼”ç¤؛ه›‍ه¤چ——ه¹¶é‌‍çœںه®‍ AI",
      experiencing: "ن½ ن¼¼ن¹ژو­£هœ¨ç»ڈهژ†çڑ„",
      facts: "ن؛‹ه®‍ vs. çŒœوµ‹",
      questions: "و¸©وں”çڑ„é—®é¢ک",
      step: "ن¸€ن¸ھه°ڈçڑ„ه®‍é™…و­¥éھ¤",
      moods: {
        decision: {
          feel: "ن½ ن¼¼ن¹ژو­£ç«™هœ¨ه²”è·¯هڈ£ï¼Œه؟ƒé‡Œè£…ç‌€ن¸€ن¸ھé‡چè¦پçڑ„é€‰و‹©م€‚",
          fact: "ن؛‹ه®‍ï¼ڑن½ ه†™éپ“ï¼Œن½ هœ¨ن¸¤ن¸ھوˆ–و›´ه¤ڑé€‰é،¹ن¹‹é—´çٹ¹è±«م€‚",
          assumption:
            "ه€¼ه¾—و ¸ه®‍çڑ„çŒœوµ‹ï¼ڑè®¤ن¸؛و‰€وœ‰ن؛‹وƒ…éƒ½ه؟…é،»هœ¨è؟™ن¸€ن¸ھه†³ه®ڑé‡Œçژ°هœ¨ه°±è§£ه†³م€‚",
          questions: [
            "ه¦‚و‍œه®³و€•ن¸چه­کهœ¨ï¼Œن½ ن¼ڑé€‰ن»€ن¹ˆï¼ں",
            "وک¯ن»€ن¹ˆè®©و¯ڈن¸ھé€‰é،¹ه¯¹ن½ و‌¥è¯´éƒ½ه¾ˆéڑ¾ï¼ں",
          ],
          step: "ç”»ن¸¤و ڈ——و¯ڈن¸ھé€‰é،¹ن½ ن¼ڑه¾—هˆ°ن»€ن¹ˆم€په¤±هژ»ن»€ن¹ˆ——و”¾ن¸€و™ڑï¼Œç¬¬ن؛Œه¤©ه†چè¯»ن¸€éپچم€‚",
        },
        anxiety: {
          feel: "ç„¦è™‘ن¼¼ن¹ژو­£هœ¨هچ وچ®ن½ و­¤هˆ»çڑ„ه¤´è„‘م€‚",
          fact: "ن؛‹ه®‍ï¼ڑن½ ه†™éپ“ï¼Œن½ ه¯¹وںگن»¶ه…·ن½“çڑ„ن؛‹و„ںهˆ°ه®³و€•وˆ–و‹…ه؟ƒم€‚",
          assumption: "ه€¼ه¾—و ¸ه®‍çڑ„çŒœوµ‹ï¼ڑè®¤ن¸؛وœ€ه‌ڈçڑ„ç»“و‍œه°±وک¯وœ€هڈ¯èƒ½هڈ‘ç”ںçڑ„م€‚",
          questions: [
            "ه½“و‹…ه؟§ه¼€ه§‹و—¶ï¼Œç¬¬ن¸€ن¸ھه†’ه‡؛و‌¥çڑ„ه؟µه¤´وک¯ن»€ن¹ˆï¼ں",
            "ه¦‚و‍œوœ€ه‌ڈçڑ„وƒ…ه†µهڈ‘ç”ںن؛†ï¼Œن½ ه®‍é™…ن¼ڑو€ژن¹ˆهپڑï¼ں",
          ],
          step: "و…¢ه‘¼هگ¸ن¸‰و¬،ï¼ˆو¯ڈه…­ç§’ن¸€و¬،ï¼‰ï¼Œç„¶هگژوٹٹè؟™ن»½ه®³و€•ه†™وˆگن¸€هڈ¥è¯‌م€‚",
        },
        sadness: {
          feel: "ن»ٹه¤©ن½ çڑ„ه؟ƒهگ¬èµ·و‌¥ه¾ˆو²‰é‡چï¼Œن¼¼ن¹ژوœ‰ن؛›ن؛‹ه€¼ه¾—éڑ¾è؟‡م€‚",
          fact: "ن؛‹ه®‍ï¼ڑن½ ه†™éپ“ï¼Œن½ و„ںهˆ°éڑ¾è؟‡وˆ–وƒ…ç»ھن½ژèگ½م€‚",
          assumption: "ه€¼ه¾—و ¸ه®‍çڑ„çŒœوµ‹ï¼ڑè®¤ن¸؛è؟™ç§چو„ںè§‰ن¼ڑو°¸è؟œهژںو ·هپœç•™م€‚",
          questions: [
            "è؟™ن»½éڑ¾è؟‡هœ¨ن؟‌وٹ¤è°پم€پن؟‌وٹ¤ن»€ن¹ˆï¼ں",
            "هœ¨ç±»ن¼¼çڑ„و—¥ه­گé‡Œï¼Œوک¯ن»€ن¹ˆو›¾ه¸®ن½ ه¥½هڈ—ن¸€ç‚¹ç‚¹ï¼ں",
          ],
          step: "ن»ٹه¤©ç»™è‡ھه·±é€‰ن¸€ن¸ھه°ڈه°ڈçڑ„ه®‰و…°ï¼ڑن¸€و‌¯çƒ­é¥®م€پن¸€و®µçں­و•£و­¥ï¼Œوˆ–ç»™ن؟،ن»»çڑ„ن؛؛هڈ‘و‌،و¶ˆوپ¯م€‚",
        },
        anger: {
          feel: "ن½ ه؟ƒé‡Œن¼¼ن¹ژوœ‰و€’و°”ï¼Œه®ƒوƒ³è¯´ه‡؛ن¸€ن؛›é‡چè¦پçڑ„ن¸œè¥؟م€‚",
          fact: "ن؛‹ه®‍ï¼ڑن½ ه†™éپ“ï¼Œن½ ه› ن¸؛وںگن¸ھوƒ…ه†µو„ںهˆ°ç”ںو°”وˆ–و؟€هٹ¨م€‚",
          assumption: "ه€¼ه¾—و ¸ه®‍çڑ„çŒœوµ‹ï¼ڑè®¤ن¸؛ه¯¹و–¹وک¯و•…و„ڈè؟™و ·هپڑçڑ„م€‚",
          questions: [
            "è؟™ن»½و€’و°”هœ¨ه‘ٹè¯‰ن½ ه“ھو‌،ç•Œé™گè¢«è¶ٹè؟‡ن؛†ï¼ں",
            "هڈ‘ç”ںن»€ن¹ˆو‰چèƒ½è®©ن½ ه¹³é‌™ن¸‹و‌¥ï¼ں",
          ],
          step: "ه†™ن¸‹é‚£ه°پن½ و°¸è؟œن¸چن¼ڑهڈ‘é€پçڑ„و€’و°”و¶ˆوپ¯ï¼Œç„¶هگژهˆ وژ‰——و€’و°”è¢«هگ¬è§پهگژو‰چن¼ڑه¹³وپ¯م€‚",
        },
        loneliness: {
          feel: "ن½ ن¼¼ن¹ژو„ںهˆ°ه­¤هچ•ï¼Œهچ³ن½؟è؛«è¾¹وœ‰ن؛؛م€‚",
          fact: "ن؛‹ه®‍ï¼ڑن½ ه†™éپ“ï¼Œن½ و„ںهˆ°ه­¤ç‹¬وˆ–و²،وœ‰è¢«هگ¬è§پم€‚",
          assumption: "ه€¼ه¾—و ¸ه®‍çڑ„çŒœوµ‹ï¼ڑè®¤ن¸؛و²،وœ‰ن؛؛هœ¨و„ڈï¼Œوˆ–و²،وœ‰ن؛؛èƒ½é™ھç‌€ن½ م€‚",
          questions: [
            "ن»ٹه¤©ن½ و„؟و„ڈهگ‘ه“ھن¸€ن¸ھن؛؛و•‍ه¼€ه؟ƒو‰‰ï¼ں",
            "ه“ھç§چé‌ è؟‘é€‚هگˆن½ ï¼ڑèپٹه¤©م€په®‰é‌™çڑ„é™ھن¼´ï¼Œè؟کوک¯ن¸€èµ·هپڑç‚¹ن»€ن¹ˆï¼ں",
          ],
          step: "ç»™ن؟،ن»»çڑ„ن؛؛هڈ‘ن¸€è،Œه­—ï¼ڑم€Œه—¨ï¼Œوƒ³èµ·ن½ ن؛†م€‚م€چ",
        },
        overwhelm: {
          feel: "ن¼¼ن¹ژه¾ˆه¤ڑè´ںو‹…و­£هœ¨هگŒو—¶هژ‹هœ¨ن½ è؛«ن¸ٹم€‚",
          fact: "ن؛‹ه®‍ï¼ڑن½ ه†™éپ“ï¼Œن½ ه¾ˆç´¯م€پç²¾ç–²هٹ›ç«­وˆ–هژ‹هٹ›ه¾ˆه¤§م€‚",
          assumption: "ه€¼ه¾—و ¸ه®‍çڑ„çŒœوµ‹ï¼ڑè®¤ن¸؛و‰€وœ‰ن؛‹éƒ½ه؟…é،»ن»ٹه¤©م€پن¸€هڈ£و°”هپڑه®Œم€‚",
          questions: [
            "ه“ھن¸€ن»¶ن؛‹ه¦‚و‍œه®Œوˆگن؛†ï¼Œèƒ½ه‡ڈè½»ه¤§éƒ¨هˆ†è´ںو‹…ï¼ں",
            "ه“ھن؛›ن؛‹هڈ¯ن»¥ن¸چه¸¦و„§ç–ڑهœ°ه»¶هگژï¼ں",
          ],
          step: "وٹٹه؟ƒé‡Œو‰€وœ‰çڑ„ن؛‹ه€’è؟›ن¸€ه¼ و¸…هچ•ï¼Œç„¶هگژهڈھن¸؛ن»ٹه¤©وŒ‘ه‡؛ن¸‰ن»¶م€‚",
        },
        positive: {
          feel: "ن½ çڑ„و—¥ه­گé‡Œن¼¼ن¹ژوœ‰ن¸€ن؛›çœںو­£ç¾ژه¥½çڑ„ن¸œè¥؟ï¼Œه€¼ه¾—هپœç•™ن¸€ن¸‹م€‚",
          fact: "ن؛‹ه®‍ï¼ڑن½ ه†™éپ“ï¼Œن½ و„ںهˆ°ه¼€ه؟ƒم€پو„ںو؟€وˆ–è‡ھè±ھم€‚",
          assumption:
            "ه€¼ه¾—و ¸ه®‍çڑ„çŒœوµ‹ï¼ڑè®¤ن¸؛ه؟«ن¹گن¸چه¦‚çƒ¦وپ¼é‡چè¦پ——ه®ƒهگŒو ·ه€¼ه¾—è¢«ه¥½ه¥½ç»ڈهژ†م€‚",
          questions: [
            "وک¯ن»€ن¹ˆè®©è؟™ç§چو„ںè§‰وˆگن¸؛هڈ¯èƒ½ï¼ں",
            "و€ژو ·و‰چèƒ½وٹٹè؟™ن¸ھو—¶هˆ»ه­کèµ·و‌¥ï¼Œç•™ç»™و›´éڑ¾çڑ„ن¸€ه¤©ï¼ں",
          ],
          step: "ç”¨ن¸€هڈ¥è¯‌ه†™ن¸‹ن½ ه¾®ç¬‘çڑ„هژںه› ï¼Œوٹٹه®ƒن؟‌ه­کهœ¨ن¸€ن¸ھن½ ن¼ڑه›‍و‌¥çœ‹çڑ„هœ°و–¹م€‚",
        },
        general: {
          feel: "ن½ ن¼¼ن¹ژو­£è£…ç‌€ن¸€ن؛›ه؟ƒن؛‹ï¼Œوƒ³ه®‰é‌™هœ°وٹٹه®ƒن»¬ه¼„وکژç™½م€‚",
          fact: "ن؛‹ه®‍ï¼ڑè؟™ن؛›ه°±وک¯ن½ هˆڑه†™ن¸‹çڑ„و–‡ه­—م€‚",
          assumption:
            "ه€¼ه¾—و ¸ه®‍çڑ„çŒœوµ‹ï¼ڑè®¤ن¸؛ن½ ه·²ç»ڈه®Œه…¨و¸…و¥ڑè‡ھه·±çڑ„و„ںهڈ—و„ڈه‘³ç‌€ن»€ن¹ˆ——وœ‰و—¶ه®ƒéœ€è¦په…ˆè¢«ه‘½هگچم€‚",
          questions: [
            "ه¦‚و‍œè؟™ن؛›و–‡ه­—وœ‰ن¸€ç§چé¢œè‰²ï¼Œن»ٹه¤©ن¼ڑوک¯ن»€ن¹ˆé¢œè‰²ï¼ں",
            "è؟™ن»¶ن؛‹é‡Œوœ€ه°ڈçڑ„ه“ھن¸ھç»†èٹ‚ه¯¹ن½ وœ€é‡چè¦پï¼ں",
          ],
          step: "è،¥ه®Œè؟™هڈ¥è¯‌ï¼ڑم€Œوˆ‘çژ°هœ¨çœںو­£وƒ³è¦پçڑ„وک¯……م€چه¹¶وٹٹه®ƒè¾“ه…¥هˆ°و،†é‡Œم€‚",
        },
      },
    },
    features: {
      title: "Ekhtaberha هٹ©ن½ çڑ„ن¸‰ç§چو–¹ه¼ڈ",
      subtitle: "ن¸€ن½چن¼™ن¼´ï¼Œن¸‰ç§چو”¯وŒپ——ن»ژو²‰é‡چçڑ„ه؟ƒهˆ°و¸…و™°çڑ„ه¤´è„‘م€‚",
      items: [
        {
          title: "وƒ…و„ںو”¯وŒپ",
          desc: "ç•…و‰€و¬²è¨€ï¼Œè¢«è®¤çœںه€¾هگ¬م€‚هٹ©و‰‹ن¸چه¸¦è¯„هˆ¤هœ°ه€¾هگ¬ï¼Œه¸®ن½ è¯´ه‡؛è‡ھه·±çڑ„و„ںهڈ—م€‚",
        },
        {
          title: "è‡ھوˆ‘هڈچو€‌",
          desc: "ه¼•ه¯¼ه¼ڈوڈگé—®ن¸ژو¸©ه’Œçڑ„وڈگç¤؛ï¼Œه¸®هٹ©ن½ çگ†è§£è‡ھه·±çڑ„و¨،ه¼ڈم€پن»·ه€¼è§‚ن¸ژéœ€و±‚م€‚",
        },
        {
          title: "ه†³ç­–و¸…و™°",
          desc: "ه¹¶هˆ—و¯”è¾ƒé€‰é،¹ï¼Œو‌ƒè،،هˆ©ه¼ٹï¼Œهپڑه‡؛çœںو­£ç¬¦هگˆè‡ھه·±çڑ„é€‰و‹©م€‚",
        },
      ],
    },
    how: {
      title: "ه¦‚ن½•ن½؟ç”¨",
      subtitle: "ن¸‰ن¸ھو¸©ه’Œçڑ„و­¥éھ¤ï¼Œç”¨ن½ è§‰ه¾—وœ€è‡ھç„¶çڑ„è¯­è¨€م€‚",
      steps: [
        {
          title: "è¯´ه‡؛ن½ çڑ„ه؟ƒن؛‹",
          desc: "ç”¨ه…­ç§چè¯­è¨€ن¸­çڑ„ن»»و„ڈن¸€ç§چï¼Œه†™ن¸‹ن½ çڑ„و‹…ه؟§م€پو„ںهڈ—وˆ–و­£é‌¢ن¸´çڑ„وٹ‰و‹©م€‚",
        },
        {
          title: "هœ¨و¸©ه’Œçڑ„وڈگé—®ن¸­وژ¢ç´¢",
          desc: "هٹ©و‰‹ن¼ڑه¹³é‌™هœ°ه›‍ه؛”ن½ çڑ„وƒ³و³•ï¼Œه¹¶è¯¢é—®ن»€ن¹ˆه¯¹ن½ وœ€é‡چè¦پم€‚",
        },
        {
          title: "ه¸¦ç‌€و¸…و™°ç¦»ه¼€",
          desc: "و¯ڈو¬،ه¯¹è¯‌ç»“و‌ںو—¶ï¼Œن½ éƒ½ن¼ڑوœ‰وڈڈè؟°و„ںهڈ—çڑ„è¯چè¯­ï¼Œن»¥هڈٹن¸€ن¸ھهڈ¯ن»¥ن؟،èµ–çڑ„ن¸‹ن¸€و­¥م€‚",
        },
      ],
    },
    principles: {
      title: "ن»¥ه…³و€€ن¸؛وœ¬",
      items: [
        "ن¸چه¸¦è¯„هˆ¤——و¯ڈن¸€ç§چوƒ…ç»ھéƒ½هڈ—و¬¢è؟ژم€‚",
        "ه…³é—­é،µé‌¢هگژï¼Œوœ¬ç½‘ç«™ن¸چن¼ڑن؟‌ه­کèپٹه¤©è®°ه½•م€‚",
        "وک¯و”¯وŒپè€Œé‌‍è¯ٹو–­——ه§‹ç»ˆن»¥ن؛؛ن¸؛وœ¬م€‚",
      ],
    },
    cta: {
      title: "ه‡†ه¤‡ه¥½è¯•è¯•ن؛†هگ———Ekhtaberhaï¼ں",
      text: "هگچه­—ه·²ç»ڈè¯´وکژن¸€هˆ‡ï¼ڑè¯•ن¸€è¯•ï¼Œو„ںهڈ—è¢«çœںو­£ه€¾هگ¬çڑ„و»‹ه‘³م€‚",
      button: "ç«‹هچ³ن½“éھŒ Ekhtaberha",
      note: "ه…چè´¹è¯•ç”¨ آ· و— éœ€و³¨ه†Œ",
    },
    footer: {
      tagline: "é™ھن½ وƒ…ç»ھهپ¥ه؛·çڑ„ AI ن¼™ن¼´م€‚",
      note: "Ekhtaberha وڈگن¾›و”¯وŒپو€§ه¯¹è¯‌ï¼Œه¹¶é‌‍هŒ»ç–—ه»؛è®®م€‚ه¦‚éپ‡هچ±وœ؛ï¼Œè¯·èپ”ç³»ه½“هœ°ç´§و€¥وœچهٹ،م€‚",
      rights: "آ© 2026 Ekhtaberha. ن؟‌ç•™و‰€وœ‰و‌ƒهˆ©م€‚",
    },
    projectAdmin: { label: "项目管理", admin: "Admin:", created: "Created & Developed by" },
  },
};

export const translations: Record<LangCode, Dict> = {
  ...baseTranslations,
  it: {
    ...baseTranslations.en,
    nav: { features: "Funzionalità", how: "Come funziona" },
    meta: { language: "Cambia lingua" },
    badge: "Il tuo spazio sicuro per pensare ed esprimerti",
    title: "Parla liberamente. Comprendi te stesso. Scegli con chiarezza.",
    subtitle:
      "Uno spazio intelligente per comprendere le emozioni, organizzare i pensieri, osservare le situazioni da più prospettive e prendere decisioni più consapevoli.",
    ctaPrimary: "Inizia una conversazione",
    ctaSecondary: "Come funziona?",
    heroNote: "Uno spazio per parlare, capire e scoprire nuove soluzioni.",
    privacy: "Il sito non salva la conversazione",
    always: "Disponibile 24 ore su 24",
    languages: "9 lingue",
    auth: {
      ...baseTranslations.en.auth,
      title: "Accedi",
      username: "Nome utente",
      password: "Password",
      submit: "Accedi",
      invalid: "Nome utente o password non corretti.",
      unavailable: "Accesso non ancora configurato.",
      signingIn: "Accesso in corso...",
      logout: "Esci",
    },
    chat: {
      ...baseTranslations.en.chat,
      title: "Parla liberamente, con calma",
      home: "Pagina iniziale",
      conversations: "Le mie conversazioni",
      newConversation: "Nuova conversazione",
      noConversations: "Inizia una nuova conversazione",
      stop: "Interrompi la risposta",
      input: "Scrivi ciò che hai in mente…",
      send: "Invia",
      error: "Si è verificato un problema di connessione. Riprova.",
      welcome: "Ciao. Raccontami cosa ti preoccupa e riflettiamoci insieme.",
      sourcesLabel: "Fonti",
      heritageSearchFailed:
        "Non riesco ad accedere a fonti affidabili sufficienti in questo momento. Riprova più tardi o riformula la domanda.",
      sending: "Sto pensando…",
    },
    features: {
      ...baseTranslations.en.features,
      title: "Uno spazio che ti capisce",
      subtitle: "Piccoli passi per comprendere meglio te stesso e le situazioni.",
    },
    how: {
      ...baseTranslations.en.how,
      title: "Come funziona?",
      subtitle: "Tre semplici passaggi per passare dalle parole a una decisione più chiara.",
    },
    principles: { ...baseTranslations.en.principles, title: "Uno spazio sicuro, senza giudizi" },
    cta: {
      ...baseTranslations.en.cta,
      title: "Pronto a iniziare?",
      text: "Scrivi ciò che ti passa per la mente e fai il primo passo verso maggiore chiarezza.",
      button: "Inizia una conversazione",
    },
    footer: {
      ...baseTranslations.en.footer,
      tagline: "Uno spazio per comprendere te stesso e decidere con consapevolezza.",
      rights: "Tutti i diritti riservati.",
    },
  },
  ru: {
    ...baseTranslations.en,
    nav: { features: "Возможности", how: "Как это работает" },
    meta: { language: "Выбрать язык" },
    badge: "Безопасное пространство для размышлений и самовыражения",
    title: "Говорите открыто. Разберитесь в себе. Принимайте решения осознанно.",
    subtitle:
      "Умное пространство, которое помогает понять чувства, упорядочить мысли, взглянуть на ситуацию с разных сторон и принимать более осознанные решения.",
    ctaPrimary: "Начать разговор",
    ctaSecondary: "Как это работает?",
    heroNote: "Место для разговора, понимания и новых решений.",
    privacy: "Сайт не сохраняет переписку",
    always: "Доступно круглосуточно",
    languages: "9 языков",
    auth: {
      ...baseTranslations.en.auth,
      title: "Вход",
      username: "Имя пользователя",
      password: "Пароль",
      submit: "Войти",
      invalid: "Неверное имя пользователя или пароль.",
      unavailable: "Вход ещё не настроен.",
      signingIn: "Выполняется вход…",
      logout: "Выйти",
    },
    chat: {
      ...baseTranslations.en.chat,
      title: "Спокойный разговор",
      home: "Главная",
      conversations: "Мои разговоры",
      newConversation: "Новый разговор",
      noConversations: "Начните новый разговор",
      stop: "Остановить ответ",
      input: "Напишите, что у вас на душе…",
      send: "Отправить",
      error: "Проблема с подключением. Попробуйте ещё раз.",
      welcome: "Здравствуйте. Расскажите, что вас беспокоит, и мы вместе всё обдумаем.",
      sourcesLabel: "Источники",
      heritageSearchFailed:
        "Сейчас не удалось найти достаточно надёжных источников. Попробуйте позже или переформулируйте вопрос.",
      sending: "Думаю…",
    },
    features: {
      ...baseTranslations.en.features,
      title: "Пространство, которое вас понимает",
      subtitle: "Простые шаги, которые помогут лучше понять себя и происходящее.",
    },
    how: {
      ...baseTranslations.en.how,
      title: "Как это работает?",
      subtitle: "Три простых шага — от выражения мыслей к ясному решению.",
    },
    principles: {
      ...baseTranslations.en.principles,
      title: "Безопасное пространство без осуждения",
    },
    cta: {
      ...baseTranslations.en.cta,
      title: "Готовы начать?",
      text: "Напишите, что вас волнует, и сделайте первый шаг к ясности.",
      button: "Начать разговор",
    },
    footer: {
      ...baseTranslations.en.footer,
      tagline: "Пространство для самопонимания и осознанных решений.",
      rights: "Все права защищены.",
    },
  },
  ja: {
    ...baseTranslations.en,
    nav: { features: "特徴", how: "使い方" },
    meta: { language: "言語を選択" },
    badge: "安心して考え、気持ちを表現できる場所",
    title: "気持ちを話して、自分を理解し、納得できる選択を。",
    subtitle:
      "感情を理解し、考えを整理し、さまざまな視点から状況を見つめ、より意識的な決断をするためのスマートな空間です。",
    ctaPrimary: "会話を始める",
    ctaSecondary: "使い方を見る",
    heroNote: "話し、理解し、新しい解決策を見つける場所。",
    privacy: "このサイトは会話を保存しません",
    always: "24時間いつでも利用可能",
    languages: "9言語",
    auth: {
      ...baseTranslations.en.auth,
      title: "ログイン",
      username: "ユーザー名",
      password: "パスワード",
      submit: "ログイン",
      invalid: "ユーザー名またはパスワードが正しくありません。",
      unavailable: "ログインはまだ設定されていません。",
      signingIn: "ログイン中…",
      logout: "ログアウト",
    },
    chat: {
      ...baseTranslations.en.chat,
      title: "安心して話してください",
      home: "ホーム",
      conversations: "会話履歴",
      newConversation: "新しい会話",
      noConversations: "新しい会話を始めましょう",
      stop: "返信を停止",
      input: "今考えていることを書いてください…",
      send: "送信",
      error: "接続に問題が発生しました。もう一度お試しください。",
      welcome: "こんにちは。気になっていることを話してください。一緒に考えてみましょう。",
      sourcesLabel: "出典",
      heritageSearchFailed:
        "回答に十分な信頼できる情報源を確認できませんでした。時間をおいて再試行するか、質問を言い換えてください。",
      sending: "考えています…",
    },
    features: {
      ...baseTranslations.en.features,
      title: "あなたを理解する空間",
      subtitle: "自分自身や状況をより明確に理解するためのシンプルなステップ。",
    },
    how: {
      ...baseTranslations.en.how,
      title: "使い方",
      subtitle: "気持ちを言葉にするところから、次の一歩までの3つのステップ。",
    },
    principles: { ...baseTranslations.en.principles, title: "判断や批判のない安心できる空間" },
    cta: {
      ...baseTranslations.en.cta,
      title: "始める準備はできましたか？",
      text: "今気になっていることを書いて、明確さへの第一歩を踏み出しましょう。",
      button: "会話を始める",
    },
    footer: {
      ...baseTranslations.en.footer,
      tagline: "自分を理解し、納得して選択するための空間。",
      rights: "無断転載を禁じます。",
    },
  },
};
