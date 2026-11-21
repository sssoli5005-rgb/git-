import { describe, expect, it } from "vitest";

import {
  getRelevantKnowledgeAnswer,
  getRelevantKnowledgeSources,
  listKnowledgeTopics,
  retrieveRelevantKnowledge,
} from "./knowledge-base";

describe("retrieveRelevantKnowledge", () => {
  it("infers the typo in a Catholic-versus-Evangelical question from reviewed sources", () => {
    const answer = getRelevantKnowledgeAnswer([
      { role: "user", content: "إيه الفرق بين الانجليين و الكاثوليك؟" },
    ]);

    expect(answer.directAnswer).toContain("غالبًا كلمة «الانجليين»");
    expect(answer.directAnswer).toContain("مش الإنجليز");
    expect(answer.directAnswer).toContain("بابا روما");
    expect(answer.directAnswer).toContain("الأنجليكان");
    expect(answer.sources).toContainEqual(
      expect.objectContaining({
        organization: "World Evangelical Alliance",
        url: "https://worldea.org/who-we-are/who-are-evangelicals/",
      }),
    );
    expect(answer.sources).toContainEqual(
      expect.objectContaining({
        organization: "The Holy See",
        url: "https://www.vatican.va/archive/ENG0015/__P2A.HTM",
      }),
    );
  });

  it("answers the Karnak question from the Egyptian Ministry reference", () => {
    const answer = getRelevantKnowledgeAnswer([
      { role: "user", content: "ايه الي موجود في الكرنك ؟" },
    ]);

    expect(answer.directAnswer).toContain("مجمع كبير على الضفة الشرقية للأقصر");
    expect(answer.directAnswer).toContain("صالة الأعمدة الكبرى");
    expect(answer.directAnswer).toContain("البحيرة المقدسة");
    expect(answer.directAnswer).toContain("عيد الأوبت");
    expect(answer.sources).toContainEqual(
      expect.objectContaining({
        organization: "وزارة السياحة والآثار المصرية",
        url: "https://egymonuments.gov.eg/ar/archaeological-sites/karnak/",
      }),
    );
  });

  it("answers the Egyptian queens' hair question from reviewed archaeological and museum sources", () => {
    const answer = getRelevantKnowledgeAnswer([
      {
        role: "user",
        content: "إيه سر جمال ملكات الفراعنة؟ وإزاي كانوا بيحافظوا على شعرهم؟",
      },
    ]);

    expect(answer.directAnswer).toContain("مافيش سر جمال واحد");
    expect(answer.directAnswer).toContain("قاعدة شبكية");
    expect(answer.directAnswer).toContain("شمع النحل");
    expect(answer.directAnswer).toContain("لا تثبت أن كل الملكات حلقن شعرهن");
    expect(answer.sources).toContainEqual(
      expect.objectContaining({
        organization: "Internet Archaeology, University of York",
        url: "https://intarch.ac.uk/journal/issue42/6/3.cfm",
      }),
    );
    expect(answer.sources).toContainEqual(
      expect.objectContaining({
        organization: "The Metropolitan Museum of Art",
        url: "https://www.metmuseum.org/art/collection/search/590954",
      }),
    );
  });

  it("answers the Library of Alexandria question with qualified evidence about Caesar's fire", () => {
    const answer = getRelevantKnowledgeAnswer([
      { role: "user", content: "ما هي مكتبة الإسكندرية القديمة؟ ومن حرقها؟" },
    ]);

    expect(answer.directAnswer).toContain("بلوتارخ");
    expect(answer.directAnswer).toContain("48 ق.م.");
    expect(answer.directAnswer).toContain("لا تثبت وحدها");
    expect(answer.directAnswer).toContain("تدمير المكتبة كاملةً لشخص واحد معروف");
    expect(answer.sources).toContainEqual(
      expect.objectContaining({
        organization: "Perseus Digital Library, Tufts University",
        url: "https://www.perseus.tufts.edu/hopper/text?doc=Perseus%3Atext%3A1999.01.0244%3Achapter%3D49%3Asection%3D3",
      }),
    );
  });

  it("answers makeup and skincare questions with a concrete, limited artifact example", () => {
    const answer = getRelevantKnowledgeAnswer([
      {
        role: "user",
        content: "إيه اللي نعرفه من الآثار عن مكياج وعناية البشرة عند المصريات القدماء؟",
      },
    ]);

    expect(answer.directAnswer).toContain("أنبوبًا ومطبّقًا للكحل");
    expect(answer.directAnswer).toContain("لا تكفي وحدها لإعادة بناء روتين يومي كامل");
    expect(answer.sources).toContainEqual(
      expect.objectContaining({
        organization: "The Metropolitan Museum of Art",
        url: "https://www.metmuseum.org/art/collection/search/590954",
      }),
    );
  });

  it("answers the ancient Egyptian lipstick question with a qualified pigment recipe", () => {
    const answer = getRelevantKnowledgeAnswer([
      { role: "user", content: "والروج على أيامهم كان بيتعمل من إيه؟" },
    ]);

    expect(answer.directAnswer).toContain("المغرة الحمراء");
    expect(answer.directAnswer).toContain("ممزوجة براتنج");
    expect(answer.directAnswer).toContain("مش وصفة موحدة لكل الملكات");
    expect(answer.directAnswer).toContain("لا تثبت وجود فريق محدد");
    expect(answer.sources).toContainEqual(
      expect.objectContaining({
        organization: "National Geographic",
        url: "https://www.nationalgeographic.com/history/article/history-of-red-lipstick",
      }),
    );
  });

  it("handles the misspelled beetle-makeup question without overstating the Cleopatra claim", () => {
    const answer = getRelevantKnowledgeAnswer([
      { role: "user", content: "هل المصريات في مصر القديمة استخدموا حشرة الخنفسا لصنع الميكب؟" },
    ]);

    expect(answer.directAnswer).toContain("المغرة الحمراء");
    expect(answer.directAnswer).toContain("رواية صحفية غير مؤكدة أثريًا");
    expect(answer.directAnswer).toContain("لا دليلًا على أن المصريات عمومًا استخدمن الخنافس");
    expect(answer.sources).toContainEqual(
      expect.objectContaining({
        organization: "National Geographic",
        url: "https://www.nationalgeographic.com/history/article/history-of-red-lipstick",
      }),
    );
  });

  it("uses only reviewed discovery evidence instead of a general Saqqara summary", () => {
    const answer = getRelevantKnowledgeAnswer([
      { role: "user", content: "لسه فيه اكتشافات في الأهرامات؟ أقصد الجيزة وسقارة." },
    ]);

    expect(answer.content).toContain("قياسات أدق لممر خلف منطقة الشيفرون");
    expect(answer.content).toContain("لا يثبت وظيفته الأصلية");
    expect(answer.content).toContain("المصادر المراجعة المتاحة هنا لا تثبت أحدث كشف هناك");
    expect(answer.directAnswer).toBeUndefined();
    expect(answer.content).not.toContain("سقارة هي المقبرة الرئيسية لمدينة منف");
    expect(answer.sources).toContainEqual(
      expect.objectContaining({
        organization: "Nature Communications",
        url: "https://www.nature.com/articles/s41467-023-36351-0",
      }),
    );
  });

  it("retrieves the reviewed discovery answer for a Japanese question", () => {
    const answer = getRelevantKnowledgeAnswer(
      [{ role: "user", content: "ギザとサッカラのピラミッドで最近発見されたものはありますか？" }],
      1,
    );

    expect(answer.content).toContain("طوله نحو 9 أمتار");
    expect(answer.sources).toContainEqual(
      expect.objectContaining({
        url: "https://www.nature.com/articles/s41467-023-36351-0",
      }),
    );
  });

  it("does not inject discovery fallback facts into ordinary pyramid questions", () => {
    const answer = getRelevantKnowledgeAnswer([
      { role: "user", content: "How were the pyramids built?" },
    ]);

    expect(answer.content).not.toContain("قياسات أدق لممر خلف منطقة الشيفرون");
  });

  it("does not answer a specific Khufu mummy question with general pyramid discoveries", () => {
    const answer = getRelevantKnowledgeAnswer([
      {
        role: "user",
        content: "هل عُثر على مومياء خوفو؟ وما الفرق بين وجود تابوت في الهرم والعثور على مومياء؟",
      },
    ]);

    expect(answer.content).not.toContain("قياسات أدق لممر خلف منطقة الشيفرون");
    expect(answer.sources).not.toContainEqual(
      expect.objectContaining({
        url: "https://www.nature.com/articles/s41467-023-36351-0",
      }),
    );
  });

  it.each([
    "هل لسه في الاهرامات اكتشافات؟",
    "What new discoveries have been made at the Giza pyramids?",
    "¿Qué hallazgos recientes hay en las pirámides de Guiza y Saqqara?",
  ])("recognizes a discovery-question wording variation: %s", (question) => {
    const answer = getRelevantKnowledgeAnswer([{ role: "user", content: question }]);

    expect(answer.content).toContain("قياسات أدق لممر خلف منطقة الشيفرون");
    expect(answer.sources).toContainEqual(
      expect.objectContaining({ url: "https://www.nature.com/articles/s41467-023-36351-0" }),
    );
  });

  it("does not answer general Egyptian discovery questions with unrelated pyramid findings", () => {
    const answer = getRelevantKnowledgeAnswer([
      { role: "user", content: "What recent archaeological discoveries happened in Egypt?" },
    ]);

    expect(answer.content).toBe("");
  });

  it("keeps Rosetta knowledge available when the question mentions a discovery", () => {
    const answer = getRelevantKnowledgeAnswer([
      {
        role: "user",
        content: "حجر رشيد: ما تاريخه وسياق العثور عليه؟ وما دور توماس يونج وشامبليون؟",
      },
    ]);

    expect(answer.content).toContain("نسخًا متقابلة من مرسوم ملكي");
    expect(answer.content).toContain("توماس يونج");
    expect(answer.sources).toContainEqual(
      expect.objectContaining({ url: "https://www.britishmuseum.org/collection/object/Y_EA24" }),
    );
  });

  it("retrieves the Tutankhamun chamber evidence for a question phrased as a discovery", () => {
    const answer = getRelevantKnowledgeAnswer([
      {
        role: "user",
        content: "هل ثبت وجود غرفة خفية خلف الجدار الشمالي في مقبرة توت عنخ آمون KV62؟",
      },
    ]);

    expect(answer.content).toContain(
      "ولم تجد دراسة المسح الثالث المنشورة سنة 2019 دليلًا جيوفيزيائيًا",
    );
    expect(answer.content).toContain("عثر على الأختام سليمة");
    expect(answer.sources).toContainEqual(
      expect.objectContaining({
        url: "https://www.griffith.ox.ac.uk/discoveringTut/journals-and-diaries/",
      }),
    );
  });

  it("answers the Akhenaten evidence question from the reviewed Amarna references", () => {
    const answer = getRelevantKnowledgeAnswer([
      {
        role: "user",
        content:
          "هل إصلاح إخناتون يثبت أنه فرض التوحيد بالمعنى الحديث؟ ناقش الأدلة من نقوش العمارنة.",
      },
    ]);

    expect(answer.directAnswer).toContain("لا تثبت وحدها أن كل سكان مصر تبنوا توحيدًا");
    expect(answer.directAnswer).toContain("محو أسماء وصور آمون");
    expect(answer.sources).toContainEqual(
      expect.objectContaining({
        url: "https://www.ucl.ac.uk/museums-static/digitalegypt/amarna/belief.html",
      }),
    );
  });

  it("answers the Imhotep part of a detailed Djoser question instead of only summarizing mastabas", () => {
    const answer = getRelevantKnowledgeAnswer([
      {
        role: "user",
        content:
          "هل يُعد هرم زوسر أقدم هرم حجري كامل أم أقدم مبنى حجري كبير؟ ما الفرق بين الهرم المدرج والمقبرة المصطبة، وما الدليل الذي يربط إمحوتب بالمشروع؟",
      },
    ]);

    expect(answer.directAnswer).toContain("يُنسب تصميم الهرم تقليديًا إلى إمحوتب");
    expect(answer.directAnswer).toContain("لا يقدمان وحدهما دليلًا وثائقيًا مباشرًا");
    expect(answer.sources).toContainEqual(
      expect.objectContaining({
        url: "https://egymonuments.gov.eg/en/archaeological-sites/saqqara/",
      }),
    );
  });

  it("distinguishes Cyril's miaphysite formula from Eutychianism in the Chalcedonian dispute", () => {
    const answer = getRelevantKnowledgeAnswer(
      [
        {
          role: "user",
          content:
            "في مجمع أفسس الأول (431م) ومجمع خلقيدونية (451م)، دار جدل لاهوتي حاد حول مصطلحات يونانية دقيقة لوصف طبيعة السيد المسيح. السؤال الدقيق هنا: ما هو الفرق الجوهري بين تعبير 'طبيعة واحدة متجسدة لله الكلمة' (Mia Physis) الذي استخدمه القديس كيرلس السكندري، وبين مفهوم 'الطبيعة الواحدة' (Monophysis) الذي نُسب لأوطاخي؟ ولماذا رفضت الكنيسة القبطية الأرثوذكسية الصيغة الخلقيدونية رغم أنها لا تتبنى عقيدة أوطاخي؟",
        },
      ],
      1,
    );

    expect(answer.directAnswer).toContain(
      "لا يصح مساواة هذا الاستخدام الكيرلسي تلقائيًا بمذهب أوطاخي",
    );
    expect(answer.directAnswer).toContain("كامل في لاهوته وكامل في ناسوته");
    expect(answer.directAnswer).toContain("بلا اختلاط ولا تغيير ولا انقسام ولا انفصال");
    expect(answer.directAnswer).toContain("لا يجعل الخلاف مجرد اختلاف ترجمة");
    expect(answer.directAnswer).not.toContain("الكنيسة القبطية تتبنى أوطاخي");
    expect(answer.sources).toContainEqual(
      expect.objectContaining({
        url: "https://sourcebooks.fordham.edu/basis/chalcedon.asp",
      }),
    );
    expect(answer.sources).toContainEqual(
      expect.objectContaining({
        url: "https://st-takla.org/books/en/pope-shenouda-iii/nature-of-christ/eutychianism.html",
      }),
    );
  });

  it("answers broad ancient Egyptian religion questions with context-specific references", () => {
    const answer = getRelevantKnowledgeAnswer(
      [{ role: "user", content: "ما معتقدات المصريين القدماء عن الآلهة والطقوس؟" }],
      1,
    );

    expect(answer.directAnswer).toContain("المعتقدات والطقوس اتغيرت عبر العصور");
    expect(answer.directAnswer).toContain("لا تمثل بالضرورة تجربة كل فرد أو كل مجتمع");
    expect(answer.sources).toContainEqual(
      expect.objectContaining({
        url: "https://www.ucl.ac.uk/museums-static/digitalegypt/religion/deitiesindex.html",
      }),
    );
  });

  it("answers who built the Great Hypostyle Hall and distinguishes its construction phases", () => {
    const answer = getRelevantKnowledgeAnswer([
      { role: "user", content: "في الكرنك، مين بنى صالة الأعمدة الكبرى؟ وإيه مراحل بنائها؟" },
    ]);

    expect(answer.directAnswer).toContain("بدأت أعمال بنائها في عهد أمنحتب الثالث");
    expect(answer.directAnswer).toContain(
      "البناء الرئيسي والزخارف ارتبطا بعهد سيتي الأول ورمسيس الثاني",
    );
    expect(answer.directAnswer).not.toContain("مش كله اتبنى في عهد ملك واحد");
    expect(answer.sources).toContainEqual(
      expect.objectContaining({
        organization: "وزارة السياحة والآثار المصرية",
        url: "https://egymonuments.gov.eg/ar/archaeological-sites/karnak/",
      }),
    );
  });

  it("answers the Luxor archaeological-sites question from reviewed sources", () => {
    const answer = getRelevantKnowledgeAnswer([
      { role: "user", content: "ايه الاماكن الاثريه الي الاقيها في الاقصر ؟" },
    ]);

    expect(answer.directAnswer).toContain("معبدا الكرنك والأقصر");
    expect(answer.directAnswer).toContain("وادي الملوك ووادي الملكات");
    expect(answer.directAnswer).toContain("معبد حتشبسوت في الدير البحري");
    expect(answer.directAnswer).toContain("معبد مدينة هابو");
    expect(answer.sources).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          organization: "UNESCO World Heritage Centre",
          url: "https://whc.unesco.org/en/list/87/",
        }),
        expect.objectContaining({
          organization: "وزارة السياحة والآثار المصرية",
          url: "https://egymonuments.gov.eg/ar/monuments/hatshepsut-temple/",
        }),
      ]),
    );
  });

  it("retrieves sourced facts about Saint Catherine and distinguishes the monastery from its wider area", () => {
    const messages = [{ role: "user" as const, content: "و ايه الي موجود في سانت كاترين ؟" }];
    const answer = getRelevantKnowledgeAnswer(messages);
    expect(answer.directAnswer).toContain("بين 548 و565 ميلاديًا");
    expect(answer.directAnswer).toContain("كنيسة العليقة المشتعلة");
    expect(answer.directAnswer).toContain("مسجدًا فاطميًا");
    expect(answer.directAnswer).toContain("نحو 6,000 مخطوطة");
    expect(answer.directAnswer).toContain("جبل موسى");
    expect(answer.directAnswer).toContain("60,100 هكتار");
    expect(answer.directAnswer).toContain("التمييز بين مدينة سانت كاترين، والدير نفسه");
    expect(answer.sources).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          organization: "Egyptian Ministry of Tourism and Antiquities",
          url: "https://egymonuments.gov.eg/en/world-heritage/saint-catherine-s-monastery-and-its-surrounding-area",
        }),
        expect.objectContaining({
          organization: "UNESCO World Heritage Centre",
          url: "https://whc.unesco.org/en/list/954/",
        }),
      ]),
    );
  });

  it("retrieves reviewed Saint Catherine knowledge after a one-character place-name typo", () => {
    const answer = getRelevantKnowledgeAnswer([{ role: "user", content: "سانت كتيرين فيها ايه؟" }]);
    expect(answer.directAnswer).toContain("دير سانت كاترين");
    expect(answer.directAnswer).toContain("كنيسة العليقة المشتعلة");
    expect(answer.sources).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ url: "https://whc.unesco.org/en/list/954/" }),
      ]),
    );
  });

  it("retrieves the biblical account of Joseph's burial with the exact passages", () => {
    const answer = getRelevantKnowledgeAnswer([{ role: "user", content: "أين جسد يوسف الصديق؟" }]);

    expect(answer.directAnswer).toContain("سفر التكوين 50:26");
    expect(answer.directAnswer).toContain("سفر الخروج 13:19");
    expect(answer.directAnswer).toContain("سفر يشوع 24:32");
    expect(answer.directAnswer).toContain("شكيم");
    expect(answer.directAnswer).toContain("لا تثبت أن رفاته عُثر عليها");
    expect(answer.sources).toContainEqual(
      expect.objectContaining({
        organization: "Bible Gateway",
        url: "https://www.biblegateway.com/passage/?search=Genesis+50%3A24-26%2CExodus+13%3A19%2CJoshua+24%3A32&version=NIV",
      }),
    );
  });

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
    expect(answer.directAnswer).toContain("لا يثبت مساواة في السلطة السياسية أو استقلال الحكم");
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

  it.each([
    ["إزاي أعرف اتجاه قراءة الهيروغليفية؟ هل لازم أبدأ من اليمين دائمًا؟", "وجوه البشر والحيوانات"],
    ["إيه الفرق بين العلامة الصوتية والعلامة المحددة في الهيروغليفية؟", "Determinative"],
    [
      "هل كل علامة هيروغليفية تمثل حرفًا واحدًا؟ اشرح أحادية وثنائية وثلاثية الصوت.",
      "أحادية أو ثنائية أو ثلاثية الصوامت",
    ],
    ["هل أكتب اسم رمسيس الثاني بالهيروغليفية حرفًا بحرف؟", "تقريبًا صوتيًا"],
  ])("retrieves a focused, sourced hieroglyphic answer for %s", (question, expected) => {
    const answer = getRelevantKnowledgeAnswer([{ role: "user", content: question }], 1);

    expect(answer.content).toContain(expected);
    expect(answer.sources).toContainEqual(
      expect.objectContaining({
        organization: "University College London",
        url: expect.stringContaining("digitalegypt/writing/"),
      }),
    );
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
