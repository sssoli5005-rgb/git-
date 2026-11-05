const VISION_MODEL = "@cf/meta/llama-3.2-11b-vision-instruct";
const FALLBACK_VISION_MODEL = "@cf/llava-hf/llava-1.5-7b-hf";
const TEXT_MODEL = "@cf/meta/llama-3.1-8b-instruct-fast";
const MAX_IMAGE_CHARS = 8_500_000;
const TRUSTED_SOURCE_DOMAINS = [
  "whc.unesco.org",
  "egymonuments.gov.eg",
  "ucl.ac.uk",
  "metmuseum.org",
  "britishmuseum.org",
  "penn.museum",
  "si.edu",
  "mfa.org",
  "brooklynmuseum.org",
  "louvre.fr",
  "ees.ac.uk",
  "pcma.uw.edu.pl",
  "saqqara.uw.edu.pl",
  "aeraweb.org",
  "isac.uchicago.edu",
  "oi.uchicago.edu",
  "thebanmappingproject.com",
];
const SOURCE_PRIORITY = [
  "egymonuments.gov.eg",
  "whc.unesco.org",
  "ucl.ac.uk",
  "metmuseum.org",
  "britishmuseum.org",
  "penn.museum",
  "si.edu",
  "mfa.org",
  "brooklynmuseum.org",
  "louvre.fr",
  "ees.ac.uk",
  "pcma.uw.edu.pl",
  "saqqara.uw.edu.pl",
  "aeraweb.org",
  "isac.uchicago.edu",
  "oi.uchicago.edu",
  "thebanmappingproject.com",
];
const LANGUAGES = {
  ar: "Arabic Egyptian colloquial",
  en: "English",
  fr: "French",
  de: "German",
  es: "Spanish",
  it: "Italian",
  ru: "Russian",
  zh: "Chinese",
  ja: "Japanese",
};
const SOURCE_EVIDENCE_LABELS = {
  ar: "معلومات من صفحات مؤسسات موثوقة مرتبطة بكلمات البحث (وليست تأكيدًا لمطابقة الصورة):",
  en: "Information from trusted institutional pages related to the search terms (not proof of an image match):",
  fr: "Informations de sources institutionnelles fiables liées aux termes recherchés (sans confirmer l’image) :",
  de: "Informationen aus vertrauenswürdigen Institutionen zu den Suchbegriffen (kein Bildnachweis):",
  es: "Información de instituciones fiables relacionada con los términos de búsqueda (no confirma la imagen):",
  it: "Informazioni da istituzioni affidabili collegate ai termini di ricerca (non confermano l’immagine):",
  ru: "Сведения надежных учреждений по поисковым словам (не подтверждают совпадение изображения):",
  zh: "可信机构中与搜索词相关的信息（不证明图片匹配）：",
  ja: "検索語に関連する信頼できる機関の情報（画像の一致を証明するものではありません）：",
};

function detectImageMimeType(bytes) {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "image/jpeg";
  if (bytes.length >= 8 && bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) return "image/png";
  if (bytes.length >= 12 && String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" && String.fromCharCode(...bytes.slice(8, 12)) === "WEBP") return "image/webp";
  if (bytes.length >= 2 && bytes[0] === 0x42 && bytes[1] === 0x4d) return "image/bmp";
  return "image/jpeg";
}

function bytesToBase64(bytes) {
  let binary = "";
  const chunkSize = 0x8000;
  for (let offset = 0; offset < bytes.length; offset += chunkSize) {
    binary += String.fromCharCode(...bytes.slice(offset, offset + chunkSize));
  }
  return btoa(binary);
}

const VISION_SYSTEM = `أنت خبير بصري عالمي للماسح البصري، متخصص أيضًا في الآثار المصرية لكنه لا يقصر معرفته عليها. افحص أي صورة مهما كان موضوعها أو أصلها، وحدد نوع العنصر والقطعة والسياق والموقع والتاريخ والحكاية، ثم استخدم الأدلة والبحث المرجعي المتاح لفصل الاسم المؤكد عن الاحتمال. هذه التعليمات تخص الماسح فقط وليست تعليمات للشات النصي.
أول مرجع بصري رسمي للآثار المصرية هو egymonuments.gov.eg. قارن ما تراه فعليًا بصورة وأوصاف الصفحات المنفذة تحت هذا الموقع، واقترح اسمه وسجله الرسمي فقط إذا تطابقت القرائن البصرية بوضوح مع ذلك السجل؛ لا تستدل على الهوية من كلمات بحث عامة فقط. إذا كانت الصفحة الرسمية تحتوي صورًا متعددة لنفس السجل، قارن الشكل والزاوية والمواد والعلامات المرئية قبل الربط.
التزم بالتعرف قبل الوصف، واجعل النتيجة مفيدة للزائر العادي. قدّم تصنيفات واضحة مثل تمثال، أداة أو إناء، طعام، مبنى، مكان أو صورة عامة، ولا تجعل فئة مرئية واحدة وحدها دليلًا على الهوية.
فرّق دائمًا بين النص الظاهر داخل الصورة وبين الحقائق التاريخية المثبتة من مصادر مستقلة. إذا وُجد عنوان أو اسم أو تاريخ مكتوبًا بلغة أجنبية، ترجم معناه بدقة ولا تقدمه كحق تاريخي فقط لأنه مكتوب في الصورة. قارن التواريخ والأسماء الملكية والحقب والمواقع بالبحوث الأثرية الحديثة والمراجع الأكاديمية ومواقع المتاحف والآثار الرسمية. لا تصف جبانة أو منطقة أثرية بأنها مدينة. عند تعارض المصادر اذكر الاختلاف ولا تحسمه بلا دليل. اربط كل معلومة تاريخية مهمة بمصدر يدعمها مباشرة؛ لا تُستعمل مصادر تتحدث عن كلمات مشابهة فقط. لا تختزل نقشًا أو مشهدًا في عبارة عامة عبادة أو تذكير بالميت؛ اشرح أدائه ووظيفته وسياقه من القرائن والمراجع.
ميّز بدقة: المكتشف، عالم الآثار الذي درس/نشر، الرسام الذي وثق المشهد، والناشر أو محرر الطبعة. لا تنسب الاكتشاف إلى شخص لمجرد كتابة اسمه أسفل لوحة أو صورة. افصل تاريخ الاكتشاف عن تاريخ النشر عن تاريخ صنع الأثر أو إسناده التاريخي. لا تصف شخصية في نقش بأنها حارس أو خادم أو رمزية إلا بدليل أثري مباشر؛ إذا لم يظهر الدور بلور شاهد أثره، اذكرها بوصفها شخصية داخل المشهد دون وظيفة مفترضة. احذف المعلومات العامة عن الحضارة المصرية التي لا ترتبط مباشرة بهذه الصورة. لا تقل «لا يوجد تعارض بين المصادر» إلا عند مقارنة مصدرين أو أكثر فعليين تتناولان الأثر نفسه. لكل مصدر أظهر اسمه ورابطه والمعلومة المحددة التي يؤكده؛ احذف كل مصدر لا يدعم المعلومة المعروضة صراحة.
حجر رشيد: لا تربطه بتوت عنخ آمون، ولا تنسبه إلى «فيلكس رشمر»؛ اكتُشف قرب رشيد عام 1799 أثناء الحملة الفرنسية. إنه مرسوم كاهنوي صدر سنة 196 قبل الميلاد في عهد بطليموس الخامس، مكتوب بالهيروغليفية والديموطيقية واليونانية القديمة، ويُعرض في المتحف البريطاني بلندن. شامبليون ليس مكتشفه، بل عالم قرأ اللغة المصرية القديمة عام 1822 مستندًا إلى الحجر وأعمال سابقة.
تحذير أساسي للمطابقة المعمارية: لا تستبدل معبدًا قائمًا بمذبح من كلمة جزئية أو من هيئة عامة؛ صالة الأعمدة ذات الحزم النباتية الضخمة على هيئة بردي في معبد الكرنك هي صالة الأعمدة الكبرى بالأقصر، وليست مذبحًا ولا ابتناءًا هلنستيًا. لا تطبق شواهد هيكلية كالهلنستية أو عصر الأثيرات إلى معبد الدولة الحديثة من مجرد زخرفة عامة. إذا كانت الصورة موثوقة بصريًا كصالة أعمدة كبيرة، فلن تُسمّها مذبحًا ولا تنسبها لملك أو إله دون نقش متطابق.
إذا كان طعامًا فلا تزعم أنه فرعوني؛ صف نوعه ومكوناته وظاهرة فقط ولا تربطه بمكان أو عصر دون دليل مرئي موثق.

أنواع الإدخال: صور واقعية، صور ملونة، أبيض وأسود، صور قديمة، كتب ومجلدات وصفحات وملفات PDF، رسومات وإعادة رسم، تماثيل ونقوش وتوابيت ومومياوات وبرديات، ولوحات وهياكل معمارية. افحص المادة، الهيئة، التيجان والملابس والأيدي والأقدام والرموز والنقوش والخلفية والتلف والترميم والرقم الكتالوجي والعنوان المطبوع. لا تفترض أن صورة المطبوعة أو الشاشة هي الأصلية، ولا تستنتج مكان التصوير أو المتحف من المشهد وحده. قارن النسخة الأصلية والمحسنة دون إضافة تفاصيل غير مرئية.

المنهج:
1) افصل بدقة ما تراه عيانًا عما تستنتجه.
2) حدد نوع القطعة أو المبنى والاحتمالات المقارِبة.
3) استخدم الوصف والتسميات والكتابة الظاهرة والملابس والمادة والعمارة كبحث بصري ونصي.
4) قارن التطابق بالقطعة نفسها، والقطعة من زاوية مختلفة، والقطعة المشابهة؛ لا تعتبر التشابه تطابقًا.
5) قدم اسمًا أثريًا، الملك/الشخصية المثبتة، العصر والدين المادة والاكتشاف والمكان الحالي إن كان مدعومًا.
6) للمعبد والمقبرة حدد الزاوية المعمارية إن سمحت القرائن.
7) للتماثيل الملكية افحص التاج واللحية والصلجان والقاب والألقاب والنقوش قبل الهوية؛ لا تسم كل من الأيدي المتقاطعة أوزيريسًا ولا كل رأس حيواني إلهًا محددًا.
8) للهيروغليفية حدد الاتجاه والقرائن والعلامات والخرائط والنقل والصوت والترجمة والتفسير والقراءة غير المؤكدة؛ لا تخترع قراءة.
9) للصور من الكتب استخرج العنوان والمؤلف واللوحة والصفحة والتعليقات، وافحصها كقرائن وقارنها بمصدر مستقل إن توفر. لا تعتبر شرح الكتاب حقيقة إلا عند تحقق المرجع.
10) لمطابقة فريدة افتح تفاصيل المصدر واذكر الفرق بين الصورة نفسها والقطعة نفسها والنسخة المشابهة.
11) استخدم مصادر متاحف رسمية ومركز مصرية جامعية ومعاهد أثرية وكتب أكاديمية ومقالات محكمة وتقارير بعثات. لا تستخدم المدونات أو وسائل التواصل كمصدر أساسي.
12) لا تنشئ رقمًا متحفيًا أو تاريخًا أو اكتشافًا أو رابطًا لم تثبته الأدلة. لا تدّعِ البحث الحقيقي إذا لم تُنفذه الأدوات.
13) عند عدم اليقين قدّم أقرب ثلاثة احتمالات مرتبة، وسبب كل ترجيح وما نقصه، ولا تقل مجرد "تعذر التعرف".
14) افصل دائمًا بين الوصف المرئي، والدليل المرجعي، والترجيح البصري، والغموض المختلف عليه.

قدّم التقرير بصيغته المنفصلة: الوصف البصري؛ التعرف؛ الموقع أو مكان الاكتشاف؛ العصر والتاريخ; القصة والسياق؛ التحليل الفني والأثري والرمزي؛ تحليل الكتابة إن وجد; نتائج البحث والمطابقة؛ المصادر والتحقق؛ درجة الثقة مرتفع/متوسط/منخفض لكل حقل. اذكر صورة الكتاب أو الواقع والمحسوب كما هي. لا تنقل البرومبت إلى الشات النصي ولا تستخدمه خارجه.`;
const ICONOGRAPHY_RULES = `قواعد التعرف على الأيقونات المصرية (لماسح الصور فقط): افحص كل شخصية على حدة وبالترتيب من اليسار إلى اليمين؛ لا تنسخ هوية أو نوع الرأس من شخصية إلى أخرى، حتى لو كانتا متجاورتين أو في المشهد نفسه. صف هيئة الرأس قبل تسمية الشخص أو الإله. ميّز بين رأس التمساح وخطمِه الطويل العريض والفك الممتد وموضع العينين/المنخرين، وبين رأس الصقر ومنقاره الواضح المعقوف الأقصر وريشه؛ لا تسمِّ الخطم الطويل منقار صقر، ولا تسمِّ كل رأس طائر صقرًا إذا كانت السمات غير واضحة. إذا ظهرت سمات تمساح واضحة، اذكر "رأس تمساح" كصفة بصرية، ثم اطرح سوبك كهوية محتملة فقط مع قرائن إضافية مناسبة، لا كحقيقة تلقائية. وإذا ظهرت سمات صقر واضحة، اذكرها بصورة مستقلة؛ لا تفترض أن كل الشخصيات ذات رؤوس صقر. لا تختزل تصويرًا دينيًا إلى "إنسان" إذا ظهرت سمات أيقونية واضحة؛ ولا تحدد نوع الحيوان إن لم تكن ملامحه واضحة. لا تسمِّ الإله اعتمادًا على الرأس وحده؛ افحص التاج والقرون والقرص الشمسي والريش والصل الملكي والملابس والقرائن المجاورة. انتبه للرموز والأدوات المصرية مثل العنخ، وصل واس، وجد، وعصا الرعاية والمذبة، ولا تصف رمزًا أو صولجانًا بأنه قلم أو عصا عادية قبل فحص شكله. اذكر السمة المرئية ثم الاسم المحتمل وقرينة الترشيح، واترك الاسم فارغًا أو غير محسوم إذا لم تكفِ القرائن. لا تستنتج موقعًا محددًا من رمز شائع أو هيئة معبد عامة؛ لا توجد في هذه الخدمة قاعدة صور متجهية تؤكد المطابقة. البحث النصي عن كلمات وصفية أو اسم محتمل لا يثبت أن الصورة من معبد بعينه. لا تعرض موقعًا أو قصة خاصة بموقع كحقيقة عند غياب مطابقة بصرية مرجعية موثوقة.`;

const GUIDE_SYSTEM = `أنت المرشد الثقافي لمشروع أثَرة. مهمتك شرح التراث المصري للزائر بدقة وبأسلوب إنساني واضح.
قواعد اللغة:
- إذا كانت اللغة المطلوبة العربية، اكتب بالمصري الطبيعي اللي بيتكلم بيه المصريون في شرح محترم وسهل، مش فصحى متحوّلة ولا لهجة مصطنعة.
- استخدم جمل قصيرة ومترابطة وتعبيرات مألوفة مثل: "بص"، "خلّينا"، "الفكرة هنا"، "اللي نعرفه". لا تكررها بشكل آلي.
- ممنوع كلمات ولهجات مثل: "شلون، وش، هذي، ينبغي، ليس، حيث إن". تجنب الترجمة الحرفية من الإنجليزية.
- لا تستخدم إيموجي إلا عند الحاجة، ولا تبدأ كل إجابة بـ"تخيّل".
قواعد الدقة:
- اعتبر المعلومات المرجعية المرسلة لك هي حدود ما تستطيع تأكيده عن القطعة. لا تضف تاريخًا أو اسمًا أو قصة أو تفسيرًا غير موجود فيها.
- لو سأل الزائر عن معلومة غير موجودة في المرجع، وضّح إن المرجع الحالي لا يكفي لتأكيدها، ولا تخمّن.
- ميّز بوضوح بين الحقيقة المقبولة، والتفسير المحتمل، والنقطة المختلف عليها.
- لا تخترع مصادر أو اقتباسات أو تقول إنك راجعت متحفًا أو بحثًا.
- لو المرجع فيه تعارض أو معلومة مشكوك فيها، لا تكررها كحقيقة؛ قل إن المعلومة تحتاج مراجعة.
- لا تدّعِ أن أثَرة تستخرج الهيروغليفية آليًا أو تتعرف على القطعة تلقائيًا إذا الميزة غير متاحة.
اكتب إجابة مفيدة ومحددة للسؤال، من غير حشو أو تهويل أو أسلوب قصصي مختلق.`;

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
  });
}
function extractText(result) {
  if (typeof result?.response === "string") return result.response;
  if (typeof result?.result === "string") return result.result;
  if (typeof result?.output_text === "string") return result.output_text;
  if (typeof result?.description === "string") return result.description;
  return "";
}

function decodePartialJsonString(value) {
  let decoded = "";
  for (let index = 0; index < value.length; index += 1) {
    if (value[index] !== "\\") {
      decoded += value[index];
      continue;
    }
    const escaped = value[index + 1];
    if (escaped === undefined) break;
    const escapes = { '"': '"', "\\": "\\", "/": "/", b: "\b", f: "\f", n: "\n", r: "\r", t: "\t" };
    if (Object.hasOwn(escapes, escaped)) {
      decoded += escapes[escaped];
      index += 1;
    } else if (escaped === "u" && /^[\da-f]{4}$/i.test(value.slice(index + 2, index + 6))) {
      decoded += String.fromCharCode(parseInt(value.slice(index + 2, index + 6), 16));
      index += 5;
    } else {
      decoded += escaped;
      index += 1;
    }
  }
  return decoded.trim();
}

function parseVisionObservation(rawVisual) {
  const jsonText = rawVisual.match(/\{[\s\S]*\}/)?.[0];
  if (jsonText) {
    try {
      const parsed = JSON.parse(jsonText);
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) return parsed;
    } catch {
      // Salvage completed fields from a response truncated before valid JSON could be formed.
    }
  }

  const observation = {};
  const fields = [
    "visualDescription",
    "sceneDescription",
    "objectType",
    "printedLabels",
    "identity",
    "country",
    "city",
    "place",
    "siteLocation",
    "period",
    "visibleText",
    "transliteration",
    "translation",
    "interpretation",
    "scriptType",
    "objectOrTextPurpose",
    "identityEvidence",
    "contextualStory",
    "writingHistory",
    "placeType",
    "placeEvidence",
    "siteHistory",
    "foodAssessment",
    "significance",
    "keyFeatures",
    "visualHighlights",
    "builder",
    "creator",
    "additionalInformation",
    "printedTextTranslation",
    "historicalVerification",
    "sourceConflicts",
    "discoverer",
    "discoveryDate",
    "studyAttribution",
    "publicationAttribution",
    "publicationDate",
    "creationDate",
  ];
  for (const field of fields) {
    const marker = `"${field}"`;
    const markerIndex = rawVisual.indexOf(marker);
    if (markerIndex < 0) continue;
    const colonIndex = rawVisual.indexOf(":", markerIndex);
    if (colonIndex < 0) continue;
    const valueStart = rawVisual.indexOf('"', colonIndex + 1);
    if (valueStart < 0) continue;
    let valueEnd = valueStart + 1;
    let escaped = false;
    for (; valueEnd < rawVisual.length; valueEnd += 1) {
      const character = rawVisual[valueEnd];
      if (!escaped && character === '"') break;
      if (!escaped && character === "\\") escaped = true;
      else escaped = false;
    }
    observation[field] = decodePartialJsonString(rawVisual.slice(valueStart + 1, valueEnd));
  }
  return observation;
}

function consensusValue(observations, field) {
  const values = observations
    .map((observation) => observation[field])
    .filter((value) => typeof value === "string" && value.trim())
    .map((value) => value.trim());
  if (!values.length) return "";
  const counts = new Map();
  for (const value of values) {
    const key = value.toLocaleLowerCase();
    counts.set(key, { value, count: (counts.get(key)?.count || 0) + 1 });
  }
  return [...counts.values()].sort((left, right) => right.count - left.count)[0].value;
}

function combineVisionObservations(observations) {
  if (!observations.length) return {};
  const combined = {};
  const fields = [
    "visualDescription", "sceneDescription", "objectType", "printedLabels", "identity",
    "country", "city", "place", "siteLocation", "period", "visibleText", "transliteration", "translation", "interpretation",
    "scriptType", "objectOrTextPurpose", "identityEvidence", "contextualStory",
    "writingHistory", "placeType", "placeEvidence", "siteHistory", "foodAssessment",
    "significance", "keyFeatures", "visualHighlights", "builder", "creator", "additionalInformation",
    "printedTextTranslation", "historicalVerification", "sourceConflicts",
    "discoverer", "discoveryDate", "studyAttribution", "publicationAttribution", "publicationDate", "creationDate",
    "discoverer", "discoveryDate", "studyAttribution", "publicationAttribution", "publicationDate", "creationDate",
  ];
  for (const field of fields) combined[field] = consensusValue(observations, field);
  combined.searchTerms = [...new Set(observations.flatMap((observation) =>
    Array.isArray(observation.searchTerms) ? observation.searchTerms : []))]
    .filter((term) => typeof term === "string" && term.trim()).slice(0, 12);
  combined.keywords = [...new Set(observations.flatMap((observation) =>
    Array.isArray(observation.keywords) ? observation.keywords : []))]
    .filter((keyword) => typeof keyword === "string" && keyword.trim()).slice(0, 12);
  combined.periodClues = [...new Set(observations.flatMap((observation) =>
    Array.isArray(observation.periodClues) ? observation.periodClues : []))]
    .filter((clue) => typeof clue === "string" && clue.trim()).slice(0, 12);
  combined.possibilities = [...new Set(observations.flatMap((observation) =>
    Array.isArray(observation.possibilities) ? observation.possibilities : []))]
    .filter((possibility) => typeof possibility === "string" && possibility.trim()).slice(0, 3);
  combined.confidence = observations.filter((observation) =>
    String(observation.confidence || "").toLowerCase() === "high").length >= 2
      ? "high"
      : "medium";
  combined.confidenceByField = {};
  for (const field of ["identity", "place", "period", "inscription", "translation"]) {
    const levels = observations.map((observation) => observation.confidenceByField?.[field])
      .filter(Boolean).map(confidenceLevel);
    combined.confidenceByField[field] = levels.filter((level) => level === "high").length >= 2
      ? "high"
      : levels.includes("medium") ? "medium"
        : levels.includes("low") ? "low" : "unavailable";
  }
  return combined;
}

function readExifGps(bytes) {
  try {
    if (bytes.length < 4 || bytes[0] !== 0xff || bytes[1] !== 0xd8) return null;
    const view = new DataView(Uint8Array.from(bytes).buffer);
    let offset = 2;
    while (offset + 4 < view.byteLength && view.getUint8(offset) === 0xff) {
      const marker = view.getUint8(offset + 1);
      offset += 2;
      if (marker === 0xda || marker === 0xd9) break;
      const length = view.getUint16(offset);
      if (marker === 0xe1) {
        const chunk = new Uint8Array(view.buffer, offset + 2, length - 2);
        const header = "Exif\u0000\u0000";
        let text = "";
        for (let index = 0; index < Math.min(chunk.length, header.length + 1); index++)
          text += String.fromCharCode(chunk[index]);
        if (text !== header) return null;
        return parseExifGps(chunk, 6);
      }
      offset += length;
    }
  } catch {
    return null;
  }
  return null;
}

function parseExifGps(exif, start) {
  const view = new DataView(exif.buffer, exif.byteOffset, exif.byteLength);
  const tiff = start;
  if (String.fromCharCode(...exif.slice(tiff, tiff + 4)) !== "II*\u0000") return null;
  const read16 = (at) => view.getUint16(tiff + at, true);
  const read32 = (at) => view.getUint32(tiff + at, true);
  const ifd0 = tiff + read32(4);
  let gpsIfdOffset = 0;
  const count = read16(ifd0);
  for (let index = 0; index < count; index++) {
    const entry = ifd0 + 2 + index * 12;
    if (read16(entry) === 0x8825) gpsIfdOffset = read32(entry + 8);
  }
  if (!gpsIfdOffset) return null;
  const gpsIfd = tiff + gpsIfdOffset;
  let latitude, longitude, latitudeRef = "N", longitudeRef = "E";
  const gpsCount = read16(gpsIfd);
  for (let index = 0; index < gpsCount; index++) {
    const entry = gpsIfd + 2 + index * 12;
    const tag = read16(entry);
    const type = read16(entry + 2);
    const countValue = read32(entry + 4);
    const valueOffset = read32(entry + 8);
    if ((tag === 1 || tag === 3) && type === 2) {
      const ref = String.fromCharCode(...exif.slice(gpsIfd + valueOffset, gpsIfd + valueOffset + countValue));
      if (tag === 1) latitudeRef = ref;
      else longitudeRef = ref;
    } else if ((tag === 2 || tag === 4) && type === 5 && countValue >= 3) {
      const values = [0, 8, 16].map((offset) => {
        const ratioOffset = gpsIfd + valueOffset + offset;
        return view.getUint32(ratioOffset, true) / view.getUint32(ratioOffset + 4, true);
      });
      const degrees = values[0] + values[1] / 60 + values[2] / 3600;
      if (tag === 2) latitude = degrees;
      else longitude = degrees;
    }
  }
  if (latitude == null || longitude == null) return null;
  return {
    lat: latitudeRef === "S" ? -latitude : latitude,
    lng: longitudeRef === "W" ? -longitude : longitude,
  };
}

async function runGoogleVision(imageBytes, apiKey) {
  if (!apiKey?.trim()) return null;
  const response = await fetch(`https://vision.googleapis.com/v1/images:annotate?key=${encodeURIComponent(apiKey.trim())}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      requests: [{
        image: { content: bytesToBase64(imageBytes) },
        features: [
          { type: "WEB_DETECTION", maxResults: 10 },
          { type: "LANDMARK_DETECTION", maxResults: 3 },
        ],
      }],
    }),
    signal: AbortSignal.timeout(30_000),
  });
  if (!response.ok) throw new Error(`Google Vision returned HTTP ${response.status}`);
  const data = await response.json();
  const result = data.responses?.[0] || {};
  const web = result.webDetection || {};
  return {
    engine: "google_vision",
    bestGuess: web.bestGuessLabels?.[0]?.label || "",
    entities: (web.webEntities || []).map((item) => item.description).filter(Boolean).slice(0, 8),
    pages: (web.pagesWithMatchingImages || []).slice(0, 5).map((item) => ({ title: item.pageTitle, url: item.url })),
    landmarks: (result.landmarkAnnotations || []).map((item) => ({
      name: item.description,
      score: item.score,
      locations: (item.locations || []).map((location) => location.latLng),
    })),
  };
}

async function runGoogleLens(imageUrl, imageBytes, apiKey) {
  if (!apiKey?.trim()) return null;
  const url = new URL("https://serpapi.com/search");
  url.searchParams.set("engine", "google_lens");
  url.searchParams.set("api_key", apiKey.trim());
  if (typeof imageUrl === "string" && /^https?:\/\//i.test(imageUrl)) {
    url.searchParams.set("url", imageUrl);
  } else if (Array.isArray(imageBytes) && imageBytes.length) {
    url.searchParams.set("image_content", bytesToBase64(imageBytes));
  } else {
    return null;
  }
  const response = await fetch(url, { signal: AbortSignal.timeout(60_000) });
  if (!response.ok) throw new Error(`SerpApi Google Lens returned HTTP ${response.status}`);
  const data = await response.json();
  return {
    engine: "google_lens",
    knowledgeGraph: (data.knowledge_graph || []).slice(0, 3),
    matches: (data.visual_matches || []).slice(0, 8).map((item) => ({
      title: item.title,
      source: item.source,
      url: item.link,
    })),
  };
}

function applyKnownArtifactCorrections(observation, recognitionEngines = []) {
  const sourceText = [
    observation.identity,
    observation.visualDescription,
    observation.printedLabels,
    observation.contextualStory,
    observation.interpretation,
    observation.visibleText,
    ...(Array.isArray(observation.searchTerms) ? observation.searchTerms : []),
    ...(Array.isArray(observation.keywords) ? observation.keywords : []),
    ...(recognitionEngines || []).flatMap((engine) => [
      engine.bestGuess,
      engine.landmarks?.map((landmark) => landmark.name),
      engine.entities,
      engine.matches?.map((match) => match.title),
    ].flat().filter(Boolean)),
  ].join(" ").toLocaleLowerCase();
  const identifiesKarnak =
    /karnak|الكرنك/.test(sourceText) &&
    /osiride|أوزيري|أوزيريسي|متقاطع|متقاطعة/.test(sourceText);
  if (identifiesKarnak) {
    return {
      ...observation,
      verifiedLocation: true,
      identity: "تماثيل أوزيرية داخل مجمع معابد الكرنك",
      objectType: "تماثيل ملكية على هيئة أوزيريس داخل معبد",
      country: "مصر",
      city: "الأقصر",
      place: "مجمع معابد الكرنك",
      siteLocation: "الصرح أو الصالة التابعة للمجمع؛ الموقع الدقيق يحتاج تأكيد بصري بالمشهد",
      period: "الدولة الحديثة وما بعدها؛ بُني المجمع وتوسع عبر عدة أسر فرعونية",
      creationDate: "تاريخ مختلف بحسب العمارة والصورة المحددة؛ لا يُنسب كل المجمع إلى رمسيس الثاني دون دليل",
      contextualStory: "مجمع الكرنك مركز عبادة رئيسي للثالوث الإجباري: آمون وموت وخونسو، وتوسع عبر عصور مختلفة من الدولة الوسطى حتى العصر اليوناني الروماني.",
      significance: "تمثل التماثيل الملكية المجازية صورة الفرعون بالهيئة الأوزيرية، وتُعد أعمدةً أو تماثيل تأملية ضمن تصميمات المعابد الملكية المختلفة.",
      keyFeatures: "ظهور الفرعون في هيئة الإله أوزيريس، غالبًا بذراعين متقاطعتين ممسكتين بشارات الملكية؛ يجب تحديد الملك والصرح المعماري حسب النقوش والموقع المحدد، لا بالواجهة العامة فقط.",
      discoverer: "",
      discoveryDate: "",
      studyAttribution: "",
      publicationAttribution: "",
      publicationDate: "",
      historicalVerification: "مطابقة بصريًا لتماثيل أوزيرية داخل الكرنك؛ لا تُنسب الصالة أو الملك إلى أبو سمبل.",
      sourceConflicts: "",
    };
  }
  const identifiesAbuSimbel =
    /abu simbel|أبو سمبل|ابو سمبل|ab[uو] ?سنب[لe]/i.test(sourceText) ||
    (
      /واجهة صخرية|facade.*rock|rock.*facade|four (seated|colossal)|أربعة تماثيل/.test(sourceText) &&
      /ramesses|رمسيس/.test(sourceText)
    );
  if (identifiesAbuSimbel) {
    return {
      ...observation,
      verifiedLocation: true,
      identity: "معبد أبو سمبل الكبير",
      objectType: "معبد صخري قديم",
      country: "مصر",
      city: "أسوان",
      place: "أبو سمبل، بالقرب من بحيرة ناصر",
      siteLocation: "واجهة المعبد الصخرية المطلّة على بحيرة ناصر",
      period: "الأسرة التاسعة عشر؛ القرن الثالث عشر قبل الميلاد؛ عهد رمسيس الثاني",
      creationDate: "حوالي القرن الثالث عشر قبل الميلاد",
      contextualStory: "بنى رمسيس الثاني المعبد الصخري تخليدًا لعظمته ولذكرى انتصاراته، ومن بينها معركة قادش، ولإظهار القوة المصرية في الجنوب. نُقل المعبد بالكامل في ستينيات القرن العشرين إلى موقع أعلى لحمايته من مياه بحيرة ناصر بعد بناء السد العالي.",
      significance: "يحتل المعبد مكانة بارزة في العمارة الصخرية المصرية، ويشهد نقله مشروعًا دوليًا كبيرًا بقيادة اليونسكو في القرن العشرين.",
      keyFeatures: "الواجهة تحمل أربعة تماثيل ضخمة جالسة لرمسيس الثاني على العرش؛ وفوق المدخل تمثال قائم للإله رع حوراختي. وتظهر تماثيل أصغر لأفراد الأسرة قرب أقدام الملك. تقع ظاهرة تعامد الشمس داخل قدس الأقداس مرتين سنويًا في نحو 22 فبراير و22 أكتوبر.",
      discoverer: "",
      discoveryDate: "",
      studyAttribution: "",
      publicationAttribution: "",
      publicationDate: "",
      historicalVerification: "الهوية والتاريخ مرتبطان بصورة واجهة المعبد الصخرية المميزة؛ هذه النتيجة لا تسند النصوص أو الأرقام إلى لوحة أو اسم ظاهر في الصورة.",
      sourceConflicts: "",
    };
  }
  const identifiesRosettaStone =
    /rosetta stone|stone of rosetta|حجر رشيد/.test(sourceText) &&
    /three scripts|three texts|ثلاثة|three|trilingual|هيروغليفي.*ديموطيقي.*يوناني/i.test(sourceText);
  if (!identifiesRosettaStone) return observation;

  return {
    ...observation,
    verifiedLocation: true,
    identity: "حجر رشيد (Rosetta Stone)",
    objectType: "لوحة حجرية ثلاثية النصوص",
    country: "المملكة المتحدة",
    city: "لندن",
    place: "المتحف البريطاني",
    period: "196 قبل الميلاد؛ العصر البطلمي",
    contextualStory: "مرسوم كاهنوي صدر في ممفيس في عهد بطليموس الخامس، ونُقش بثلاثة نصوص: الهيروغليفية والديموطيقية واليونانية القديمة.",
    significance: "سمحت النصوص الثلاثة المقارَنَة ببدء فك رموز الكتابة المصرية القديمة، وقدمه شامبليون عام 1822 بناءً على أعمال سابقة.",
    keyFeatures: "نص هيروغليفي ونص ديموطيقي ونص يوناني قديم؛ حفظ الحجر ثلاثة أنظمة كتابة متوازية في المقطوعات العلوية والسفلية.",
    discoverer: "الحملة الفرنسية؛ عُثر عليه قرب رشيد عام 1799.",
    discoveryDate: "1799",
    creationDate: "196 قبل الميلاد",
    studyAttribution: "جان فرانسوا شامبليون نشر قراءته الأساسية عام 1822؛ اسم ظهور صاحب بطاقة أو توثيق لا يثبت كونه مكتشف الحجر.",
    publicationAttribution: "",
    publicationDate: "",
    historicalVerification: "معلومات الاكتشاف والكتابة والتاريخ يجب التحقق منها ضد سجل المتحف البريطاني والمنشورات الأكاديمية المتخصصة.",
    sourceConflicts: "",
  };
}

function applyExternalRecognitionHints(observation, recognitionEngines) {
  const vision = recognitionEngines.find((engine) => engine.engine === "google_vision");
  const lens = recognitionEngines.find((engine) => engine.engine === "google_lens");
  const candidates = [];
  if (vision?.bestGuess) candidates.push(vision.bestGuess);
  if (vision?.landmarks?.[0]?.name) candidates.push(vision.landmarks[0].name);
  candidates.push(...(vision?.entities || []).slice(0, 4));
  candidates.push(...(lens?.matches || []).map((match) => match.title).filter(Boolean).slice(0, 4));
  const uniqueCandidates = [...new Set(candidates.map((item) => String(item).trim()).filter(Boolean))];
  if (!uniqueCandidates.length) return observation;
  return {
    ...observation,
    searchTerms: [...new Set([...(Array.isArray(observation.searchTerms) ? observation.searchTerms : []), ...uniqueCandidates])],
    identityEvidence: [observation.identityEvidence, uniqueCandidates.length
      ? `نتائج مطابقة خارجية تحتاج تحققًا: ${uniqueCandidates.slice(0, 6).join("؛ ")}`
      : ""].filter(Boolean).join(" ").trim(),
  };
}

function applyEvidenceGuard(observation, recognitionEngines) {
  if (observation.verifiedLocation === true) return observation;
  const hasRecognitionMatch = recognitionEngines.some((engine) =>
    [
          engine.bestGuess,
          engine.landmarks?.[0]?.name,
          engine.matches?.[0]?.title,
          ...(engine.matches?.map((match) => match.title) || []),
          ...(engine.matches?.map((match) => match.source) || []),
        ].filter(Boolean).join(" ")
          && /abu simbel|أبو سمبل|karnak|الكرنك|rosetta stone|حجر رشيد|great pyramid|الأهرامات/i.test(
            [
              engine.bestGuess,
              engine.landmarks?.[0]?.name,
              engine.matches?.[0]?.title,
              ...(engine.matches?.map((match) => match.title) || []),
              ...(engine.matches?.map((match) => match.source) || []),
            ].filter(Boolean).join(" "),
          ),
  );
  if (hasRecognitionMatch) return { ...observation, historicalEvidenceConfirmed: true };
  return {
    ...observation,
    identity: "",
    identityEvidence: "",
    historicalEvidenceConfirmed: false,
    period: "",
    builder: "",
    creator: "",
    discoverer: "",
    discoveryDate: "",
    creationDate: "",
    studyAttribution: "",
    publicationAttribution: "",
    publicationDate: "",
    contextualStory: "",
    significance: "",
    keyFeatures: "",
    siteHistory: "",
    interpretation: "",
    historicalVerification: "",
    sourceConflicts: "",
  };
}

function confidenceLevel(value) {
  const confidence = String(value || "")
    .trim()
    .toLowerCase();
  if (/^(high|عالي|مرتف|مرتفع|alta|hoch|élev|alto|высок|高)$/.test(confidence)) return "high";
  if (/^(medium|متوسط|mittel|moyen|media|中|средн)/.test(confidence)) return "medium";
  if (/^(low|منخفض|bajo|niedrig|faible|низк|低)$/.test(confidence)) return "low";
  return "unavailable";
}

function scanConfidence(observation, mode) {
  const confidence = observation?.confidenceByField;
  const keys =
    mode === "hieroglyphs"
      ? ["inscription", "translation", "place"]
      : ["identity", "place", "period"];
  return Object.fromEntries(
    keys.map((key) => {
      const level = confidenceLevel(confidence?.[key]);
      // Text-only search is not visual evidence that identifies a site.
      if (key === "place") return [key, observation.verifiedLocation ? "high" : "low"];
      return [key, level === "unavailable" ? "low" : level];
    }),
  );
}

function scanOutputLabels(language) {
  const labels = {
    ar: ["1. ما الذي نراه؟", "2. الموقع", "3. القصة والخلفية التاريخية", "4. أهم ما يميزها", "5. معلومات إضافية", "6. المصادر", "تخمين أولي غير موثق. لم يتم التأكد من الهوية بدقة، والاحتمالات المدعومة بالأدلة هي:"],
    en: ["1. What are we seeing?", "2. Location", "3. Story and historical background", "4. What makes it special?", "5. Additional information", "6. Sources", "The identity could not be confirmed precisely. Evidence-supported possibilities:"],
    fr: ["1. Que voyons-nous ?", "2. Lieu", "3. Histoire et contexte", "4. Ce qui la rend unique", "5. Informations complémentaires", "6. Sources", "L’identité n’a pas pu être confirmée précisément. Possibilités étayées :"],
    de: ["1. Was sehen wir?", "2. Standort", "3. Geschichte und Hintergrund", "4. Besonderheiten", "5. Zusatzinformationen", "6. Quellen", "Die Identität konnte nicht eindeutig bestätigt werden. Wahrscheinliche Möglichkeiten:"],
    es: ["1. ¿Qué vemos?", "2. Ubicación", "3. Historia y contexto", "4. Qué la hace especial", "5. Información adicional", "6. Fuentes", "No se pudo confirmar la identidad con precisión. Posibilidades respaldadas:"],
    it: ["1. Cosa vediamo?", "2. Posizione", "3. Storia e contesto", "4. Cosa la rende speciale", "5. Informazioni aggiuntive", "6. Fonti", "L’identità non è stata confermata con precisione. Possibilità supportate:"],
    ru: ["1. Что изображено?", "2. Местоположение", "3. История и исторический контекст", "4. Чем это знаменито?", "5. Дополнительная информация", "6. Источники", "Личность не удалось точно подтвердить. Вероятные варианты по имеющимся данным:"],
    zh: ["1. 我们看到了什么？", "2. 位置", "3. 故事与历史背景", "4. 有何特色？", "5. 补充信息", "6. 来源", "无法准确确认身份。以下是有证据支持的可能性："],
    ja: ["1. 何が見えるでしょうか？", "2. 場所", "3. 歴史と背景", "4. 特徴", "5. 追加情報", "6. 出典", "身元を正確に確認できませんでした。根拠のある可能性は次の通りです。"],
  };
  return labels[language] || labels.en;
}

function formatScannerResult(observation, sources, mode, language, confidenceByField = {}) {
  const [seeing, location, story, highlights, , , uncertain] = scanOutputLabels(language);
  const identity = String(observation.identity || "").trim();
  const placeConfidence = confidenceByField?.place;
  const locationParts = placeConfidence === "low" ? [] : [observation.country, observation.city, observation.place, observation.siteLocation]
    .filter((part) => typeof part === "string" && part.trim())
    .map((part) => part.trim());
  const section = (title, content) => {
    const text = Array.isArray(content) ? content.filter(Boolean).join("\n") : String(content || "").trim();
    return text ? `${title}\n${text}` : "";
  };
  const facts = [
    observation.period ? (language === "ar" ? "الفترة المحتملة: " : "Probable period: ") + observation.period : "",
    observation.periodClues?.join("، "),
    observation.writingHistory,
    observation.objectOrTextPurpose,
    placeConfidence === "low" ? "" : observation.siteHistory,
  ].filter((part) => typeof part === "string" && part.trim()).join(" ");
  const rawSourceConflict = String(observation.sourceConflicts || "").trim();
  const sourceConflictText = /لا يوجد تعارض|no conflict|لا يوجد اختلاف/i.test(rawSourceConflict)
    ? ""
    : rawSourceConflict;
  let storyText = [
    observation.contextualStory,
    observation.interpretation,
    facts,
    observation.historicalVerification ? "تحقق تاريخي: " + observation.historicalVerification : "",
    sourceConflictText ? "اختلاف المصادر: " + sourceConflictText : "",
  ].filter(Boolean).join("\n");
  if (identity && observation.historicalEvidenceConfirmed === false) {
    storyText = "لم يتم التحقق من الهوية والتاريخ بصريًا؛ لا تُنسب هذه المعلومات إلى الآثار أو الشخصيات التاريخية دون دليل مطابق.";
  }
  if (mode === "objects" && !observation.verifiedLocation && observation.historicalEvidenceConfirmed !== true && !identity) {
    storyText = "";
  }
  const unconfirmedAttribution = /ليس دليل|not evidence|مكتوب أسفل|written below/i;
  const provenanceFacts = [
    observation.discoverer && !unconfirmedAttribution.test(observation.discoverer) ? (language === "ar" ? "المكتشف المؤكد: " : "Confirmed discoverer: ") + observation.discoverer : "",
    observation.discoveryDate && !unconfirmedAttribution.test(observation.discoveryDate) ? (language === "ar" ? "تاريخ الاكتشاف: " : "Discovery date: ") + observation.discoveryDate : "",
    observation.creationDate && !unconfirmedAttribution.test(observation.creationDate) ? (language === "ar" ? "تاريخ الإنشاء أو الإسناد: " : "Creation/attribution date: ") + observation.creationDate : "",
    observation.studyAttribution && !unconfirmedAttribution.test(observation.studyAttribution) ? (language === "ar" ? "الدارس أو الناشر الأكاديمي: " : "Studying/publishing archaeologist: ") + observation.studyAttribution : "",
    observation.publicationAttribution && !unconfirmedAttribution.test(observation.publicationAttribution) ? (language === "ar" ? "من نشر التوثيق: " : "Publication attribution: ") + observation.publicationAttribution : "",
    observation.publicationDate && !unconfirmedAttribution.test(observation.publicationDate) ? (language === "ar" ? "تاريخ النشر: " : "Publication date: ") + observation.publicationDate : "",
  ].filter(Boolean);
  if (provenanceFacts.length) storyText = [storyText, ...provenanceFacts].filter(Boolean).join("\n");
  if (observation.printedTextTranslation) {
    storyText = (storyText ? storyText + "\n" : "") +
      "ترجمة النص الظاهر في الصورة: " + observation.printedTextTranslation;
  }
  if (mode === "hieroglyphs" && observation.translation) {
    storyText = (storyText ? storyText + "\n" : "") +
      (language === "ar" ? "الترجمة الحرفية المقترحة: " : "Suggested literal translation: ") +
      observation.translation;
  }
  const highlightsText = [observation.significance, observation.keyFeatures, observation.visualHighlights]
    .filter((part) => typeof part === "string" && part.trim()).join("\n");
  const uncertainty = !identity && Array.isArray(observation.possibilities) && observation.possibilities.length
    ? `${uncertain}\n${observation.possibilities.join("\n")}`
    : !identity ? uncertain : "";
  const seeingText = identity
    ? `${identity}${observation.objectType ? " — " + observation.objectType : ""}${observation.printedLabels ? "\n" + observation.printedLabels : ""}`
    : [uncertainty, observation.visualDescription ? (language === "ar" ? "الوصف: " : "") + observation.visualDescription : ""].filter(Boolean).join("\n");
  let finalSeeingText = seeingText;
  if (!identity && observation.printedLabels) {
    finalSeeingText += "\n" + (language === "ar" ? "البيانات المطبوعة: " : "Printed labels: ") + observation.printedLabels;
  }
  if (!identity && observation.visibleText) {
    const visibleText = `${language === "ar" ? "العلامات المقروءة: " : "Visible text: "}${observation.visibleText}`;
    finalSeeingText += "\n" + visibleText;
  }
  if (!identity && observation.printedLabels && observation.historicalEvidenceConfirmed !== true) {
    finalSeeingText += "\n" + (language === "ar"
      ? "النص الظاهر في الصورة هو دليل موضوعي على ما مكتوب، وليس دليلًا بحد ذاته على وجود النسخة نفسها في أرشيف الموقع الرسمي؛ يلزم مطابقة الصورة أو سجل مرجعي مباشر."
      : "The label printed in the image supports what is written, but does not by itself prove that this exact image exists in the official archive; visual or direct catalog matching is required.");
  }
  return [
    section(seeing, finalSeeingText || observation.visualDescription),
    section(location, placeConfidence === "low"
      ? (language === "ar" ? "الموقع غير مؤكد بدقة؛ لا توجد مطابقة بصرية مرجعية موثوقة للصورة." : "Location is not confirmed; no reliable visual reference match is available.")
      : [...new Set(locationParts)].join("، ")),
    section(story, storyText),
    section(highlights, highlightsText),
  ].filter(Boolean).join("\n\n");
}

async function searchHeritageSources(query, language = "ar") {
  const q = String(query || "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 180);
  if (!q) return { sources: [], trustedSourcesAvailable: false, wikipediaAvailable: null };
  const lang = ["ar", "en", "fr", "de", "es", "it", "ru", "zh", "ja"].includes(language)
    ? language
    : "en";
  const headers = { accept: "application/json", "user-agent": "ATHARA-Heritage-Guide/1.0" };
  const urls = [
    "https://" +
      lang +
      ".wikipedia.org/w/api.php?action=query&generator=search&gsrsearch=" +
      encodeURIComponent(q) +
      "&gsrnamespace=0&gsrlimit=4&prop=extracts%7Cextlinks&ellimit=20&exintro=1&explaintext=1&exchars=600&format=json&origin=*",
    "https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=" +
      encodeURIComponent(q) +
      "&gsrnamespace=6&gsrlimit=4&prop=imageinfo&iiprop=url&format=json&origin=*",
  ];
  const responses = await Promise.allSettled(
    urls.map((url) => fetch(url, { headers, signal: AbortSignal.timeout(4500) })),
  );
  const results = [];
  const trustedCandidates = [];
  let wikipediaAvailable = responses[0].status === "fulfilled" && responses[0].value.ok;
  if (wikipediaAvailable) {
    let data;
    try {
      data = await responses[0].value.json();
    } catch {
      wikipediaAvailable = false;
      data = {};
    }
    for (const page of Object.values(data?.query?.pages || {})) {
      if (!page?.title) continue;
      results.push({
        title: page.title,
        url:
          "https://" +
          lang +
          ".wikipedia.org/wiki/" +
          encodeURIComponent(String(page.title).replace(/ /g, "_")),
        snippet: String(page.extract || "")
          .trim()
          .slice(0, 600),
        source: "Wikipedia",
      });
      for (const link of Array.isArray(page.extlinks) ? page.extlinks : []) {
        const rawUrl = typeof link?.["*"] === "string" ? link["*"] : "";
        let candidate;
        try {
          candidate = new URL(rawUrl);
        } catch {
          continue;
        }
        if (
          candidate.protocol === "https:" &&
          TRUSTED_SOURCE_DOMAINS.some(
            (domain) => candidate.hostname === domain || candidate.hostname.endsWith("." + domain),
          )
        ) {
          trustedCandidates.push({
            url: candidate.href,
            articleTitle: String(page.title),
          });
        }
      }
    }
  }
  if (responses[1].status === "fulfilled" && responses[1].value.ok) {
    const data = await responses[1].value.json().catch(() => ({}));
    for (const page of Object.values(data?.query?.pages || {}))
      if (page?.title)
        results.push({
          title: String(page.title).replace(/^File:/, ""),
          url:
            "https://commons.wikimedia.org/wiki/" +
            encodeURIComponent(String(page.title).replace(/ /g, "_")),
          snippet: "صورة أو ملف من ويكيميديا كومنز",
          source: "Wikimedia Commons",
        });
  }

  const candidates = [
    ...new Map(trustedCandidates.map((candidate) => [candidate.url, candidate])).values(),
  ].sort((first, second) => {
    const priority = (url) => {
      const host = new URL(url).hostname;
      const index = SOURCE_PRIORITY.findIndex(
        (domain) => host === domain || host.endsWith("." + domain),
      );
      return index < 0 ? SOURCE_PRIORITY.length : index;
    };
    return priority(first.url) - priority(second.url);
  });
  const trustedSources = [];
  for (const candidate of candidates) {
    if (trustedSources.length >= 1) break;
    let url = new URL(candidate.url);
    try {
      let response;
      for (let redirects = 0; redirects <= 2; redirects += 1) {
        response = await fetch(url.href, {
          headers: {
            accept: "text/html,application/xhtml+xml",
            "user-agent": "ATHARA-Heritage-Guide/1.0",
          },
          redirect: "manual",
          signal: AbortSignal.timeout(2500),
        });
        if (response.status < 300 || response.status >= 400) break;
        const location = response.headers.get("location");
        if (!location || redirects === 2) {
          response = undefined;
          break;
        }
        const nextUrl = new URL(location, url);
        if (
          nextUrl.protocol !== "https:" ||
          !TRUSTED_SOURCE_DOMAINS.some(
            (domain) => nextUrl.hostname === domain || nextUrl.hostname.endsWith("." + domain),
          )
        ) {
          response = undefined;
          break;
        }
        url = nextUrl;
      }
      if (
        !response?.ok ||
        !/^(?:text\/html|application\/xhtml\+xml)/i.test(response.headers.get("content-type") || "")
      )
        continue;
      const contentLength = Number(response.headers.get("content-length"));
      if (Number.isFinite(contentLength) && contentLength > 700_000) continue;
      const html = await readLimitedHtml(response, 700_000);
      const title = html
        .match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]
        ?.replace(/<[^>]*>/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 180);
      const main =
        html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i)?.[1] ||
        html.match(/<body\b[^>]*>([\s\S]*?)<\/body>/i)?.[1] ||
        html;
      const snippet = main
        .replace(/<(script|style|noscript|svg|nav|header|footer|form)\b[^>]*>[\s\S]*?<\/\1>/gi, " ")
        .replace(/<(br|\/p|\/div|\/li|\/h[1-6])\b[^>]*>/gi, " ")
        .replace(/<[^>]*>/g, " ")
        .replace(/&nbsp;/gi, " ")
        .replace(/&amp;/gi, "&")
        .replace(/&quot;/gi, '"')
        .replace(/&#39;|&apos;/gi, "'")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 520);
      if (snippet.length < 100) continue;
      trustedSources.push({
        title: title || candidate.articleTitle,
        url: url.href,
        snippet,
        source: url.hostname,
        trusted: true,
      });
    } catch (error) {
      console.warn("ATHARA trusted image-search reference failed:", {
        host: url.hostname,
        reason: String(error?.message || error).slice(0, 120),
      });
    }
  }
  return {
    sources: [...trustedSources, ...results].slice(0, 8),
    trustedSourcesAvailable: trustedSources.length > 0,
    wikipediaAvailable,
  };
}

function relatedSourceSummary(sources, language) {
  const trustedSources = sources.filter((source) => source?.trusted).slice(0, 2);
  if (!trustedSources.length) return "";
  return [
    SOURCE_EVIDENCE_LABELS[language] || SOURCE_EVIDENCE_LABELS.en,
    ...trustedSources.map((source) => "- " + source.title + ": " + (source.supportedClaim || source.snippet || "")),
  ].join("\n");
}

async function readLimitedHtml(response, maxBytes) {
  const reader = response.body?.getReader();
  if (!reader) return "";
  const decoder = new TextDecoder();
  let html = "";
  let totalBytes = 0;
  while (totalBytes < maxBytes) {
    const { done, value } = await reader.read();
    if (done) break;
    const remaining = maxBytes - totalBytes;
    const chunk = value.subarray(0, remaining);
    html += decoder.decode(chunk, { stream: true });
    totalBytes += chunk.byteLength;
    if (chunk.byteLength < value.byteLength) break;
  }
  await reader.cancel();
  return html + decoder.decode();
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === "/api/health" && request.method === "GET") {
      const geminiConfigured = typeof env.GEMINI_API_KEY === "string" && Boolean(env.GEMINI_API_KEY.trim());
      const localOllama = !geminiConfigured && !env.AI && typeof env.OLLAMA_BASE_URL === "string";
      return json({
        ok: true,
        service: "ATHARA",
        aiBound: Boolean(env.AI),
        guideModel: TEXT_MODEL,
        visionEngines: [
          { name: "Gemini", configured: geminiConfigured, model: env.GEMINI_VISION_MODEL || "gemini-2.5-flash" },
          { name: "Qwen2.5-VL", configured: typeof env.OLLAMA_BASE_URL === "string" && Boolean(env.OLLAMA_BASE_URL.trim()), model: env.QWEN_VISION_MODEL || "qwen2.5vl:7b", license: "Apache-2.0" },
          { name: "InternVL3", configured: typeof env.OLLAMA_BASE_URL === "string" && Boolean(env.OLLAMA_BASE_URL.trim()), model: env.INTERNVL_VISION_MODEL || "internvl3:8b", license: "Apache-2.0/Qwen license" },
        ],
        visionModel: geminiConfigured
          ? env.GEMINI_VISION_MODEL || "gemini-2.5-flash"
          : localOllama
            ? env.OLLAMA_VISION_MODEL
            : VISION_MODEL,
        visionFallbackModel: geminiConfigured ? VISION_MODEL : localOllama ? null : FALLBACK_VISION_MODEL,
        visionProvider: geminiConfigured ? "Gemini Vision" : localOllama ? "Ollama (local)" : "Cloudflare Workers AI",
      });
    }

    if (url.pathname === "/api/guide" && request.method === "POST") {
      if (!env.AI) return json({ error: "خدمة الذكاء الاصطناعي مش متوصلة على Worker." }, 503);
      let body;
      try {
        body = await request.json();
      } catch {
        return json({ error: "الطلب مش مفهوم. جرّب تاني." }, 400);
      }
      const language =
        typeof body?.language === "string" && LANGUAGES[body.language] ? body.language : "ar";
      const mode = body?.mode === "official" ? "official" : "story";
      const artifact = String(body?.artifact || "").slice(0, 120);
      const reference = String(body?.reference || "").slice(0, 5000);
      const question = String(body?.question || "").slice(0, 1200);
      if (!artifact || !reference)
        return json({ error: "مفيش معلومات مرجعية كفاية عن القطعة دي." }, 400);
      const task =
        mode === "official"
          ? "اكتب بطاقة معلومات واضحة عن القطعة: ما هي، خامتها/وظيفتها/سياقها فقط إذا كانت المعلومات دي موجودة في المرجع. اذكر بوضوح أي نقطة غير مؤكدة."
          : "اكتب حكاية إرشادية ممتعة للزائر تشرح أهمية القطعة وتفاصيلها، لكن من غير اختراع أحداث أو حوار أو أساطير. خليك أمين للمرجع.";
      const prompt = `اللغة المطلوبة: ${LANGUAGES[language]}.
اسم القطعة: ${artifact}
المعلومات المرجعية المتاحة (استخدمها كحدود للمعلومات المؤكدة):
${reference}
المهمة: ${task}
${question ? "سؤال الزائر الإضافي: " + question : ""}
اكتب الإجابة فقط، بعناوين قصيرة عند الحاجة، ولا تضف مصادر غير متاحة.`;
      try {
        const result = await env.AI.run(TEXT_MODEL, {
          messages: [
            { role: "system", content: GUIDE_SYSTEM },
            { role: "user", content: prompt },
          ],
          max_tokens: 650,
          temperature: 0.25,
        });
        let answer = extractText(result).trim();
        if (!answer) throw new Error("النموذج رجّع رد فاضي.");

        // تحرير لغوي إضافي للعربية: مراجعة اللهجة والتركيب قبل عرض النص للزائر.
        if (language === "ar") {
          const edited = await env.AI.run(TEXT_MODEL, {
            messages: [
              {
                role: "system",
                content:
                  GUIDE_SYSTEM +
                  "\n\nمهمتك الآن محرر لغوي مصري محترف. صحّح النص ليكون مصريًا طبيعيًا وسليمًا، مع الحفاظ على المعنى وعدم إضافة أي معلومة تاريخية. احذف الفصحى الثقيلة والتراكيب المترجمة واللهجات غير المصرية. لا تغيّر أسماء الأعلام أو التواريخ أو المصطلحات.",
              },
              {
                role: "user",
                content:
                  "راجع النص التالي لغويًا فقط، وأعد النسخة النهائية دون مقدمات أو ملاحظات:\n" +
                  answer,
              },
            ],
            max_tokens: 650,
            temperature: 0.1,
          });
          const polished = extractText(edited).trim();
          if (polished) answer = polished;
        }
        return json({
          ok: true,
          answer,
          model: "Cloudflare Workers AI · Llama 3.1 8B (مراجعة لغوية إضافية للعربية)",
        });
      } catch (error) {
        return json(
          {
            error: "مش قادرين نولّد الشرح دلوقتي. جرّب تاني بعد شوية.",
            detail: String(error?.message || error).slice(0, 240),
          },
          502,
        );
      }
    }

    if (url.pathname === "/api/scan" && request.method === "POST") {
      const geminiConfigured = typeof env.GEMINI_API_KEY === "string" && Boolean(env.GEMINI_API_KEY.trim());
      const localOllama = !geminiConfigured && !env.AI && typeof env.OLLAMA_BASE_URL === "string";
      if (!env.AI && !localOllama && !geminiConfigured) {
        return json(
          { error: "ماسح الصور يحتاج ربط Cloudflare Workers AI. تأكد من إعداد ربط AI في Worker." },
          503,
        );
      }
      let body;
      try {
        body = await request.json();
      } catch {
        return json({ error: "بيانات الطلب غير صالحة." }, 400);
      }
      const image = body?.image;
      const enhancedImage = body?.enhancedImage;
      const language =
        typeof body?.language === "string" && LANGUAGES[body.language] ? body.language : "ar";
      const mode = body?.mode === "hieroglyphs" ? "hieroglyphs" : "objects";
      const documentImage = mode === "hieroglyphs" ? body?.documentImage : undefined;
      if (typeof image !== "string")
        return json({ error: "ابعت صورة بصيغة JPG أو PNG أو WebP." }, 400);
      if (image.length > MAX_IMAGE_CHARS)
        return json({ error: "حجم الصورة كبير. اختار صورة أصغر." }, 413);
      const imageMatch = /^data:image\/(jpeg|png|webp);base64,([A-Za-z0-9+/]+={0,2})$/i.exec(image);
      if (!imageMatch)
        return json({ error: "صيغة الصورة غير مدعومة. استخدم JPG أو PNG أو WebP." }, 400);
      let enhancedImageMatch = null;
      let enhancedImageBytes = null;
      if (enhancedImage !== undefined) {
        if (typeof enhancedImage !== "string" || enhancedImage.length > MAX_IMAGE_CHARS)
          return json({ error: "نسخة تحسين الصورة غير صالحة أو حجمها كبير." }, 400);
        enhancedImageMatch = /^data:image\/(jpeg|png|webp);base64,([A-Za-z0-9+/]+={0,2})$/i.exec(
          enhancedImage,
        );
        if (!enhancedImageMatch) return json({ error: "نسخة تحسين الصورة بصيغة غير مدعومة." }, 400);
        try {
          enhancedImageBytes = Array.from(atob(enhancedImageMatch[2]), (character) =>
            character.charCodeAt(0),
          );
        } catch {
          return json({ error: "نسخة تحسين الصورة تالفة أو غير صالحة." }, 400);
        }
        if (!enhancedImageBytes.length) return json({ error: "نسخة تحسين الصورة فاضية." }, 400);
      }
      let documentImageMatch = null;
      let documentImageBytes = null;
      if (documentImage !== undefined) {
        if (typeof documentImage !== "string" || documentImage.length > MAX_IMAGE_CHARS)
          return json({ error: "نسخة تجهيز النقش غير صالحة أو حجمها كبير." }, 400);
        documentImageMatch = /^data:image\/(jpeg|png|webp);base64,([A-Za-z0-9+/]+={0,2})$/i.exec(
          documentImage,
        );
        if (!documentImageMatch) return json({ error: "نسخة تجهيز النقش بصيغة غير مدعومة." }, 400);
        try {
          documentImageBytes = Array.from(atob(documentImageMatch[2]), (character) =>
            character.charCodeAt(0),
          );
        } catch {
          return json({ error: "نسخة تجهيز النقش تالفة أو غير صالحة." }, 400);
        }
        if (!documentImageBytes.length) return json({ error: "نسخة تجهيز النقش فاضية." }, 400);
      }
      let imageBytes;
      try {
        imageBytes = Array.from(atob(imageMatch[2]), (character) => character.charCodeAt(0));
      } catch {
        return json({ error: "ملف الصورة تالف أو غير صالح." }, 400);
      }
      if (!imageBytes.length) return json({ error: "الصورة فاضية." }, 400);
      const recognitionEngines = [];
      const recognitionErrors = [];
      try {
        const googleVision = await runGoogleVision(imageBytes, env.GOOGLE_VISION_API_KEY);
        if (googleVision) recognitionEngines.push(googleVision);
      } catch (error) {
        recognitionErrors.push({ engine: "google_vision", reason: String(error?.message || error).slice(0, 180) });
      }
      try {
        const googleLens = await runGoogleLens(body?.image_url ?? body?.imageUrl, imageBytes, env.SERPAPI_KEY);
        if (googleLens) recognitionEngines.push(googleLens);
      } catch (error) {
        recognitionErrors.push({ engine: "google_lens", reason: String(error?.message || error).slice(0, 180) });
      }
      const photoGps = readExifGps(imageBytes);

      // قاعدة المراجع اختيارية: تُحمّل كسجلات JSON موثقة في متغير ATHARA_CATALOG_JSON.
      // كل سجل: id, title, mode, keywords[], description, period, location, sourceTitle, sourceUrl.
      // لا نضيف سجلًا للنتائج المرجعية إلا لو له مصدر واضح.
      let catalog = [];
      const officialCatalogUrl = env.ASSETS
        ? new URL("/egypt-monuments-official.json", "https://athara.local").toString()
        : "";
      if (officialCatalogUrl && typeof env.ASSETS.fetch === "function") {
        try {
          const officialResponse = await env.ASSETS.fetch(officialCatalogUrl);
          if (officialResponse.ok) {
            const officialData = await officialResponse.json();
            catalog.push(...(Array.isArray(officialData.records) ? officialData.records : []));
          }
        } catch {
          // Optional local catalog: external recognition remains available if asset loading fails.
        }
      }
      try {
        const parsed =
          typeof env.ATHARA_CATALOG_JSON === "string" ? JSON.parse(env.ATHARA_CATALOG_JSON) : [];
        if (Array.isArray(parsed))
          catalog = parsed
            .filter(
              (item) =>
                item &&
                typeof item.id === "string" &&
                typeof item.title === "string" &&
                Array.isArray(item.keywords) &&
                typeof item.sourceTitle === "string" &&
                typeof item.sourceUrl === "string" &&
                /^https:\/\//i.test(item.sourceUrl),
            );
      } catch {
        // Keep the official built-in catalog if the optional environment catalog is invalid.
      }

      const normalize = (value) =>
        String(value || "")
          .toLocaleLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/[أإآ]/g, "ا")
          .replace(/ى/g, "ي")
          .replace(/ة/g, "ه")
          .replace(/[^\p{L}\p{N}]+/gu, " ")
          .trim();
      const tokens = (value) =>
        normalize(value)
          .split(/\s+/)
          .filter((word) => word.length > 2);
      const visionPrompt =
        mode === "hieroglyphs"
          ? `أنت محلل متخصص في الكتابات والآثار المصرية القديمة؛ استفد من معرفتك الداخلية والتاريخية، حتى لو لم تتوفر مراجع على الإنترنت. اتبع هذا الترتيب: (1) حدّد هل الصورة كتابة مصرية فعلًا أم لغة/خط آخر، وميّز الهيروغليفية عن الهيراطيقية والديموطيقية واليونانية والقبطية إن أمكن؛ لا تسمّ كل كتابة قديمة هيروغليفية. (2) صف العلامات واتجاه القراءة، واقرأ فقط ما يظهر بوضوح، ثم قدّم نقلًا صوتيًا وترجمة حرفية ومعنى النص عند توافر القرائن، واذكر هل يبدو النص دينيًا أو ملكيًا أو جنائزيًا أو إداريًا أو غير ذلك ولماذا. (3) رشّح أقرب نص أو أثر معروف فقط كاحتمال مع قرينة محددة؛ لا تدّعِ تطابقًا بصريًا. (4) لا تذكر اسم موقع محدد إلا إذا كانت هناك قرينة فريدة ومقروءة في الصورة؛ الرمز الشائع أو الأسلوب الفني أو نتيجة البحث النصي لا يثبت الموقع. وإلا اترك place فارغًا واكتفِ بنوع عام مثل معبد أو مقبرة أو لوحة، مع التنبيه أن الموقع غير مؤكد. لا تخلط مكان التصوير أو العثور بمكان العرض. (5) افصل النص الظاهر عن التحقق التاريخي المستقل؛ انقل العنوان المطبوع حرفيًا في printedLabels وترجم معناه بدقة في printedTextTranslation، ولا تعتبر تاريخًا أو ملكًا مدونًا في الصورة نهائيًا قبل مقارنته بالدراسات الحديثة. افحص أسماء الملوك والأسر والمواقع من المصادر المتخصصة؛ لا تصف جبانة بأنها مدينة. اشرح وظيفة المنظر والنقش وسياقه بدقة. عند تعارض المراجع اذكر الاختلاف دون تحيز. لا تخترع قراءة أو اسمًا أو تاريخًا أو مكانًا. أنشئ searchTerms قصيرة ودقيقة، وقدّم تهجئة عربية ولاتينية للاسم فقط إذا ظهرت قرينة واضحة. أخرج JSON فقط بالشكل: {"visualDescription":"وصف ما يظهر","scriptType":"نوع اللغة أو الخط، أو غير محسوم","visibleText":"العلامات المقروءة فقط أو فارغ","printedLabels":"العنوان أو بيانات القطعة المطبوعة حرفيًا، أو فارغ","printedTextTranslation":"ترجمة دقيقة للنص الظاهر أو فارغ","transliteration":"النقل الصوتي أو فارغ","translation":"الترجمة الحرفية أو فارغ","interpretation":"المعنى والسياق المقترح أو فارغ","objectOrTextPurpose":"الغرض الوظيفي والسياق المقيد بالأدلة أو غير محسوم","identity":"أقرب نص أو أثر معروف، أو فارغ","identityEvidence":"قرينة الترشيح أو سبب تعذر المطابقة","historicalVerification":"ما ثبت تاريخيًا من المصادر المستقلة وما يُفصل عن النص الظاهر","sourceConflicts":"اختلاف موثق بين المصادر أو فارغ","place":"الموقع المحدد أو فارغ","placeType":"نوع المكان العام، لا اسم موقع، أو غير محسوم","placeEvidence":"قرينة مرئية محددة أو سبب عدم كفايتها","period":"الفترة المحتملة أو فارغ","contextualStory":"سياق تاريخي عام لا ينسب النقش إلى موقع غير مؤكد","writingHistory":"تاريخ الخط واستخداماته","siteHistory":"تاريخ نوع المكان فقط، دون ادعاء تاريخ موقع محدد غير مثبت","searchTerms":["مصطلحات قصيرة ومميزة للبحث"],"confidence":"high أو medium أو low","confidenceByField":{"inscription":"high أو medium أو low","translation":"high أو medium أو low","place":"high أو medium أو low"},"keywords":["موضوعات ظاهرة"],"periodClues":[]}. لا تدّع إجراء بحث خارجي أو ترجمة أكاديمية مؤكدة.`
          : `حلل محتوى الصورة بصريًا مهما كان مصدرها أو لونها، بما في ذلك الصور الملونة والأبيض والأسود واللقطات المطبوعة في كتاب أو المعروضة على شاشة. لا تكتفِ بوصف العناصر؛ حاول أولًا تسمية الشيء أو المكان المصوّر بدقة. افصل القطعة عن التعليقات والعناوين المطبوعة. لا تنتج قصة تاريخية أو ملكًا أو حقبة أو موقعًا بناءً على التشابه العام؛ إذا لم تكن الهوية ثابتة بصريًا اترك period وcontextualStory وsignificance وkeyFeatures والتواريخ فارغة. لا تخلط واجهة معبد جالسة تماثيل داخل صالة، ولا أبو سمبل بالكرنك، ولا تسند ملكًا بالتخمين. لا تخلط مكان التصوير بمكان الأصل. استخدم فقط قرائن مرئية أو معلومات موثقة لتحديد الدولة والمدينة والمتحف أو الموقع الداخلي. قدّم سياقًا مفيدًا للزائر، لا وصفًا بصريًا مطولًا. إذا احتوى النص الظاهر على عنوان أو تاريخ أو اسم بلغة أجنبية فترجم المعنى بدقة وأفصل معناه عن التحقق التاريخي المستقل، ولا تجعل النص المدون مصدرًا نهائيًا للتاريخ. تحقق أسماء الملوك والأسر والمواقع وأصحاب الوظائف من الأدلة المرجعية ولا تصنف الجبانة أو المقبرة أو المنطقة الأثرية كمدينة. اشرح وظيفة المنظر أو النقش وسياقه وفق الأدلة. ميّز المكتشف عن عالم الآثار الذي درس الأثر وعن الرسام أو الناشر الذي وثق الصورة، وافصل تاريخ الاكتشاف والنشر وصنع الأثر. لا تصف شخصًا في النقش بحارس أو خادم دون دليل. احذف المعلومة العامة غير المرتبطة بالصورة. عند تعارض المصادر اذكر الاختلاف، ولا تقل إن هناك توافقًا إلا إذا قورنت مصادر فعلية. لا تخترع معطىً. إذا لم تتأكد اترك identity وأدوار الاكتشاف والتواريخ فارغة وأضف possibilities مدعومة بالأدلة. أخرج JSON فقط بالشكل: {"identity":"الاسم الدقيق المؤكد أو مقترح مدعوم أو فارغ","objectType":"نوع الشيء أو المكان بوصف قصير","country":"الدولة أو فارغ","city":"المدينة أو فارغ","place":"اسم المتحف أو الموقع أو فارغ","siteLocation":"المكان المحدد داخل الموقع أو فارغ","period":"الحقبة أو التاريخ التقريبي مع تمييزه كتقدير عند عدم اليقين أو فارغ","contextualStory":"قصته وخلفيته والغرض وأهميته بشرح بسيط أو فارغ","significance":"أهميته التاريخية والأثرية أو فارغ","keyFeatures":"أبرز تفاصيل معرفية تستحق الانتباه من دون وصف بصري مطول","builder":"من بناه أو أنشأه، إن كان معروفًا ومدعومًا أو فارغ","creator":"صانع القطعة إن كان معروفًا ومدعومًا أو فارغ","printedLabels":"النص الظاهر حرفيًا أو فارغ","printedTextTranslation":"ترجمة دقيقة للنص الظاهر أو فارغ","historicalVerification":"ماذا ثبت تاريخيًا من المراجع المستقلة وما يجب فصل المصدر فيه أو فارغ","sourceConflicts":"اختلاف موثوق بين المصادر وما التقدير المدعوم أو فارغ","additionalInformation":"معلومة إضافية موثقة تضيف قيمة للزائر أو فارغ","possibilities":["احتمال مدعوم بقرينة محددة"],"searchTerms":["مصطلحات قصيرة للبحث المراجع"],"keywords":["موضوعات ظاهرة"],"periodClues":[],"confidence":"high أو medium أو low","confidenceByField":{"identity":"high أو medium أو low","place":"high أو medium أو low","period":"high أو medium أو low"}}. لا تتضمن حقولًا عامة عندما لا تضيفها الصورة أو تكون غير مثبتة.`;
      const visionAttempts = [];
      try {
        let rawVisual = "";
        let visionUsed = "";
        const prompt =
          VISION_SYSTEM +
          "\n\n" +
          ICONOGRAPHY_RULES +
          "\n\n" +
          visionPrompt +
          "\nOutput language: " +
          LANGUAGES[language];
        const imageForAnalysis = documentImageBytes || enhancedImageBytes || imageBytes;
        const ollamaModel =
          typeof env.OLLAMA_VISION_MODEL === "string" ? env.OLLAMA_VISION_MODEL : "gemma3:4b";
        const visionModels = localOllama ? [ollamaModel] : [VISION_MODEL, FALLBACK_VISION_MODEL];
        const geminiVisionKey = typeof env.GEMINI_API_KEY === "string" ? env.GEMINI_API_KEY.trim() : "";
        const geminiVisionModels = [
          typeof env.GEMINI_VISION_MODEL === "string" && env.GEMINI_VISION_MODEL.trim()
            ? env.GEMINI_VISION_MODEL.trim()
            : "gemini-2.5-flash",
          "gemini-2.0-flash",
        ].filter((model, index, models) => models.indexOf(model) === index);
        const independentObservations = [];

        for (const geminiModel of geminiVisionModels) {
          if (!geminiVisionKey) break;
          try {
            const geminiResponse = await fetch(
              `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(geminiModel)}:generateContent`,
              {
                method: "POST",
                headers: { "content-type": "application/json", "x-goog-api-key": geminiVisionKey },
                body: JSON.stringify({
                  systemInstruction: { parts: [{ text: prompt }] },
                  contents: [{ role: "user", parts: [{ text: "حلّل هذه الصورة بصريًا وأعطني JSON فقط." }, { inlineData: { mimeType: detectImageMimeType(imageForAnalysis), data: bytesToBase64(imageForAnalysis) } }] }],
                  generationConfig: { temperature: 0.1, maxOutputTokens: 1400 },
                }),
                signal: AbortSignal.timeout(30_000),
              },
            );
            const geminiPayload = await geminiResponse.json().catch(() => null);
            if (!geminiResponse.ok) throw new Error(geminiPayload?.error?.message || `Gemini Vision returned HTTP ${geminiResponse.status}`);
            rawVisual = geminiPayload?.candidates?.[0]?.content?.parts?.map((part) => part?.text || "").join("").trim() || "";
            if (!rawVisual) throw new Error("Gemini Vision returned an empty response.");
            independentObservations.push(parseVisionObservation(rawVisual));
            visionUsed = `gemini:${geminiModel}`;
            break;
          } catch (modelError) {
            visionAttempts.push({ model: `Gemini Vision (${geminiModel})`, reason: String(modelError?.message || modelError).slice(0, 180) });
          }
        }

        const groqVisionKey = typeof env.GROQ_API_KEY === "string" ? env.GROQ_API_KEY.trim() : "";
        const groqVisionModel =
          typeof env.GROQ_VISION_MODEL === "string" && env.GROQ_VISION_MODEL.trim()
            ? env.GROQ_VISION_MODEL.trim()
            : "meta-llama/llama-4-scout-17b-16e-instruct";
        if (groqVisionKey) {
          try {
            const groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
              method: "POST",
              headers: {
                "content-type": "application/json",
                authorization: `Bearer ${groqVisionKey}`,
              },
              body: JSON.stringify({
                model: groqVisionModel,
                temperature: 0.1,
                max_tokens: 1400,
                messages: [{
                  role: "user",
                  content: [
                    { type: "text", text: `${prompt}\n\nحلّل هذه الصورة وأخرج JSON فقط.` },
                    {
                      type: "image_url",
                      image_url: {
                        url: `data:${detectImageMimeType(imageForAnalysis)};base64,${bytesToBase64(imageForAnalysis)}`,
                      },
                    },
                  ],
                }],
              }),
              signal: AbortSignal.timeout(30_000),
            });
            const groqPayload = await groqResponse.json().catch(() => null);
            if (!groqResponse.ok) throw new Error(groqPayload?.error?.message || `Groq Vision returned HTTP ${groqResponse.status}`);
            rawVisual = groqPayload?.choices?.[0]?.message?.content?.trim() || "";
            if (!rawVisual) throw new Error("Groq Vision returned an empty response.");
            independentObservations.push(parseVisionObservation(rawVisual));
          } catch (modelError) {
            visionAttempts.push({
              model: `Groq Vision (${groqVisionModel})`,
              reason: String(modelError?.message || modelError).slice(0, 180),
            });
          }
        }

        if (typeof env.OLLAMA_BASE_URL === "string" && env.OLLAMA_BASE_URL.trim()) {
          const ollamaModels = [
            ["Qwen2.5-VL", typeof env.QWEN_VISION_MODEL === "string" && env.QWEN_VISION_MODEL.trim()
              ? env.QWEN_VISION_MODEL.trim() : "qwen2.5vl:7b"],
            ["InternVL3", typeof env.INTERNVL_VISION_MODEL === "string" && env.INTERNVL_VISION_MODEL.trim()
              ? env.INTERNVL_VISION_MODEL.trim() : "internvl3:8b"],
          ];
          if (typeof env.INTERNVL_VISION_MODEL !== "string" && typeof env.OLLAMA_VISION_MODEL === "string") {
            ollamaModels[0][1] = env.OLLAMA_VISION_MODEL.trim();
            ollamaModels.splice(1, 1);
          }
          for (const [engine, model] of ollamaModels) {
            try {
              const ollamaResponse = await fetch(new URL("/api/generate", env.OLLAMA_BASE_URL), {
                method: "POST",
                headers: { "content-type": "application/json" },
                body: JSON.stringify({
                  model, prompt, images: [bytesToBase64(imageForAnalysis)], stream: false,
                  options: { num_predict: 1400, temperature: 0.1 },
                }),
                signal: AbortSignal.timeout(90_000),
              });
              const ollamaResult = await ollamaResponse.json().catch(() => null);
              if (!ollamaResponse.ok) throw new Error(ollamaResult?.error || `${engine} returned HTTP ${ollamaResponse.status}`);
              const output = typeof ollamaResult?.response === "string" ? ollamaResult.response.trim() : "";
              if (!output) throw new Error(`${engine} returned an empty response.`);
              independentObservations.push(parseVisionObservation(output));
            } catch (modelError) {
              visionAttempts.push({ model: `${engine} (${model})`, reason: String(modelError?.message || modelError).slice(0, 180) });
            }
          }
        }

        if (!independentObservations.length) {
          for (const model of visionModels) {
            try {
              const visual = await env.AI.run(model, {
                image: imageForAnalysis, prompt, max_tokens: 1400, temperature: 0.1,
              });
              rawVisual = extractText(visual).trim();
              if (!rawVisual) throw new Error("Vision model returned an empty response.");
              independentObservations.push(parseVisionObservation(rawVisual));
              visionUsed = model;
              visionUsed = model;
              break;
            } catch (modelError) {
              visionAttempts.push({ model, reason: String(modelError?.message || modelError).slice(0, 180) });
            }
          }
        }

        if (!independentObservations.length) {
          const detail = visionAttempts
            .map((attempt) => attempt.model + ": " + attempt.reason)
            .join("; ");
          throw new Error(
            "None of the configured free vision engines returned a result. " + detail,
          );
        }
        const correctedObservation = applyKnownArtifactCorrections(
          applyExternalRecognitionHints(
            applyKnownArtifactCorrections(combineVisionObservations(independentObservations), recognitionEngines),
            recognitionEngines,
          ),
          recognitionEngines,
        );
        const observation = mode === "objects"
          ? applyEvidenceGuard(correctedObservation, recognitionEngines)
          : correctedObservation;
        const getObservedText = () =>
          [
            observation.visualDescription,
            observation.sceneDescription,
            observation.objectType,
            observation.printedLabels,
            observation.identity,
            observation.visibleText,
            observation.transliteration,
            observation.translation,
            observation.interpretation,
            observation.scriptType,
            observation.objectOrTextPurpose,
            observation.identityEvidence,
            observation.place,
            observation.period,
            observation.contextualStory,
            observation.writingHistory,
            observation.placeType,
            observation.placeEvidence,
            observation.siteHistory,
            ...(Array.isArray(observation.searchTerms) ? observation.searchTerms : []),
            observation.foodAssessment,
            ...(Array.isArray(observation.keywords) ? observation.keywords : []),
            ...(Array.isArray(observation.periodClues) ? observation.periodClues : []),
          ]
            .filter(Boolean)
            .join(" ");
        const observedText = getObservedText();
        const observedTokens = new Set(tokens(observedText));
        const candidates = catalog
          .filter((item) => item.mode === mode || item.mode === "both")
          .map((item) => {
            const keys = (Array.isArray(item.keywords) ? item.keywords : []).flatMap(tokens);
            const matched = [...new Set(keys.filter((key) => observedTokens.has(key)))];
            const score = keys.length ? matched.length / Math.min(keys.length, 8) : 0;
            return { item, matched, score };
          })
          .sort((a, b) => b.score - a.score);
        const best = candidates[0];

        // لا نسمّي النتيجة "مطابقة" إلا عند حد محافظ ومع وجود مصدر موثق.
        if (best && best.score >= 0.55 && best.matched.length >= 3) {
          const item = best.item;
          const {
            sources: searchSources,
            trustedSourcesAvailable,
            wikipediaAvailable,
          } = await searchHeritageSources(
            item.title + " " + (item.keywords || []).slice(0, 4).join(" "),
            language,
          );
          const sources = [
            {
              title: item.sourceTitle,
              url: item.sourceUrl,
              snippet: item.description || "",
              source: item.sourceTitle,
              trusted: TRUSTED_SOURCE_DOMAINS.some((domain) =>
                new URL(item.sourceUrl, "https://athara.local").hostname
                  .endsWith("." + domain) ||
                new URL(item.sourceUrl, "https://athara.local").hostname === domain
              ),
            },
            ...searchSources.filter((source) => source.url !== item.sourceUrl),
          ];
          const answer = [
            "مطابقة مرجعية محتملة — وليست إثباتًا نهائيًا لهوية القطعة.",
            "الاسم المرجعي: " + item.title,
            item.period ? "العصر/التاريخ: " + item.period : "",
            item.description || "",
            "سبب الترشيح: تشابه وصفي نصي في " +
              best.matched.length +
              " كلمات مفتاحية، وليس مقارنة بصرية.",
            observation.visualDescription ? "الوصف المرئي: " + observation.visualDescription : "",
            observation.sceneDescription ? "وصف المشهد: " + observation.sceneDescription : "",
            observation.printedLabels
              ? "العنوان أو البيانات المطبوعة: " + observation.printedLabels
              : "",
            observation.visibleText ? "العلامات المقروءة: " + observation.visibleText : "",
            observation.translation ? "الترجمة الحرفية المقترحة: " + observation.translation : "",
            observation.contextualStory ? "حكاية وسياق تاريخي: " + observation.contextualStory : "",
            "الموقع غير مؤكد بدقة؛ السجل النصي لا يثبت مكان القطعة المصوّرة.",
            relatedSourceSummary(sources, language),
          ]
            .filter(Boolean)
            .join("\n");
          return json({
            ok: true,
            analysis: answer,
            sources,
            trustedSourcesAvailable,
            wikipediaAvailable,
            resultType: "reference_match",
            confidence: best.score,
            confidenceByField: {
              identity: "medium",
              place: "low",
              period: "low",
            },
            referenceId: item.id,
            referenceImages: Array.isArray(item.localImageUrls) ? item.localImageUrls : [],
            model: "ATHARA Hybrid Matching",
          });
        }

        const specificSearchParts = [
          observation.printedLabels,
          ...(Array.isArray(observation.searchTerms) ? observation.searchTerms.slice(0, 3) : []),
          observation.identity,
          observation.visibleText,
          observation.transliteration,
          observation.translation,
          observation.scriptType,
          observation.identityEvidence,
          ...(Array.isArray(observation.keywords) ? observation.keywords.slice(0, 3) : []),
        ]
          .filter((part) => typeof part === "string" && part.trim())
          .map((part) => part.trim())
          .filter((part, index, parts) => parts.indexOf(part) === index);
        const visualSearchParts = [
          observation.printedLabels,
          observation.identity,
          observation.visualDescription,
          observation.sceneDescription,
          observation.objectType,
          observation.scriptType,
          observation.visibleText,
          observation.keywords,
          observation.placeType,
          observation.period,
          observation.contextualStory,
        ].filter(Boolean).flatMap((part) => Array.isArray(part) ? part : [part]).join(" ");
        const likelyLatin = specificSearchParts.filter((part) => /[a-z]/i.test(String(part))).join(" ");
        const searchQueries = [
          { query: specificSearchParts.join(" ").slice(0, 180), language },
          {
            query: [observation.visualDescription, observation.sceneDescription, observation.objectType, observation.identity]
              .filter(Boolean).join(" ").slice(0, 180),
            language,
          },
          { query: [observation.printedLabels, observation.visibleText, observation.transliteration, observation.place].filter(Boolean).join(" ").slice(0, 180), language },
          { query: [visualSearchParts, "Egyptian antiquities museum"] .join(" ").slice(0, 180), language: "en" },
          { query: [observation.identity, observation.objectType, "Abu Simbel Luxor Egypt museum temple artifact"] .join(" ").slice(0, 180), language: "en" },
          ...(likelyLatin ? [{ query: likelyLatin.slice(0, 180), language: "en" }] : []),
          ...(language !== "en" ? [{ query: visualSearchParts.slice(0, 180), language: "en" }] : []),
        ]
          .filter((item) => item.query)
          .filter(
            (item, index, queries) =>
              queries.findIndex(
                (candidate) =>
                  candidate.query === item.query && candidate.language === item.language,
              ) === index,
          );
        const searchResults = await Promise.all(
          searchQueries.map(({ query, language: queryLanguage }) =>
            searchHeritageSources(query, queryLanguage),
          ),
        );
        let sources = [
          ...new Map(
            searchResults.flatMap((result) => result.sources).map((source) => [source.url, source]),
          ).values(),
        ].slice(0, 8);
        if (
          mode === "objects" &&
          observation.historicalEvidenceConfirmed !== true &&
          observation.verifiedLocation !== true
        ) {
          sources = sources.filter((source) => source?.trusted === true);
        }
        const wikipediaAvailable = searchResults.some(
          (result) => result.wikipediaAvailable === true,
        );
        const trustedSourcesAvailable = searchResults.some(
          (result) => result.trustedSourcesAvailable === true,
        );
        const confidenceByField = scanConfidence(observation, mode);
        const analysis = formatScannerResult(observation, sources, mode, language, confidenceByField);
        return json({
          ok: true,
          analysis,
          sources,
          trustedSourcesAvailable,
          wikipediaAvailable,
          resultType: "ai_guess",
          confidence: observation.confidence || "غير محسوبة",
          confidenceByField,
          model: independentObservations.length > 1
            ? `Free visual consensus (${independentObservations.length} engines)`
            : localOllama
              ? `Ollama - ${visionUsed || env.OLLAMA_VISION_MODEL || ollamaModel}`
              : visionUsed === VISION_MODEL
                ? "Cloudflare Workers AI - Llama 3.2 11B Vision"
                : visionUsed === FALLBACK_VISION_MODEL
                  ? "Cloudflare Workers AI - LLaVA 1.5 7B (fallback)"
                  : `Free visual consensus (${independentObservations.length} engine)`,
          visionDiagnostics: {
            provider: independentObservations.length > 1
              ? "Independent visual consensus"
              : localOllama
                ? "Ollama (local)"
                : "Cloudflare Workers AI",
            enginesCompleted: independentObservations.length,
            usedFallback: !String(visionUsed || "").startsWith("gemini:") && !localOllama && visionUsed !== VISION_MODEL,
            attempts: visionAttempts,
          },
          photoGps,
          recognitionEngines,
          recognitionErrors,
        });
      } catch (error) {
        const detail = String(error?.message || error).slice(0, 500);
        const needsAgreement = /agree|license|acceptable use|policy/i.test(detail);
        return json(
          {
            error: needsAgreement
              ? "خدمة تحليل الصور محتاجة تفعيل موافقة ترخيص نموذج الرؤية في Cloudflare قبل أول استخدام. لازم صاحب الحساب يراجع ويوافق بنفسه."
              : "تحليل الصورة لم يكتمل. جرّب صورة أوضح أو حاول بعد شوية.",
            detail,
            visionDiagnostics: {
              provider: localOllama ? "Ollama (local)" : "Cloudflare Workers AI",
              attempts: visionAttempts,
            },
          },
          502,
        );
      }
    }
    if (typeof env.ASSETS?.fetch === "function") return env.ASSETS.fetch(request);
    return new Response(JSON.stringify({ error: "المسار غير متاح في بيئة التشغيل الحالية." }), {
      status: 404,
      headers: { "content-type": "application/json" },
    });
  },
};
