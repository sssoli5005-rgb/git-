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
  },,

  {
    id: "luxor-west-bank", name: "البر الغربي بالأقصر", period: "newKingdom", region: "الأقصر", x: 52, y: 69,
    events: [
      { date: "الدولة الحديثة", title: "جبانة الملوك والنبلاء", detail: "اختار ملوك من الأسرات الثامنة عشرة إلى العشرين وادي الملوك لدفنهم، كما انتشرت مقابر كبار المسؤولين في جبانات طيبة." },
      { date: "نحو 1500–1000 ق.م", title: "مقابر ملكية مزخرفة", detail: "حملت جدران مقابر ملكية نصوصًا دينية ومناظر مرتبطة برحلة الشمس والعالم الآخر." },
      { date: "العصر الحديث", title: "أبحاث وحماية مستمرة", detail: "تعمل بعثات مصرية ودولية على توثيق المقابر ودراسة حالتها وحمايتها." }
    ]
  },
  {
    id: "deir-el-medina", name: "دير المدينة", period: "newKingdom", region: "الأقصر", x: 49, y: 72,
    events: [
      { date: "الدولة الحديثة", title: "قرية العمال المهرة", detail: "سكنها حرفيون متخصصون في إعداد وزخرفة المقابر الملكية في وادي الملوك ووادي الملكات." },
      { date: "عصر الرعامسة", title: "وثائق الحياة اليومية", detail: "حفظت البرديات والأوستراكا تفاصيل الأجور والغياب والنزاعات والعلاقات الاجتماعية." },
      { date: "نحو 1150 ق.م", title: "إضراب العمال", detail: "تسجل برديات من عهد رمسيس الثالث احتجاج العمال بسبب تأخر حصص المؤن، وهو من أقدم الإضرابات الموثقة." }
    ]
  },
  {
    id: "edfu", name: "معبد إدفو", period: "latePeriods", region: "أسوان", x: 48, y: 79,
    events: [
      { date: "237 ق.م", title: "بداية البناء البطلمي", detail: "بدأ بناء المعبد في عهد بطليموس الثالث، واستمرت أعماله وإضافاته خلال العصر البطلمي." },
      { date: "العصر البطلمي", title: "معبد حورس", detail: "كرّس المعبد للإله حورس، وتوثق نقوشه الطقوس والأساطير والأعياد." },
      { date: "57 ق.م تقريبًا", title: "اكتمال الزخرفة", detail: "تؤرخ نقوش المعبد مراحل متتابعة من البناء والزخرفة حتى أواخر العصر البطلمي." }
    ]
  },
  {
    id: "philae", name: "جزيرة فيلة", period: "latePeriods", region: "أسوان", x: 42, y: 91,
    events: [
      { date: "العصر البطلمي", title: "ازدهار عبادة إيزيس", detail: "أصبحت فيلة مركزًا مهمًا لعبادة إيزيس، وضم مجمعها معابد ومنشآت من عصور متعددة." },
      { date: "العصر الروماني", title: "استمرار الشعائر", detail: "استمرت بعض الطقوس المرتبطة بإيزيس في فيلة خلال العصر الروماني." },
      { date: "1972–1980", title: "إنقاذ آثار فيلة", detail: "فُككت منشآت الجزيرة ونُقلت إلى جزيرة أجيلكيا ضمن حملة إنقاذ آثار النوبة." }
    ]
  },
  {
    id: "dahshur", name: "دهشور", period: "oldKingdom", region: "الجيزة", x: 72, y: 38,
    events: [
      { date: "نحو 2600 ق.م", title: "الهرم المنحني", detail: "شيد الملك سنفرو الهرم المنحني، ويظهر تغير زاوية الميل في الجزء العلوي." },
      { date: "نحو 2590 ق.م", title: "الهرم الأحمر", detail: "يرتبط الهرم الأحمر بسنفرو ويعد من أقدم الأهرامات ذات الأوجه المستقيمة المكتملة." },
      { date: "الدولة الوسطى", title: "جبانة ملكية جديدة", detail: "شهدت دهشور بناء أهرامات ومقابر ملكية في عهد ملوك من الأسرة الثانية عشرة." }
    ]
  },
  {
    id: "aby dos", name: "أبيدوس", period: "middleKingdom", region: "سوهاج", x: 54, y: 75,
    events: [
      { date: "عصور مبكرة", title: "جبانة ملكية مبكرة", detail: "تضم أبيدوس مدافن ملكية من بدايات الأسرات، وأسهمت في فهم نشأة الدولة المصرية." },
      { date: "الدولة الوسطى", title: "مركز عبادة أوزير", detail: "ارتبطت أبيدوس بقوة بعبادة أوزير ورحلات الحج والطقوس الجنائزية." },
      { date: "الدولة الحديثة", title: "معبد سيتي الأول", detail: "يضم الموقع معبد سيتي الأول وقائمة ملوك أبيدوس الشهيرة، مع إضافات من عهد رمسيس الثاني." }
    ]
  },
  {
    id: "amarna", name: "تل العمارنة", period: "newKingdom", region: "المنيا", x: 61, y: 58,
    events: [
      { date: "نحو 1346 ق.م", title: "تأسيس أخت آتون", detail: "أنشأ أخناتون عاصمة جديدة مكرسة لعبادة آتون في منطقة تل العمارنة." },
      { date: "عهد أخناتون", title: "تحول فني وديني", detail: "شهدت المدينة أساليب فنية ومناظر ملكية مختلفة، إلى جانب تغيرات في الخطاب الديني الرسمي." },
      { date: "بعد عهد أخناتون", title: "هجر المدينة", detail: "تراجع استخدام العاصمة بعد نهاية تجربة العمارنة، وأصبحت بقاياها مصدرًا مهمًا للبرديات والرسائل." }
    ]
  },
  {
    id: "memphis", name: "منف", period: "oldKingdom", region: "الجيزة", x: 73, y: 45,
    events: [
      { date: "بدايات الدولة", title: "مركز سياسي مبكر", detail: "كانت منف من أهم المراكز السياسية والإدارية في مصر القديمة، قرب ملتقى الوادي والدلتا." },
      { date: "الدولة القديمة", title: "مركز ديني وحرفي", detail: "ارتبطت منف بعبادة بتاح وبورش ومؤسسات ملكية وحرفية واسعة." },
      { date: "العصور اللاحقة", title: "استمرار المكانة", detail: "احتفظت منف بأهمية دينية وإدارية عبر عصور مختلفة، وتنتشر آثارها في منطقة ميت رهينة." }
    ]
  },
];

const artifacts = [
  { id: "djoser", name: "هرم زوسر المدرج", period: "الدولة القديمة – الأسرة الثالثة", function: "مجمع جنائزي ملكي", material: "الحجر الجيري", significance: "مرحلة مبكرة بارزة في تطور بناء الأهرامات والعمارة الحجرية." },
  { id: "khufu", name: "هرم خوفو", period: "الدولة القديمة – الأسرة الرابعة", function: "هرم جنائزي ملكي", material: "الحجر الجيري والجرانيت", significance: "أكبر أهرامات الجيزة، ويعكس قدرات تنظيمية وهندسية كبيرة." },
  { id: "bent", name: "الهرم المنحني", period: "الدولة القديمة – الأسرة الرابعة", function: "هرم جنائزي ملكي", material: "الحجر الجيري", significance: "يوضح مرحلة تجريبية مهمة في تطوير شكل الهرم الكامل." },
  { id: "abu-simbel", name: "معبدا أبو سمبل", period: "الدولة الحديثة – الأسرة التاسعة عشرة", function: "معبدان منحوتان في الصخر", material: "الصخر الرملي", significance: "يرتبطان ببرنامج رمسيس الثاني الملكي والديني في النوبة." },,

  { id: "red", name: "الهرم الأحمر", period: "الدولة القديمة – الأسرة الرابعة", function: "هرم جنائزي ملكي", material: "الحجر الجيري", significance: "يرتبط بسنفرو في دهشور، ويعد من أقدم الأهرامات ذات الأوجه المستقيمة المكتملة." },
  { id: "sphinx", name: "أبو الهول بالجيزة", period: "الدولة القديمة – الأسرة الرابعة", function: "تمثال ملكي ضخم مرتبط بالمجمع الجنائزي", material: "الصخر الجيري الطبيعي", significance: "يجمع هيئة أسد ورأسًا بشريًا، وترتبط هويته غالبًا بخفرع مع استمرار نقاشات علمية حول تفاصيل التأريخ." },
  { id: "narmer", name: "لوحة نارمر", period: "بداية الأسرات – الأسرة الأولى", function: "لوحة احتفالية/ملكية", material: "حجر الشيست", significance: "تعرض مشاهد ملكية ورموزًا مرتبطة بتوحيد القطرين وبدايات الدولة." },
  { id: "rosetta", name: "حجر رشيد", period: "العصر البطلمي – 196 ق.م", function: "مرسوم ملكي مكتوب بثلاثة أنظمة كتابية", material: "حجر جرانوديوريت", significance: "أسهمت نصوصه المتوازية بالهيروغليفية والديموطيقية واليونانية في فك رموز الهيروغليفية." },
  { id: "tut-mask", name: "القناع الذهبي لتوت عنخ آمون", period: "الدولة الحديثة – الأسرة الثامنة عشرة", function: "قناع جنائزي", material: "ذهب ومواد مطعمة متعددة", significance: "جزء من تجهيزات دفن الملك، ويعرض مهارة الصياغة والرمزية الجنائزية." },
  { id: "senusret", name: "التمثال الواقف لسنوسرت الأول", period: "الدولة الوسطى – الأسرة الثانية عشرة", function: "تمثال ملكي", material: "حجر جيري", significance: "يمثل تقاليد تصوير الملك في الدولة الوسطى ويعكس استمرارية الرموز الملكية." },
  { id: "hat-shepsut", name: "تماثيل حتشبسوت", period: "الدولة الحديثة – الأسرة الثامنة عشرة", function: "تماثيل ملكية ودينية", material: "أحجار متنوعة", significance: "تكشف تنوع صور الملكة الرسمية وتحول تمثيلها بين هيئة أوزيرية وهيئة الملك." },
  { id: "canopic", name: "الأواني الكانوبية", period: "عصور مصرية متعددة", function: "حفظ الأحشاء ضمن تجهيزات التحنيط", material: "حجر وألباستر وفخار ومواد أخرى", significance: "ارتبطت بحماية الأحشاء وبأبناء حورس الأربعة، وتنوعت أشكالها عبر الزمن." },
  { id: "shabti", name: "تماثيل الأوشابتي", period: "الدولة الوسطى وما بعدها", function: "تماثيل جنائزية رمزية", material: "خشب وحجر وفخار وخزف", significance: "كان يُعتقد أنها تؤدي أعمالًا نيابة عن المتوفى في العالم الآخر، وتفاوتت أعدادها ونقوشها." },
  { id: "merneptah", name: "لوحة مرنبتاح", period: "الدولة الحديثة – الأسرة التاسعة عشرة", function: "لوحة نصر ملكية", material: "حجر جرانيت", significance: "تتضمن نصًا ملكيًا يذكر جماعة باسم إسرائيل ضمن سياق حملة عسكرية في كنعان." },
  { id: "senet", name: "لعبة السنت", period: "من الدولة القديمة وما بعدها", function: "لعبة لوحية", material: "خشب وعاج وحجر ومواد أخرى", significance: "كانت لعبة شعبية ذات دلالات اجتماعية ورمزية، وظهرت لاحقًا في سياقات جنائزية." },
  { id: "palette", name: "لوحة صيادين ما قبل الأسرات", period: "نقادة الثانية/الثالثة", function: "لوحة احتفالية أو تجميلية", material: "حجر", significance: "تساعد مناظرها على دراسة الرموز والسلطة والصيد والتعبير الفني قبل قيام الدولة." },
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
  },,

  {
    question: "ما الاسم القديم لقرية الحرفيين الذين عملوا في مقابر الملوك بطيبة؟",
    options: ["دير المدينة", "منف", "تانيس"], answer: 0,
    explanation: "دير المدينة كانت قرية متخصصة للحرفيين والعمال المهرة المرتبطين بمقابر وادي الملوك والملكات."
  },
  {
    question: "أي ملك ارتبط ببناء الهرم الأحمر في دهشور؟",
    options: ["سنفرو", "خفرع", "أمنحتب الثالث"], answer: 0,
    explanation: "الهرم الأحمر أحد مشروعات الملك سنفرو في دهشور."
  },
  {
    question: "ما اللغات أو أنظمة الكتابة الموجودة على حجر رشيد؟",
    options: ["الهيروغليفية والديموطيقية واليونانية", "الهيراطيقية والقبطية واللاتينية", "المسمارية واليونانية والقبطية"], answer: 0,
    explanation: "يحمل حجر رشيد مرسومًا بثلاث نسخ: الهيروغليفية والديموطيقية واليونانية."
  },
  {
    question: "ما الوظيفة الأساسية للأواني الكانوبية؟",
    options: ["حفظ الأحشاء المحنطة", "تخزين الحبوب", "حفظ الحبر"], answer: 0,
    explanation: "استخدمت الأواني الكانوبية لحفظ أحشاء المتوفى ضمن طقوس التحنيط، مع اختلاف الممارسات عبر العصور."
  },
  {
    question: "أي معبد اشتهر بنقوشه عن حورس في إدفو؟",
    options: ["معبد إدفو", "معبد الأقصر", "معبد حتشبسوت"], answer: 0,
    explanation: "معبد إدفو مكرس لحورس ويضم نصوصًا طقسية وأساطير ونقوشًا بطلمية."
  },
  {
    question: "أين نُقلت معابد فيلة بعد مشروع الإنقاذ؟",
    options: ["جزيرة أجيلكيا", "هضبة الجيزة", "جزيرة إلفنتين"], answer: 0,
    explanation: "نُقلت منشآت فيلة إلى جزيرة أجيلكيا لحمايتها من ارتفاع مياه بحيرة ناصر."
  },
  {
    question: "بماذا اشتهرت مدينة أخناتون في تل العمارنة؟",
    options: ["عبادة آتون والعاصمة الجديدة", "بناء الهرم الأكبر", "صناعة حجر رشيد"], answer: 0,
    explanation: "أسس أخناتون أخت آتون عاصمة جديدة ارتبطت بتركيز العبادة الرسمية على آتون."
  },
  {
    question: "ما الذي تسجله برديات دير المدينة عن إضراب العمال؟",
    options: ["احتجاجًا بسبب تأخر حصص المؤن", "اعتراضًا على بناء الأهرامات", "نزاعًا على تجارة البردي"], answer: 0,
    explanation: "تسجل وثائق من عهد رمسيس الثالث احتجاج العمال بسبب تأخر توزيع المؤن والأجور العينية."
  },
  {
    question: "ما اسم الإله الذي ارتبطت به منف ومؤسساتها الدينية؟",
    options: ["بتاح", "حورس", "خنوم"], answer: 0,
    explanation: "كانت منف مركزًا مهمًا لعبادة بتاح، إلى جانب آلهة أخرى."
  },
  {
    question: "ما الذي يميز لوحة مرنبتاح في الدراسات التاريخية؟",
    options: ["ذكر اسم إسرائيل في نص مصري", "أول خريطة لمصر", "قاموس هيروغليفي كامل"], answer: 0,
    explanation: "تتضمن اللوحة أقدم إشارة مصرية معروفة عادةً إلى جماعة باسم إسرائيل."
  },
  {
    question: "ما الوظيفة الرمزية لتماثيل الأوشابتي؟",
    options: ["القيام بأعمال نيابة عن المتوفى", "حراسة مخازن القمح", "تحديد حدود الحقول"], answer: 0,
    explanation: "وُضعت الأوشابتي ضمن التجهيزات الجنائزية لتؤدي أعمالًا نيابة عن المتوفى وفق المعتقدات المصرية."
  },
  {
    question: "ما الغرض من نقل معابد أبو سمبل في القرن العشرين؟",
    options: ["حمايتها من ارتفاع مياه بحيرة ناصر", "توسيع طريق تجاري", "ترميمها بعد حريق"], answer: 0,
    explanation: "نُقلت المعابد ضمن حملة إنقاذ آثار النوبة لحمايتها من مياه بحيرة ناصر بعد إنشاء السد العالي."
  },
];

const features: {
  id: FeatureId;
  icon: typeof Clock3;
  symbol: string;
  titleKey: keyof typeof heritageExperienceCopy.ar;
  descKey: keyof typeof heritageExperienceCopy.ar;
  art: string;
}[] = [
  { id: "timeline", icon: Clock3, symbol: "𓆣", titleKey: "timeline", descKey: "timelineDesc", art: "timeline" },
  { id: "map", icon: MapPinned, symbol: "𓊹", titleKey: "map", descKey: "mapDesc", art: "map" },
  { id: "compare", icon: GitCompareArrows, symbol: "𓏞", titleKey: "compare", descKey: "compareDesc", art: "compare" },
  { id: "notebook", icon: NotebookPen, symbol: "𓏛", titleKey: "notebook", descKey: "notebookDesc", art: "notebook" },
  { id: "detective", icon: SearchCheck, symbol: "𓂀", titleKey: "detective", descKey: "detectiveDesc", art: "detective" },
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
            <button key={id} type="button" className={`athara-experience-card athara-art-${art}`} onClick={() => setActive(id)}>
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
