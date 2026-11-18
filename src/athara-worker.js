const VISION_MODEL = "@cf/moondream/moondream3.1-9B-A2B";
const FALLBACK_VISION_MODELS = [
  "@cf/mistralai/mistral-small-3.1-24b-instruct",
  "@cf/meta/llama-4-scout-17b-16e-instruct",
];
const FALLBACK_VISION_MODEL = FALLBACK_VISION_MODELS[0];
const TEXT_MODEL = "@cf/meta/llama-3.1-8b-instruct-fast";
const DEFAULT_VISION_PROVIDER_ORDER = ["Cloudflare", "Gemini", "Groq"];
const MAX_IMAGE_CHARS = 8_500_000;
const MAX_COMPARISON_IMAGE_BYTES = 500_000;
const DEFAULT_SCANNER_MATCH_THRESHOLD = 0.8;
const SCANNER_IMAGE_HOSTS = new Set([
  "images.metmuseum.org",
  "openaccess-cdn.clevelandart.org",
  "upload.wikimedia.org",
  "commons.wikimedia.org",
  "www.artic.edu",
  "egymonuments.gov.eg",
  "www.egymonuments.gov.eg",
  "ids.si.edu",
  "media.britishmuseum.org",
]);
const SCANNER_ALLOWED_SOURCE_DOMAINS = [
  "wikipedia.org", "wikidata.org", "commons.wikimedia.org", "metmuseum.org",
  "clevelandart.org", "britishmuseum.org", "louvre.fr", "egymonuments.gov.eg",
  "thebanmappingproject.com", "giza.fas.harvard.edu", "whc.unesco.org",
  "si.edu", "europeana.eu", "artic.edu",
];
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
  "artic.edu",
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

const VISION_SYSTEM = `أنت خبير بصري للماسح المتخصص حصريًا في الآثار المصرية القديمة ومواقعها: التماثيل، الأدوات، النقوش والرسوم الجدارية، المعابد والمقابر، التوابيت والمومياوات والبرديات. افحص الصور الأصلية أو صور الكتب والشاشات. حدّد الاسم الأقرب كاحتمال بصري قابل للبحث، ثم افصل بوضوح بين الاحتمال والتطابق الذي تؤكده صورة مرجعية أو صفحة أثرية موثوقة. هذه التعليمات تخص الماسح فقط وليست تعليمات للشات النصي.
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

async function withScannerTimeout(operation, timeoutMs, label) {
  let timer;
  try {
    return await Promise.race([
      Promise.resolve(operation),
      new Promise((_, reject) => {
        timer = setTimeout(() => reject(new Error(`${label} timed out after ${timeoutMs}ms`)), timeoutMs);
      }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}


const TRANSIENT_VISION_HTTP_STATUSES = new Set([408, 425, 500, 502, 503, 504]);
const VISION_PROVIDER_TIMEOUT_MS = { cloudflare: 12_000, gemini: 18_000, groq: 18_000 };
const VISION_PROVIDER_RETRIES = 1;

function safeVisionFailureCategory(reason) {
  const value = String(reason || "").toLowerCase();
  if (/429|quota|rate.?limit/.test(value)) return "rate_limited";
  if (/timeout|timed out|abort/.test(value)) return "timeout";
  if (/license|agree|acceptable use|policy/.test(value)) return "provider_consent_required";
  if (/401|403|unauthorized|forbidden|api.?key/.test(value)) return "authentication_or_permission";
  if (/503|502|500|overload|busy|capacity/.test(value)) return "provider_unavailable";
  if (/empty|non-informative|invalid/.test(value)) return "invalid_provider_response";
  return "request_failed";
}


function isRetryableVisionNetworkError(error) {
  return ["AbortError", "TimeoutError", "TypeError"].includes(error?.name) ||
    /timeout|timed out|network|connection reset|socket/i.test(String(error?.message || error));
}

async function fetchVisionWithRetry(url, init, { provider, timeoutMs, retries = VISION_PROVIDER_RETRIES } = {}) {
  let lastError;
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      const response = await fetch(url, { ...init, signal: AbortSignal.timeout(timeoutMs) });
      if (!TRANSIENT_VISION_HTTP_STATUSES.has(response.status) || attempt === retries) return response;
      try { await response.body?.cancel(); } catch { /* Continue with the retry. */ }
      console.warn("[Image scanner] " + provider + " returned HTTP " + response.status + "; retrying attempt " + (attempt + 2) + "/" + (retries + 1) + ".");
    } catch (error) {
      lastError = error;
      if (!isRetryableVisionNetworkError(error) || attempt === retries) throw error;
      console.warn("[Image scanner] " + provider + " failed transiently; retrying attempt " + (attempt + 2) + "/" + (retries + 1) + ": " + String(error?.message || error).slice(0, 160));
    }
    await new Promise((resolve) => setTimeout(resolve, Math.min(1_000, 350 * (2 ** attempt))));
  }
  throw lastError || new Error(provider + " failed after retries.");
}

function extractText(result) {
  if (typeof result?.answer === "string") return result.answer;
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

function meaningfulVisionText(value) {
  if (typeof value !== "string") return "";
  const text = value.trim();
  if (!text) return "";
  const normalized = text.replace(/[.!?؟。،,:;؛]+$/u, "").trim();
  return /^(?:غير\s+(?:محدد|معروف|متاح|متوفر|مقروء|مؤكد|محسوم)|لا\s+يوجد(?:\s+(?:نص|بيانات|عنوان|ملصق|كتابة|نقوش))?(?:\s+مطبوع(?:ة)?)?|لا\s+توجد(?:\s+(?:بيانات|كتابة|نقوش))?|بدون\s+نص|غير\s+موجود(?:ة)?|unknown|unspecified|not specified|none|null|n\/?a|not available|not identified|not visible|not provided|unavailable|no (?:text|printed text|label|data))$/iu.test(normalized)
    ? ""
    : text;
}

function cleanVisionObservation(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return Object.fromEntries(Object.entries(value).map(([key, field]) => [
    key,
    typeof field === "string"
      ? meaningfulVisionText(field)
      : Array.isArray(field)
        ? field.map(meaningfulVisionText).filter(Boolean)
        : field,
  ]));
}

function resolveVisionProviderOrder(_env) {
  return [...DEFAULT_VISION_PROVIDER_ORDER];
}

function stripHtml(html) {
  if (!html) return "";
  return String(html)
    .replace(/<[^>]*>+/g, " ")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

async function freeArtifactIdentificationFallback(observation, language) {
  const lang = language === "ar" ? "ar" : "en";
  const terms = [
    observation?.visualCandidateIdentity, observation?.identity,
    ...(Array.isArray(observation?.searchTerms) ? observation.searchTerms : []),
    observation?.objectType, observation?.material,
    ...(Array.isArray(observation?.symbols) ? observation.symbols : []),
  ].filter((x) => typeof x === "string" && x.trim())
   .map((x) => x.trim()).filter((x, i, a) => a.indexOf(x) === i).slice(0, 4);
  if (!terms.length) return null;
  const query = terms.join(" ").slice(0, 140);
  const headers = { Accept: "application/json" };
  const lookups = await Promise.allSettled([
    (async () => {
      const url = new URL("https://commons.wikimedia.org/w/api.php");
      url.search = new URLSearchParams({action:"query",generator:"search",gsrsearch:query,gsrnamespace:"6",gsrlimit:"4",prop:"imageinfo",iiprop:"url|extmetadata",format:"json",origin:"*"}).toString();
      const response = await fetch(url,{headers,signal:AbortSignal.timeout(3_500)});
      if(!response.ok)throw new Error(`Commons HTTP ${response.status}`);
      const data=await response.json();
      return Object.values(data?.query?.pages||{}).map((page)=>{
        const info=page?.imageinfo?.[0]||{},meta=info.extmetadata||{};
        const title=String(page?.title||"").replace(/^File:/,"");
        return title?{title:title.replace(/\.[a-z0-9]{2,5}$/i,""),url:`https://commons.wikimedia.org/wiki/${encodeURIComponent(page.title)}`,snippet:stripHtml(meta.ImageDescription?.value||meta.ObjectName?.value||""),source:"Wikimedia Commons",trusted:true}:null;
      }).filter(Boolean);
    })(),
    (async () => {
      const url=new URL(`https://${lang}.wikipedia.org/w/api.php`);
      url.search=new URLSearchParams({action:"query",list:"search",srsearch:query,srlimit:"3",format:"json",origin:"*"}).toString();
      const response=await fetch(url,{headers,signal:AbortSignal.timeout(3_500)});
      if(!response.ok)throw new Error(`Wikipedia HTTP ${response.status}`);
      const data=await response.json();
      return (data?.query?.search||[]).map(x=>({title:x.title,url:`https://${lang}.wikipedia.org/wiki/${encodeURIComponent(x.title)}`,snippet:stripHtml(x.snippet||""),source:`Wikipedia (${lang})`,trusted:true}));
    })(),
    (async () => {
      const url=new URL("https://www.wikidata.org/w/api.php");
      url.search=new URLSearchParams({action:"wbsearchentities",search:query,language:lang,limit:"3",format:"json",origin:"*"}).toString();
      const response=await fetch(url,{headers,signal:AbortSignal.timeout(3_500)});
      if(!response.ok)throw new Error(`Wikidata HTTP ${response.status}`);
      const data=await response.json();
      return (data?.search||[]).map(x=>({title:x.label||x.id,url:`https://www.wikidata.org/wiki/${x.id}`,snippet:x.description||"",source:"Wikidata",trusted:true}));
    })(),
  ]);
  const sources=[...new Map(lookups.flatMap(x=>x.status==="fulfilled"?x.value:[]).filter(x=>x?.url&&scannerSourceUrlAllowed(x.url)).map(x=>[x.url,x])).values()].slice(0,6);
  if(!sources.length)return null;
  const best=sources.find(x=>x.snippet)||sources[0];
  return {name:best.title||"",story:best.snippet||"",location:"",sources,confidence:"low",usedFreeFallback:true};
}

function parseVisionObservation(rawVisual) {
  const jsonText = rawVisual.match(/\{[\s\S]*\}/)?.[0];
  if (jsonText) {
    try {
      const parsed = JSON.parse(jsonText);
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        return cleanVisionObservation(parsed);
      }
    } catch {
      // Salvage completed fields from a response truncated before valid JSON could be formed.
    }
  }

  const observation = {};
  const fields = [
    "visualDescription",
    "sceneDescription",
    "objectType",
    "material",
    "style",
    "possibleLocation",
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
  return cleanVisionObservation(observation);
}

function hasUsableVisionObservation(observation, mode) {
  if (!observation || typeof observation !== "object" || Array.isArray(observation)) return false;
  const fields = mode === "hieroglyphs"
    ? ["visualDescription", "sceneDescription", "scriptType", "visibleText", "printedLabels", "identity", "objectType"]
    : ["visualDescription", "sceneDescription", "objectType", "material", "identity", "style", "keyFeatures"];
  if (fields.some((field) => meaningfulVisionText(observation[field]))) return true;
  return ["symbols", "keywords", "searchTerms", "possibilities"].some((field) =>
    Array.isArray(observation[field]) && observation[field].some((value) => meaningfulVisionText(value)),
  );
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
    "visualDescription", "sceneDescription", "objectType", "material", "style", "possibleLocation",
    "printedLabels", "identity", "country", "city", "place", "siteLocation", "period", "visibleText", "transliteration", "translation", "interpretation",
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
  combined.symbols = [...new Set(observations.flatMap((observation) =>
    Array.isArray(observation.symbols) ? observation.symbols : []))]
    .filter((symbol) => typeof symbol === "string" && symbol.trim()).slice(0, 12);
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

function applyKnownArtifactCorrections(observation) {
  const sourceText = [
    observation.identity,
    observation.visualDescription,
    observation.printedLabels,
    observation.contextualStory,
    observation.interpretation,
    observation.visibleText,
    ...(Array.isArray(observation.searchTerms) ? observation.searchTerms : []),
    ...(Array.isArray(observation.keywords) ? observation.keywords : []),
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
    possibilities: [],
    periodClues: [],
    writingHistory: "",
    objectOrTextPurpose: "",
    printedTextTranslation: "",
    translation: "",
  };
}

function applyEvidenceGuard(observation, hasOfficialVisualMatch, candidateIdentity = observation.identity) {
  if (hasOfficialVisualMatch) return observation;
  return {
    ...observation,
    visualCandidateIdentity: meaningfulVisionText(candidateIdentity),
    identity: "",
    identityEvidence: "",
    historicalEvidenceConfirmed: false,
    verifiedLocation: false,
    country: "",
    city: "",
    place: "",
    siteLocation: "",
    placeEvidence: "",
    placeType: "",
    period: "",
    objectOrTextPurpose: "",
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
    possibilities: [],
    confidenceByField: {
      ...observation.confidenceByField,
      identity: "low",
      place: "low",
      period: "low",
    },
  };
}

function canonicalOfficialArchiveUrl(value) {
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" || !/(^|\.)egymonuments\.gov\.eg$/i.test(url.hostname)) return "";
    url.hostname = url.hostname.toLowerCase().replace(/^www\./, "");
    url.search = "";
    url.hash = "";
    url.pathname = url.pathname.replace(/\/+$/, "") || "/";
    return url.href;
  } catch {
    return "";
  }
}

const GENERIC_IMAGE_SEARCH_TERMS = new Set([
  "مصر", "مصرية", "مصري", "اثار", "اثر", "قديم", "قديمة", "فرعوني", "حجر", "تمثال", "معبد", "نقش",
  "egypt", "egyptian", "ancient", "artifact", "statue", "temple", "stone", "tomb", "monument",
]);

function rankOfficialCatalogCandidates(catalog, observation) {
  const queryText = [
    observation.visualDescription,
    observation.sceneDescription,
    observation.objectType,
    observation.printedLabels,
    observation.visibleText,
    ...(Array.isArray(observation.searchTerms) ? observation.searchTerms : []),
    ...(Array.isArray(observation.keywords) ? observation.keywords : []),
  ].filter(Boolean).join(" ");
  const queryTerms = normalizeSearchTerms(queryText)
    .filter((term) => !GENERIC_IMAGE_SEARCH_TERMS.has(term));
  if (queryTerms.length < 2) return [];

  return catalog
    .filter((record) => {
      if (record.mode !== "objects" && record.mode !== "both") return false;
      if (!canonicalOfficialArchiveUrl(record.sourceUrl)) return false;
      return (record.imageUrls || []).some((imageUrl) => {
        const canonicalUrl = canonicalOfficialArchiveUrl(imageUrl);
        return canonicalUrl && new URL(canonicalUrl).pathname.startsWith("/media/");
      });
    })
    .map((record) => {
      const titleTerms = new Set(normalizeSearchTerms(
        [record.title, ...(Array.isArray(record.keywords) ? record.keywords : [])].join(" "),
      ));
      const descriptionTerms = new Set(normalizeSearchTerms(record.description));
      const titleMatches = queryTerms.filter((term) => titleTerms.has(term));
      const descriptionMatches = queryTerms.filter((term) => descriptionTerms.has(term));
      const score = titleMatches.length * 4 + descriptionMatches.length;
      return { record, score, titleMatches, descriptionMatches };
    })
    .filter((candidate) => candidate.titleMatches.length > 0 || candidate.descriptionMatches.length >= 2)
    .sort((left, right) => right.score - left.score)
    .slice(0, 4);
}

const GENERIC_SCANNER_DESCRIPTION_TERMS = new Set([
  "egypt", "egyptian", "ancient", "artifact", "artifacts", "statue", "statues",
  "temple", "stone", "sandstone", "carved", "museum", "relief", "reliefs", "inscription", "inscriptions", "hieroglyph", "hieroglyphs",
  "مصر", "مصري", "مصريه", "مصرية", "اثار", "اثر", "اثري", "اثريه", "فرعوني", "فرعونيه",
  "معبد", "معابد", "تمثال", "تماثيل", "حجر", "قديم", "قديمه", "خامة", "خامات", "نقش", "نقوش",
]);

const DISTINCTIVE_SCANNER_TERM_GROUPS = [
  new Set(["rock", "cut", "جبل", "صخر", "نحت"]),
  new Set(["seated", "sitting", "جالسه", "جلوس"]),
  new Set(["four", "اربعه"]),
  new Set(["baboon", "بابون"]),
  new Set(["colossal", "giant", "عملاق", "ضخمه"]),
  new Set(["mummy", "mummified", "مومياء", "تحنيط"]),
  new Set(["coffin", "تابوت"]),
  new Set(["bust", "نصفي"]),
  new Set(["mask", "قناع"]),
  new Set(["nemes", "نفرتيتي", "nefertiti"]),
  new Set(["sphinx", "ابوالهول"]),
];

function countDistinctiveScannerFeatures(queryTerms, candidateTerms) {
  return DISTINCTIVE_SCANNER_TERM_GROUPS.filter((group) =>
    queryTerms.some((term) => group.has(term) && candidateTerms.has(term)),
  ).length;
}

function scannerDescriptionTerms(observation) {
  const text = [
    observation.visualDescription,
    observation.sceneDescription,
    observation.objectType,
    observation.material,
    observation.style,
    ...(Array.isArray(observation.symbols) ? observation.symbols : []),
    ...(Array.isArray(observation.searchTerms) ? observation.searchTerms : []),
    ...(Array.isArray(observation.keywords) ? observation.keywords : []),
  ].filter(Boolean).join(" ").toLowerCase();
  const terms = new Set(normalizeSearchTerms(text).map((term) => term.replace(/^ال/, "")));
  if (/rock.cut|carved.*rock|منحوت|مقطوع.*جبل|صخري/.test(text)) {
    ["جبل", "صخر", "نحت"].forEach((term) => terms.add(term));
  }
  if (/seated|sitting|جالسه|جالس/.test(text)) ["جالسه", "جلوس"].forEach((term) => terms.add(term));
  if (/facade|front|واجهه/.test(text)) terms.add("واجهه");
  if (/baboon|monkey|بابون|قرد/.test(text)) ["بابون", "قرد"].forEach((term) => terms.add(term));
  if (/colossal|giant|huge|ضخمه|عملاق/.test(text)) ["ضخمه", "عملاق"].forEach((term) => terms.add(term));
  if (/\bfour\b|\b4\b|اربعه/.test(text)) terms.add("اربعه");
  if (/mumm(y|ified)|مومياء|محنط/.test(text)) ["مومياء", "تحنيط"].forEach((term) => terms.add(term));
  if (/coffin|sarcophagus|تابوت/.test(text)) terms.add("تابوت");
  if (/bust|نصفي/.test(text)) terms.add("نصفي");
  if (/mask|قناع/.test(text)) terms.add("قناع");
  if (/nefertiti|نفرتيتي/.test(text)) terms.add("نفرتيتي");
  if (/sphinx|ابو\s*الهول/.test(text)) terms.add("ابوالهول");
  return [...terms]
    .map((term) => term.replace(/^ال/, ""))
    .filter((term) => term.length > 2 && !GENERIC_SCANNER_DESCRIPTION_TERMS.has(term));
}

function rankOpenScannerCandidates(candidates, observation) {
  const queryTerms = scannerDescriptionTerms(observation);
  return candidates.map((candidate) => {
    const candidateTerms = new Set(normalizeSearchTerms(
      `${candidate.name || ""} ${candidate.sourceText || ""} ${candidate.museum || ""}`,
    ).map((term) => term.replace(/^ال/, "")));
    const matches = queryTerms.filter((term) => candidateTerms.has(term));
    const distinctiveMatches = countDistinctiveScannerFeatures(queryTerms, candidateTerms);
    return {
      ...candidate,
      textScore: matches.length,
      textEvidence: distinctiveMatches,
    };
  })
    .filter((candidate) => candidate.textEvidence >= 2 && candidate.textScore >= 2)
    .sort((left, right) => right.textScore - left.textScore)
    .slice(0, 5);
}

function rankOfficialTextCandidates(catalog, observation) {
  const queryTerms = scannerDescriptionTerms(observation);
  if (queryTerms.length < 3) return [];
  const ranked = catalog
    .filter((record) =>
      (record.mode === "objects" || record.mode === "both") &&
      canonicalOfficialArchiveUrl(record.sourceUrl) &&
      /\/(?:monuments|archaeological-sites|collections|museums)\//i.test(
        new URL(canonicalOfficialArchiveUrl(record.sourceUrl)).pathname,
      ),
    )
    .map((record) => {
      const titleTerms = new Set(normalizeSearchTerms(
        [record.title, ...(Array.isArray(record.keywords) ? record.keywords : [])].join(" "),
      ).map((term) => term.replace(/^ال/, "")));
      const descriptionTerms = new Set(normalizeSearchTerms(record.description).map((term) => term.replace(/^ال/, "")));
      const titleMatches = queryTerms.filter((term) => titleTerms.has(term));
      const descriptionMatches = queryTerms.filter((term) => descriptionTerms.has(term));
      const distinctiveMatches = countDistinctiveScannerFeatures(queryTerms, descriptionTerms);
      return {
        record,
        titleMatches,
        descriptionMatches,
        distinctiveMatches,
        score: titleMatches.length * 4 + descriptionMatches.length + distinctiveMatches.length * 3,
      };
    })
    .sort((left, right) => right.score - left.score);
  if (catalog.length <= 20) {
    console.info("[Image scanner] Local catalog text scores:", ranked.slice(0, 5).map((candidate) => ({
      title: candidate.record.title,
      queryTerms,
      matchedTerms: candidate.descriptionMatches,
      distinctiveFeatureGroups: candidate.distinctiveMatches,
    })));
  }
  return ranked
    .filter((candidate) =>
      candidate.distinctiveMatches >= 2 &&
      candidate.descriptionMatches.length >= 2,
    )
    .slice(0, 3);
}

function officialTextCandidateArtifact(candidate) {
  const record = candidate?.record;
  if (!record) return null;
  const url = canonicalOfficialArchiveUrl(record.sourceUrl);
  if (!url) return null;
  const name = String(record.title || "").replace(/\s*[-–—]\s*(?:إكتشف|اكتشف)\s+الآثار.*$/i, "").trim();
  const description = String(record.description || "").trim();
  const locationMatch = description.match(/(?:تقع|يقع|توجد|يوجد)\s+(?:ب|في)?\s*([^،؛.!؟]+)/i);
  const pageLocation = /\/(?:monuments|archaeological-sites)\//i.test(url) ? name : "";
  return {
    name,
    museum: String(record.museum || record.institution || record.repository || "").trim(),
    objectNumber: String(record.objectNumber || record.id || "").trim(),
    location: String(record.location || pageLocation || locationMatch?.[1] || "")
      .replace(/^(?:ب|في)\s*/u, "")
      .trim(),
    period: String(record.period || "").trim(),
    objectType: String(record.objectType || "").trim(),
    description,
    source: String(record.sourceTitle || "").trim(),
    similarity: null,
    url,
  };
}

async function findCachedOfficialImage(record) {
  const officialImageUrls = (record.imageUrls || []).filter((imageUrl) => {
    const canonicalUrl = canonicalOfficialArchiveUrl(imageUrl);
    return canonicalUrl && new URL(canonicalUrl).pathname.startsWith("/media/");
  });
  const localImageUrls = Array.isArray(record.localImageUrls) ? record.localImageUrls : [];
  for (const imageUrl of officialImageUrls) {
    const imageIndex = record.imageUrls.indexOf(imageUrl);
    if (record.imageUrls.length === localImageUrls.length && localImageUrls[imageIndex]) {
      return { imageUrl, localUrl: localImageUrls[imageIndex] };
    }
    if (!globalThis.crypto?.subtle) continue;
    const digest = await globalThis.crypto.subtle.digest(
      "SHA-1",
      new TextEncoder().encode(imageUrl),
    );
    const hash = [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
    const localUrl = `/egypt-monuments-images/${hash}.jpg`;
    if (localImageUrls.includes(localUrl)) return { imageUrl, localUrl };
  }
  return null;
}

async function loadOfficialCandidateImages(candidates, assets) {
  const loaded = [];
  for (const candidate of candidates) {
    const reference = await findCachedOfficialImage(candidate.record);
    if (!reference) continue;
    let response;
    if (typeof assets?.fetch === "function") {
      try {
        response = await assets.fetch(new URL(reference.localUrl, "https://athara.local").toString());
      } catch {
        response = null;
      }
    }
    if (!response?.ok) {
      try {
        response = await fetch(reference.imageUrl, { signal: AbortSignal.timeout(8000) });
      } catch {
        response = null;
      }
    }
    if (!response?.ok) continue;
    const buffer = await response.arrayBuffer();
    if (!buffer.byteLength || buffer.byteLength > 1_500_000) continue;
    loaded.push({
      label: `R${loaded.length + 1}`,
      item: candidate.record,
      imageBytes: Array.from(new Uint8Array(buffer)),
    });
    if (loaded.length === 3) break;
  }
  return loaded;
}

async function compareWithOfficialCatalogPhotos(imageBytes, candidates, apiKey, model, threshold) {
  if (!apiKey || !candidates.length || imageBytes.length > 2_000_000) return null;
  const parts = [
    {
      text: `الصورة الأولى هي صورة الزائر. الصور التالية صور مرجعية من كتالوج وزارة السياحة والآثار، ولكل صورة رمز قصير قبلها. قارن الصور بصريًا فقط. لا تعتبر التشابه العام أو كونها آثارًا مصرية تطابقًا، ولا تستخدم معرفتك السابقة بالأسماء أو العصور. أعد JSON فقط بالشكل {"matchId":"R1 أو R2 أو R3 أو none","similarity":0.0,"visualEvidence":["علامة مرئية مميزة أولى","علامة مرئية مميزة ثانية"]}. similarity تقدير بصري من 0 إلى 1 وليس CLIP أو قياسًا رياضيًا؛ امنح ${threshold} أو أعلى فقط عند تطابق واضح لعلامتين بصريتين مميزتين على الأقل.`,
    },
    { inlineData: { mimeType: detectImageMimeType(imageBytes), data: bytesToBase64(imageBytes) } },
  ];
  for (const candidate of candidates) {
    parts.push({ text: `الصورة المرجعية ${candidate.label}:` });
    parts.push({
      inlineData: {
        mimeType: detectImageMimeType(candidate.imageBytes),
        data: bytesToBase64(candidate.imageBytes),
      },
    });
  }
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
    {
      method: "POST",
      headers: { "content-type": "application/json", "x-goog-api-key": apiKey },
      body: JSON.stringify({
        contents: [{ role: "user", parts }],
        generationConfig: { temperature: 0.1, maxOutputTokens: 300 },
      }),
      signal: AbortSignal.timeout(10_000),
    },
  );
  const payload = await response.json().catch(() => null);
  if (!response.ok) throw new Error(payload?.error?.message || `Gemini catalog comparison returned HTTP ${response.status}`);
  const text = payload?.candidates?.[0]?.content?.parts?.map((part) => part?.text || "").join("") || "";
  const jsonText = text.match(/\{[\s\S]*\}/)?.[0];
  if (!jsonText) return null;
  let result;
  try {
    result = JSON.parse(jsonText);
  } catch {
    return null;
  }
  const similarity = Number(result.similarity);
  if (
    !Number.isFinite(similarity) ||
    similarity < threshold ||
    similarity > 1 ||
    !Array.isArray(result.visualEvidence) ||
    result.visualEvidence.filter((item) => typeof item === "string" && item.trim()).length < 2
  ) {
    return null;
  }
  const matched = candidates.find((candidate) => candidate.label === result.matchId);
  return matched
    ? {
        item: matched.item,
        url: matched.item.sourceUrl,
        engine: "Gemini official catalog comparison",
        similarity,
      }
    : null;
}

function scannerMatchThreshold(env) {
  const configured = env.SCANNER_MATCH_THRESHOLD;
  if (configured === undefined || configured === null || configured === "") {
    return DEFAULT_SCANNER_MATCH_THRESHOLD;
  }
  const threshold = Number(configured);
  if (!Number.isFinite(threshold) || threshold < 0 || threshold > 1) {
    throw new Error("SCANNER_MATCH_THRESHOLD must be a number from 0 to 1.");
  }
  return threshold;
}

function scannerIndexThreshold(env) {
  const threshold = Number(env.SCANNER_INDEX_MATCH_THRESHOLD ?? 0.85);
  return Number.isFinite(threshold) && threshold >= 0 && threshold <= 1 ? threshold : 0.85;
}

function scannerProbableThreshold(env) {
  const threshold = Number(env.SCANNER_PROBABLE_THRESHOLD ?? 0.65);
  return Number.isFinite(threshold) && threshold >= 0 && threshold <= 1 ? threshold : 0.65;
}

function scannerSourceUrlAllowed(value) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && SCANNER_ALLOWED_SOURCE_DOMAINS.some(
      (domain) => url.hostname === domain || url.hostname.endsWith(`.${domain}`),
    );
  } catch {
    return false;
  }
}

async function searchScannerIndex(env, imageBytes) {
  const baseUrl = typeof env.SCANNER_INDEX_URL === "string" ? env.SCANNER_INDEX_URL.trim() : "";
  if (!baseUrl) return null;
  const timeoutValue = Number(env.SCANNER_INDEX_TIMEOUT_MS ?? 12_000);
  const timeout = Number.isFinite(timeoutValue) && timeoutValue > 0 ? Math.min(timeoutValue, 30_000) : 12_000;
  try {
    const response = await fetch(new URL("/search", baseUrl), {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        imageBase64: bytesToBase64(imageBytes),
        mimeType: detectImageMimeType(imageBytes),
        topK: 5,
      }),
      signal: AbortSignal.timeout(timeout),
    });
    const payload = await response.json().catch(() => null);
    if (!response.ok) throw new Error(payload?.detail || `FAISS index returned HTTP ${response.status}`);
    const results = Array.isArray(payload?.results)
      ? payload.results.filter((item) => item && typeof item.entityId === "string" && item.metadata)
          .map((item) => ({
            entityId: item.entityId,
            similarity: Number(item.similarity),
            metadata: item.metadata,
          }))
          .filter((item) => Number.isFinite(item.similarity))
          .slice(0, 5)
      : [];
    console.info("[Image scanner] FAISS top results:", results.map((item) => ({
      name: item.metadata.title_ar || item.metadata.title_en || item.entityId,
      entityId: item.entityId,
      similarity: item.similarity,
      source: item.metadata.source,
    })));
    return { results, topTwoSameEntity: payload?.topTwoSameEntity === true };
  } catch (error) {
    console.error(`[Image scanner] FAISS lookup failed: ${String(error?.message || error)}`);
    return { results: [], topTwoSameEntity: false };
  }
}

function scannerIndexArtifactResult(indexHit) {
  const metadata = indexHit.metadata;
  const title = String(metadata.title_ar || metadata.title_en || "").trim();
  const pageUrl = String(metadata.page_url || "").trim();
  if (!title || !scannerSourceUrlAllowed(pageUrl)) return null;
  const description = String(metadata.description || "").trim();
  const location = [metadata.institution, metadata.city, metadata.country]
    .filter((part) => typeof part === "string" && part.trim())
    .join(", ");
  const artifact = {
    name: title,
    museum: String(metadata.institution || "").trim(),
    objectNumber: String(metadata.accession_number || "").trim(),
    location,
    period: String(metadata.period || "").trim(),
    objectType: String(metadata.object_type || "").trim(),
    description,
    similarity: Math.round(indexHit.similarity * 1000) / 1000,
    source: String(metadata.source || "").trim(),
    url: pageUrl,
  };
  return {
    ok: true,
    analysis: description,
    resultType: "reference_match",
    identificationStatus: "confirmed",
    reverseImageSearchStatus: "match",
    confidence: "high",
    confidenceByField: {
      identity: "high",
      place: location ? "medium" : "low",
      period: artifact.period ? "medium" : "low",
    },
    matchedArtifact: artifact,
    sources: [{
      title,
      url: pageUrl,
      snippet: description,
      source: artifact.source,
      trusted: true,
    }],
    candidates: [],
    visualMatchMethod: "OpenCLIP ViT-B-32 + FAISS",
  };
}

function scannerIndexCandidates(indexResult) {
  return (indexResult?.results || []).flatMap((hit) => {
    const metadata = hit.metadata || {};
    const name = String(metadata.title_ar || metadata.title_en || "").trim();
    const url = String(metadata.page_url || "").trim();
    if (!name || !scannerSourceUrlAllowed(url)) return [];
    return [{
      name,
      museum: String(metadata.institution || "").trim(),
      objectNumber: String(metadata.accession_number || "").trim(),
      url,
      similarity: Math.round(hit.similarity * 1000) / 1000,
      source: String(metadata.source || "").trim(),
      sourceText: String(metadata.description || "").trim(),
      entityId: hit.entityId,
    }];
  }).slice(0, 5);
}

function openScannerCandidateArtifact(candidate) {
  if (!candidate || !scannerSourceUrlAllowed(candidate.url)) return null;
  return {
    name: candidate.name,
    museum: candidate.museum || "",
    objectNumber: candidate.objectNumber || "",
    location: candidate.museum || "",
    period: "",
    objectType: "",
    description: candidate.sourceText || "",
    source: candidate.source || "",
    similarity: null,
    url: candidate.url,
  };
}

async function summarizeTrustedSourceText(env, sourceText, language) {
  const text = String(sourceText || "").trim().slice(0, 6000);
  const key = typeof env.GROQ_API_KEY === "string" ? env.GROQ_API_KEY.trim() : "";
  if (!text || !key) return "";
  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model: typeof env.GROQ_MODEL === "string" && env.GROQ_MODEL.trim() ? env.GROQ_MODEL.trim() : "qwen/qwen3.8-27b",
        temperature: 0.1,
        max_tokens: 300,
        messages: [{ role: "user", content: `لخّص النص المرجعي التالي بلغة ${LANGUAGES[language]} فقط. لا تضف أي معلومة من معرفتك، ولا تخترع مكانًا أو تاريخًا أو قصة. أعد الملخص فقط.\n\n${text}` }],
      }),
      signal: AbortSignal.timeout(4_000),
    });
    const payload = await response.json().catch(() => null);
    if (!response.ok) throw new Error(payload?.error?.message || `Groq returned HTTP ${response.status}`);
    return payload?.choices?.[0]?.message?.content?.trim() || "";
  } catch (error) {
    console.error(`[Image scanner] Source-only summary failed: ${String(error?.message || error)}`);
    return "";
  }
}

function configuredGeminiVisionModel(env) {
  return typeof env.GEMINI_VISION_MODEL === "string" && env.GEMINI_VISION_MODEL.trim()
    ? env.GEMINI_VISION_MODEL.trim()
    : "gemini-3.8-flash";
}

function scannerVisualDescription(observation) {
  return {
    object_type: observation.objectType || observation.visualDescription || "",
    material: observation.material || "",
    symbols: Array.isArray(observation.symbols) ? observation.symbols : [],
    style: observation.style || "",
    possible_location: observation.possibleLocation || observation.placeType || "",
  };
}

function scannerSearchQueries(observation) {
  const identityTerms = [observation.identity, observation.visualCandidateIdentity];
  const searchTerms = [
    ...(Array.isArray(observation.searchTerms) ? observation.searchTerms : []),
    ...(Array.isArray(observation.keywords) ? observation.keywords : []),
    ...identityTerms,
  ]
    .filter((term) => typeof term === "string" && term.trim())
    .map((term) => term.trim())
    .filter((term, index, list) => list.indexOf(term) === index)
    .slice(0, 8);
  const visualTerms = [
    ...identityTerms,
    observation.objectType,
    observation.material,
    ...(Array.isArray(observation.symbols) ? observation.symbols : []),
    observation.style,
    observation.visualDescription,
    observation.possibleLocation,
  ]
    .filter((term) => typeof term === "string" && term.trim())
    .map((term) => term.trim())
    .filter((term, index, list) => list.indexOf(term) === index);
  return [...new Set([searchTerms.join(" "), visualTerms.join(" ")])]
    .filter(Boolean)
    .map((query) => query.slice(0, 180))
    .slice(0, 2);
}

function makeScannerCandidate(candidate) {
  if (!candidate || typeof candidate.name !== "string" || !candidate.name.trim()) return null;
  let pageUrl;
  let imageUrl;
  try {
    pageUrl = new URL(candidate.url);
    imageUrl = new URL(candidate.imageUrl);
  } catch {
    return null;
  }
  if (
    pageUrl.protocol !== "https:" ||
    imageUrl.protocol !== "https:" ||
    !SCANNER_IMAGE_HOSTS.has(imageUrl.hostname) ||
    !SCANNER_ALLOWED_SOURCE_DOMAINS.some(
      (domain) => pageUrl.hostname === domain || pageUrl.hostname.endsWith(`.${domain}`),
    )
  ) {
    return null;
  }
  return {
    name: candidate.name.trim().slice(0, 240),
    museum: String(candidate.museum || "").trim().slice(0, 160),
    objectNumber: String(candidate.objectNumber || "").trim().slice(0, 100),
    url: pageUrl.href,
    imageUrl: imageUrl.href,
    source: String(candidate.source || "").trim().slice(0, 100),
    currentLocation: String(candidate.currentLocation || "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim().slice(0, 240),
    findSpot: String(candidate.findSpot || "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim().slice(0, 240),
    period: String(candidate.period || "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim().slice(0, 240),
    material: String(candidate.material || "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim().slice(0, 240),
    provenance: String(candidate.provenance || "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim().slice(0, 1200),
    didYouKnow: String(candidate.didYouKnow || "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim().slice(0, 1200),
    sourceText: String(candidate.sourceText || "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim().slice(0, 6000),
  };
}

async function scannerJson(url, label) {
  const response = await fetch(url, {
    headers: { accept: "application/json" },
    signal: AbortSignal.timeout(12_000),
  });
  if (!response.ok) throw new Error(`${label} returned HTTP ${response.status}`);
  return response.json();
}

async function searchMetScannerCandidates(query) {
  const searchUrl = new URL("https://collectionapi.metmuseum.org/public/collection/v1.1/search");
  searchUrl.search = new URLSearchParams({
    departmentId: "10",
    q: query,
    hasImages: "true",
    limit: "4",
  }).toString();
  const search = await scannerJson(searchUrl, "Met collection search");
  const ids = (Array.isArray(search.objectIDs) ? search.objectIDs : []).slice(0, 4);
  const records = await Promise.allSettled(ids.map(async (id) => {
    const item = await scannerJson(
      `https://collectionapi.metmuseum.org/public/collection/v1/objects/${encodeURIComponent(id)}`,
      "Met object lookup",
    );
    return makeScannerCandidate({
      name: item.title,
      museum: "The Metropolitan Museum of Art",
      objectNumber: item.accessionNumber,
      url: item.objectURL,
      imageUrl: item.primaryImageSmall || item.primaryImage,
      source: "The Metropolitan Museum of Art",
      sourceText: [
        item.objectDescription,
        item.culture,
        item.period,
        item.objectDate,
        item.medium,
      ].filter(Boolean).join(" "),
    });
  }));
  return records
    .filter((result) => result.status === "fulfilled" && result.value)
    .map((result) => result.value);
}

async function searchClevelandScannerCandidates(query) {
  const url = new URL("https://openaccess-api.clevelandart.org/api/artworks/");
  url.search = new URLSearchParams({
    q: query,
    department: "Egyptian and Ancient Near Eastern Art",
    cc0: "",
    has_image: "1",
    limit: "5",
  }).toString();
  const data = await scannerJson(url, "Cleveland collection search");
  return (Array.isArray(data?.data) ? data.data : []).map((item) => makeScannerCandidate({
    name: item.title,
    museum: "Cleveland Museum of Art",
    objectNumber: item.accession_number,
    url: item.url,
    imageUrl: item.images?.web?.url,
    source: "Cleveland Museum of Art",
    sourceText: [item.description, item.tombstone, item.culture?.join(" "), item.creation_date]
      .filter(Boolean).join(" "),
  })).filter(Boolean);
}

async function searchClevelandByImage(imageBytes) {
  try {
    const mimeType = detectImageMimeType(imageBytes);
    const extension = mimeType === "image/png" ? "png" : mimeType === "image/webp" ? "webp" : "jpg";
    const form = new FormData();
    form.set("file", new Blob([new Uint8Array(imageBytes)], { type: mimeType }), `athara-upload.${extension}`);
    const response = await fetch("https://openaccess-api.clevelandart.org/api/artworks", {
      method: "POST",
      body: form,
      signal: AbortSignal.timeout(8_000),
    });
    if (!response.ok) throw new Error(`Cleveland image similarity returned HTTP ${response.status}`);
    const payload = await response.json();
    const candidates = (Array.isArray(payload?.data) ? payload.data : [])
      .map((item) => makeScannerCandidate({
        name: item.title,
        museum: "Cleveland Museum of Art",
        objectNumber: item.accession_number,
        url: item.url,
        imageUrl: item.images?.web?.url || item.images?.print?.url,
        source: "Cleveland Museum of Art — image similarity",
        currentLocation: item.current_location,
        findSpot: item.find_spot,
        period: item.creation_date || item.culture,
        material: item.technique || item.support_materials,
        provenance: item.provenance,
        didYouKnow: item.did_you_know || item.artlens_description,
        sourceText: [
          item.description,
          item.tombstone,
          item.did_you_know,
          item.artlens_description,
          item.early_education_description,
          item.creation_date,
          item.culture,
          item.technique,
          item.support_materials,
          item.provenance,
          item.exhibitions,
          item.citations,
        ].filter(Boolean).join(" "),
      }))
      .filter(Boolean)
      .slice(0, 12);
    console.info("[Image scanner] Cleveland image-similarity retrieval:", {
      returned: candidates.length,
      hasCatalogRecords: candidates.length > 0,
    });
    return { candidates, available: true };
  } catch (error) {
    console.error(`[Image scanner] Cleveland image-similarity retrieval failed: ${String(error?.message || error).slice(0, 180)}`);
    return { candidates: [], available: false };
  }
}

async function searchArtInstituteScannerCandidates(query) {
  const url = new URL("https://api.artic.edu/api/v1/artworks/search");
  url.search = new URLSearchParams({
    q: query,
    limit: "5",
    "query[term][is_public_domain]": "true",
    fields: "id,title,artist_title,date_display,medium_display,place_of_origin,description,image_id,is_public_domain,main_reference_number",
  }).toString();
  const data = await scannerJson(url, "Art Institute of Chicago collection search");
  return (Array.isArray(data?.data) ? data.data : [])
    .filter((item) => {
      if (!item?.image_id || item?.is_public_domain !== true) return false;
      const recordText = [item.title, item.artist_title, item.place_of_origin, item.description].filter(Boolean).join(" ");
      return /egypt|egyptian|pharaoh|nubia|thebes|ancient near east|مصر|مصري|فرعوني|طيبة|النوبة/i.test(recordText);
    })
    .map((item) => makeScannerCandidate({
      name: item.title,
      museum: "Art Institute of Chicago",
      objectNumber: item.main_reference_number || String(item.id || ""),
      url: `https://www.artic.edu/artworks/${item.id}`,
      imageUrl: `https://www.artic.edu/iiif/2/${encodeURIComponent(item.image_id)}/full/400,/0/default.jpg`,
      source: "Art Institute of Chicago",
      period: item.date_display,
      material: item.medium_display,
      sourceText: [
        item.description,
        item.artist_title,
        item.date_display,
        item.medium_display,
        item.place_of_origin,
        item.main_reference_number,
      ].filter(Boolean).join(" "),
    }))
    .filter(Boolean);
}

async function searchWikipediaScannerCandidates(query, language) {
  const url = new URL(`https://${language}.wikipedia.org/w/api.php`);
  url.search = new URLSearchParams({
    action: "query",
    generator: "search",
    gsrsearch: query,
    gsrnamespace: "0",
    gsrlimit: "5",
    prop: "pageimages|extracts|info",
    inprop: "url",
    exintro: "1",
    explaintext: "1",
    piprop: "thumbnail",
    pithumbsize: "640",
    format: "json",
  }).toString();
  const data = await scannerJson(url, `Wikipedia ${language} search`);
  return Object.values(data?.query?.pages || {}).map((page) => makeScannerCandidate({
    name: page.title,
    museum: "",
    objectNumber: "",
    url: page.fullurl || `https://${language}.wikipedia.org/wiki/${encodeURIComponent(String(page.title || "").replace(/ /g, "_"))}`,
    imageUrl: page.thumbnail?.source,
    source: `Wikipedia (${language})`,
    sourceText: page.extract || "",
  })).filter(Boolean);
}

async function searchCommonsScannerCandidates(query) {
  const url = new URL("https://commons.wikimedia.org/w/api.php");
  url.search = new URLSearchParams({
    action: "query",
    generator: "search",
    gsrsearch: query,
    gsrnamespace: "6",
    gsrlimit: "6",
    prop: "imageinfo",
    iiprop: "url|extmetadata",
    iiurlwidth: "640",
    format: "json",
  }).toString();
  const data = await scannerJson(url, "Wikimedia Commons search");
  return Object.values(data?.query?.pages || {})
    .map((page) => {
      const info = page?.imageinfo?.[0] || {};
      const metadata = info.extmetadata || {};
      const title = String(page?.title || "").replace(/^File:/, "");
      return makeScannerCandidate({
        name: title.replace(/\.(?:jpe?g|png|webp|tiff?)$/i, ""),
        museum: metadata.Institution?.value || "",
        url: `https://commons.wikimedia.org/wiki/${encodeURIComponent(String(page?.title || "").replace(/ /g, "_"))}`,
        imageUrl: info.thumburl || info.url,
        source: "Wikimedia Commons",
        sourceText: metadata.ImageDescription?.value || "",
      });
    })
    .filter(Boolean);
}

async function searchWikidataScannerCandidates(query) {
  const searchUrl = new URL("https://www.wikidata.org/w/api.php");
  searchUrl.search = new URLSearchParams({
    action: "wbsearchentities",
    search: query,
    language: "en",
    limit: "5",
    format: "json",
  }).toString();
  const search = await scannerJson(searchUrl, "Wikidata search");
  const ids = (Array.isArray(search.search) ? search.search : [])
    .map((item) => item?.id)
    .filter((id) => typeof id === "string" && /^Q\d+$/.test(id));
  if (!ids.length) return [];
  const detailsUrl = new URL("https://www.wikidata.org/w/api.php");
  detailsUrl.search = new URLSearchParams({
    action: "wbgetentities",
    ids: ids.join("|"),
    props: "labels|descriptions|claims",
    languages: "en|ar",
    format: "json",
  }).toString();
  const details = await scannerJson(detailsUrl, "Wikidata entity lookup");
  const entities = details.entities || {};
  const collectionIds = [...new Set(Object.values(entities)
    .map((entity) => entity?.claims?.P195?.[0]?.mainsnak?.datavalue?.value?.id)
    .filter((id) => typeof id === "string" && /^Q\d+$/.test(id)))];
  const collections = {};
  if (collectionIds.length) {
    const collectionUrl = new URL("https://www.wikidata.org/w/api.php");
    collectionUrl.search = new URLSearchParams({
      action: "wbgetentities",
      ids: collectionIds.join("|"),
      props: "labels",
      languages: "en|ar",
      format: "json",
    }).toString();
    const collectionData = await scannerJson(collectionUrl, "Wikidata collection lookup");
    for (const [id, entity] of Object.entries(collectionData.entities || {})) {
      collections[id] = entity.labels?.en?.value || entity.labels?.ar?.value || "";
    }
  }
  return Object.entries(entities).map(([id, entity]) => {
    const claims = entity?.claims || {};
    const imageName = claims.P18?.[0]?.mainsnak?.datavalue?.value;
    if (typeof imageName !== "string") return null;
    const label = entity.labels?.en?.value || entity.labels?.ar?.value || "";
    const collection = claims.P195?.[0]?.mainsnak?.datavalue?.value?.id || "";
    return makeScannerCandidate({
      name: label,
      museum: collections[collection] || "",
      objectNumber: claims.P217?.[0]?.mainsnak?.datavalue?.value || "",
      url: `https://www.wikidata.org/wiki/${id}`,
      imageUrl: `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(imageName)}?width=640`,
      source: "Wikidata",
      sourceText: entity.descriptions?.en?.value || entity.descriptions?.ar?.value || "",
    });
  }).filter(Boolean);
}

async function searchOpenScannerCandidates(observation, language = "en") {
  const queries = scannerSearchQueries(observation).slice(0, 2);
  if (!queries.length) return { candidates: [], availableSources: 0, failedSources: 0 };
  const providers = queries.flatMap((query) => [
    [`Met (${query})`, () => searchMetScannerCandidates(query)],
    [`Cleveland (${query})`, () => searchClevelandScannerCandidates(query)],
    [`Art Institute of Chicago (${query})`, () => searchArtInstituteScannerCandidates(query)],
    [`Wikimedia Commons (${query})`, () => searchCommonsScannerCandidates(query)],
    [`Wikidata (${query})`, () => searchWikidataScannerCandidates(query)],
    [`Wikipedia en (${query})`, () => searchWikipediaScannerCandidates(query, "en")],
    ...(language === "ar" ? [[`Wikipedia ar (${query})`, () => searchWikipediaScannerCandidates(query, "ar")]] : []),
  ]);
  const results = await Promise.allSettled(providers.map(([, search]) => search()));
  const candidates = [];
  let availableSources = 0;
  let failedSources = 0;
  results.forEach((result, index) => {
    if (result.status === "fulfilled") {
      availableSources += 1;
      candidates.push(...result.value);
      return;
    }
    failedSources += 1;
    console.error(`[Image scanner] ${providers[index][0]} search failed: ${String(result.reason?.message || result.reason).slice(0, 180)}`);
  });
  const rankedCandidates = [...new Map(candidates.map((candidate) => [candidate.url, candidate])).values()].slice(0, 10);
  console.info("[Image scanner] Source searches completed:", {
    queries,
    checked: providers.map(([name], index) => ({
      source: name,
      status: results[index]?.status === "fulfilled" ? "available" : "failed",
    })),
    availableSources,
    failedSources,
    candidateCount: rankedCandidates.length,
  });
  return {
    candidates: rankedCandidates,
    availableSources,
    failedSources,
  };
}


function scannerGroundedResearchQueries(observation, language = "en") {
  const strings = (values) => (Array.isArray(values) ? values : [])
    .filter((value) => typeof value === "string" && value.trim())
    .map((value) => value.trim().replace(/\s+/g, " "));
  const identity = [
    observation?.visualCandidateIdentity,
    observation?.identity,
    ...strings(observation?.possibilities),
    ...strings(observation?.searchTerms),
    observation?.printedLabels,
    observation?.visibleText,
  ].filter((value) => typeof value === "string" && value.trim());
  const visual = [
    observation?.objectType,
    observation?.material,
    observation?.style,
    ...strings(observation?.symbols),
    ...strings(observation?.keywords),
    observation?.visualDescription,
    observation?.sceneDescription,
  ].filter((value) => typeof value === "string" && value.trim());
  const text = [observation?.printedLabels, observation?.visibleText, observation?.transliteration]
    .filter((value) => typeof value === "string" && value.trim());
  const aliases = [
    ["نفتيس", "Nephthys Nebthet"], ["نبت حوت", "Nephthys"],
    ["أوزير", "Osiris"], ["اوزير", "Osiris"], ["إيزيس", "Isis"], ["ايزيس", "Isis"],
    ["أنوبيس", "Anubis"], ["انوبس", "Anubis"], ["بتاح", "Ptah"], ["سخمت", "Sekhmet"],
    ["حتحور", "Hathor"], ["باستت", "Bastet"], ["تحوت", "Thoth"], ["حورس", "Horus"],
    ["آمون", "Amun"], ["امون", "Amun"],
  ];
  const expand = (values) => values.flatMap((value) => [
    value,
    ...aliases.filter(([needle]) => value.toLowerCase().includes(needle.toLowerCase())).map(([, alias]) => alias),
  ]);
  const unique = (values) => [...new Set(expand(values).map((value) => value.trim()).filter(Boolean))];
  const suffix = language === "ar"
    ? "سجل قطعة أثرية مصرية قديمة كتالوج متحف رسمي"
    : "ancient Egyptian artifact official museum collection catalogue record";
  return [
    unique(identity).slice(0, 8),
    unique(visual).slice(0, 10),
    unique(text).slice(0, 5),
  ]
    .filter((values) => values.length)
    .map((values) => (values.join(" ") + " " + suffix).replace(/\s+/g, " ").trim().slice(0, 420))
    .filter((query, index, all) => query.length > suffix.length + 8 && all.indexOf(query) === index)
    .slice(0, 3);
}

function scannerGroundedResearchQuery(observation, language = "en") {
  return scannerGroundedResearchQueries(observation, language).join("\n");
}

function scannerUrlsFromText(value) {
  const text = String(value || "");
  const markdown = [...text.matchAll(/\[([^\]]{2,160})\]\((https:\/\/[^\s)]+)\)/g)]
    .map((m) => ({ title: m[1].trim(), url: m[2].replace(/[.,;]+$/, "") }));
  const plain = [...text.matchAll(/https:\/\/[^\s<>"')\]]+/g)]
    .map((m) => ({ title: "", url: m[0].replace(/[.,;]+$/, "") }));
  return [...new Map([...markdown, ...plain].map((x) => [x.url, x])).values()];
}

async function searchWithGeminiGrounding(query, apiKey, model) {
  const queryList = String(query || "").split("\n").map((item) => item.trim()).filter(Boolean).slice(0, 3);
  const prompt = "نفّذ بحث Google Search لكل زاوية بحث مناسبة من القائمة التالية، ولا تكتفِ بأول نتيجة:\n" +
    queryList.map((item, index) => (index + 1) + ". " + item).join("\n") +
    ". ابحث عن سجل القطعة نفسه في كتالوج وزارة السياحة والآثار المصرية أو المتاحف الرسمية. جرّب الاسم العربي والإنجليزي والتهجئات البديلة والسمات المميزة. استبعد الصفحة الرئيسية والأسئلة والشروط والأخبار وصفحات العصور العامة. أرجع عناوين وروابط السجلات الأصلية وما يؤكده كل سجل. لا تخترع اسمًا أو متحفًا أو تاريخًا.";
  const response = await fetchVisionWithRetry("https://generativelanguage.googleapis.com/v1beta/interactions", {
    method: "POST",
    headers: { "content-type": "application/json", "x-goog-api-key": apiKey },
    body: JSON.stringify({ model, input: prompt, tools: [{ type: "google_search" }] }),
  }, { provider: "Gemini Google Search grounding", timeoutMs: 12_000 });
  const payload = await response.json().catch(() => null);
  if (!response.ok) throw new Error(payload?.error?.message || "Gemini search HTTP " + response.status);
  const blocks = [], citations = [], issuedQueries = [], structuredEntries = [];
  for (const step of Array.isArray(payload?.steps) ? payload.steps : []) {
    if (step?.type === "google_search_call" && Array.isArray(step.arguments?.queries)) {
      issuedQueries.push(...step.arguments.queries.filter((item) => typeof item === "string"));
    }
    if (step?.type === "google_search_result") {
      structuredEntries.push(...scannerStructuredSearchEntries(step.result || step));
    }
    if (step?.type !== "model_output") continue;
    for (const part of Array.isArray(step.content) ? step.content : []) {
      if (typeof part?.text === "string") blocks.push(part.text);
      for (const annotation of Array.isArray(part?.annotations) ? part.annotations : []) {
        const url = annotation?.url || annotation?.uri;
        if (annotation?.type === "url_citation" && typeof url === "string") {
          citations.push({ title: annotation.title || "", url });
        }
      }
    }
  }
  const summary = blocks.join("\n") || String(payload?.output_text || "");
  return {
    entries: [...new Map([
      ...structuredEntries,
      ...citations,
      ...scannerUrlsFromText(summary),
    ].map((item) => [item.url, item])).values()],
    summary,
    issuedQueries: [...new Set(issuedQueries)].slice(0, 6),
  };
}

function scannerStructuredSearchEntries(value) {
  const entries = [];
  const visited = new Set();
  const visit = (node, depth = 0) => {
    if (!node || typeof node !== "object" || depth > 6 || visited.has(node)) return;
    visited.add(node);
    if (Array.isArray(node)) {
      for (const item of node.slice(0, 40)) visit(item, depth + 1);
      return;
    }
    const url = [node.url, node.uri, node.link].find((item) =>
      typeof item === "string" && /^https:\/\//i.test(item));
    if (url) {
      const title = [node.title, node.page_title, node.name].find((item) =>
        typeof item === "string" && item.trim()) || "";
      const snippet = [node.content, node.snippet, node.description, node.text, node.excerpt]
        .find((item) => typeof item === "string" && item.trim()) || "";
      entries.push({ title, url, snippet: String(snippet).slice(0, 1200) });
    }
    for (const key of [
      "executed_tools", "browser_results", "search_results", "results",
      "items", "sources", "citations", "annotations", "output",
    ]) {
      if (node[key] !== undefined) visit(node[key], depth + 1);
    }
  };
  visit(value);
  return [...new Map(entries.map((entry) => [entry.url, entry])).values()].slice(0, 30);
}

async function searchWithGroqBrowser(query, apiKey, model) {
  const supportedModels = new Set([
    "openai/gpt-oss-20b",
    "openai/gpt-oss-120b",
    "openai/gpt-oss-safeguard-20b",
  ]);
  const browserModel = supportedModels.has(model) ? model : "openai/gpt-oss-20b";
  const queryList = String(query || "").split("\n").map((item) => item.trim()).filter(Boolean).slice(0, 3);
  const prompt = "Use browser search for each of these search angles and return original museum/antiquities object catalogue pages, not broad articles:\n" +
    queryList.map((item, index) => (index + 1) + ". " + item).join("\n") +
    "\nPrioritize the Egyptian Ministry of Tourism and Antiquities and official museum collections. Return the page title, exact URL, and catalogue facts actually stated. Ignore home, FAQ, terms, events, and broad historical-period pages. Do not invent catalogue records.";
  const response = await fetchVisionWithRetry("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: { "content-type": "application/json", authorization: "Bearer " + apiKey },
    body: JSON.stringify({
      model: browserModel,
      temperature: 1,
      max_completion_tokens: 1800,
      reasoning_effort: "low",
      tool_choice: "required",
      tools: [{ type: "browser_search" }],
      messages: [{ role: "user", content: prompt }],
    }),
  }, { provider: "Groq browser search", timeoutMs: 12_000 });
  const payload = await response.json().catch(() => null);
  if (!response.ok) throw new Error(payload?.error?.message || "Groq search HTTP " + response.status);
  const message = payload?.choices?.[0]?.message || {};
  const summary = typeof message.content === "string" ? message.content.trim() : "";
  const structuredEntries = scannerStructuredSearchEntries(message);
  const payloadEntries = scannerStructuredSearchEntries(payload);
  const entries = [...new Map([
    ...structuredEntries,
    ...payloadEntries,
    ...scannerUrlsFromText(summary),
  ].map((entry) => [entry.url, entry])).values()];
  if (!summary && !entries.length) throw new Error("Groq browser search returned no text or structured results.");
  return { entries, summary, model: browserModel };
}

async function searchWithCloudflareWebSearch(env, query) {
  if (typeof env.AI?.websearch !== "function") throw new Error("Cloudflare Web Search binding unavailable.");
  const response = await withScannerTimeout(env.AI.websearch({
    gatewayId: "default", query: query.slice(0, 1024), provider: "exa", limit: 10,
  }), 14_000, "Cloudflare Web Search");
  const payload = await response.json().catch(() => null);
  if (!response.ok) throw new Error(payload?.error?.message || `Cloudflare search HTTP ${response.status}`);
  return { entries: (Array.isArray(payload?.items) ? payload.items : [])
    .filter((x) => typeof x?.url === "string")
    .map((x) => ({ title: x.title || "", url: x.url, snippet: x.description || "" })), summary: "" };
}

function scannerMeta(html, key) {
  for (const tag of html.match(/<meta\b[^>]*>/gi) || []) {
    const name = tag.match(/(?:property|name)=["']([^"']+)["']/i)?.[1];
    const value = tag.match(/content=["']([^"']+)["']/i)?.[1];
    if (name?.toLowerCase() === key.toLowerCase() && value) return stripHtml(value);
  }
  return "";
}

function scannerSpecificCataloguePage(url) {
  const host = url.hostname.toLowerCase();
  const path = url.pathname.toLowerCase().replace(/\/+$/, "");
  if (/(?:^|\/)(?:faqs?|terms(?:-and-conditions)?|privacy(?:-policy)?|historical-periods|events|children|about|news)(?:\/|$)/.test(path)) {
    return false;
  }
  if (host === "egymonuments.gov.eg" || host.endsWith(".egymonuments.gov.eg")) {
    const segments = path.split("/").filter(Boolean);
    return segments.length >= 3 &&
      ["ar", "en"].includes(segments[0]) &&
      ["monuments", "archaeological-sites", "collections", "museums"].includes(segments[1]);
  }
  return (
    (host.endsWith("metmuseum.org") && /\/art\/collection\/search\/\d+/.test(path)) ||
    (host.endsWith("clevelandart.org") && /\/art\/\d/.test(path)) ||
    (host === "artic.edu" && /\/artwork\/\d+/.test(path)) ||
    (host.endsWith("britishmuseum.org") && /\/collection\/object\/\d+/.test(path)) ||
    (host.endsWith("si.edu") && /\/object\//.test(path)) ||
    (host.endsWith("penn.museum") && /\/collections\/object\//.test(path)) ||
    (host.endsWith("brooklynmuseum.org") && /\/opencollection\/objects\//.test(path)) ||
    (host.endsWith("louvre.fr") && /\/oeuvres\//.test(path)) ||
    (host.endsWith("europeana.eu") && /\/item\//.test(path))
  );
}

async function readGroundedScannerSource(entry, observation) {
  let url;
  try { url = new URL(entry.url); } catch { return null; }
  if (!scannerSourceUrlAllowed(url.href)) return null;
  const specificCataloguePage = scannerSpecificCataloguePage(url);
  if (!specificCataloguePage && !scannerSourceSupportsCandidate({
    title: String(entry.title || ""),
    url: url.href,
    snippet: String(entry.snippet || ""),
    trusted: true,
  }, observation)) return null;
  const initial = {
    title: String(entry.title || url.hostname),
    url: url.href,
    snippet: String(entry.snippet || "").slice(0, 1200),
    source: url.hostname,
    trusted: true,
  };
  try {
    const response = await fetch(url.href, {
      headers: { accept: "text/html,application/xhtml+xml", "user-agent": "ATHARA-Heritage-Guide/1.0" },
      redirect: "follow",
      signal: AbortSignal.timeout(5_000),
    });
    const finalUrl = new URL(response.url || url.href);
    if (!response.ok || !scannerSourceUrlAllowed(finalUrl.href)) {
      return specificCataloguePage || scannerSourceSupportsCandidate(initial, observation)
        ? { source: initial, candidate: null }
        : null;
    }
    const html = await readLimitedHtml(response, 600_000);
    const title = stripHtml(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] || "") || initial.title;
    const main = html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i)?.[1] ||
      html.match(/<article\b[^>]*>([\s\S]*?)<\/article>/i)?.[1] || html;
    const snippet = stripHtml(main.replace(/<(script|style|noscript|svg|nav|header|footer|form)\b[\s\S]*?<\/\1>/gi, " ")
      .replace(/<[^>]*>/g, " ")).slice(0, 6000);
    const source = {
      ...initial,
      title,
      url: finalUrl.href,
      snippet: snippet.length > 50 ? snippet : initial.snippet,
    };
    const stillSpecificCataloguePage = scannerSpecificCataloguePage(finalUrl);
    if (!scannerSourceSupportsCandidate(source, observation) && !stillSpecificCataloguePage) return null;
    const imageRef = scannerMeta(html, "og:image") || scannerMeta(html, "twitter:image");
    let candidate = null;
    if (imageRef) {
      const imageUrl = new URL(imageRef, finalUrl.href);
      const permittedImageHost =
        SCANNER_IMAGE_HOSTS.has(imageUrl.hostname) || imageUrl.hostname === finalUrl.hostname;
      if (imageUrl.protocol === "https:" && permittedImageHost) {
        candidate = makeScannerCandidate({
          name: title,
          url: finalUrl.href,
          imageUrl: imageUrl.href,
          source: url.hostname,
          sourceText: source.snippet,
        });
      }
    }
    return { source, candidate };
  } catch (error) {
    console.warn("[Image scanner] Could not read grounded page:", url.hostname,
      String(error?.message || error).slice(0, 120));
    return specificCataloguePage || scannerSourceSupportsCandidate(initial, observation)
      ? { source: initial, candidate: null }
      : null;
  }
}

async function searchArtifactGroundedSources(env, observation, language = "en") {
  const query = scannerGroundedResearchQuery(observation, language);
  const providers = [];
  const geminiKey = typeof env.GEMINI_API_KEY === "string" ? env.GEMINI_API_KEY.trim() : "";
  const groqKey = typeof env.GROQ_API_KEY === "string" ? env.GROQ_API_KEY.trim() : "";
  if (geminiKey) providers.push({ name: "Gemini Google Search", run: () =>
    searchWithGeminiGrounding(query, geminiKey, configuredGeminiVisionModel(env)) });
  if (groqKey) providers.push({ name: "Groq browser search", run: () =>
    searchWithGroqBrowser(query, groqKey, env.GROQ_WEB_SEARCH_MODEL || "openai/gpt-oss-20b") });
  if (typeof env.AI?.websearch === "function") providers.push({ name: "Cloudflare Web Search", run: () =>
    searchWithCloudflareWebSearch(env, query) });
  // Independent search engines run concurrently. A quota error or timeout in one
  // engine must not delay or cancel results returned by the others.
  const results = await Promise.allSettled(providers.map((provider) => provider.run()));
  let failedSources = 0;
  let successfulProviders = 0;
  const pageTasks = [];
  const sourceLeads = [];
  for (const [index, result] of results.entries()) {
    const provider = providers[index];
    if (result.status === "rejected") {
      failedSources++;
      console.warn("[Image scanner] Search provider failed; other engines continue:", provider.name,
        String(result.reason?.message || result.reason).slice(0, 160));
      continue;
    }
    successfulProviders++;
    const entries = (result.value.entries || [])
      .filter((entry) => scannerSourceUrlAllowed(entry.url))
      .slice(0, 10);
    for (const entry of entries) {
      let entryUrl;
      try { entryUrl = new URL(entry.url); } catch { continue; }
      // Keep search-engine catalogue evidence even if the institution blocks a
      // Worker fetch, serves a timeout, or changes its HTML template.
      if (scannerSpecificCataloguePage(entryUrl) || scannerSourceSupportsCandidate({
        title: entry.title || "",
        url: entryUrl.href,
        snippet: entry.snippet || "",
        trusted: true,
      }, observation)) {
        sourceLeads.push({
          title: String(entry.title || entryUrl.hostname),
          url: entryUrl.href,
          snippet: String(entry.snippet || "").slice(0, 1200),
          source: entryUrl.hostname,
          trusted: true,
          searchProvider: provider.name,
        });
      }
      pageTasks.push(readGroundedScannerSource(entry, observation).then((page) => {
        if (!page) return null;
        return { ...page, source: { ...page.source, searchProvider: provider.name } };
      }).catch((error) => {
        console.warn("[Image scanner] Catalogue page read failed:", provider.name,
          String(error?.message || error).slice(0, 120));
        return null;
      }));
    }
  }
  const collected = (await Promise.all(pageTasks)).filter(Boolean);
  const pageSources = collected.map((entry) => entry.source);
  const preservedSources = [...new Map(
    [...pageSources, ...sourceLeads].map((source) => [source.url, source]),
  ).values()];
  const unique = [...new Map(collected.map((entry) => [entry.source.url, entry])).values()];
  unique.sort((left, right) => {
    const leftPriority = SOURCE_PRIORITY.findIndex((domain) => new URL(left.source.url).hostname.endsWith(domain));
    const rightPriority = SOURCE_PRIORITY.findIndex((domain) => new URL(right.source.url).hostname.endsWith(domain));
    return (leftPriority < 0 ? 999 : leftPriority) - (rightPriority < 0 ? 999 : rightPriority) ||
      Number(Boolean(right.candidate)) - Number(Boolean(left.candidate));
  });
  const sources = [...new Map([
    ...unique.map((entry) => entry.source),
    ...preservedSources,
  ].map((source) => [source.url, source])).values()].slice(0, 8);
  const candidates = unique.flatMap((entry) => entry.candidate ? [entry.candidate] : []);
  return {
    sources,
    candidates: candidates.slice(0, 12),
    availableSources: successfulProviders,
    failedSources,
    provider: providers.filter((provider, index) => results[index]?.status === "fulfilled")
      .map((provider) => provider.name).join(", "),
  };
}

async function downloadScannerCandidateImages(candidates) {
  const downloads = await Promise.all(candidates.slice(0, 5).map(async (candidate) => {
    try {
      const response = await fetch(candidate.imageUrl, {
        signal: AbortSignal.timeout(8_000),
      });
      if (!response.ok) throw new Error(`Image returned HTTP ${response.status}`);
      const resolvedUrl = new URL(response.url || candidate.imageUrl);
      const contentType = response.headers.get("content-type") || "";
      if (
        resolvedUrl.protocol !== "https:" ||
        !SCANNER_IMAGE_HOSTS.has(resolvedUrl.hostname) ||
        !/^image\/(jpeg|png|webp)(?:;|$)/i.test(contentType)
      ) {
        throw new Error("Candidate image redirected to an unsupported host or format.");
      }
      const bytes = new Uint8Array(await response.arrayBuffer());
      if (!bytes.length || bytes.length > 900_000) {
        throw new Error("Candidate image is empty or exceeds the size limit.");
      }
      return { ...candidate, imageBytes: bytes };
    } catch (error) {
      console.error(`[Image scanner] Candidate image download failed (${candidate.source}): ${String(error?.message || error).slice(0, 180)}`);
      return null;
    }
  }));
  return downloads
    .filter((candidate) => candidate !== null)
    .map((candidate, index) => ({ id: `C${index + 1}`, ...candidate }));
}

function cosineSimilarity(left, right) {
  if (!Array.isArray(left) || !Array.isArray(right) || left.length !== right.length || !left.length) return -1;
  let dot = 0;
  let leftNorm = 0;
  let rightNorm = 0;
  for (let index = 0; index < left.length; index += 1) {
    const a = Number(left[index]);
    const b = Number(right[index]);
    if (!Number.isFinite(a) || !Number.isFinite(b)) return -1;
    dot += a * b;
    leftNorm += a * a;
    rightNorm += b * b;
  }
  return leftNorm > 0 && rightNorm > 0 ? dot / (Math.sqrt(leftNorm) * Math.sqrt(rightNorm)) : -1;
}

async function rankScannerCandidateImagesWithEmbeddings(ai, imageBytes, candidates) {
  const selected = candidates.filter((candidate) => candidate?.imageBytes?.length).slice(0, 5);
  if (!ai || typeof ai.run !== "function" || !selected.length) {
    return { ranked: [], model: "", available: false };
  }
  const toImageUri = (bytes) => `data:${detectImageMimeType(bytes)};base64,${bytesToBase64(bytes)}`;
  const imageMessages = [
    imageBytes,
    ...selected.map((candidate) => candidate.imageBytes),
  ].map((bytes) => [{
    role: "user",
    content: [{
      type: "image_url",
      image_url: { url: toImageUri(bytes) },
    }],
  }]);
  const response = await withScannerTimeout(
    ai.run("@cf/google/embeddinggemma-2", {
      messages: imageMessages,
      dimensions: 512,
    }),
    7_000,
    "Cloudflare EmbeddingGemma 2",
  );
  const vectors = Array.isArray(response?.data)
    ? response.data.map((entry) => entry?.embedding)
    : [];
  if (vectors.length !== selected.length + 1 || !Array.isArray(vectors[0])) {
    throw new Error("EmbeddingGemma returned an incomplete image-vector batch.");
  }
  const ranked = selected.map((candidate, index) => ({
    ...candidate,
    similarity: cosineSimilarity(vectors[0], vectors[index + 1]),
  }))
    .filter((candidate) => Number.isFinite(candidate.similarity) && candidate.similarity >= -1)
    .sort((left, right) => right.similarity - left.similarity);
  return { ranked, model: "@cf/google/embeddinggemma-2", available: true };
}

function formatArtifactCatalogStory(candidate, language = "ar") {
  const isArabic = language === "ar";
  const lines = [
    candidate.name ? (isArabic ? `اسم القطعة: ${candidate.name}` : `Object: ${candidate.name}`) : "",
    candidate.museum ? (isArabic ? `المتحف/المجموعة: ${candidate.museum}` : `Museum/collection: ${candidate.museum}`) : "",
    candidate.currentLocation ? (isArabic ? `مكان العرض حسب سجل المتحف: ${candidate.currentLocation}` : `Recorded display location: ${candidate.currentLocation}`) : "",
    candidate.findSpot ? (isArabic ? `مكان العثور أو الاكتشاف: ${candidate.findSpot}` : `Findspot: ${candidate.findSpot}`) : "",
    candidate.period ? (isArabic ? `التاريخ أو الفترة المسجلة: ${candidate.period}` : `Recorded date/period: ${candidate.period}`) : "",
    candidate.material ? (isArabic ? `الخامة/التقنية: ${candidate.material}` : `Material/technique: ${candidate.material}`) : "",
    candidate.didYouKnow ? (isArabic ? `عن القطعة: ${candidate.didYouKnow}` : `About the object: ${candidate.didYouKnow}`) : "",
    candidate.provenance ? (isArabic ? `سجل الملكية: ${candidate.provenance}` : `Provenance: ${candidate.provenance}`) : "",
    candidate.sourceText ? (isArabic ? `تفاصيل بطاقة المتحف: ${candidate.sourceText}` : `Museum catalogue record: ${candidate.sourceText}`) : "",
  ].filter(Boolean);
  return lines.join("\n\n");
}

async function compareImageCandidatesWithGroq(imageBytes, candidates, apiKey, model, threshold) {
  const selected = candidates.slice(0, 2);
  if (!apiKey || !selected.length || imageBytes.length > 2_000_000) return { ranked: [], match: null };

  const content = [
    {
      type: "text",
      text: `قارن الصورة الأولى (صورة الزائر) بكل صورة مرجعية تليها. استخدم التشابه البصري الفعلي فقط، ولا تعتمد على أسماء المرشحين أو معرفتك التاريخية. أعد JSON فقط بالشكل {"rankedMatches":[{"candidateId":"C1","similarity":0.0,"visualEvidence":["علامة مرئية مميزة أولى","علامة مرئية مميزة ثانية"]}]}. similarity تقدير بصري من 0 إلى 1؛ لا تمنح ${threshold} أو أعلى إلا عند تطابق علامتين واضحتين على الأقل. لا تعتبر كون الصورتين لآثار مصرية تطابقًا.`,
    },
    { type: "image_url", image_url: { url: `data:${detectImageMimeType(imageBytes)};base64,${bytesToBase64(imageBytes)}` } },
  ];
  for (const [index, candidate] of selected.entries()) {
    const candidateId = candidate.id || candidate.label || `C${index + 1}`;
    const candidateName = candidate.name || candidate.item?.title || "مرشح";
    content.push({ type: "text", text: `الصورة المرجعية ${candidateId}: ${candidateName}` });
    content.push({
      type: "image_url",
      image_url: { url: `data:${detectImageMimeType(candidate.imageBytes)};base64,${bytesToBase64(candidate.imageBytes)}` },
    });
  }

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model,
      temperature: 0.1,
      max_tokens: 700,
      response_format: { type: "json_object" },
      messages: [{ role: "user", content }],
    }),
    signal: AbortSignal.timeout(10_000),
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok) throw new Error(payload?.error?.message || `Groq image comparison returned HTTP ${response.status}`);
  const raw = payload?.choices?.[0]?.message?.content || "";
  const jsonText = String(raw).match(/\{[\s\S]*\}/)?.[0];
  if (!jsonText) throw new Error("Groq image comparison returned invalid JSON.");
  let parsed;
  try { parsed = JSON.parse(jsonText); }
  catch { throw new Error("Groq image comparison returned invalid JSON."); }

  const ranked = (Array.isArray(parsed.rankedMatches) ? parsed.rankedMatches : [])
    .map((entry) => {
      const candidate = selected.find((item, index) =>
        (item.id || item.label || `C${index + 1}`) === entry?.candidateId,
      );
      return {
        candidate,
        similarity: Number(entry?.similarity),
        visualEvidence: Array.isArray(entry?.visualEvidence)
          ? entry.visualEvidence.filter((item) => typeof item === "string" && item.trim()).slice(0, 3)
          : [],
      };
    })
    .filter((entry) => entry.candidate && Number.isFinite(entry.similarity) && entry.similarity >= 0 && entry.similarity <= 1)
    .sort((left, right) => right.similarity - left.similarity);
  const best = ranked[0];
  return {
    ranked: ranked.map(({ candidate, similarity }) => ({
      name: candidate.name || candidate.item?.title || "",
      museum: candidate.museum || candidate.item?.museum || candidate.item?.sourceTitle || "",
      objectNumber: candidate.objectNumber || candidate.item?.objectNumber || candidate.item?.id || "",
      url: candidate.url || candidate.item?.sourceUrl || "",
      similarity: Math.round(similarity * 1000) / 1000,
    })),
    match: best && best.similarity >= threshold && best.visualEvidence.length >= 2
      ? { candidate: best.candidate, similarity: best.similarity }
      : null,
  };
}

async function compareOpenScannerCandidatesWithGroq(imageBytes, candidates, apiKey, model, threshold) {
  return compareImageCandidatesWithGroq(imageBytes, candidates, apiKey, model, threshold);
}

async function compareOfficialCatalogPhotosWithGroq(imageBytes, candidates, apiKey, model, threshold) {
  const result = await compareImageCandidatesWithGroq(imageBytes, candidates, apiKey, model, threshold);
  return result.match
    ? {
        item: result.match.candidate.item,
        url: result.match.candidate.item.sourceUrl,
        engine: "Groq Qwen Vision official catalog comparison",
        similarity: result.match.similarity,
      }
    : null;
}

async function compareOpenScannerCandidates(imageBytes, candidates, apiKey, model, threshold) {
  if (!apiKey || !candidates.length || imageBytes.length > 2_000_000) return { ranked: [], match: null };
  const parts = [{
    text: `قارن صورة المستخدم بالصورة المرجعية المرفقة لكل مرشح. لا تستخدم معرفة الأسماء أو التاريخ. أعد JSON فقط بالشكل {"rankedMatches":[{"candidateId":"C1","similarity":0.0,"visualEvidence":["تفصيل مرئي مميز"]}]}. similarity تقدير بصري من 0 إلى 1 وليس CLIP أو قياسًا رياضيًا؛ امنح 0.8 أو أعلى فقط عند تطابق واضح لعلامتين بصريتين مميزتين على الأقل، لا للتشابه العام. أدرج أفضل ثلاثة مرشحين فقط ولا تختلق أدلة.`,
  }, {
    inlineData: { mimeType: detectImageMimeType(imageBytes), data: bytesToBase64(imageBytes) },
  }];
  for (const candidate of candidates) {
    parts.push({ text: `الصورة المرجعية ${candidate.id}: ${candidate.name}` });
    parts.push({
      inlineData: {
        mimeType: detectImageMimeType(candidate.imageBytes),
        data: bytesToBase64(candidate.imageBytes),
      },
    });
  }
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
    {
      method: "POST",
      headers: { "content-type": "application/json", "x-goog-api-key": apiKey },
      body: JSON.stringify({
        contents: [{ role: "user", parts }],
        generationConfig: { responseMimeType: "application/json", temperature: 0.1, maxOutputTokens: 700 },
      }),
      signal: AbortSignal.timeout(10_000),
    },
  );
  const payload = await response.json().catch(() => null);
  if (!response.ok) throw new Error(payload?.error?.message || `Gemini candidate comparison returned HTTP ${response.status}`);
  const text = payload?.candidates?.[0]?.content?.parts?.map((part) => part?.text || "").join("") || "";
  const jsonText = text.match(/\{[\s\S]*\}/)?.[0];
  if (!jsonText) throw new Error("Gemini candidate comparison returned invalid JSON.");
  let result;
  try {
    result = JSON.parse(jsonText);
  } catch {
    throw new Error("Gemini candidate comparison returned invalid JSON.");
  }
  const ranked = (Array.isArray(result.rankedMatches) ? result.rankedMatches : [])
    .map((entry) => ({
      candidate: candidates.find((candidate) => candidate.id === entry?.candidateId),
      similarity: Number(entry?.similarity),
      visualEvidence: Array.isArray(entry?.visualEvidence)
        ? entry.visualEvidence.filter((item) => typeof item === "string" && item.trim()).slice(0, 3)
        : [],
    }))
    .filter((entry) => entry.candidate && Number.isFinite(entry.similarity) && entry.similarity >= 0 && entry.similarity <= 1)
    .sort((left, right) => right.similarity - left.similarity)
    .slice(0, 3);
  const best = ranked[0];
  return {
    ranked: ranked.map(({ candidate, similarity }) => ({
      name: candidate.name,
      museum: candidate.museum,
      objectNumber: candidate.objectNumber,
      url: candidate.url,
      similarity: Math.round(similarity * 1000) / 1000,
    })),
    match: best && best.similarity >= threshold && best.visualEvidence.length >= 2
      ? { candidate: best.candidate, similarity: best.similarity }
      : null,
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
    ar: ["1. ما الذي نراه؟", "2. الموقع", "3. القصة والخلفية التاريخية", "4. أهم ما يميزها", "5. معلومات إضافية", "6. المصادر", "لم يتم التأكد من الهوية بدقة. احتمالات أولية تحتاج إلى مطابقة:"],
    en: ["1. What are we seeing?", "2. Location", "3. Story and historical background", "4. What makes it special?", "5. Additional information", "6. Sources", "The identity could not be confirmed. Initial candidates to verify:"],
    fr: ["1. Que voyons-nous ?", "2. Lieu", "3. Histoire et contexte", "4. Ce qui la rend unique", "5. Informations complémentaires", "6. Sources", "L’identité n’a pas été confirmée. Premières possibilités à vérifier :"],
    de: ["1. Was sehen wir?", "2. Standort", "3. Geschichte und Hintergrund", "4. Besonderheiten", "5. Zusatzinformationen", "6. Quellen", "Die Identität ist nicht bestätigt. Erste Möglichkeiten zur Überprüfung:"],
    es: ["1. ¿Qué vemos?", "2. Ubicación", "3. Historia y contexto", "4. Qué la hace especial", "5. Información adicional", "6. Fuentes", "La identidad no está confirmada. Posibilidades iniciales por verificar:"],
    it: ["1. Cosa vediamo?", "2. Posizione", "3. Storia e contesto", "4. Cosa la rende speciale", "5. Informazioni aggiuntive", "6. Fonti", "L’identità non è confermata. Prime possibilità da verificare:"],
    ru: ["1. Что изображено?", "2. Местоположение", "3. История и исторический контекст", "4. Чем это знаменито?", "5. Дополнительная информация", "6. Источники", "Личность не подтверждена. Предварительные варианты для проверки:"],
    zh: ["1. 我们看到了什么？", "2. 位置", "3. 故事与历史背景", "4. 有何特色？", "5. 补充信息", "6. 来源", "身份尚未确认。以下是需要核实的初步可能性："],
    ja: ["1. 何が見えるでしょうか？", "2. 場所", "3. 歴史と背景", "4. 特徴", "5. 追加情報", "6. 出典", "身元は未確認です。確認が必要な初期候補："],
  };
  return labels[language] || labels.en;
}

function scanProviderUnavailableMessage(language) {
  const messages = {
    ar: "وصلت الصورة لكن تعذر تحليلها الآن. مش هخمن اسم القطعة أو قصتها من غير دليل. جرّب مرة تانية بعد شوية أو ارفع صورة أوضح.",
    en: "The image arrived, but could not be analyzed right now. I will not guess its identity or story without evidence. Try again shortly or upload a clearer image.",
    fr: "L’image a été reçue, mais ne peut pas être analysée pour le moment. Je ne devinerai pas son identité ni son histoire sans preuve. Réessayez bientôt ou envoyez une image plus nette.",
    de: "Das Bild wurde empfangen, kann momentan aber nicht analysiert werden. Ohne Belege rate ich weder Identität noch Geschichte. Bitte versuchen Sie es später erneut oder laden Sie ein klareres Bild hoch.",
    es: "La imagen se recibió, pero no se pudo analizar ahora. No adivinaré su identidad ni su historia sin pruebas. Inténtalo más tarde o sube una imagen más clara.",
    it: "L’immagine è stata ricevuta, ma al momento non può essere analizzata. Non indovinerò identità o storia senza prove. Riprova più tardi o carica un’immagine più chiara.",
    ru: "Изображение получено, но сейчас его не удалось проанализировать. Без подтверждений я не буду угадывать название или историю. Попробуйте позже или загрузите более четкое изображение.",
    zh: "已收到图片，但目前无法分析。没有证据时，我不会猜测名称或故事。请稍后重试或上传更清晰的图片。",
    ja: "画像を受信しましたが、現在分析できません。根拠なしに名前や物語を推測しません。しばらくしてから再試行するか、より鮮明な画像をアップロードしてください。",
  };
  return messages[language] || messages.en;
}

function unconfirmedCandidateLabel(language) {
  const labels = {
    ar: "اسم محتمل غير مؤكد: ",
    en: "Unconfirmed visual candidate: ",
    fr: "Nom visuel possible, non confirmé : ",
    de: "Unbestätigter visueller Kandidat: ",
    es: "Posible nombre visual, sin confirmar: ",
    it: "Possibile nome visivo non confermato: ",
    ru: "Предполагаемое, не подтвержденное название: ",
    zh: "未确认的视觉候选名称：",
    ja: "未確認の視覚的な候補名：",
  };
  return labels[language] || labels.en;
}

function unverifiedLocationText(language) {
  const labels = {
    ar: "لم يذكر المصدر مكان العرض بوضوح.",
    en: "The source does not clearly state where it is displayed.",
    fr: "La source ne précise pas clairement son lieu d’exposition.",
    de: "Die Quelle nennt den Ausstellungsort nicht eindeutig.",
    es: "La fuente no indica claramente dónde se exhibe.",
    it: "La fonte non indica chiaramente dove è esposto.",
    ru: "Источник не указывает, где именно экспонат выставлен.",
    zh: "来源未明确说明其展出地点。",
    ja: "出典には展示場所が明確に記載されていません。",
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
  const allowHistoricalContext = mode !== "objects" || observation.historicalEvidenceConfirmed === true;
  const facts = allowHistoricalContext ? [
    observation.period ? (language === "ar" ? "الفترة المحتملة: " : "Probable period: ") + observation.period : "",
    observation.periodClues?.join("، "),
    observation.writingHistory,
    observation.objectOrTextPurpose,
    placeConfidence === "low" ? "" : observation.siteHistory,
  ].filter((part) => typeof part === "string" && part.trim()).join(" ") : "";
  const rawSourceConflict = String(observation.sourceConflicts || "").trim();
  const sourceConflictText = /لا يوجد تعارض|no conflict|لا يوجد اختلاف/i.test(rawSourceConflict)
    ? ""
    : rawSourceConflict;
  let storyText = allowHistoricalContext ? [
    observation.contextualStory,
    observation.interpretation,
    facts,
    observation.historicalVerification ? "تحقق تاريخي: " + observation.historicalVerification : "",
    sourceConflictText ? "اختلاف المصادر: " + sourceConflictText : "",
  ].filter(Boolean).join("\n") : "";
  if (identity && observation.historicalEvidenceConfirmed === false) {
    storyText = "لم يتم التحقق من الهوية والتاريخ بصريًا؛ لا تُنسب هذه المعلومات إلى الآثار أو الشخصيات التاريخية دون دليل مطابق.";
  }
  if (mode === "objects" && !observation.verifiedLocation && observation.historicalEvidenceConfirmed !== true && !identity) {
    storyText = "";
  }
  const unconfirmedAttribution = /ليس دليل|not evidence|مكتوب أسفل|written below/i;
  const provenanceFacts = allowHistoricalContext ? [
    observation.discoverer && !unconfirmedAttribution.test(observation.discoverer) ? (language === "ar" ? "المكتشف المؤكد: " : "Confirmed discoverer: ") + observation.discoverer : "",
    observation.discoveryDate && !unconfirmedAttribution.test(observation.discoveryDate) ? (language === "ar" ? "تاريخ الاكتشاف: " : "Discovery date: ") + observation.discoveryDate : "",
    observation.creationDate && !unconfirmedAttribution.test(observation.creationDate) ? (language === "ar" ? "تاريخ الإنشاء أو الإسناد: " : "Creation/attribution date: ") + observation.creationDate : "",
    observation.studyAttribution && !unconfirmedAttribution.test(observation.studyAttribution) ? (language === "ar" ? "الدارس أو الناشر الأكاديمي: " : "Studying/publishing archaeologist: ") + observation.studyAttribution : "",
    observation.publicationAttribution && !unconfirmedAttribution.test(observation.publicationAttribution) ? (language === "ar" ? "من نشر التوثيق: " : "Publication attribution: ") + observation.publicationAttribution : "",
    observation.publicationDate && !unconfirmedAttribution.test(observation.publicationDate) ? (language === "ar" ? "تاريخ النشر: " : "Publication date: ") + observation.publicationDate : "",
  ].filter(Boolean) : [];
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
  if (mode === "objects" && observation.visualCandidateIdentity) {
    const relatedSources = sources.filter((source) => scannerSourceSupportsCandidate(source, observation));
    const groundedSource = relatedSources[0];
    if (groundedSource) {
      const candidateLocation = [observation.possibleLocation, observation.place, observation.city]
        .filter((value) => typeof value === "string" && value.trim())
        .find((value) => {
          const locationTerms = normalizeSearchTerms(value).filter(
            (term) => !/^(?:egypt|egyptian|مصر|المصرية|مصري|في|من|the|of|in)$/.test(term),
          );
          const sourceText = normalizeSearchTerms(
            `${groundedSource.title || ""} ${groundedSource.snippet || ""}`,
          );
          return (
            locationTerms.length > 0 &&
            locationTerms.every((term) => sourceText.includes(term))
          );
        });
      const sourceStory = groundedSource.snippet || groundedSource.title;
      return [
        section(seeing, `${unconfirmedCandidateLabel(language)}${observation.visualCandidateIdentity}`),
        section(location, candidateLocation || unverifiedLocationText(language)),
        section(story, sourceStory),
      ].filter(Boolean).join("\n\n");
    }
  }
  const uncertainty = !identity && Array.isArray(observation.possibilities) && observation.possibilities.length
    ? `${uncertain}\n${observation.possibilities.join("\n")}`
    : !identity ? uncertain : "";
  const seeingText = identity
    ? `${identity}${observation.objectType ? " — " + observation.objectType : ""}${observation.printedLabels ? "\n" + observation.printedLabels : ""}`
    : [
        uncertainty,
        observation.visualCandidateIdentity
          ? unconfirmedCandidateLabel(language) + observation.visualCandidateIdentity
          : "",
        observation.objectType
          ? (language === "ar" ? "نوع ظاهر مبدئيًا: " : "Preliminary visible type: ") + observation.objectType
          : "",
        observation.visualDescription
          ? (language === "ar" ? "الوصف: " : "Description: ") + observation.visualDescription
          : "",
      ].filter(Boolean).join("\n");
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
  const officialSources = await searchOfficialMonumentsArchive(q);
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
  const dedupedSources = [...new Map([
    ...officialSources.map((source) => [source.url, { ...source, trusted: true }]),
    ...trustedSources.map((source) => [source.url, source]),
    ...results.map((source) => [source.url, source]),
  ].filter(([, value]) => Boolean(value?.url))).values()].slice(0, 8);
  return {
    sources: dedupedSources,
    trustedSourcesAvailable: trustedSources.length > 0 || officialSources.length > 0,
    wikipediaAvailable,
  };
}

function relatedSourceSummary(sources, language, observation = null) {
  const trustedSources = sources
    .filter((source) => source?.trusted)
    .filter((source) => !observation || scannerSourceSupportsCandidate(source, observation))
    .slice(0, 2);
  if (!trustedSources.length) return "";
  return [
    SOURCE_EVIDENCE_LABELS[language] || SOURCE_EVIDENCE_LABELS.en,
    ...trustedSources.map((source) => "- " + source.title + ": " + (source.supportedClaim || source.snippet || "")),
  ].join("\n");
}

function normalizeSearchTerms(value) {
  return String(value || "")
    .toLocaleLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[أإآ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .split(/\s+/)
    .filter((term) => term.length > 2)
    .filter((term, index, terms) => terms.indexOf(term) === index);
}

function scannerCandidateTerms(observation) {
  const rawTerms = normalizeSearchTerms([
    observation.identity,
    observation.visualCandidateIdentity,
    observation.place,
    observation.possibleLocation,
    ...(Array.isArray(observation.searchTerms) ? observation.searchTerms : []),
    ...(Array.isArray(observation.keywords) ? observation.keywords : []),
  ].filter(Boolean).join(" "));
  const aliases = {
    "نفتيس": ["nephthys"],
    "خوفو": ["khufu"],
    "زوسر": ["djoser"],
    "توت": ["tut"],
    "عنخ": ["ankh"],
    "امون": ["amun"],
    "ابو": ["abu"],
    "سمبل": ["simbel"],
    "الاربعه": ["four"],
    "اربعه": ["four"],
    "جالسه": ["seated"],
    "ضخمه": ["colossal"],
    "واجهه": ["facade"],
    "جبل": ["rock"],
    "منحوت": ["cut"],
    "معبد": ["temple"],
    "خشبي": ["wooden"],
    "برونزي": ["bronze"],
    "قاعد": ["seated"],
  };
  const expandedTerms = rawTerms.flatMap((term) => [term, ...(aliases[term] || [])]);
  const genericTerms = new Set([
    "statue", "artifact", "egyptian", "ancient", "temple", "wooden",
    "bust", "plaster", "stone", "painted", "royal", "figurine",
    "تمثال", "اثري", "اثر", "مصرية", "مصري", "القديمة", "قديم",
    "ملون", "حجر", "جص", "ملكي", "نصفي", "خشبي", "ملك", "ملكه",
    "اله", "الهه", "فرعون", "ال", "في", "من", "على", "the", "and",
  ]);
  return [...new Set(expandedTerms.filter((term) => !genericTerms.has(term)))];
}

function scannerSourceSupportsCandidate(source, observation) {
  if (source?.trusted !== true) return false;
  try {
    const sourceUrl = new URL(source.url);
    const path = sourceUrl.pathname.toLowerCase().replace(/\/+$/, "") || "/";
    if (/(?:^|\/)(?:faqs?|terms(?:-and-conditions)?|privacy(?:-policy)?|historical-periods|events|children|about|news)(?:\/|$)/.test(path)) return false;
    if (sourceUrl.hostname === "egymonuments.gov.eg" || sourceUrl.hostname.endsWith(".egymonuments.gov.eg")) {
      const segments = path.split("/").filter(Boolean);
      if (segments.length < 3 || !["ar", "en"].includes(segments[0]) ||
          !["monuments", "archaeological-sites", "collections", "museums"].includes(segments[1])) return false;
    }
  } catch {
    return false;
  }
  const identityTerms = scannerCandidateTerms(observation);
  if (identityTerms.length < 1) return false;
  const titleTerms = new Set(normalizeSearchTerms(source.title || ""));
  const snippetTerms = new Set(normalizeSearchTerms(source.snippet || ""));
  const genericIdentityTerms = new Set([
    "king", "queen", "goddess", "god", "pharaoh", "royal", "ancient",
    "egyptian", "statue", "bust", "wooden", "painted", "plaster", "stone",
    "ملك", "ملكه", "اله", "الهه", "فرعون", "ملكي", "قديم", "مصري", "مصرية",
  ]);
  const namedTerms = identityTerms.filter((term) => !genericIdentityTerms.has(term));
  return namedTerms.some((term) => titleTerms.has(term) || snippetTerms.has(term));
}

async function searchOfficialMonumentsArchive(query) {
  const genericTerms = new Set([
    "egypt", "egyptian", "ancient", "antiquities", "artifact", "artifacts",
    "statue", "statues", "temple", "tomb", "museum", "mummy", "hieroglyph",
    "مصر", "مصري", "مصرية", "اثار", "اثر", "تمثال", "تماثيل", "معبد",
    "مقبرة", "متحف", "فرعوني", "فرعونية", "قديم", "قديمة",
  ]);
  const terms = normalizeSearchTerms(query).filter((term) => !genericTerms.has(term));
  if (!terms.length) return [];
  const egyptianSignals = /مصر|فرعون|هرم|معبد|تمثال|مقبرة|نقش|اثر|آثار|اثار|سقارة|الاقصر|اسوان|أبو سمبل|دهشور|ابو سمبل|متحف|pyramid|temple|statue|tomb|artifact|egypt|pharaoh|hieroglyph|obelisk|mummy/i;
  if (!egyptianSignals.test(query)) return [];
  const fetchOptions = {
    headers: { accept: "text/html,application/xhtml+xml", "user-agent": "ATHARA-Heritage-Guide/1.0" },
    signal: AbortSignal.timeout(6000),
  };
  const pageUrls = [
    "https://egymonuments.gov.eg/ar/monuments",
    "https://egymonuments.gov.eg/ar/archaeological-sites",
    "https://egymonuments.gov.eg/ar/museums",
    "https://egymonuments.gov.eg/ar/collections",
    "https://egymonuments.gov.eg/en/collections",
  ];
  const results = new Map();
  const pageResponses = await Promise.allSettled(pageUrls.map(async (pageUrl) => {
    try {
      const response = await fetch(pageUrl, fetchOptions);
      if (!response.ok) return "";
      return response.text();
    } catch {
      console.warn("ATHARA official archive index lookup failed:", {
        path: new URL(pageUrl).pathname,
      });
      return "";
    }
  }));
  for (const pageResponse of pageResponses) {
    if (pageResponse.status !== "fulfilled" || !pageResponse.value) continue;
    const anchors = [...pageResponse.value.matchAll(/<a\s+[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)];
    for (const match of anchors) {
      const href = String(match[1] || "").trim();
      const label = String(match[2] || "")
        .replace(/<[^>]*>/g, " ")
        .replace(/&nbsp;/gi, " ")
        .replace(/&amp;/gi, "&")
        .replace(/&quot;/gi, '"')
        .replace(/&#39;|&apos;/gi, "'")
        .replace(/\s+/g, " ")
        .trim();
      if (!href || !label) continue;
      const resolvedUrl = /^https?:\/\//i.test(href)
        ? href
        : href.startsWith("/")
          ? "https://egymonuments.gov.eg" + href
          : href;
      try {
        const nextUrl = new URL(resolvedUrl);
        if (!/egymonuments\.gov\.eg$/i.test(nextUrl.hostname) && !nextUrl.hostname.endsWith(".egymonuments.gov.eg")) continue;
        const normalizedLabel = normalizeSearchTerms(label).join(" ");
        const labelMatches = terms.filter((term) => normalizedLabel.includes(term));
        if (!labelMatches.length && !terms.some((term) => nextUrl.pathname.toLowerCase().includes(term))) continue;
        const snippet = label.length > 180 ? label.slice(0, 180) : label;
        if (!results.has(nextUrl.href)) {
          results.set(nextUrl.href, {
            title: label,
            url: nextUrl.href,
            snippet,
            source: "egymonuments.gov.eg",
            trusted: true,
          });
        }
      } catch {
        continue;
      }
    }
  }
  const matchedRecords = [...results.values()].slice(0, 4);
  const enrichedRecords = await Promise.allSettled(matchedRecords.map(async (source) => {
    try {
      const response = await fetch(source.url, {
        headers: fetchOptions.headers,
        signal: AbortSignal.timeout(3500),
      });
      if (!response.ok || !/^(?:text\/html|application\/xhtml\+xml)/i.test(response.headers.get("content-type") || "")) {
        return source;
      }
      const html = await readLimitedHtml(response, 350_000);
      const title = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]
        ?.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim().slice(0, 180);
      const main = html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i)?.[1] ||
        html.match(/<body\b[^>]*>([\s\S]*?)<\/body>/i)?.[1] || html;
      const snippet = main
        .replace(/<(script|style|noscript|svg|nav|header|footer|form)\b[^>]*>[\s\S]*?<\/\1>/gi, " ")
        .replace(/<(br|\/p|\/div|\/li|\/h[1-6])\b[^>]*>/gi, " ")
        .replace(/<[^>]*>/g, " ")
        .replace(/&nbsp;/gi, " ").replace(/&amp;/gi, "&").replace(/&quot;/gi, '"')
        .replace(/&#39;|&apos;/gi, "'").replace(/\s+/g, " ").trim().slice(0, 520);
      return snippet.length >= 80 ? { ...source, title: title || source.title, snippet } : source;
    } catch (error) {
      console.warn("ATHARA official collection detail lookup failed:", {
        host: "egymonuments.gov.eg",
        reason: String(error?.message || error).slice(0, 120),
      });
      return source;
    }
  }));
  return enrichedRecords
    .filter((result) => result.status === "fulfilled")
    .map((result) => result.value)
    .slice(0, 4);
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
      const visionProviderOrder = resolveVisionProviderOrder(env);
      const visionFallbackOrder = visionProviderOrder.slice(1);
      return json({
        ok: true,
        service: "ATHARA",
        aiBound: Boolean(env.AI),
        guideModel: TEXT_MODEL,
        visionEngines: [
          { name: "Gemini", configured: geminiConfigured, model: configuredGeminiVisionModel(env) },
          { name: "Groq", configured: typeof env.GROQ_API_KEY === "string" && Boolean(env.GROQ_API_KEY.trim()), model: env.GROQ_VISION_MODEL || env.GROQ_MODEL || "qwen/qwen3.8-27b" },
          { name: "Cloudflare Workers AI", configured: typeof env.AI?.run === "function", model: VISION_MODEL, fallbackModel: FALLBACK_VISION_MODEL },
        ],
        reverseImageSearch: {
          openMuseumCatalogs: geminiConfigured,
          officialCatalogGemini: geminiConfigured,
          geminiGoogleSearch: geminiConfigured,
          groqBrowserSearch: typeof env.GROQ_API_KEY === "string" && Boolean(env.GROQ_API_KEY.trim()),
          cloudflareWebSearch: typeof env.AI?.websearch === "function",
        },
        visionProviderOrder,
        visionFallbackOrder,
        visionModel: geminiConfigured
          ? configuredGeminiVisionModel(env)
          : localOllama
            ? env.OLLAMA_VISION_MODEL
            : VISION_MODEL,
        visionFallbackModel: localOllama ? null : FALLBACK_VISION_MODEL,
        visionFallbackModels: localOllama ? [] : FALLBACK_VISION_MODELS,
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
      const groqVisionConfigured = typeof env.GROQ_API_KEY === "string" && Boolean(env.GROQ_API_KEY.trim());
      const localOllama = !geminiConfigured && !env.AI && typeof env.OLLAMA_BASE_URL === "string";
      const visionProviderOrder = resolveVisionProviderOrder(env);
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
      const reverseImageSearchConfigured = geminiConfigured || groqVisionConfigured || Boolean(env.SCANNER_INDEX_URL) || typeof env.AI?.websearch === "function";
      if (mode === "hieroglyphs" && !env.AI && !localOllama && !geminiConfigured) {
        return json(
          {
            ok: true,
            analysis: scanProviderUnavailableMessage(language),
            resultType: "unverified",
            reverseImageSearchStatus: reverseImageSearchConfigured ? "failed" : "unavailable",
            sources: [],
            trustedSourcesAvailable: false,
            wikipediaAvailable: null,
            confidenceByField: { inscription: "low", translation: "low", place: "low" },
          },
        );
      }
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
      let scannerIndexResult = null;
      if (mode === "objects" && env.SCANNER_INDEX_URL) {
        scannerIndexResult = await searchScannerIndex(env, imageBytes);
        const [best, runnerUp] = scannerIndexResult?.results || [];
        const sameEntity = Boolean(best && runnerUp && best.entityId === runnerUp.entityId);
        const threshold = scannerIndexThreshold(env);
        if (best) {
          const decision = best.similarity >= threshold && sameEntity ? "confirmed" : "candidate";
          console.info("[Image scanner] FAISS decision:", {
            decision,
            reason: decision === "confirmed" ? "threshold-and-top-two-entity-agreement" : "insufficient-score-or-entity-agreement",
            threshold,
            bestSimilarity: best.similarity,
            topTwoSameEntity: sameEntity,
          });
          if (decision === "confirmed") {
            const result = scannerIndexArtifactResult(best);
            if (result) {
              result.sourceStory = await summarizeTrustedSourceText(env, best.metadata.description, language);
              if (result.sourceStory) result.analysis = result.sourceStory;
              return json(result);
            }
            console.warn("[Image scanner] FAISS hit rejected because its source URL or title is not allowed.");
          }
        } else {
          console.info("[Image scanner] FAISS decision:", { decision: "unverified", reason: "no-index-results" });
        }
      }
      let comparisonImageBytes = imageBytes.length <= MAX_COMPARISON_IMAGE_BYTES ? imageBytes : null;
      if (body?.searchImage !== undefined) {
        if (typeof body.searchImage !== "string" || body.searchImage.length > 700_000) {
          return json({ error: "نسخة البحث البصري غير صالحة أو كبيرة." }, 400);
        }
        const searchImageMatch = /^data:image\/(jpeg|png|webp);base64,([A-Za-z0-9+/]+={0,2})$/i.exec(body.searchImage);
        if (!searchImageMatch) return json({ error: "نسخة البحث البصري بصيغة غير مدعومة." }, 400);
        try {
          comparisonImageBytes = Array.from(atob(searchImageMatch[2]), (character) => character.charCodeAt(0));
        } catch {
          return json({ error: "نسخة البحث البصري تالفة أو غير صالحة." }, 400);
        }
        if (!comparisonImageBytes.length || comparisonImageBytes.length > MAX_COMPARISON_IMAGE_BYTES) {
          return json({ error: "نسخة المقارنة البصرية يجب ألا تتجاوز 500 كيلوبايت." }, 413);
        }
      }
      const photoGps = readExifGps(imageBytes);

      // قاعدة المراجع اختيارية: تُحمّل كسجلات JSON موثقة في متغير ATHARA_CATALOG_JSON.
      // كل سجل: id, title, mode, keywords[], description, period, location, sourceTitle, sourceUrl.
      // لا نضيف سجلًا للنتائج المرجعية إلا لو له مصدر واضح.
      let catalog = [];
      const assetsFetch = typeof env.ASSETS?.fetch === "function" ? env.ASSETS.fetch.bind(env.ASSETS) : null;
      const developmentCatalogFallback = !assetsFetch &&
        typeof process !== "undefined" && process.env.NODE_ENV === "development";
      if (assetsFetch || developmentCatalogFallback) {
        try {
          const officialCatalogUrl = assetsFetch
            ? new URL("/egypt-monuments-official.json", "https://athara.local").toString()
            : new URL("/egypt-monuments-official.json", request.url).toString();
          const officialResponse = assetsFetch
            ? await assetsFetch(officialCatalogUrl)
            : await fetch(officialCatalogUrl, {
                headers: { accept: "application/json" },
                signal: AbortSignal.timeout(5_000),
              });
          if (officialResponse.ok) {
            const officialData = await officialResponse.json();
            catalog.push(...(Array.isArray(officialData.records) ? officialData.records : []));
          }
        } catch (error) {
          console.warn(`[Image scanner] Official catalog asset unavailable: ${String(error?.message || error).slice(0, 180)}`);
        }
      }
      try {
        const parsed = typeof env.ATHARA_CATALOG_JSON === "string"
          ? JSON.parse(env.ATHARA_CATALOG_JSON)
          : null;
        if (Array.isArray(parsed) && parsed.length > 0) {
          const catalogOverride = parsed
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
          if (catalogOverride.length > 0) catalog = catalogOverride;
        }
      } catch {
        // Keep the official built-in catalog if the optional environment catalog is invalid.
      }

      const visionPrompt =
        mode === "hieroglyphs"
          ? `أنت محلل متخصص في الكتابات والآثار المصرية القديمة؛ استفد من معرفتك الداخلية والتاريخية، حتى لو لم تتوفر مراجع على الإنترنت. اتبع هذا الترتيب: (1) حدّد هل الصورة كتابة مصرية فعلًا أم لغة/خط آخر، وميّز الهيروغليفية عن الهيراطيقية والديموطيقية واليونانية والقبطية إن أمكن؛ لا تسمّ كل كتابة قديمة هيروغليفية. (2) صف العلامات واتجاه القراءة، واقرأ فقط ما يظهر بوضوح، ثم قدّم نقلًا صوتيًا وترجمة حرفية ومعنى النص عند توافر القرائن، واذكر هل يبدو النص دينيًا أو ملكيًا أو جنائزيًا أو إداريًا أو غير ذلك ولماذا. (3) رشّح أقرب نص أو أثر معروف فقط كاحتمال مع قرينة محددة؛ لا تدّعِ تطابقًا بصريًا. (4) لا تذكر اسم موقع محدد إلا إذا كانت هناك قرينة فريدة ومقروءة في الصورة؛ الرمز الشائع أو الأسلوب الفني أو نتيجة البحث النصي لا يثبت الموقع. وإلا اترك place فارغًا واكتفِ بنوع عام مثل معبد أو مقبرة أو لوحة، مع التنبيه أن الموقع غير مؤكد. لا تخلط مكان التصوير أو العثور بمكان العرض. (5) افصل النص الظاهر عن التحقق التاريخي المستقل؛ انقل العنوان المطبوع حرفيًا في printedLabels وترجم معناه بدقة في printedTextTranslation، ولا تعتبر تاريخًا أو ملكًا مدونًا في الصورة نهائيًا قبل مقارنته بالدراسات الحديثة. افحص أسماء الملوك والأسر والمواقع من المصادر المتخصصة؛ لا تصف جبانة بأنها مدينة. اشرح وظيفة المنظر والنقش وسياقه بدقة. عند تعارض المراجع اذكر الاختلاف دون تحيز. لا تخترع قراءة أو اسمًا أو تاريخًا أو مكانًا. أنشئ searchTerms قصيرة ودقيقة، وقدّم تهجئة عربية ولاتينية للاسم فقط إذا ظهرت قرينة واضحة. أخرج JSON فقط بالشكل: {"visualDescription":"وصف ما يظهر","scriptType":"نوع اللغة أو الخط، أو غير محسوم","visibleText":"العلامات المقروءة فقط أو فارغ","printedLabels":"العنوان أو بيانات القطعة المطبوعة حرفيًا، أو فارغ","printedTextTranslation":"ترجمة دقيقة للنص الظاهر أو فارغ","transliteration":"النقل الصوتي أو فارغ","translation":"الترجمة الحرفية أو فارغ","interpretation":"المعنى والسياق المقترح أو فارغ","objectOrTextPurpose":"الغرض الوظيفي والسياق المقيد بالأدلة أو غير محسوم","identity":"أقرب نص أو أثر معروف، أو فارغ","identityEvidence":"قرينة الترشيح أو سبب تعذر المطابقة","historicalVerification":"ما ثبت تاريخيًا من المصادر المستقلة وما يُفصل عن النص الظاهر","sourceConflicts":"اختلاف موثق بين المصادر أو فارغ","place":"الموقع المحدد أو فارغ","placeType":"نوع المكان العام، لا اسم موقع، أو غير محسوم","placeEvidence":"قرينة مرئية محددة أو سبب عدم كفايتها","period":"الفترة المحتملة أو فارغ","contextualStory":"سياق تاريخي عام لا ينسب النقش إلى موقع غير مؤكد","writingHistory":"تاريخ الخط واستخداماته","siteHistory":"تاريخ نوع المكان فقط، دون ادعاء تاريخ موقع محدد غير مثبت","searchTerms":["مصطلحات قصيرة ومميزة للبحث"],"confidence":"high أو medium أو low","confidenceByField":{"inscription":"high أو medium أو low","translation":"high أو medium أو low","place":"high أو medium أو low"},"keywords":["موضوعات ظاهرة"],"periodClues":[]}. لا تدّع إجراء بحث خارجي أو ترجمة أكاديمية مؤكدة.`
          : `حلل الصورة باعتبارها أثرًا مصريًا قديمًا أو صورة له من كتاب أو شاشة. ابدأ بأقرب اسم معروف يمكن أن يفسر السمات المميزة، لا بمجرد وصف عام؛ اذكره كاحتمال إذا لم توجد علامة فريدة، واتركه فارغًا فقط إذا تعذر اقتراح احتمال مفيد. حدّد نوع الأثر وخامته والرموز أو النقوش والحقبة والموقع المحتمل، واذكر القرينة التي جعلتك تقترح الاسم. افصل التعليقات المطبوعة عن الأثر نفسه. لا تخترع اسمًا أو قصة أو تاريخًا أو مكانًا. يمكن اقتراح اسم ومكان محتملين بصريًا للبحث، لكن لا تصفهما بالمؤكدين إلا بعد دعم صفحة متحف/آثار موثوقة أو مطابقة صورة مرجعية. عند توفر مصدر موثوق في السياق، لخّص منه قصة الأثر ومكان عرضه، ولا تنسب للمصدر معلومات لا يقولها. اترك حقائق القصة والمكان فارغة إذا لم يوجد سند. أخرج JSON فقط بالشكل: {"identity":"أقرب اسم محتمل، أو فارغ إذا تعذر","identityEvidence":"السمات الفارقة التي تدعم الاحتمال أو سبب تعذر التحديد","visualDescription":"وصف مختصر للسمات المرئية","objectType":"نوع الأثر","material":"الخامة المحتملة أو غير متأكد","symbols":["رموز أو نقوش ظاهرة"],"style":"الأسلوب أو غير متأكد","possibleLocation":"المتحف أو الموقع المحتمل أو غير متأكد","country":"الدولة المحتملة أو غير متأكد","city":"المدينة المحتملة أو غير متأكد","place":"المتحف أو الموقع المحتمل أو غير متأكد","period":"العصر المحتمل أو غير متأكد","contextualStory":"القصة/الوظيفة المحتملة فقط إن كنت تعرفها، وإلا فارغ","significance":"الأهمية المحتملة أو فارغ","keyFeatures":"تفاصيل فارقة تساعد في التحقق","searchTerms":["اسم أو كلمات بحث قصيرة بالعربية والإنجليزية"],"keywords":["كلمات دقيقة للبحث"],"possibilities":["حتى 3 أسماء محتملة مع قرينة قصيرة لكل منها"],"confidence":"high أو medium أو low","confidenceByField":{"identity":"high أو medium أو low","place":"high أو medium أو low","period":"high أو medium أو low"}}. لا تدّع أن الاحتمال حقيقة، ولا تدّع إجراء بحث لم يُجرَ.`;
      const visualOnlyPrompt = visionPrompt;
      const visionAttempts = [];
      const geminiVisionKey = typeof env.GEMINI_API_KEY === "string" ? env.GEMINI_API_KEY.trim() : "";
      const groqVisionKey = typeof env.GROQ_API_KEY === "string" ? env.GROQ_API_KEY.trim() : "";
      try {
        let rawVisual = "";
        let visionUsed = "";
        const prompt =
          VISION_SYSTEM +
          "\n\n" +
          ICONOGRAPHY_RULES +
          "\n\n" +
          visualOnlyPrompt +
          (mode === "objects" ? "\n\nاقترح أقرب هوية أثرية معقولة كاحتمال غير مؤكد، واذكر السمات المحددة التي تدعمها. لا تدّعِ تطابقًا بصريًا أو مكانًا مؤكدًا دون مصدر مطابق." : "") +
          "\nOutput language: " +
          LANGUAGES[language];
        const imageForAnalysis = documentImageBytes || enhancedImageBytes || imageBytes;
        const ollamaModel =
          typeof env.OLLAMA_VISION_MODEL === "string" ? env.OLLAMA_VISION_MODEL : "gemma3:4b";
        const visionModels = localOllama ? [ollamaModel] : [VISION_MODEL];
        const geminiVisionModels = [configuredGeminiVisionModel(env)];
        const independentObservations = [];
        let visionProviderUsed = "";
        const imageDataUrl = `data:${detectImageMimeType(imageForAnalysis)};base64,${bytesToBase64(imageForAnalysis)}`;

        // Cloudflare-hosted Moondream is the first, fast vision path. It avoids
        // the Meta Llama license handshake and rejects busy capacity immediately.
        if (!localOllama && typeof env.AI?.run === "function") {
          try {
            const cloudflareVision = await withScannerTimeout(env.AI.run(VISION_MODEL, {
              task: "query",
              image: imageDataUrl,
              question: `${prompt}\n\nحلّل الصورة نفسها، واقترح أقرب هوية أثرية كاحتمال مع قرائن مرئية. أخرج JSON فقط بالمفاتيح المطلوبة في التعليمات. لا تدّعِ تطابقًا بصريًا أو مكانًا مؤكدًا بلا صورة مرجعية ومصدر مطابق.\nلغة الإجابة: ${LANGUAGES[language]}.`,
              reasoning: false,
              temperature: 0.1,
              max_tokens: 950,
              stream: false,
            }, { rejectIfBusy: true }), VISION_PROVIDER_TIMEOUT_MS.cloudflare, "Cloudflare Moondream");
            rawVisual = extractText(cloudflareVision).trim();
            if (!rawVisual) throw new Error("Cloudflare Moondream returned an empty response.");
            const observation = parseVisionObservation(rawVisual);
            if (!hasUsableVisionObservation(observation, mode)) {
              throw new Error("Cloudflare Moondream returned invalid or non-informative visual data.");
            }
            independentObservations.push(observation);
            visionUsed = VISION_MODEL;
            visionProviderUsed = "Cloudflare";
          } catch (modelError) {
            console.error(`[Image scanner] Cloudflare Moondream failed: ${String(modelError?.message || modelError)}`);
            visionAttempts.push({
              model: VISION_MODEL,
              reason: String(modelError?.message || modelError).slice(0, 180),
            });
          }
        }

        // Try independent Cloudflare-hosted vision models before leaving the
        // Cloudflare provider. Model availability can differ by account; move on
        // immediately when a model is not enabled or is temporarily unavailable.
        if (!localOllama && !independentObservations.length && typeof env.AI?.run === "function") {
          for (const fallbackVisionModel of FALLBACK_VISION_MODELS) {
            if (independentObservations.length) break;
            const fallbackVisionLabel = fallbackVisionModel === "@cf/mistralai/mistral-small-3.1-24b-instruct"
              ? "Mistral Small 3.1"
              : fallbackVisionModel === "@cf/meta/llama-4-scout-17b-16e-instruct"
                ? "Llama 4 Scout"
                : fallbackVisionModel;
            try {
              const fallbackVision = await withScannerTimeout(env.AI.run(fallbackVisionModel, {
                messages: [{
                  role: "system",
                  content: prompt,
                }, {
                  role: "user",
                  content: [
                    { type: "text", text: "حلّل الصورة بصريًا وأخرج JSON فقط بالمفاتيح المطلوبة. اقترح أقرب هوية كاحتمال، ولا تخترع مكانًا أو اسمًا مؤكدًا." },
                    { type: "image_url", image_url: { url: imageDataUrl } },
                  ],
                }],
                temperature: 0.1,
                max_tokens: 1100,
                stream: false,
              }, { rejectIfBusy: true }), VISION_PROVIDER_TIMEOUT_MS.gemini, "Cloudflare " + fallbackVisionLabel + " Vision");
              rawVisual = extractText(fallbackVision).trim();
              if (!rawVisual) throw new Error("Cloudflare " + fallbackVisionLabel + " returned an empty response.");
              const observation = parseVisionObservation(rawVisual);
              if (!hasUsableVisionObservation(observation, mode)) {
                throw new Error("Cloudflare " + fallbackVisionLabel + " returned invalid or non-informative visual data.");
              }
              independentObservations.push(observation);
              visionUsed = fallbackVisionModel;
              visionProviderUsed = "Cloudflare " + fallbackVisionLabel;
            } catch (modelError) {
              console.error("[Image scanner] Cloudflare " + fallbackVisionLabel + " failed:", String(modelError?.message || modelError));
              visionAttempts.push({
                model: fallbackVisionModel,
                reason: String(modelError?.message || modelError).slice(0, 180),
              });
            }
          }
        }

        if (!independentObservations.length && geminiVisionKey) {
          const geminiModel = geminiVisionModels[0];
          try {
            const geminiResponse = await fetchVisionWithRetry(
              `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(geminiModel)}:generateContent`,
              {
                method: "POST",
                headers: { "content-type": "application/json", "x-goog-api-key": geminiVisionKey },
                body: JSON.stringify({
                  systemInstruction: { parts: [{ text: prompt }] },
                  contents: [{ role: "user", parts: [
                    { text: "حلّل هذه الصورة بصريًا وأعطني JSON فقط." },
                    { inlineData: { mimeType: detectImageMimeType(imageForAnalysis), data: bytesToBase64(imageForAnalysis) } },
                  ] }],
                  generationConfig: { temperature: 0.1, maxOutputTokens: 1100 },
                }),
              },
              { provider: "Gemini Vision", timeoutMs: VISION_PROVIDER_TIMEOUT_MS.gemini },
            );
            const geminiPayload = await geminiResponse.json().catch(() => null);
            if (!geminiResponse.ok) throw new Error(geminiPayload?.error?.message || `Gemini Vision returned HTTP ${geminiResponse.status}`);
            rawVisual = geminiPayload?.candidates?.[0]?.content?.parts?.map((part) => part?.text || "").join("").trim() || "";
            if (!rawVisual) throw new Error("Gemini Vision returned an empty response.");
            const observation = parseVisionObservation(rawVisual);
            if (!hasUsableVisionObservation(observation, mode)) throw new Error("Gemini Vision returned invalid visual data.");
            independentObservations.push(observation);
            visionUsed = `gemini:${geminiModel}`;
            visionProviderUsed = "Gemini";
          } catch (error) {
            console.error("[Image scanner] Gemini Vision failed:", String(error?.message || error));
            visionAttempts.push({ model: `Gemini Vision (${geminiModel})`, reason: String(error?.message || error).slice(0, 180) });
          }
        }

        const groqVisionModel =
          typeof env.GROQ_VISION_MODEL === "string" && env.GROQ_VISION_MODEL.trim()
            ? env.GROQ_VISION_MODEL.trim()
            : typeof env.GROQ_MODEL === "string" && env.GROQ_MODEL.trim()
              ? env.GROQ_MODEL.trim()
              : "qwen/qwen3.8-27b";
        if (groqVisionKey && !independentObservations.length) {
          try {
            const groqResponse = await fetchVisionWithRetry(
              "https://api.groq.com/openai/v1/chat/completions",
              {
                method: "POST",
                headers: {
                  "content-type": "application/json",
                  authorization: `Bearer ${groqVisionKey}`,
                },
                body: JSON.stringify({
                  model: groqVisionModel,
                  temperature: 0.1,
                  max_tokens: 950,
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
              },
              { provider: "Groq Vision", timeoutMs: VISION_PROVIDER_TIMEOUT_MS.groq },
            );
            const groqPayload = await groqResponse.json().catch(() => null);
            if (!groqResponse.ok) throw new Error(groqPayload?.error?.message || `Groq Vision returned HTTP ${groqResponse.status}`);
            rawVisual = groqPayload?.choices?.[0]?.message?.content?.trim() || "";
            if (!rawVisual) throw new Error("Groq Vision returned an empty response.");
            const observation = parseVisionObservation(rawVisual);
            if (!hasUsableVisionObservation(observation, mode)) {
              throw new Error("Groq Vision returned invalid or non-informative visual data.");
            }
            independentObservations.push(observation);
            visionProviderUsed = "Groq";
          } catch (modelError) {
            console.error(`[Image scanner] Groq Vision (${groqVisionModel}) failed: ${String(modelError?.message || modelError)}`);
            visionAttempts.push({
              model: `Groq Vision (${groqVisionModel})`,
              reason: String(modelError?.message || modelError).slice(0, 180),
            });
          }
        }

        if (localOllama && typeof env.OLLAMA_BASE_URL === "string" && env.OLLAMA_BASE_URL.trim()) {
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
              const observation = parseVisionObservation(output);
              if (!hasUsableVisionObservation(observation, mode)) {
                throw new Error(`${engine} returned invalid or non-informative visual data.`);
              }
              independentObservations.push(observation);
            } catch (modelError) {
              console.error(`[Image scanner] ${engine} (${model}) failed: ${String(modelError?.message || modelError)}`);
              visionAttempts.push({ model: `${engine} (${model})`, reason: String(modelError?.message || modelError).slice(0, 180) });
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
        const visualObservation = combineVisionObservations(independentObservations);
        const correctedObservation = applyKnownArtifactCorrections(visualObservation);
        let officialVisualMatch = null;
        const observation = mode === "objects"
          ? applyEvidenceGuard(
              correctedObservation,
              Boolean(officialVisualMatch),
              visualObservation.identity,
            )
          : correctedObservation;
        const officialTextCandidates = mode === "objects"
          ? rankOfficialTextCandidates(catalog, observation)
          : [];
        let matchThreshold = DEFAULT_SCANNER_MATCH_THRESHOLD;
        if (mode === "objects" && (geminiConfigured || groqVisionConfigured)) {
          try {
            matchThreshold = scannerMatchThreshold(env);
          } catch (error) {
            console.error(`[Image scanner] Invalid match threshold: ${String(error?.message || error).slice(0, 180)}`);
            return json({ error: "إعداد حدّ المطابقة البصرية غير صالح." }, 503);
          }
        }
        let geminiCatalogComparisonFailed = false;
        let openScannerComparisonSucceeded = false;
        let groqCatalogComparisonSucceeded = false;
        let openScannerSearchStatus = reverseImageSearchConfigured ? "no_match" : "unavailable";
        let openScannerRankedCandidates = [];
        let openScannerSourceCandidates = [];
        let openScannerDiscoveredCandidates = [];
        let openScannerWebSources = [];
        if (mode === "objects" && !officialVisualMatch && (geminiConfigured || groqVisionConfigured)) {
          const candidates = rankOfficialCatalogCandidates(catalog, observation);
          const candidateImages = await loadOfficialCandidateImages(candidates, env.ASSETS);
          if (candidateImages.length) {
            const referenceImage = comparisonImageBytes || imageBytes;
            if (geminiConfigured) {
              try {
                officialVisualMatch = await compareWithOfficialCatalogPhotos(
                  referenceImage,
                  candidateImages,
                  env.GEMINI_API_KEY.trim(),
                  geminiVisionModels[0],
                  matchThreshold,
                );
                openScannerComparisonSucceeded = true;
              } catch (error) {
                geminiCatalogComparisonFailed = true;
                visionAttempts.push({
                  model: "Gemini official catalog comparison",
                  reason: String(error?.message || error).slice(0, 180),
                });
              }
            }
            if (!officialVisualMatch && groqVisionConfigured) {
              try {
                officialVisualMatch = await compareOfficialCatalogPhotosWithGroq(
                  referenceImage,
                  candidateImages,
                  env.GROQ_API_KEY.trim(),
                  typeof env.GROQ_VISION_MODEL === "string" && env.GROQ_VISION_MODEL.trim()
                    ? env.GROQ_VISION_MODEL.trim()
                    : typeof env.GROQ_MODEL === "string" && env.GROQ_MODEL.trim()
                      ? env.GROQ_MODEL.trim()
                      : "qwen/qwen3.8-27b",
                  matchThreshold,
                );
                groqCatalogComparisonSucceeded = true;
                openScannerComparisonSucceeded = true;
              } catch (error) {
                visionAttempts.push({
                  model: "Groq official catalog comparison",
                  reason: String(error?.message || error).slice(0, 180),
                });
              }
            }
          }
        }
        if (officialVisualMatch) {
          const item = officialVisualMatch.item;
          const sourceStory = await summarizeTrustedSourceText(env, item.description || "", language);
          const sources = [{
            title: item.sourceTitle,
            url: item.sourceUrl,
            snippet: item.description || "",
            source: item.sourceTitle,
            trusted: true,
          }];
          return json({
            ok: true,
            analysis: sourceStory || item.description || "",
            sourceStory,
            sources,
            trustedSourcesAvailable: true,
            wikipediaAvailable: null,
            resultType: "reference_match",
            identificationStatus: "confirmed",
            reverseImageSearchStatus: "match",
            confidence: "medium",
            confidenceByField: {
              identity: "medium",
              place: "low",
              period: item.period ? "medium" : "low",
            },
            referenceId: item.id,
            referenceImages: Array.isArray(item.localImageUrls) ? item.localImageUrls : [],
            matchedOfficialUrl: officialVisualMatch.url,
            visualDescription: scannerVisualDescription(observation),
            matchedArtifact: {
              name: item.title,
              museum: item.museum || item.sourceTitle,
              objectNumber: item.objectNumber || item.id,
              url: officialVisualMatch.url,
              similarity: Math.round(officialVisualMatch.similarity * 1000) / 1000,
            },
            visualMatchMethod: "Gemini multimodal comparison; not CLIP",
            model: "ATHARA Official Visual Search",
          });
        }

        if (mode === "objects" && !officialVisualMatch && reverseImageSearchConfigured) {
          try {
            const probableThreshold = scannerProbableThreshold(env);
            const indexNames = scannerIndexCandidates(scannerIndexResult)
              .filter((candidate) => candidate.similarity >= probableThreshold)
              .map((candidate) => candidate.name);
            const searchObservation = indexNames.length
              ? {
                  ...observation,
                  searchTerms: [...new Set([
                    ...indexNames,
                    ...(Array.isArray(observation.searchTerms) ? observation.searchTerms : []),
                  ])].slice(0, 8),
                }
              : observation;
            const [imageSearch, textSearch, groundedSearch] = await Promise.all([
              searchClevelandByImage(comparisonImageBytes || imageBytes),
              searchOpenScannerCandidates(searchObservation, language),
              searchArtifactGroundedSources(env, searchObservation, language),
            ]);
            openScannerWebSources = groundedSearch.sources;
            const mergedCandidates = [
              ...imageSearch.candidates,
              ...textSearch.candidates,
              ...groundedSearch.candidates,
            ];
            const uniqueCandidates = [...new Map(mergedCandidates.map((candidate) => [candidate.url, candidate])).values()];
            const search = {
              candidates: uniqueCandidates.slice(0, 12),
              availableSources: textSearch.availableSources + (imageSearch.available ? 1 : 0) + groundedSearch.availableSources,
              failedSources: textSearch.failedSources + (imageSearch.available ? 0 : 1) + groundedSearch.failedSources,
            };
            openScannerDiscoveredCandidates = search.candidates;
            openScannerSourceCandidates = rankOpenScannerCandidates(search.candidates, observation);
            const candidateImages = await downloadScannerCandidateImages(search.candidates.slice(0, 8));
            let embeddingRankedCandidates = [];
            if (candidateImages.length && typeof env.AI?.run === "function") {
              try {
                const embeddingResult = await rankScannerCandidateImagesWithEmbeddings(
                  env.AI,
                  comparisonImageBytes || imageBytes,
                  candidateImages,
                );
                embeddingRankedCandidates = embeddingResult.ranked;
                const embeddingOrder = new Map(embeddingRankedCandidates.map((candidate, index) => [candidate.url, index]));
                candidateImages.sort((left, right) =>
                  (embeddingOrder.get(left.url) ?? 999) - (embeddingOrder.get(right.url) ?? 999),
                );
                console.info("[Image scanner] Multimodal image embeddings ranked museum candidates:", {
                  model: embeddingResult.model,
                  count: embeddingRankedCandidates.length,
                });
              } catch (error) {
                console.warn("[Image scanner] Multimodal embedding ranking unavailable:", String(error?.message || error).slice(0, 180));
              }
            }
            if (!search.candidates.length) {
              openScannerSearchStatus = search.availableSources === 0
                ? "failed"
                : geminiConfigured || groqVisionConfigured
                  ? "no_match"
                  : "unavailable";
            } else if (!candidateImages.length) {
              openScannerSearchStatus = search.availableSources === 0
                ? "failed"
                : geminiConfigured || groqVisionConfigured
                  ? "no_match"
                  : "unavailable";
            } else if (!geminiConfigured && !groqVisionConfigured) {
              openScannerRankedCandidates = openScannerSourceCandidates.map((candidate) => ({
                ...candidate,
                similarity: null,
              }));
              openScannerSearchStatus = search.availableSources === 0 ? "failed" : "unavailable";
            } else {
              let comparison = null;
              if (geminiConfigured) {
                try {
                  comparison = await compareOpenScannerCandidates(
                    comparisonImageBytes || imageBytes,
                    candidateImages.slice(0, 5),
                    env.GEMINI_API_KEY.trim(),
                    geminiVisionModels[0],
                    matchThreshold,
                  );
                  openScannerComparisonSucceeded = true;
                } catch (error) {
                  geminiCatalogComparisonFailed = true;
                  visionAttempts.push({
                    model: "Gemini open-catalog comparison",
                    reason: String(error?.message || error).slice(0, 180),
                  });
                }
              }
              if ((!comparison || !comparison.match) && groqVisionConfigured) {
                try {
                  comparison = await compareOpenScannerCandidatesWithGroq(
                    comparisonImageBytes || imageBytes,
                    candidateImages.slice(0, 5),
                    env.GROQ_API_KEY.trim(),
                    typeof env.GROQ_VISION_MODEL === "string" && env.GROQ_VISION_MODEL.trim()
                      ? env.GROQ_VISION_MODEL.trim()
                      : typeof env.GROQ_MODEL === "string" && env.GROQ_MODEL.trim()
                        ? env.GROQ_MODEL.trim()
                        : "qwen/qwen3.8-27b",
                    matchThreshold,
                  );
                  groqCatalogComparisonSucceeded = true;
                  openScannerComparisonSucceeded = true;
                } catch (error) {
                  visionAttempts.push({
                    model: "Groq open-catalog comparison",
                    reason: String(error?.message || error).slice(0, 180),
                  });
                }
              }

              openScannerRankedCandidates = comparison?.ranked?.length
                ? comparison.ranked
                : openScannerSourceCandidates.map((candidate) => ({ ...candidate, similarity: null }));
              openScannerSearchStatus = search.availableSources === 0
                ? "failed"
                : openScannerComparisonSucceeded
                  ? "no_match"
                  : "unavailable";

              if (comparison?.match) {
                const candidate = comparison.match.candidate;
                const catalogueStory = formatArtifactCatalogStory(candidate, language);
                const sourceStory = await summarizeTrustedSourceText(env, candidate.sourceText || "", language);
                const artifactStory = sourceStory || catalogueStory || candidate.sourceText;
                const matchedArtifact = {
                  name: candidate.name,
                  museum: candidate.museum,
                  currentLocation: candidate.currentLocation || "",
                  findSpot: candidate.findSpot || "",
                  period: candidate.period || "",
                  material: candidate.material || "",
                  provenance: candidate.provenance || "",
                  objectNumber: candidate.objectNumber,
                  url: candidate.url,
                  similarity: Math.round(comparison.match.similarity * 1000) / 1000,
                };
                const source = {
                  title: candidate.name,
                  url: candidate.url,
                  snippet: candidate.sourceText,
                  source: candidate.source,
                  trusted: true,
                };
                return json({
                  ok: true,
                  analysis: artifactStory,
                  sourceStory: artifactStory,
                  sources: [source],
                  trustedSourcesAvailable: true,
                  wikipediaAvailable: null,
                  resultType: "reference_match",
                  identificationStatus: "confirmed",
                  reverseImageSearchStatus: "match",
                  confidence: "medium",
                  confidenceByField: {
                    identity: "medium",
                    place: candidate.currentLocation || candidate.museum ? "medium" : "low",
                    period: candidate.period ? "medium" : "low",
                  },
                  visualDescription: scannerVisualDescription(observation),
                  matchedArtifact,
                  candidates: [],
                  visualMatchMethod: groqCatalogComparisonSucceeded
                    ? "Cleveland visual retrieval + Cloudflare multimodal embeddings + Groq Qwen Vision reference-image verification"
                    : "Cleveland visual retrieval + Cloudflare multimodal embeddings + Gemini reference-image verification",
                });
              }
            }
          } catch (error) {
            if (!openScannerComparisonSucceeded && !groqCatalogComparisonSucceeded) geminiCatalogComparisonFailed = true;
            openScannerSearchStatus = openScannerSourceCandidates.length ? "unavailable" : "failed";
            visionAttempts.push({
              model: "Gemini open-catalog comparison",
              reason: String(error?.message || error).slice(0, 180),
            });
            console.error(`[Image scanner] Open catalog comparison failed: ${String(error?.message || error).slice(0, 180)}`);
          }
        }

        const specificSearchParts = [
          ...officialTextCandidates.slice(0, 2).map((candidate) => candidate.record.title),
          ...(Array.isArray(observation.searchTerms) ? observation.searchTerms.slice(0, 3) : []),
          observation.identity || observation.visualCandidateIdentity,
          observation.printedLabels,
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
        const selectedSearchQueries = mode === "objects"
          ? [[
              ...officialTextCandidates.slice(0, 2).map((candidate) => candidate.record.title),
              observation.identity,
              observation.visualCandidateIdentity,
              ...(Array.isArray(observation.searchTerms) ? observation.searchTerms.slice(0, 4) : []),
              observation.objectType,
              observation.visualDescription,
              observation.visualCandidateIdentity ? "Egyptian antiquities" : "",
            ]
              .filter((part) => typeof part === "string" && part.trim())
              .join(" ")]
              .filter(Boolean)
              .map((query) => ({ query: query.slice(0, 180), language }))
          : searchQueries;
        const searchResults = await Promise.all(
          selectedSearchQueries.slice(0, 1).map(({ query, language: queryLanguage }) =>
            searchHeritageSources(query, queryLanguage),
          ),
        );
        let sources = [
          ...new Map(
            searchResults.flatMap((result) => result.sources).map((source) => [source.url, source]),
          ).values(),
        ].slice(0, 8);
        const candidateSources = [...new Map(
          [...openScannerRankedCandidates, ...openScannerSourceCandidates, ...openScannerDiscoveredCandidates]
            .map((candidate) => [candidate.url, candidate]),
        ).values()].map((candidate) => ({
          title: candidate.name,
          url: candidate.url,
          snippet: "",
          source: candidate.museum || candidate.name,
          trusted: true,
        }));
        const officialTextSources = officialTextCandidates.map(({ record }) => ({
          title: record.title,
          url: canonicalOfficialArchiveUrl(record.sourceUrl),
          snippet: record.description || "",
          source: record.sourceTitle || "",
          trusted: true,
        })).filter((source) => source.url);
        const indexCandidates = scannerIndexCandidates(scannerIndexResult);
        const probableThreshold = scannerProbableThreshold(env);
        const indexSources = indexCandidates
          .filter((candidate) => candidate.similarity >= probableThreshold)
          .map((candidate) => ({
            title: candidate.name,
            url: candidate.url,
            snippet: candidate.sourceText,
            source: candidate.source || candidate.museum || candidate.name,
            trusted: true,
          }));
        sources = [...new Map(
          [...sources, ...candidateSources, ...openScannerWebSources, ...indexSources, ...officialTextSources].map((source) => [source.url, source]),
        ).values()].slice(0, 8);
        if (
          mode === "objects" &&
          observation.historicalEvidenceConfirmed !== true &&
          observation.verifiedLocation !== true
        ) {
          sources = sources.filter((source) => source?.trusted === true);
        }
        // The trust filter above excludes broad, untrusted keyword-search pages.
        // Keep trusted museum and official-archive records as contextual references
        // even when the image itself has not been visually matched. A cited source
        // is context, not proof of the uploaded object's identity.
        const wikipediaAvailable = searchResults.some(
          (result) => result.wikipediaAvailable === true,
        );
        const trustedSourcesAvailable = candidateSources.length > 0 || openScannerWebSources.length > 0 || searchResults.some(
          (result) => result.trustedSourcesAvailable === true,
        );
        const confidenceByField = scanConfidence(observation, mode);
        const formattedAnalysis = formatScannerResult(observation, sources, mode, language, confidenceByField);
        const sourceBackedCandidate = Boolean(
          (observation.visualCandidateIdentity || observation.identity) &&
          sources.some((source) => scannerSourceSupportsCandidate(source, observation))
        );
        const indexedProbable = indexCandidates.some((candidate) => candidate.similarity >= probableThreshold);
        // A probable result requires a visual candidate supported by a trusted
        // source, or an image-index similarity above the configured threshold.
        // Text-only free-catalog fallback results are appended later and never
        // influence this decision.
        // Search-result presence alone is not image evidence. A candidate becomes
        // probable only when the visual identity is independently supported,
        // the image index clears its threshold, or the image-comparison engine
        // produced an above-threshold ranked visual score.
        const visuallyRankedCandidate = openScannerRankedCandidates.some(
          (candidate) =>
            typeof candidate.similarity === "number" &&
            Number.isFinite(candidate.similarity) &&
            candidate.similarity >= probableThreshold,
        );
        const identificationStatus =
          indexedProbable || visuallyRankedCandidate
            ? "probable"
            : "unverified";
        const probableArtifact = indexCandidates.find((candidate) => candidate.similarity >= probableThreshold);
        let responseSources = probableArtifact
          ? sources.filter((source) => source.url === probableArtifact.url)
          : [...new Map([...sources, ...openScannerWebSources].map((source) => [source.url, source])).values()];
        const responseSourceText = probableArtifact?.description || responseSources
          .filter((source) => source?.trusted === true && typeof source.snippet === "string")
          .slice(0, 1)
          .map((source) => source.snippet)
          .filter(Boolean)
          .join("\n");
        // Free public fallback when no confident identification yet — no API keys needed.
        // مشغولة فقط عندما يكون SCANNER_FREE_FALLBACK_ENABLES مضبوطًا على "true".
        // لو انتهت حصة الأدوات المدفوعة أو تعذرت، تعمل المصادر المجانية تلقائيًا وتجيب اسم القطعة وقصتها ومكانها ومصدرها.
        // Enable the no-key public-catalog fallback by default. Set the variable
        // explicitly to "false" only to disable it for diagnostics.
        const freeFallbackEnabled =
          typeof env.SCANNER_FREE_FALLBACK_ENABLED === "string"
            ? env.SCANNER_FREE_FALLBACK_ENABLED.trim().toLowerCase() !== "false"
            : true;

        let freeFallbackCandidate = null;
        if (identificationStatus === "unverified" && freeFallbackEnabled && responseSources.length < 2) {
          const freeFallback = await freeArtifactIdentificationFallback(observation, language);
          if (freeFallback?.sources?.length) {
            // Keep free catalog hits as explicit research leads, never as confirmed visual matches.
            responseSources = [...new Map(
              [...responseSources, ...freeFallback.sources].map((source) => [source.url, source]),
            ).values()].slice(0, 8);
            if (freeFallback.name || freeFallback.story || freeFallback.location) {
              freeFallbackCandidate = {
                name: freeFallback.name || "",
                description: freeFallback.story || "",
                location: freeFallback.location || "",
                confidence: "low",
                status: "research_candidate",
                visuallyMatched: false,
                sources: freeFallback.sources.slice(0, 5),
              };
            }
          }
        }

        console.info("[Image scanner] Final decision:", {
          decision: identificationStatus,
          reason: sourceBackedCandidate
            ? "trusted-source-support"
            : indexedProbable
              ? "medium-faiss-match-with-source"
              : officialTextCandidates.length
                ? "local-official-text-correlation"
                : openScannerSourceCandidates.length
                  ? "trusted-source-text-overlap"
                : "no-sufficient-source-match",
          sourcesChecked: sources.map((source) => source.source || source.title),
        });
        const relatedContext = mode === "objects" && !officialVisualMatch && sourceBackedCandidate
          ? relatedSourceSummary(responseSources, language, observation)
          : "";
        const freeCandidateContext = freeFallbackCandidate
          ? [
              language === "ar" ? "مرشحات بحث من كتالوجات عامة (غير مؤكدة بصريًا)" : "Public-catalog research leads (not visually confirmed)",
              freeFallbackCandidate.name
                ? (language === "ar" ? "اسم مرشح: " : "Candidate name: ") + freeFallbackCandidate.name
                : "",
              freeFallbackCandidate.location
                ? (language === "ar" ? "الموقع الوارد في بيانات المصدر: " : "Location listed by source: ") + freeFallbackCandidate.location
                : "",
              freeFallbackCandidate.description
                ? (language === "ar" ? "معلومات المصدر: " : "Source information: ") + freeFallbackCandidate.description
                : "",
              language === "ar"
                ? "هذه نتائج بحث نصي مساعدة وليست تطابقًا للصورة. يلزم التحقق من صورة الكتالوج قبل اعتماد الهوية أو الموقع."
                : "These are text-search leads, not an image match. Verify the catalog image before accepting the identity or location.",
            ].filter(Boolean).join("\n")
          : "";
        const researchLeadContext = identificationStatus === "unverified" && responseSources.length
          ? [
              language === "ar"
                ? "سجلات ومصادر أثرية مرتبطة بنتائج البحث (ليست تطابقًا بصريًا مؤكدًا):"
                : "Related museum and archaeological catalogue records (not a confirmed visual match):",
              ...responseSources.slice(0, 4).map((source) =>
                "- " + source.title + ": " + String(source.snippet || source.supportedClaim || "").slice(0, 900)),
            ].join("\n")
          : "";
        const analysis = [formattedAnalysis, relatedContext, freeCandidateContext, researchLeadContext]
          .filter(Boolean).join("\n\n");
        const sourceStory = freeFallbackCandidate?.description || await summarizeTrustedSourceText(env, responseSourceText, language);
        const reverseImageSearchStatus = identificationStatus === "probable" && probableArtifact
          ? "no_match"
          : openScannerSearchStatus === "failed" ||
              (geminiCatalogComparisonFailed && !openScannerComparisonSucceeded && !groqCatalogComparisonSucceeded)
            ? "failed"
            : openScannerSearchStatus;
        return json({
          ok: true,
          analysis,
          sourceStory,
          sources: responseSources,
          trustedSourcesAvailable,
          wikipediaAvailable,
          resultType: mode === "objects" ? "unverified" : "ai_guess",
          identificationStatus: mode === "objects" ? identificationStatus : "unverified",
          reverseImageSearchStatus,
          ...(mode === "objects"
            ? {
                visualDescription: scannerVisualDescription(observation),
                candidates: [...new Map([
                  ...openScannerDiscoveredCandidates.map((candidate) => ({
                    name: candidate.name,
                    museum: candidate.museum,
                    objectNumber: candidate.objectNumber,
                    url: candidate.url,
                    source: candidate.source,
                    description: candidate.sourceText || "",
                    similarity: null,
                  })),
                  ...openScannerSourceCandidates,
                  ...openScannerRankedCandidates,
                  ...indexCandidates,
                  ...(freeFallbackCandidate ? [freeFallbackCandidate] : []),
                ].map((candidate) => [candidate.url || candidate.name, candidate])).values()].slice(0, 5),
                ...(identificationStatus === "probable" && probableArtifact
                  ? { matchedArtifact: probableArtifact }
                  : {}),
                visualMatchMethod: indexCandidates.length ? "OpenCLIP ViT-B-32 + FAISS candidates" : "visual observation; no confirmed image match",
              }
            : {}),
          confidence: mode === "objects" ? identificationStatus === "probable" ? "medium" : "low" : observation.confidence || "غير محسوبة",
          confidenceByField,
          model: independentObservations.length > 1
            ? `Free visual consensus (${independentObservations.length} engines)`
            : localOllama
              ? `Ollama - ${visionUsed || env.OLLAMA_VISION_MODEL || ollamaModel}`
              : visionUsed === VISION_MODEL
                ? "Cloudflare Workers AI - Moondream 3.1"
                : visionUsed === "@cf/mistralai/mistral-small-3.1-24b-instruct"
                ? "Cloudflare Workers AI - Mistral Small 3.1"
                : visionUsed === "@cf/meta/llama-4-scout-17b-16e-instruct"
                  ? "Cloudflare Workers AI - Llama 4 Scout"
                  : `Free visual consensus (${independentObservations.length} engine)`,
          visionDiagnostics: {
            provider: visionProviderUsed || (independentObservations.length > 1 ? "Independent visual consensus" : localOllama ? "Ollama (local)" : "Unknown"),
            providerOrder: visionProviderOrder,
            fallbackOrder: visionProviderOrder.slice(1),
            enginesCompleted: independentObservations.length,
            usedFallback: Boolean(visionProviderUsed && visionProviderUsed !== "Cloudflare"),
            failedAttempts: visionAttempts.map((attempt) => ({
              engine: attempt.model,
              category: safeVisionFailureCategory(attempt.reason),
            })),
          },
          photoGps,
        });
      } catch (error) {
        const detail = String(error?.message || error).slice(0, 500);
        console.error(`[Image scanner] Vision analysis failed: ${detail}`);
        const needsAgreement = /agree|license|acceptable use|policy/i.test(detail);
        return json(
          {
            ok: true,
            analysis: needsAgreement && language === "ar"
              ? "خدمة تحليل الصور محتاجة تفعيل موافقة ترخيص نموذج الرؤية في Cloudflare قبل أول استخدام. لازم صاحب الحساب يراجع ويوافق بنفسه."
              : scanProviderUnavailableMessage(language),
            resultType: "unverified",
            reverseImageSearchStatus: reverseImageSearchConfigured ? "failed" : "unavailable",
            sources: [],
            trustedSourcesAvailable: false,
            wikipediaAvailable: null,
            licenseAgreementRequired: needsAgreement,
            confidenceByField: mode === "hieroglyphs"
              ? { inscription: "low", translation: "low", place: "low" }
              : { identity: "low", place: "low", period: "low" },
            visionDiagnostics: {
              provider: localOllama ? "Ollama (local)" : "No vision engine completed",
              providerOrder: visionProviderOrder,
              fallbackOrder: visionProviderOrder.slice(1),
              configuredProviders: {
                Cloudflare: typeof env.AI?.run === "function",
                Gemini: Boolean(geminiVisionKey),
                Groq: Boolean(groqVisionKey),
              },
              cloudflareFallbackModels: typeof env.AI?.run === "function" ? FALLBACK_VISION_MODELS : [],
              failedAttempts: visionAttempts.map((attempt) => ({
                engine: attempt.model,
                category: safeVisionFailureCategory(attempt.reason),
              reason: safeVisionDiagnosticReason(attempt.reason, env),
              })),
            },
          },
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
