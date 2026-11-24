import { useMemo, useState } from "react";
import {
  Clock3,
  MapPinned,
  GitCompareArrows,
  NotebookPen,
  SearchCheck,
  X,
  ChevronLeft,
  Trash2,
  Landmark,
  ScrollText,
} from "lucide-react";
import { useLanguage } from "@/i18n/language";
import { heritageExperienceCopy } from "@/i18n/translations";

type FeatureId = "timeline" | "map" | "compare" | "notebook" | "detective";

type Site = {
  id: string;
  name: string;
  period: string;
  region: string;
  x: number;
  y: number;
  events: { date: string; title: string; detail: string }[];
};

const sites: Site[] = [
  {
    id: "giza",
    name: "هضبة الجيزة",
    period: "oldKingdom",
    region: "الجيزة",
    x: 70,
    y: 31,
    events: [
      { date: "نحو 2670 ق.م", title: "بدايات العمارة الهرمية", detail: "شهد عصر الأسرة الثالثة تطورًا مهمًا في بناء المقابر الملكية، وصولًا إلى هرم زوسر المدرج في سقارة." },
      { date: "نحو 2580–2510 ق.م", title: "بناء أهرامات الجيزة", detail: "شُيدت الأهرامات الكبرى في عهد ملوك الأسرة الرابعة، خوفو وخفرع ومنقرع." },
      { date: "العصور اللاحقة", title: "موقع للزيارة والتبجيل", detail: "ظلت الجيزة مقصدًا للزيارة والاهتمام عبر عصور مصرية ويونانية ورومانية وحديثة." },
    ],
  },
  {
    id: "karnak",
    name: "مجمع معابد الكرنك",
    period: "newKingdom",
    region: "الأقصر",
    x: 55,
    y: 66,
    events: [
      { date: "من الدولة الوسطى", title: "بدايات المجمع", detail: "تعود أقدم المنشآت المعروفة في الكرنك إلى الدولة الوسطى، ثم اتسع المجمع عبر قرون." },
      { date: "الدولة الحديثة", title: "توسعات الملوك", detail: "أضاف ملوك من بينهم تحتمس الثالث وأمنحتب الثالث ورمسيس الثاني منشآت وصروحًا ومسلات." },
      { date: "العصور اللاحقة", title: "استمرار الاستخدام", detail: "استمر النشاط الديني والبناء والإضافات في الموقع خلال فترات تاريخية متعددة." },
    ],
  },
  {
    id: "abu-simbel",
    name: "أبو سمبل",
    period: "newKingdom",
    region: "أسوان",
    x: 38,
    y: 88,
    events: [
      { date: "القرن 13 ق.م", title: "النحت في عهد رمسيس الثاني", detail: "نُحت المعبدان في عهد رمسيس الثاني ضمن مشهد ملكي وديني في النوبة." },
      { date: "القرن 19", title: "إعادة التعريف بالموقع", detail: "أصبح الموقع معروفًا على نطاق أوسع للباحثين والرحالة في العصر الحديث." },
      { date: "1964–1968", title: "عملية الإنقاذ والنقل", detail: "نُقلت المعابد إلى موقع أعلى لحمايتها من ارتفاع مياه بحيرة ناصر." },
    ],
  },
  {
    id: "saqqara",
    name: "سقارة",
    period: "oldKingdom",
    region: "الجيزة",
    x: 76,
    y: 40,
    events: [
      { date: "نحو 2670 ق.م", title: "هرم زوسر المدرج", detail: "يمثل مجمع زوسر مرحلة محورية في تطور العمارة الحجرية الملكية." },
      { date: "الدولة القديمة", title: "جبانة ملكية ونخبوية", detail: "احتوت سقارة على أهرامات ومصاطب ومقابر لكبار المسؤولين عبر فترات مختلفة." },
      { date: "عصور متعددة", title: "استمرار الدفن", detail: "استُخدمت أجزاء من الجبانة وأُعيد توظيفها خلال عصور لاحقة." },
    ],
  },
  {
    id: "hawara",
    name: "هرم اللاهون",
    period: "middleKingdom",
    region: "الفيوم",
    x: 63,
    y: 53,
    events: [
      { date: "نحو القرن 19 ق.م", title: "بناء هرم سنوسرت الثاني", detail: "ارتبط الموقع بالملك سنوسرت الثاني من الأسرة الثانية عشرة، ويُعد من مواقع الدولة الوسطى المهمة." },
      { date: "الدولة الوسطى", title: "مجمع هرمي ومقابر", detail: "تضم المنطقة آثارًا مرتبطة بالمجمع الجنائزي والجبانة المحيطة به." },
      { date: "العصر الحديث", title: "أبحاث أثرية", detail: "شهد الموقع أعمال تنقيب ودراسة ساعدت في فهم العمارة الجنائزية في الدولة الوسطى." },
    ],
  },
  {
    id: "tanis",
    name: "تانيس (صان الحجر)",
    period: "latePeriods",
    region: "الشرقية",
    x: 79,
    y: 20,
    events: [
      { date: "العصر الانتقالي الثالث", title: "ازدهار تانيس", detail: "أصبحت تانيس مركزًا ملكيًا مهمًا في شمال شرق الدلتا خلال الأسرة الحادية والعشرين." },
      { date: "العصر المتأخر", title: "استمرار الأهمية", detail: "احتفظت المدينة بأهمية دينية وسياسية في فترات لاحقة من تاريخ مصر القديمة." },
      { date: "العصر الحديث", title: "اكتشاف المقابر الملكية", detail: "كشفت أعمال التنقيب عن مقابر ملكية ومقتنيات مهمة في جبانة تانيس." },
    ],
  },

  {
    id: "luxor", name: "معبد الأقصر", period: "newKingdom", region: "الأقصر", x: 54, y: 68,
    events: [
      { date: "نحو 1400 ق.م", title: "بدايات البناء الملكي", detail: "بدأ أمنحتب الثالث تشييد أجزاء رئيسية من معبد الأقصر، ثم أضاف ملوك لاحقون منشآت ونقوشًا." },
      { date: "عهد رمسيس الثاني", title: "إضافات ملكية", detail: "أضاف رمسيس الثاني الفناء والصروح والتماثيل الضخمة التي ارتبطت بصورته الملكية." },
      { date: "عصور لاحقة", title: "تغيرات في الاستخدام", detail: "شهد الموقع إضافات واستخدامات دينية وعمرانية في فترات لاحقة، وما زال جزء من تاريخه ظاهرًا في طبقاته." },
    ],
  },
  {
    id: "valley-kings", name: "وادي الملوك", period: "newKingdom", region: "الضفة الغربية للأقصر", x: 51, y: 70,
    events: [
      { date: "من الأسرة الثامنة عشرة", title: "اختيار الوادي للدفن الملكي", detail: "اتجه ملوك الدولة الحديثة إلى مقابر محفورة في الصخر بدلًا من الأهرامات الملكية التقليدية." },
      { date: "الأسرات 18–20", title: "مقابر مزخرفة", detail: "زُينت مقابر كثيرة بنصوص دينية ومناظر تساعد في فهم معتقدات العالم الآخر." },
      { date: "1922", title: "اكتشاف مقبرة توت عنخ آمون", detail: "كشف هوارد كارتر عن المقبرة KV62 ومحتوياتها الملكية الشهيرة." },
    ],
  },
  {
    id: "deir-el-bahari", name: "الدير البحري", period: "newKingdom", region: "الأقصر", x: 49, y: 66,
    events: [
      { date: "الأسرة الحادية عشرة", title: "معبد منتوحتب الثاني", detail: "يضم الموقع مجمعًا جنائزيًا مبكرًا مهمًا للملك منتوحتب الثاني." },
      { date: "الأسرة الثامنة عشرة", title: "معبد حتشبسوت", detail: "شُيد المعبد المدرج لحتشبسوت بمحاذاة المنحدرات، وتبرز نقوشه بعثة بلاد بونت والشرعية الملكية." },
      { date: "العصر الحديث", title: "أبحاث وترميمات", detail: "أصبح الموقع محورًا للدراسة الأثرية والحفاظ على العمارة والمناظر المنقوشة." },
    ],
  },
  {
    id: "philae", name: "معبد إيزيس في فيلة", period: "latePeriods", region: "أسوان", x: 39, y: 91,
    events: [
      { date: "العصر البطلمي", title: "تشييد أجزاء رئيسية", detail: "شهدت فيلة نشاطًا معماريًا كبيرًا في العصر البطلمي مع تكريس المعبد لعبادة إيزيس." },
      { date: "العصر الروماني", title: "استمرار الإضافات", detail: "استمرت أعمال البناء والنقوش في العصر الروماني، ما يجعل الموقع شاهدًا على تداخل التقاليد." },
      { date: "1970s", title: "نقل المعبد", detail: "نُقلت آثار فيلة إلى جزيرة أجيليكا ضمن حملة إنقاذ آثار النوبة." },
    ],
  },
  {
    id: "edfu", name: "معبد حورس بإدفو", period: "latePeriods", region: "إدفو، أسوان", x: 46, y: 79,
    events: [
      { date: "237 ق.م", title: "بدء البناء", detail: "بدأ بناء المعبد في عهد بطليموس الثالث، واستمر العمل فيه عبر ملوك بطالمة متعاقبين." },
      { date: "57 ق.م تقريبًا", title: "اكتمال المعبد", detail: "تُظهر نقوش التأسيس اكتمال أجزاء المعبد في عهد بطليموس الثاني عشر." },
      { date: "العصر الحديث", title: "مصدر للنصوص الدينية", detail: "تُعد جدرانه من أغنى مصادر دراسة الطقوس والأساطير والمعمار المعبدي في مصر." },
    ],
  },
  {
    id: "kom-ombo", name: "معبد كوم أمبو", period: "latePeriods", region: "أسوان", x: 43, y: 85,
    events: [
      { date: "العصر البطلمي", title: "تشييد المعبد", detail: "شُيد المعبد في العصر البطلمي وخصص لعبادة سوبك وحورس الأكبر في تصميم مزدوج." },
      { date: "العصر الروماني", title: "إضافات ونقوش", detail: "أضيفت عناصر معمارية ونقوش في فترات رومانية لاحقة." },
      { date: "العصر الحديث", title: "دراسة النقوش", detail: "تساعد مناظر المعبد ونقوشه في دراسة العبادة والطب والطقوس، مع ضرورة تفسير كل منظر في سياقه." },
    ],
  },
  {
    id: "meidum", name: "هرم ميدوم", period: "oldKingdom", region: "بني سويف", x: 67, y: 46,
    events: [
      { date: "الأسرة الثالثة/الرابعة", title: "مرحلة انتقالية في بناء الهرم", detail: "يرتبط الهرم بمراحل من حكم سنفرو، ويُظهر تطور الانتقال من الهرم المدرج إلى الهرم ذي الأوجه الملساء." },
      { date: "العصور القديمة", title: "انهيار الكسوة الخارجية", detail: "فقد الهرم معظم كسوته الخارجية، وبقيت نواته الداخلية ظاهرة." },
      { date: "العصر الحديث", title: "دراسة البناء", detail: "ساعدت بقاياه في دراسة تقنيات البناء وتغير تصميم الأهرامات المبكرة." },
    ],
  },
  {
    id: "red-pyramid", name: "الهرم الأحمر", period: "oldKingdom", region: "دهشور، الجيزة", x: 73, y: 37,
    events: [
      { date: "عهد سنفرو", title: "بناء الهرم", detail: "يُعد الهرم الأحمر من أقدم الأهرامات المكتملة ذات الأوجه الملساء." },
      { date: "الأسرة الرابعة", title: "تطور هندسي", detail: "يمثل نجاحًا معماريًا بعد التجارب التي ظهرت في الهرم المنحني." },
      { date: "العصر الحديث", title: "موقع أثري مفتوح", detail: "يتيح الهرم دراسة الحجر الجيري المحلي وتقنيات بناء الأهرامات." },
    ],
  },
  {
    id: "bent-pyramid", name: "الهرم المنحني", period: "oldKingdom", region: "دهشور، الجيزة", x: 75, y: 34,
    events: [
      { date: "عهد سنفرو", title: "تغيير زاوية البناء", detail: "يتغير ميل جوانب الهرم في منتصف ارتفاعه، وهو ما أعطاه اسمه الحديث." },
      { date: "الأسرة الرابعة", title: "تجربة معمارية", detail: "يُدرس الهرم بوصفه مرحلة مهمة في تجارب الوصول إلى الهرم كامل الأوجه." },
      { date: "العصر الحديث", title: "الحفاظ على الكسوة", detail: "احتفظ الهرم بجزء كبير من كسوته الحجرية الخارجية مقارنة بكثير من الأهرامات." },
    ],
  },
  {
    id: "tell-el-amarna", name: "تل العمارنة", period: "newKingdom", region: "المنيا", x: 59, y: 51,
    events: [
      { date: "نحو 1346 ق.م", title: "تأسيس أخيتاتون", detail: "أنشأ أخناتون عاصمة جديدة ارتبطت بتحول ديني وسياسي في عهده." },
      { date: "عهد أخناتون", title: "فن ومجتمع العمارنة", detail: "تكشف البيوت والمقابر والرسائل عن جوانب من الإدارة والحياة اليومية والفن." },
      { date: "بعد عهد أخناتون", title: "هجر المدينة", detail: "تراجعت المدينة كعاصمة بعد نهاية التجربة العمارنية، وأعيد استخدام بعض موادها." },
    ],
  },
  {
    id: "aby dos", name: "أبيدوس", period: "oldKingdom", region: "سوهاج", x: 52, y: 73,
    events: [
      { date: "عصور مبكرة", title: "مركز جنائزي مهم", detail: "ارتبطت أبيدوس بعبادة أوزيريس وبجبانات ملكية مبكرة." },
      { date: "الأسرة التاسعة عشرة", title: "معبد سيتي الأول", detail: "يضم المعبد قوائم ملكية ومناظر طقسية ذات قيمة تاريخية كبيرة." },
      { date: "عصور لاحقة", title: "استمرار الزيارة الدينية", detail: "احتفظت أبيدوس بمكانة دينية مهمة في الذاكرة المصرية القديمة." },
    ],
  },
  {
    id: "bubastis", name: "تل بسطة", period: "latePeriods", region: "الشرقية", x: 84, y: 28,
    events: [
      { date: "عصور متعددة", title: "مدينة باستت", detail: "ارتبطت المدينة بعبادة الإلهة باستت، وكانت مركزًا دينيًا مهمًا في شرق الدلتا." },
      { date: "الأسرة الثانية والعشرون", title: "مكانة ملكية", detail: "برزت المدينة في عهد الأسرة الثانية والعشرين ذات الصلة بمدينة بر-باستت." },
      { date: "العصر الحديث", title: "حفائر ومكتشفات", detail: "كشفت الحفائر عن معابد وتماثيل وكتل معمارية توثق تاريخ الموقع." },
    ],
  },
  {
    id: "tell-el-dabaa", name: "تل الضبعة (أواريس)", period: "middleKingdom", region: "الشرقية", x: 82, y: 24,
    events: [
      { date: "الدولة الوسطى", title: "نشأة مستوطنة مهمة", detail: "تطورت المنطقة إلى مركز سكاني وتجاري مهم في شرق الدلتا." },
      { date: "الفترة الهكسوسية", title: "عاصمة أواريس", detail: "أصبحت أواريس مركز حكم الهكسوس في شمال مصر." },
      { date: "الدولة الحديثة", title: "إعادة تشكيل الموقع", detail: "ارتبطت المنطقة لاحقًا بمدينة بر-رعمسيس ومراحل جديدة من الاستيطان." },
    ],
  },
  {
    id: "el-kab", name: "الكاب (نخب)", period: "oldKingdom", region: "جنوب الأقصر", x: 47, y: 77,
    events: [
      { date: "عصور ما قبل الأسرات", title: "مركز مبكر", detail: "كانت نخب من المراكز المهمة في جنوب مصر قبل توحيد البلاد." },
      { date: "الدولة الحديثة", title: "مقابر صخرية", detail: "تضم جبانة الكاب مقابر لمسؤولين ونقوشًا تقدم معلومات عن الإدارة والحملات." },
      { date: "العصر الحديث", title: "توثيق النقوش", detail: "تساعد المقابر والنقوش في دراسة المجتمع والسلطة في مصر القديمة." },
    ],
  },
  {
    id: "elephantine", name: "جزيرة الفنتين", period: "latePeriods", region: "أسوان", x: 38, y: 93,
    events: [
      { date: "عصور مبكرة", title: "مركز حدودي وتجاري", detail: "كان موقع الجزيرة عند الشلال الأول مهمًا للتجارة والحدود الجنوبية." },
      { date: "الدولة القديمة والوسطى", title: "مجتمع متعدد الوظائف", detail: "توضح الآثار والنقوش دورها الإداري والديني والتجاري." },
      { date: "العصر المتأخر", title: "معبد خنوم", detail: "ارتبط الموقع بعبادة خنوم، وتكشف بقاياه عن طبقات تاريخية متعاقبة." },
    ],
  },
  {
    id: "tanis-extra", name: "منف (ميت رهينة)", period: "oldKingdom", region: "الجيزة", x: 78, y: 43,
    events: [
      { date: "بدايات الدولة المصرية", title: "عاصمة مبكرة", detail: "كانت منف مركزًا سياسيًا ودينيًا بارزًا في مراحل طويلة من التاريخ المصري." },
      { date: "الدولة القديمة", title: "مركز الإدارة والعبادة", detail: "ارتبطت المدينة بعبادة بتاح وبمؤسسات ملكية وإدارية." },
      { date: "العصور المتأخرة", title: "استمرار الأهمية", detail: "ظلت منف موقعًا دينيًا واستراتيجيًا حتى مع انتقال مراكز الحكم." },
    ],
  },
];

const artifacts = [
  { id: "djoser", name: "هرم زوسر المدرج", period: "الدولة القديمة – الأسرة الثالثة", function: "مجمع جنائزي ملكي", material: "الحجر الجيري", significance: "مرحلة مبكرة بارزة في تطور بناء الأهرامات والعمارة الحجرية." },
  { id: "khufu", name: "هرم خوفو", period: "الدولة القديمة – الأسرة الرابعة", function: "هرم جنائزي ملكي", material: "الحجر الجيري والجرانيت", significance: "أكبر أهرامات الجيزة، ويعكس قدرات تنظيمية وهندسية كبيرة." },
  { id: "bent", name: "الهرم المنحني", period: "الدولة القديمة – الأسرة الرابعة", function: "هرم جنائزي ملكي", material: "الحجر الجيري", significance: "يوضح مرحلة تجريبية مهمة في تطوير شكل الهرم الكامل." },
  { id: "abu-simbel", name: "معبدا أبو سمبل", period: "الدولة الحديثة – الأسرة التاسعة عشرة", function: "معبدان منحوتان في الصخر", material: "الصخر الرملي", significance: "يرتبطان ببرنامج رمسيس الثاني الملكي والديني في النوبة." },

  { id: "khafre", name: "تمثال خفرع", period: "الدولة القديمة – الأسرة الرابعة", function: "تمثال ملكي", material: "الديوريت", significance: "يجسد صورة الملك المرتبطة بالسلطة والحماية الإلهية، وعُثر عليه في معبد الوادي بالجيزة." },
  { id: "menkaure", name: "ثالوث منقرع", period: "الدولة القديمة – الأسرة الرابعة", function: "مجموعة نحتية ملكية", material: "الشيست", significance: "تصور الملك مع آلهة أو تجسيدات إقليمية، وتوضح برنامجًا دينيًا وسياسيًا." },
  { id: "narmer", name: "لوحة نارمر", period: "بدايات الأسرات", function: "لوحة احتفالية/ملكية", material: "حجر صلد", significance: "من أهم الشواهد المصورة على الملكية والتوحيد في بدايات الدولة المصرية." },
  { id: "palette-hunters", name: "لوحة الصيادين", period: "نقادة الثالثة", function: "لوحة احتفالية", material: "حجر صلد", significance: "تعرض مشاهد صيد ورموزًا تعكس تطور الفن والسلطة قبل الأسرات." },
  { id: "senusret", name: "رأس تمثال سنوسرت الثالث", period: "الدولة الوسطى – الأسرة الثانية عشرة", function: "صورة ملكية", material: "حجر", significance: "تُظهر ملامح واقعية نسبيًا تُفسر غالبًا في سياق التعبير عن مسؤولية الحكم." },
  { id: "white-chapel", name: "مقصورة سنوسرت الأول البيضاء", period: "الدولة الوسطى", function: "مقصورة شعائرية", material: "الحجر الجيري", significance: "تضم نقوشًا وأسماء أقاليم ومعلومات مهمة عن جغرافية مصر الإدارية." },
  { id: "hatshepsut", name: "تمثال حتشبسوت", period: "الدولة الحديثة – الأسرة الثامنة عشرة", function: "تمثال ملكي", material: "حجر", significance: "يوضح كيف استخدمت الملكة صورًا ملكية تقليدية لتأكيد شرعيتها." },
  { id: "tut-mask", name: "قناع توت عنخ آمون", period: "الدولة الحديثة – الأسرة الثامنة عشرة", function: "قناع جنائزي", material: "ذهب ومواد مرصعة", significance: "جزء من تجهيزات الدفن الملكي، ويعكس مهارة الصياغة ومعتقدات البعث والحماية." },
  { id: "canopic", name: "الأواني الكانوبية", period: "عصور متعددة", function: "حفظ الأحشاء في التحنيط", material: "حجر أو فخار أو مواد أخرى", significance: "ارتبطت بحماية أحشاء المتوفى وبأربعة أبناء لحورس في المعتقد الجنائزي." },
  { id: "rosetta", name: "حجر رشيد", period: "العصر البطلمي – 196 ق.م", function: "مرسوم ملكي بثلاثة أنظمة كتابة", material: "جرانوديوريت", significance: "ساعدت نصوصه المتوازية على فك رموز الهيروغليفية في القرن التاسع عشر." },
  { id: "senet", name: "لعبة السنت", period: "من الدولة القديمة وما بعدها", function: "لعبة لوحية", material: "خشب أو عاج أو فخار", significance: "تظهر في سياقات جنائزية وفنية، واكتسبت دلالات رمزية في بعض العصور." },
  { id: "merneptah", name: "لوحة مرنبتاح", period: "الدولة الحديثة – الأسرة التاسعة عشرة", function: "نص انتصاري ملكي", material: "جرانيت", significance: "تضم أقدم إشارة مصرية معروفة إلى اسم إسرائيل في سياق نص ملكي." },
  { id: "wilbour", name: "بردية ويلبور", period: "عهد رمسيس الخامس", function: "سجل إداري للأراضي", material: "بردي", significance: "توثق مساحات وأراضي ومؤسسات، وتفيد في دراسة الاقتصاد والإدارة." },
  { id: "edwin-smith", name: "بردية إدوين سميث", period: "نسخة من الدولة الحديثة لنص أقدم", function: "نص طبي جراحي", material: "بردي", significance: "تعرض حالات إصابات وفحصًا وتشخيصًا وتوقعات علاجية منظمة." },
  { id: "amarnaletters", name: "رسائل العمارنة", period: "الدولة الحديثة – الأسرة الثامنة عشرة", function: "مراسلات دبلوماسية", material: "ألواح طينية", significance: "تكشف شبكة العلاقات السياسية والدبلوماسية بين مصر وممالك الشرق الأدنى." },
  { id: "coffin", name: "التوابيت المزخرفة", period: "عصور متعددة", function: "حماية وتجهيز جنائزي", material: "خشب أو حجر", significance: "تحمل نصوصًا وصورًا تكشف تغير المعتقدات والطقوس الجنائزية عبر الزمن." },
];

const quiz = [
  {
    question: "أي موقع يرتبط بهرم زوسر المدرج؟",
    options: ["سقارة", "أبو سمبل", "الكرنك"],
    answer: 0,
    explanation: "يقع هرم زوسر المدرج في جبانة سقارة، ويرتبط بالملك زوسر من الأسرة الثالثة.",
  },
  {
    question: "في عهد أي ملك شُيد معبدا أبو سمبل؟",
    options: ["خوفو", "رمسيس الثاني", "زوسر"],
    answer: 1,
    explanation: "شُيد معبدا أبو سمبل في عهد رمسيس الثاني خلال الأسرة التاسعة عشرة.",
  },
  {
    question: "ما الوظيفة الأساسية للأهرامات الملكية؟",
    options: ["مخازن للحبوب", "مقابر ملكية ضمن مجمعات جنائزية", "أسواق تجارية"],
    answer: 1,
    explanation: "كانت الأهرامات جزءًا من مجمعات جنائزية ملكية مرتبطة بالدفن والعبادة الجنائزية.",
  },
  { question: "ما الاسم اليوناني الشائع لمدينة طيبة؟", options: ["الأقصر","منف","أبيدوس"], answer: 0, explanation: "ترتبط طيبة بمنطقة الأقصر الحالية، وكانت مركزًا مهمًا في الدولة الحديثة." },
  { question: "أي ملك ارتبط ببناء الهرم الأحمر؟", options: ["خوفو","سنفرو","خفرع"], answer: 1, explanation: "يُنسب الهرم الأحمر في دهشور إلى الملك سنفرو." },
  { question: "ما وظيفة حجر رشيد التاريخية؟", options: ["تقويم زراعي","مرسوم بثلاثة أنظمة كتابة","خريطة للمعابد"], answer: 1, explanation: "يحمل مرسومًا مكتوبًا بالهيروغليفية والديموطيقية واليونانية." },
  { question: "أين تقع مقبرة توت عنخ آمون؟", options: ["وادي الملوك","سقارة","دهشور"], answer: 0, explanation: "تقع المقبرة المعروفة بالرمز KV62 في وادي الملوك." },
  { question: "أي إله ارتبط بمعبد إدفو؟", options: ["حورس","بتاح","خنوم"], answer: 0, explanation: "خصص معبد إدفو لعبادة حورس، ويعد من أفضل المعابد حفظًا." },
  { question: "ما وظيفة الأواني الكانوبية؟", options: ["حفظ الأحشاء المحنطة","تخزين الحبوب","حفظ الحبر"], answer: 0, explanation: "استُخدمت لحفظ أحشاء المتوفى ضمن تجهيزات التحنيط." },
  { question: "ما المدينة التي أسسها أخناتون عاصمة جديدة؟", options: ["أخيتاتون","منف","تانيس"], answer: 0, explanation: "أخيتاتون هي المدينة المعروفة اليوم بتل العمارنة." },
  { question: "أي موقع نُقلت معابده إلى جزيرة أجيليكا؟", options: ["فيلة","الكرنك","إدفو"], answer: 0, explanation: "نُقلت آثار فيلة لحمايتها من ارتفاع مياه بحيرة ناصر." },
  { question: "ما المادة الأساسية التي نُحتت فيها معابد أبو سمبل؟", options: ["الصخر الرملي","الجرانيت الوردي","الطوب اللبن"], answer: 0, explanation: "المعبدان منحوتان في واجهة صخرية من الحجر الرملي." },
  { question: "أي ملك ارتبط بمعبد الدير البحري المدرج؟", options: ["حتشبسوت","أحمس","أمنحتب الرابع"], answer: 0, explanation: "شيدت حتشبسوت معبدها الجنائزي بالدير البحري." },
  { question: "ما النظام الكتابي الموجود على حجر رشيد إلى جانب اليونانية؟", options: ["الهيروغليفية والديموطيقية","المسمارية والقبطية","اللاتينية والهيراطيقية"], answer: 0, explanation: "النص يتضمن الهيروغليفية والديموطيقية واليونانية." },
  { question: "ما اسم عاصمة الهكسوس في شرق الدلتا؟", options: ["أواريس","طيبة","إخيتاتون"], answer: 0, explanation: "كانت أواريس مركز حكم الهكسوس، ويرتبط موقعها بتل الضبعة." },
  { question: "ما وظيفة المقابر الصخرية في وادي الملوك؟", options: ["دفن الملوك","تخزين مياه الفيضان","إقامة الأسواق"], answer: 0, explanation: "اختير الوادي لدفن ملوك الدولة الحديثة في مقابر محفورة بالصخر." },
  { question: "أي موقع ارتبط بعبادة باستت؟", options: ["تل بسطة","أبو سمبل","اللاهون"], answer: 0, explanation: "ارتبطت مدينة بر-باستت، المعروفة بتل بسطة، بالإلهة باستت." },
  { question: "ما الذي يميز معبد كوم أمبو؟", options: ["تخصيص مزدوج لسوبك وحورس","هرم مدرج","مقبرة ملكية تحت الأرض"], answer: 0, explanation: "يتميز بتخطيط مزدوج وارتباطه بسوبك وحورس الأكبر." },
  { question: "أي وثيقة طبية تصف فحص الإصابات والجروح؟", options: ["بردية إدوين سميث","حجر رشيد","بردية ويلبور"], answer: 0, explanation: "تقدم بردية إدوين سميث حالات إصابات وفحصًا وتشخيصًا." },
  { question: "ما اسم المقصورة البيضاء المرتبطة بسنوسرت الأول؟", options: ["مقصورة سنوسرت الأول البيضاء","مقصورة توت عنخ آمون","مقصورة نارمر"], answer: 0, explanation: "تضم نقوشًا مهمة عن الأقاليم والجغرافيا الإدارية." },
  { question: "أي موقع يضم معبد سيتي الأول الشهير؟", options: ["أبيدوس","الفيوم","تانيس"], answer: 0, explanation: "يقع معبد سيتي الأول في أبيدوس بسوهاج." },
  { question: "ما أهمية رسائل العمارنة؟", options: ["توثيق العلاقات الدبلوماسية","وصف بناء الأهرامات","قائمة طعام ملكية"], answer: 0, explanation: "توثق المراسلات السياسية بين مصر وممالك الشرق الأدنى." },
  { question: "ما المقصود بالمصطبة في العمارة الجنائزية؟", options: ["مقبرة ذات بناء علوي منخفض مستطيل","معبد صخري","بوابة مدينة"], answer: 0, explanation: "المصطبة نوع من المقابر ذات كتلة علوية مستطيلة وجوانب مائلة." },
  { question: "ما الذي يميز الهرم المنحني؟", options: ["تغير زاوية الميل","وجود نقوش زجاجية","أنه مبني من الطوب فقط"], answer: 0, explanation: "يتغير ميل جوانبه في منتصف الارتفاع تقريبًا." },
  { question: "أي ملك ارتبط بلوحة مرنبتاح؟", options: ["مرنبتاح","رمسيس الثاني","تحتمس الثالث"], answer: 0, explanation: "اللوحة نص ملكي يعود إلى عهد مرنبتاح من الأسرة التاسعة عشرة." },
  { question: "ما وظيفة قوائم القرابين في المقابر؟", options: ["تسجيل وتقديم مستلزمات للمتوفى","تحديد حدود المدن","تسجيل الضرائب فقط"], answer: 0, explanation: "تسجل قوائم القرابين أنواعًا من الطعام والمواد المرتبطة بالطقوس الجنائزية." },
  { question: "أي موقع كان مركزًا لعبادة خنوم؟", options: ["الفنتين","الجيزة","تل العمارنة"], answer: 0, explanation: "ارتبطت جزيرة الفنتين ومعبدها بعبادة خنوم." },
  { question: "لماذا تعد نقوش المعابد مصدرًا تاريخيًا؟", options: ["لأنها توثق طقوسًا وأسماء وأحداثًا في سياقها","لأنها دائمًا وصف حرفي لكل حدث","لأنها لا تتأثر بالسياسة"], answer: 0, explanation: "تقدم النقوش أدلة مهمة، لكنها نصوص وصور رسمية تحتاج قراءة نقدية وسياقية." },
];

const features: {
  id: FeatureId;
  icon: typeof Clock3;
  symbol: string;
  titleKey: keyof typeof heritageExperienceCopy.ar;
  descKey: keyof typeof heritageExperienceCopy.ar;
  art: string;
  image: string;
  imageCredit: string;
}[] = [
  { id: "timeline", icon: Clock3, symbol: "𓆣", titleKey: "timeline", descKey: "timelineDesc", art: "timeline", image: "https://egymonuments.gov.eg/media/1215/pyramidsss.jpg?crop=0.26411576704545459%2C0.10024175153587361%2C0.025656960227272589%2C0.22526225483213388&cropmode=percentage&height=423&rnd=134159695430000000&width=645", imageCredit: "وزارة السياحة والآثار المصرية" },
  { id: "map", icon: MapPinned, symbol: "𓊹", titleKey: "map", descKey: "mapDesc", art: "map", image: "/heritage-experiences/map.svg", imageCredit: "خريطة استكشافية من أثَرة" },
  { id: "compare", icon: GitCompareArrows, symbol: "𓏞", titleKey: "compare", descKey: "compareDesc", art: "compare", image: "https://collectionapi.metmuseum.org/api/collection/v1/iiif/590699/1421657/main-image", imageCredit: "The Metropolitan Museum of Art · Open Access" },
  { id: "notebook", icon: NotebookPen, symbol: "𓏛", titleKey: "notebook", descKey: "notebookDesc", art: "notebook", image: "https://images.metmuseum.org/CRDImages/eg/original/DP292923.jpg", imageCredit: "The Metropolitan Museum of Art · Open Access" },
  { id: "detective", icon: SearchCheck, symbol: "𓂀", titleKey: "detective", descKey: "detectiveDesc", art: "detective", image: "https://images.metmuseum.org/CRDImages/eg/original/DP-35426-001.jpg", imageCredit: "The Metropolitan Museum of Art · Open Access" },
];

export function HeritageExperiences() {
  const { lang } = useLanguage();
  const c = heritageExperienceCopy[lang === "ar" ? "ar" : "en"];
  const [active, setActive] = useState<FeatureId | null>(null);
  const [selectedSite, setSelectedSite] = useState(sites[0].id);
  const [period, setPeriod] = useState("all");
  const [firstArtifact, setFirstArtifact] = useState("djoser");
  const [secondArtifact, setSecondArtifact] = useState("khufu");
  const [noteTitle, setNoteTitle] = useState("");
  const [noteBody, setNoteBody] = useState("");
  const [notes, setNotes] = useState<{ id: number; title: string; body: string }[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("athara-research-notes") || "[]");
    } catch {
      return [];
    }
  });
  const [questionIndex, setQuestionIndex] = useState(-1);
  const [answers, setAnswers] = useState<number[]>([]);
  const [showScore, setShowScore] = useState(false);
  const currentSite = sites.find((site) => site.id === selectedSite) ?? sites[0];
  const visibleSites = useMemo(
    () => (period === "all" ? sites : sites.filter((site) => site.period === period)),
    [period],
  );
  const first = artifacts.find((item) => item.id === firstArtifact) ?? artifacts[0];
  const second = artifacts.find((item) => item.id === secondArtifact) ?? artifacts[1];
  const saveNotes = (next: typeof notes) => {
    setNotes(next);
    try {
      localStorage.setItem("athara-research-notes", JSON.stringify(next));
    } catch {
      // Keep the current session usable if browser storage is unavailable.
    }
  };
  const startQuiz = () => {
    setQuestionIndex(0);
    setAnswers([]);
    setShowScore(false);
  };

  return (
    <>
      <section className="athara-experiences" aria-labelledby="athara-experiences-title">
        <div className="athara-experiences-heading">
          <span>{c.toolsEyebrow}</span>
          <h2 id="athara-experiences-title">{c.toolsTitle}</h2>
          <p>{c.toolsText}</p>
        </div>
        <div className="athara-experience-grid">
          {features.map(({ id, icon: Icon, symbol, titleKey, descKey, art }) => (
            <button key={id} type="button" className={`athara-experience-card athara-art-${art}`} style={{ backgroundImage: `linear-gradient(180deg, rgba(12,9,6,.12), rgba(12,9,6,.88)), url("${image}")` }} onClick={() => setActive(id)} aria-label={`${c[titleKey]} — ${c[descKey]}`}>
              <span className="athara-experience-symbol" aria-hidden="true">{symbol}</span>
              <span className="athara-experience-icon"><Icon size={20} /></span>
              <span className="athara-experience-copy">
                <strong>{c[titleKey]}</strong>
                <small>{c[descKey]}</small>
                <span className="athara-experience-open">{c.explore} <ChevronLeft size={15} /></span>
              </span>
            </button>
          ))}
        </div>
      </section>

      {active && (
        <div className="athara-feature-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setActive(null); }}>
          <section className="athara-feature-panel" role="dialog" aria-modal="true" aria-label={c[features.find((f) => f.id === active)!.titleKey]}>
            <header className="athara-feature-header">
              <div>
                <span>𓂀 ATHARA</span>
                <h2>{c[features.find((f) => f.id === active)!.titleKey]}</h2>
              </div>
              <button type="button" onClick={() => setActive(null)} aria-label={c.close}><X /></button>
            </header>

            {active === "timeline" && (
              <div className="athara-feature-content">
                <label className="athara-field-label">{c.chooseSite}
                  <select value={selectedSite} onChange={(event) => setSelectedSite(event.target.value)}>
                    {sites.map((site) => <option key={site.id} value={site.id}>{site.name}</option>)}
                  </select>
                </label>
                <div className="athara-timeline-hero">
                  <span>𓊹</span><strong>{currentSite.name}</strong><small>{currentSite.region}</small>
                </div>
                <div className="athara-timeline-list">
                  {currentSite.events.map((event, index) => (
                    <article key={event.title} className="athara-timeline-event">
                      <span className="athara-timeline-dot">{String(index + 1).padStart(2, "0")}</span>
                      <div><small>{event.date}</small><h3>{event.title}</h3><p>{event.detail}</p></div>
                    </article>
                  ))}
                </div>
                <p className="athara-feature-note">{c.timelineNote}</p>
              </div>
            )}

            {active === "map" && (
              <div className="athara-feature-content">
                <div className="athara-map-toolbar">
                  <label className="athara-field-label">{c.period}
                    <select value={period} onChange={(event) => setPeriod(event.target.value)}>
                      <option value="all">{c.allPeriods}</option>
                      <option value="oldKingdom">{c.oldKingdom}</option>
                      <option value="middleKingdom">{c.middleKingdom}</option>
                      <option value="newKingdom">{c.newKingdom}</option>
                      <option value="latePeriods">{c.latePeriods}</option>
                    </select>
                  </label>
                </div>
                <div className="athara-schematic-map" role="group" aria-label={c.map}>
                  <span className="athara-map-compass">𓇳 N</span>
                  {visibleSites.map((site) => (
                    <button key={site.id} type="button" className={`athara-map-pin ${selectedSite === site.id ? "is-selected" : ""}`} style={{ left: `${site.x}%`, top: `${site.y}%` }} onClick={() => setSelectedSite(site.id)} title={site.name}>
                      <span>𓊹</span><small>{site.name}</small>
                    </button>
                  ))}
                </div>
                <div className="athara-map-detail">
                  <Landmark size={20} /><div><strong>{currentSite.name}</strong><p>{currentSite.region} · {c[currentSite.period as keyof typeof c]}</p><small>{currentSite.events[0].detail}</small></div>
                </div>
                <p className="athara-feature-note">{c.mapNote}</p>
              </div>
            )}

            {active === "compare" && (
              <div className="athara-feature-content">
                <p className="athara-feature-note">{c.compareHint}</p>
                <div className="athara-compare-selects">
                  <label className="athara-field-label">{c.firstArtifact}<select value={firstArtifact} onChange={(event) => setFirstArtifact(event.target.value)}>{artifacts.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
                  <label className="athara-field-label">{c.secondArtifact}<select value={secondArtifact} onChange={(event) => setSecondArtifact(event.target.value)}>{artifacts.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
                </div>
                <div className="athara-compare-grid">
                  {[first, second].map((item, index) => (
                    <article key={index}><span className="athara-compare-mark">{index === 0 ? "𓏞" : "𓊹"}</span><h3>{item.name}</h3><dl>
                      <dt>{c.period}</dt><dd>{item.period}</dd><dt>{c.function}</dt><dd>{item.function}</dd><dt>{c.material}</dt><dd>{item.material}</dd><dt>{c.significance}</dt><dd>{item.significance}</dd>
                    </dl></article>
                  ))}
                </div>
              </div>
            )}

            {active === "notebook" && (
              <div className="athara-feature-content">
                <form className="athara-notebook-form" onSubmit={(event) => { event.preventDefault(); if (!noteTitle.trim() || !noteBody.trim()) return; saveNotes([{ id: Date.now(), title: noteTitle.trim(), body: noteBody.trim() }, ...notes]); setNoteTitle(""); setNoteBody(""); }}>
                  <label className="athara-field-label">{c.noteTitle}<input value={noteTitle} onChange={(event) => setNoteTitle(event.target.value)} maxLength={100} required /></label>
                  <label className="athara-field-label">{c.notePlaceholder}<textarea value={noteBody} onChange={(event) => setNoteBody(event.target.value)} rows={4} maxLength={3000} required /></label>
                  <button className="athara-feature-primary" type="submit"><ScrollText size={17} />{c.saveNote}</button>
                </form>
                <div className="athara-notes-heading"><h3>{c.savedNotes}</h3><small>{c.localStorageNote}</small></div>
                {notes.length === 0 ? <p className="athara-feature-note">{c.noNotes}</p> : <div className="athara-notes-list">{notes.map((note) => <article key={note.id}><div><strong>{note.title}</strong><p>{note.body}</p></div><button type="button" onClick={() => saveNotes(notes.filter((item) => item.id !== note.id))} aria-label={c.deleteNote}><Trash2 size={17} /></button></article>)}</div>}
              </div>
            )}

            {active === "detective" && (
              <div className="athara-feature-content">
                {questionIndex < 0 ? <div className="athara-quiz-intro"><span>𓂀</span><h3>{c.detective}</h3><p>{c.detectiveDesc}</p><button className="athara-feature-primary" type="button" onClick={startQuiz}>{c.startQuiz}</button></div>
                : showScore ? <div className="athara-quiz-intro"><span>𓋹</span><h3>{c.score}: {answers.filter((answer, index) => answer === quiz[index].answer).length} / {quiz.length}</h3><button className="athara-feature-primary" type="button" onClick={startQuiz}>{c.restartQuiz}</button></div>
                : <div className="athara-quiz-question"><small>{c.question} {questionIndex + 1} {c.of} {quiz.length}</small><h3>{quiz[questionIndex].question}</h3><div className="athara-quiz-options">{quiz[questionIndex].options.map((option, index) => <button type="button" key={option} className={answers[questionIndex] === index ? "is-chosen" : ""} onClick={() => setAnswers((current) => { const next = [...current]; next[questionIndex] = index; return next; })}>{option}</button>)}</div>
                  {answers[questionIndex] !== undefined && <div className={`athara-quiz-feedback ${answers[questionIndex] === quiz[questionIndex].answer ? "is-correct" : ""}`}><strong>{answers[questionIndex] === quiz[questionIndex].answer ? c.correct : c.incorrect}</strong><p>{quiz[questionIndex].explanation}</p></div>}
                  <button className="athara-feature-primary" type="button" disabled={answers[questionIndex] === undefined} onClick={() => questionIndex === quiz.length - 1 ? setShowScore(true) : setQuestionIndex((current) => current + 1)}>{questionIndex === quiz.length - 1 ? c.showResult : c.nextQuestion}</button>
                </div>}
              </div>
            )}
          </section>
        </div>
      )}
    </>
  );
}
