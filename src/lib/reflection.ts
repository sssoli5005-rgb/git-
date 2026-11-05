// Rule-based demo "reflection" engine — no external APIs, no real AI.
// Detects the dominant theme of the user's message using keyword matching
// across all six supported languages, so the localized templates in
// src/i18n/translations.ts can render a structured response.

export type Category =
  | "decision"
  | "anxiety"
  | "sadness"
  | "anger"
  | "loneliness"
  | "overwhelm"
  | "positive"
  | "general";

// Checked in order: the first matching category wins.
const KEYWORDS: ReadonlyArray<[Category, string[]]> = [
  [
    "decision",
    [
      "قرار", "أقرر", "بقرر", "اختيار", "أختار",
      "decide", "decision", "choice", "choose", "dilemma", "torn between",
      "choisir", "décid", "décision", "hésite",
      "decidir", "decisión", "opción", "elegir", "dudo",
      "entscheid", "wählen", "wahl", "schwanke",
      "决定", "选择", "抉择",
    ],
  ],
  [
    "anxiety",
    [
      "خوف", "أخاف", "خايف", "قلق", "متوتر", "توتر", "رعب", "مخاطرة",
      "afraid", "fear", "anxious", "anxiety", "worry", "worried", "scared", "nervous", "panic",
      "peur", "angoiss", "inquiet", "anxieux", "panique",
      "miedo", "ansiedad", "nervios", "preocupa", "pánico",
      "angst", "ängstlich", "nervös", "sorge", "besorgt", "panik",
      "害怕", "担心", "焦虑", "紧张", "恐慌",
    ],
  ],
  [
    "sadness",
    [
      "حزين", "حزن", "مكتئب", "بكاء", "دمعة",
      "sad", "depress", "down", "crying", "cry", "grief", "hopeless",
      "triste", "déprim", "pleure", "chagrin", "désespér",
      "tristeza", "deprim", "llorar", "desánimo",
      "traurig", "depressiv", "weinen", "kummer",
      "难过", "伤心", "沮丧", "哭", "绝望",
    ],
  ],
  [
    "anger",
    [
      "غاضب", "غضب", "زهقت", "زعلت", "منفعل", "مستفز",
      "angry", "frustrat", "furious", "annoyed", "mad at", "rage",
      "colère", "fâch", "énerve", "frustr", "furieux",
      "enfad", "cabre", "frustrad", "furios",
      "wütend", "ärger", "verärgert", "wut",
      "生气", "愤怒", "愤怒", "烦", "恼火",
    ],
  ],
  [
    "loneliness",
    [
      "وحيد", "وحدة", "معزول", "بلا أصدقاء",
      "lonely", "alone", "isolated", "no one", "nobody",
      "seul", "solitud", "isolé",
      "solo", "soledad", "solitari",
      "einsam", "allein", "isoliert",
      "孤独", "孤单", "一个人", "没人",
    ],
  ],
  [
    "overwhelm",
    [
      "تعبان", "تعب", "مرهق", "ضغط", "مقهور", "تحت الضغط", "مزدحم",
      "tired", "exhaust", "overwhelm", "stress", "burnout", "too much", "pressure",
      "fatigu", "épuis", "sous pression", "débord",
      "agotad", "cansad", "estresad", "presión", "desbord",
      "müde", "erschöpft", "überfordert", "stressig", "druck",
      "累", "压力", "疲惫", "崩溃", "太 多",
    ],
  ],
  [
    "positive",
    [
      "سعيد", "فرحان", "مبسوط", "ممتن", "شكر", "فخور", "فخر",
      "happy", "grateful", "excited", "proud", "joy", "thankful",
      "heureux", "heureuse", "content", "reconnaiss", "enthousiaste", "fier",
      "feliz", "alegr", "emocion", "orgullo", "agradec",
      "glücklich", "dankbar", "stolz", "aufgeregt",
      "开心", "高兴", "幸福", "感谢", "自豪",
    ],
  ],
];

export function detectCategory(rawText: string): Category {
  const text = rawText.toLowerCase();
  for (const [category, words] of KEYWORDS) {
    if (words.some((word) => text.includes(word))) {
      return category;
    }
  }
  return "general";
}
