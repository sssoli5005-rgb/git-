import { describe, expect, it } from "vitest";

import {
  getRelevantKnowledgeAnswer,
  getRelevantKnowledgeSources,
  listKnowledgeTopics,
  retrieveRelevantKnowledge,
} from "./knowledge-base";

describe("retrieveRelevantKnowledge", () => {
  it("does not inject psychology material into ordinary greetings", () => {
    const result = retrieveRelevantKnowledge(
      [
        { role: "user", content: "عايزة أفهم التلاعب النفسي في العلاقات" },
        { role: "assistant", content: "ممكن نتكلم عنه ونوضح علاماته" },
        { role: "user", content: "إزيك؟ عاملة إيه النهارده؟" },
      ],
      "ar",
    );

    expect(result).toBe("");
  });

  it("retrieves a relevant topic when the user asks about it directly", () => {
    const result = retrieveRelevantKnowledge(
      [{ role: "user", content: "إيه علامات التلاعب النفسي؟" }],
      "ar",
    );

    expect(result).toContain("أنماط التلاعب النفسي والحماية منها");
    expect(result).toContain("بالمصري الطبيعي");
  });

  it("retrieves sourced, nuanced information about food in ancient Egypt", () => {
    const messages = [{ role: "user" as const, content: "ايه اكلات الفراعنه" }];
    const result = retrieveRelevantKnowledge(messages, "ar");
    const sources = getRelevantKnowledgeSources(messages);

    expect(result).toContain("توزيع الخبز والبيرة كحصص غذائية");
    expect(result).toContain("مش وصفة موحدة لكل المصريين");
    expect(result).toContain("مش دليل لوحدها إن كل الناس كانت بتاكل نفس الأصناف يوميًا");
    expect(sources).toContainEqual(
      expect.objectContaining({
        organization: "Ancient Egypt Research Associates",
        url: "https://aeraweb.org/feeding-pyramid-workers/",
      }),
    );
    expect(sources).toContainEqual(
      expect.objectContaining({
        organization: "Cahiers de la Méditerranée / OpenEdition",
        url: "https://books.openedition.org/pcjb/2179?lang=en",
      }),
    );
    expect(result).toContain("ماينفعش ننسب أكلات محددة");
  });

  it("retrieves a direct, sourced answer separating deity iconography from style and theology", () => {
    const messages = [
      {
        role: "user" as const,
        content:
          "لماذا توجد اختلافات في تصوير نفس الإله المصري القديم بين عصر وآخر؟ وهل تغير شكل الإله بسبب تطور الفن فقط، أم أن التغيرات السياسية والدينية أثرت أيضاً في طريقة تصويره؟ اشرح بمثال تاريخي حقيقي.",
      },
    ];
    const answer = getRelevantKnowledgeAnswer(messages);

    expect(answer.directAnswer).toContain("الأسلوب الفني");
    expect(answer.directAnswer).toContain("الهيئة الرمزية");
    expect(answer.directAnswer).toContain("عصر العمارنة");
    expect(answer.directAnswer).toContain("أشعة تنتهي بأيدٍ");
    expect(answer.directAnswer).toContain("غير محدد");
    expect(answer.directAnswer).not.toContain("كان آمون يُصوّر برأس ثور");
    expect(answer.sources).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          organization: "University College London",
          url: "https://www.ucl.ac.uk/museums-static/digitalegypt/amarna/ideology.html",
        }),
        expect.objectContaining({
          url: "https://www.ucl.ac.uk/museums-static/digitalegypt/religion/deitiesindex.html",
        }),
      ]),
    );
  });

  it("uses sourced Abu Simbel facts without inventing the small temple facade details", () => {
    const answer = getRelevantKnowledgeAnswer([
      {
        role: "user",
        content:
          "اشرح الفرق بين معبد أبو سمبل الكبير ومعبد نفرتاري الصغير: اتبنى كل واحد لمين وليه؟",
      },
    ]);

    expect(answer.directAnswer).toContain("أربعة تماثيل ضخمة جالسة");
    expect(answer.directAnswer).toContain("مكرس لحتحور والملكة نفرتاري");
    expect(answer.directAnswer).toContain("لا تحدد عدد تماثيل واجهة المعبد الصغير أو وضعياتها");
    expect(answer.directAnswer).not.toContain("ثلاثة لرمسيس وثلاثة لنفرتاري");
    expect(answer.sources).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          organization: "Egyptian Ministry of Tourism and Antiquities",
          url: "https://egymonuments.gov.eg/en/archaeological-sites/abu-simbel/",
        }),
        expect.objectContaining({
          organization: "UNESCO World Heritage Centre",
          url: "https://whc.unesco.org/en/list/88/",
        }),
      ]),
    );
  });

  it("keeps Abu Simbel evidence for contextual follow-ups without repeating a canned answer", () => {
    const answer = getRelevantKnowledgeAnswer([
      {
        role: "user",
        content:
          "اشرح الفرق بين معبد أبو سمبل الكبير ومعبد نفرتاري الصغير: اتبنى كل واحد لمين وليه؟",
      },
      {
        role: "assistant",
        content: "المعبد الصغير مكرس لحتحور ونفرتاري، وتماثيلها بمقياس تماثيل الملك.",
      },
      {
        role: "user",
        content: "هل ده يثبت إن نفرتاري كان ليها نفس السلطة السياسية لرمسيس؟",
      },
    ]);

    expect(answer.directAnswer).toBeUndefined();
    expect(answer.content).toContain("المعبد الصغير شماله فهو مكرس لحتحور والملكة نفرتاري");
    expect(answer.content).toContain("لا تحدد عدد تماثيل واجهة المعبد الصغير أو وضعياتها");
    expect(answer.sources).toContainEqual(
      expect.objectContaining({
        url: "https://egymonuments.gov.eg/en/archaeological-sites/abu-simbel/",
      }),
    );
  });

  it.each([
    ["هل أكلوا المومياوات كدواء؟", "استخدام ما سُمّي أوروبيًا «موميا» كدواء"],
    ["هل نابليون كسر أنف أبو الهول؟", "يُظهر الأنف مفقودًا قبل الحملة الفرنسية"],
    ["هل في غرفة سرية وراء مقبرة توت؟", "وجود غرفة مخفية لم يثبت"],
  ])("retrieves a grounded Egyptian-heritage rumor: %s", (question, expected) => {
    const result = retrieveRelevantKnowledge([{ role: "user", content: question }], "ar");

    expect(result).toContain(expected);
    expect(getRelevantKnowledgeSources([{ role: "user", content: question }])).not.toHaveLength(0);
  });

  it("retrieves a sourced starter set for Egyptian stories and rumors", () => {
    const messages = [{ role: "user" as const, content: "احكيلي حكايات وأسرار الفراعنة" }];
    const result = retrieveRelevantKnowledge(messages, "ar");
    const sources = getRelevantKnowledgeSources(messages);

    expect(result).toContain("المومياوات دواء");
    expect(result).toContain("نابليون كسر أنف أبي الهول");
    expect(result).toContain("غرفة نفرتيتي خلف مقبرة توت");
    expect(result).toContain("لا تقل إن الرادار أثبت استحالة وجود أي فراغ");
    expect(sources).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ organization: "Manchester University Press" }),
        expect.objectContaining({ organization: "Internet Archive" }),
        expect.objectContaining({ organization: "Journal of Cultural Heritage" }),
      ]),
    );
  });

  it("keeps the topic available for a clear follow-up question", () => {
    const result = retrieveRelevantKnowledge(
      [
        { role: "user", content: "عايزة أفهم التلاعب النفسي في العلاقات" },
        { role: "assistant", content: "خلينا نفرق بين الخلاف والتلاعب المتكرر." },
        { role: "user", content: "طب أعمل إيه؟" },
      ],
      "ar",
    );

    expect(result).toContain("أنماط التلاعب النفسي والحماية منها");
  });

  it("does not carry an old topic into an unrelated new question", () => {
    const result = retrieveRelevantKnowledge(
      [
        { role: "user", content: "اشرحلي لغة الجسد" },
        { role: "assistant", content: "لغة الجسد إشارات محتملة مش دليل قاطع." },
        { role: "user", content: "رشحلي فيلم كوميدي" },
      ],
      "ar",
    );

    expect(result).toBe("");
  });

  it("retrieves sourced Saqqara facts and exact university and UNESCO references", () => {
    const messages = [{ role: "user" as const, content: "إيه أهم الآثار اللي في سقاره؟" }];
    const result = retrieveRelevantKnowledge(messages, "ar");
    const sources = getRelevantKnowledgeSources(messages);

    expect(result).toContain("سقارة هي المقبرة الرئيسية لمدينة منف");
    expect(result).toContain("لا تنسب كل آثار جبانة منف إلى سقارة وحدها");
    expect(sources).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          organization: "University College London",
          url: "https://www.ucl.ac.uk/museums-static/digitalegypt/saqqara/index.html",
        }),
        expect.objectContaining({
          organization: "UNESCO World Heritage Centre",
          url: "https://whc.unesco.org/en/list/86/",
        }),
      ]),
    );
  });

  it("keeps the previous heritage topic available when the user asks for its sources", () => {
    const messages = [
      { role: "user" as const, content: "إيه أهم الآثار اللي في سقارة؟" },
      { role: "assistant" as const, content: "سقارة فيها مقابر وأهرامات." },
      { role: "user" as const, content: "المصادر؟" },
    ];

    expect(getRelevantKnowledgeSources(messages)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ organization: "UNESCO World Heritage Centre" }),
      ]),
    );
  });

  it("deduplicates source links across matching heritage entries", () => {
    const sources = getRelevantKnowledgeSources([
      { role: "user", content: "احكيلي عن هرم زوسر في سقارة" },
    ]);

    expect(
      sources.filter((source) => source.url === "https://whc.unesco.org/en/list/86/"),
    ).toHaveLength(1);
  });

  it("retrieves university sources that distinguish Egyptian language stages and scripts", () => {
    const messages = [{ role: "user" as const, content: "ايه الفرق بين الهيروغليفية والقبطية؟" }];
    const result = retrieveRelevantKnowledge(messages, "ar");
    const sources = getRelevantKnowledgeSources(messages);

    expect(result).toContain("أنظمة كتابة وليست أسماء للغة منفصلة");
    expect(sources).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          organization: "University College London",
          url: "https://www.ucl.ac.uk/museums-static/digitalegypt/writing/index.html",
        }),
        expect.objectContaining({
          url: "https://www.ucl.ac.uk/museums-static/digitalegypt/writing/coptic.html",
        }),
      ]),
    );
  });

  it("retrieves a sourced distinction between Egyptian writing systems and their uses", () => {
    const messages = [
      {
        role: "user" as const,
        content:
          "ما الفرق بين الهيروغليفية والهيراطيقية والديموطيقية؟ هل هي لغة دينية أم أنظمة كتابة؟",
      },
    ];
    const result = retrieveRelevantKnowledge(messages, "ar");
    const sources = getRelevantKnowledgeSources(messages);

    expect(result).toContain("أنظمة كتابة للغة المصرية");
    expect(result).toContain("مرسومًا رسميًا");
    expect(result).toContain("الأدب والنصوص الدينية");
    expect(result).toContain("تداخلت استخدامات الخطوط");
    expect(sources).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          organization: "University College London",
          url: "https://www.ucl.ac.uk/museums-static/digitalegypt/writing/index.html",
        }),
        expect.objectContaining({
          organization: "The British Museum",
          url: "https://www.britishmuseum.org/collection/object/Y_EA24",
        }),
      ]),
    );
  });

  it("explains early Egyptian writing as a tool of administration without overstating the evidence", () => {
    const messages = [
      {
        role: "user" as const,
        content:
          "كيف ساعدت الكتابة في تثبيت سلطة الملك وإدارة الأقاليم بعد توحيد مصر العليا والسفلى؟",
      },
    ];
    const answer = retrieveRelevantKnowledge(messages, "ar");
    const sources = getRelevantKnowledgeSources(messages);

    expect(answer).toContain("أسماء وألقاب");
    expect(answer).toContain("الزيت وكميته وجودته");
    expect(answer).toContain("لا يثبت وحده أن كل إقليم أُدير بالطريقة نفسها");
    expect(sources).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          organization: "University College London",
          url: "https://www.ucl.ac.uk/museums-static/digitalegypt/administration/index.html",
        }),
        expect.objectContaining({
          url: "https://www.ucl.ac.uk/museums-static/digitalegypt/writing/tablets.html",
        }),
      ]),
    );
  });

  it("explains hieroglyphic sign functions with checked examples and corrects common errors", () => {
    const result = retrieveRelevantKnowledge(
      [
        {
          role: "user",
          content: "اشرحلي العلامات المعجمية والصوتية والتحديدية في الهيروغليفية",
        },
      ],
      "ar",
    );

    expect(result).toContain("علامة البيت 𓉐");
    expect(result).toContain("علامة الفم 𓂋");
    expect(result).toContain("لها القيمة الصوتية الأحادية r");
    expect(result).toContain("أما رع فهو اسم الإله");
    expect(result).toContain("pr هو قيمة صوتية عند استخدامها كفونوجرام");
    expect(result).toContain("لا تعمم قيمة واحدة على كل علامة مرسومة كثعبان");
    expect(result).toContain("صامتين أو ثلاثة");
    expect(result).toContain("المصري القديم ما كانش بيكتب الضمائر بس");
    expect(result).toContain("لا يعطي نطقًا كاملًا مؤكدًا للحركات القديمة");
  });

  it("distinguishes the Greek meaning of hieroglyphs from hieratic and religious use", () => {
    const result = retrieveRelevantKnowledge(
      [{ role: "user", content: "لماذا أطلق عليها اسم الكتابة المقدسة؟" }],
      "ar",
    );

    expect(result).toContain("تسمية يونانية قديمة");
    expect(result).toContain("النقوش المقدسة");
    expect(result).toContain("الكتابة الكهنوتية");
    expect(result).toContain("لا يصح وصف كل نصوصها بأنها دينية");
  });

  it("dates early Egyptian writing without claiming priority over cuneiform or Arabic descent", () => {
    const result = retrieveRelevantKnowledge(
      [
        {
          role: "user",
          content: "إيه أقدم كتابة مصرية؟ وهل الهيروغليفية اتحولت للحروف العربية؟",
        },
      ],
      "ar",
    );

    expect(result).toContain("3300–3200 ق.م.");
    expect(result).toContain("ظهور الكتابة المصرية والمسمارية في بلاد الرافدين متقارب زمنيًا");
    expect(result).toContain("الكتابة الهيروغليفية لم تتحول إلى الحروف العربية");
  });

  it("qualifies the traditional count of uniliteral values", () => {
    const result = retrieveRelevantKnowledge(
      [{ role: "user", content: "كام علامة أحادية الصوت في الهيروغليفية؟" }],
      "ar",
    );

    expect(result).toContain("نحو 24 قيمة أحادية الصامت");
    expect(result).toContain("مش عدد كل الأشكال الهيروغليفية عبر العصور");
  });

  it("does not claim every royal name must appear inside a cartouche", () => {
    const result = retrieveRelevantKnowledge(
      [{ role: "user", content: "هل كل اسم ملك أو ملكة لازم يكون داخل خرطوش؟" }],
      "ar",
    );

    expect(result).toContain("مش شرطًا يظهر حول كل اسم ملك أو ملكة");
    expect(result).toContain("قرينة مهمة");
  });

  it("describes the Rosetta Stone texts as parallel versions and credits Young", () => {
    const result = retrieveRelevantKnowledge(
      [
        {
          role: "user",
          content: "ما هو حجر رشيد؟ وما دور توماس يونج وشامبليون في فك الهيروغليفية؟",
        },
      ],
      "ar",
    );

    expect(result).toContain("نسخًا متقابلة من مرسوم ملكي");
    expect(result).toContain("مش بالضرورة متطابقة حرفيًا");
    expect(result).toContain("توماس يونج");
    expect(result).toContain("قبل شامبليون");
  });

  it("explains mastaba, step-pyramid, and smooth-sided pyramid development without overgeneralizing", () => {
    const result = retrieveRelevantKnowledge(
      [
        {
          role: "user",
          content:
            "إيه الفرق بين المصطبة والهرم المدرج والهرم الكامل؟ وإيه التطور المعماري اللي حصل بينهم؟",
        },
      ],
      "ar",
    );

    expect(result).toContain("مش أقدم شكل للدفن في مصر على الإطلاق");
    expect(result).toContain("ببئر أو ممر");
    expect(result).toContain("مش كل مصطبة لها فتحة رأسية من السقف");
    expect(result).toContain("مجرد ست مصاطب منفصلة");
    expect(result).toContain("الهرم الأحمر لسنفرو في دهشور");
  });

  it("qualifies the proposed reason for the Bent Pyramid's angle change", () => {
    const result = retrieveRelevantKnowledge(
      [
        {
          role: "user",
          content: "إيه الفرق بين الهرم المنحني والهرم الأحمر في دهشور؟ وليه اتغيرت زاويته؟",
        },
      ],
      "ar",
    );

    expect(result).toContain("54 و43 درجة");
    expect(result).toContain("أول هرم كبير مكتمل ذي أوجه ملساء");
    expect(result).toContain("ليس محسومًا تمامًا");
    expect(result).toContain("لا ينبغي عرض هذا السبب كحقيقة مؤكدة");
  });
});

describe("psychology knowledge coverage", () => {
  it("exposes the full set of documented knowledge topics", () => {
    const topics = listKnowledgeTopics();
    expect(topics.length).toBeGreaterThanOrEqual(37);
    expect(topics.some((topic) => topic.title.includes("المرأة الصارخة"))).toBe(true);
    expect(new Set(topics.map((topic) => topic.id)).size).toBe(topics.length);
  });

  it.each([
    ["التعلق القلق", "أنماط التعلق"],
    ["CBT", "العلاج المعرفي السلوكي"],
    ["تنظيم المشاعر", "تنظيم المشاعر والضغط"],
    ["التواصل الفعال", "التواصل الفعال والاستماع"],
    ["الإقناع", "التأثير والإقناع الأخلاقي"],
    ["تحليل الشخصية", "الشخصية والفروق الفردية"],
    ["التسويف", "العادات والدافعية والتغيير"],
    ["لغة الجسد", "الإشارات الاجتماعية ولغة الجسد"],
    ["الابتزاز العاطفي", "الابتزاز العاطفي"],
    ["love bombing", "الإغراق العاطفي"],
    ["سبب المشكلة", "فهم المشكلة من جذورها"],
    ["إعجاب", "التعارف وبداية التواصل"],
    ["gaslighting", "التشكيك في الواقع"],
    ["حدود شخصية", "الحدود والتواصل الواضح"],
    ["قراءة الأفكار", "التحيزات والأفكار التلقائية"],
    ["أتصالح", "إصلاح الخلاف"],
    ["ذكاء اجتماعي", "الذكاء الاجتماعي والتعامل مع المواقف"],
    ["علاقة صحية", "العلاقات الصحية والإنذار المبكر"],
    ["الهيروغليفية المصرية", "أساسيات الكتابة الهيروغليفية المصرية"],
    ["اتجاه قراءة النقش", "اتجاه قراءة النقوش الهيروغليفية"],
    ["العلامات الثنائية والثلاثية", "أنواع العلامات الهيروغليفية"],
    ["الكارتوش", "الكارتوش والأسماء الملكية"],
    ["حجر رشيد", "حجر رشيد وفك رموز الهيروغليفية"],
    ["اكتب اسمي بالهيروغليفية", "حدود كتابة الأسماء الحديثة بالهيروغليفية"],
    ["حلل صورة نقش هيروغليفي", "تحليل صورة نقش هيروغليفي بأمانة علمية"],
    ["آخر نقش هيروغليفي", "تاريخ استخدام الهيروغليفية"],
    ["هل الترجمة صحيحة", "التحقق من معلومات الهيروغليفية ومراجعها"],
  ])("retrieves the relevant knowledge for %s", (query, expectedTitle) => {
    const result = retrieveRelevantKnowledge([{ role: "user", content: query }], "ar");
    expect(result).toContain(expectedTitle);
  });
  it.each([
    ["هو بيبصلي كتير، هل ده معناه إنه معجب؟", "الإشارات الاجتماعية ولغة الجسد"],
    ["حاسه إنه بيشككني في ذاكرتي وبيقول إني بتوهم", "التشكيك في الواقع"],
    ["بيقول لو بتحبيني لازم تعملي كذا وإلا هيسيبني", "الابتزاز العاطفي"],
    ["مستعجل في الحب وبيوعدني بحاجات كبيرة من أول أسبوع", "الإغراق العاطفي"],
    ["عايزة أحط حدود وأقول لا من غير تأنيب ضمير", "الحدود والتواصل الواضح"],
    ["عندي تفكير كارثي وبقرأ أفكار الناس", "التحيزات والأفكار التلقائية"],
    ["مش قادرة أهدى من القلق والانفعال", "تنظيم المشاعر والضغط"],
    ["إزاي أصلح خلاف مع صاحبتي؟", "إصلاح الخلاف"],
    ["إزاي أقنع حد من غير ضغط؟", "التأثير والإقناع الأخلاقي"],
    ["بسوّف ومش قادرة ألتزم بعادة جديدة", "العادات والدافعية والتغيير"],
  ])("retrieves useful evidence-informed guidance for %s", (query, topic) => {
    const result = retrieveRelevantKnowledge([{ role: "user", content: query }], "ar");
    expect(result).toContain(topic);
    expect(result).toContain("Distinguish evidence from hypotheses");
  });

  it.each([
    ["حكايات وأسرار", "منهج التحقق من حكايات وأسرار الفراعنة"],
    ["هل كائنات فضائية بنت الأهرامات؟", "ادعاء أن كائنات فضائية بنت الأهرامات"],
    ["هل لعنة الفراعنة حقيقية؟", "لعنة الفراعنة ومقبرة توت عنخ آمون"],
    ["احكيلي أسطورة إيزيس وأوزوريس", "الأساطير المصرية القديمة"],
    ["هل الفراعنة كانوا عمالقة؟", "ادعاء وجود عمالقة من الفراعنة"],
    ["أصل كليوباترا إيه؟", "أصل كليوباترا السابعة وهويتها"],
    ["هل فيه مدينة سرية تحت الأهرامات؟", "عمر أبو الهول والغرف السرية تحت الأهرامات"],
    ["إيه حقيقة التحنيط والسحر؟", "التحنيط والسحر في مصر القديمة"],
    ["هل كان عند الفراعنة كهرباء؟", "ادعاء أن المصريين القدماء امتلكوا كهرباء حديثة"],
  ])("retrieves Egyptian legend fact-check material for %s", (query, expectedTitle) => {
    const result = retrieveRelevantKnowledge([{ role: "user", content: query }], "ar");
    expect(result).toContain(expectedTitle);
  });

  it("clearly treats YouTube as a discovery source, not historical proof", () => {
    const result = retrieveRelevantKnowledge(
      [{ role: "user", content: "إيه اللي بيتقال على يوتيوب عن الفراعنة وهل هو موثق؟" }],
      "ar",
    );
    expect(result).toContain("يوتيوب ومواقع التواصل مصادر لاكتشاف الادعاءات");
    expect(result).toContain("مصادر المتاحف والجامعات");
  });

  it("does not frame a single body-language cue as proof of attraction", () => {
    const result = retrieveRelevantKnowledge(
      [{ role: "user", content: "لغة الجسد والنظرات هل تثبت الإعجاب؟" }],
      "ar",
    );
    expect(result).toContain("مش دليل قاطع");
    expect(result).toContain("ما تحكمش من علامة واحدة");
  });
});
