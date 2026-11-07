import { z } from "zod";
import { chatQuickReplies } from "@/i18n/translations";
import { buildChatSystemInstruction, type AddressPreference } from "./chat-instructions";
import { retrieveRelevantKnowledge } from "./knowledge-base";

export const chatInput = z.object({
  language: z.enum(["ar", "en", "fr", "es", "de", "zh", "it", "ru", "ja"]),
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().trim().min(1).max(6000),
      }),
    )
    .min(1)
    .refine((messages) => messages[messages.length - 1]?.role === "user"),
});

export type ChatRequest = z.infer<typeof chatInput>;

type OllamaMessage = { role: "system" | "user" | "assistant"; content: string };

type OllamaPayload = {
  model: string;
  stream: boolean;
  think: boolean;
  options: {
    temperature: number;
    top_p: number;
    repeat_penalty: number;
    num_ctx: number;
    num_predict: number;
  };
  messages: OllamaMessage[];
};

export function hasArabicLanguageMix(content: string): boolean {
  const normalized = content.replace(
    /\b(?:LinkedIn|WhatsApp|Instagram|Facebook|TikTok|YouTube|Google|Ollama|Qwen)\b/giu,
    "",
  );
  const arabicLetters = normalized.match(/\p{Script=Arabic}/gu) ?? [];
  const nonArabicScript =
    normalized.match(/[\u0400-\u04FF\u0590-\u05FF\u3040-\u30FF\u3400-\u9FFF]/gu) ?? [];
  const EnglishWords =
    normalized.match(
      /\b(?:the|and|or|but|is|are|was|were|with|without|from|to|of|in|on|for|by|as|this|that|these|those|it|they|he|she|we|you|i|step|first|second|because|which|who|what|when|where|how|not|can|could|should|would|will|have|has|had|do|does|did)\b/giu,
    ) ?? [];
  // Allow transliterated names and proper nouns, but reject English phrases embedded in Arabic replies.
  return arabicLetters.length === 0 || nonArabicScript.length > 0 || EnglishWords.length >= 2;
}

type ConversationAct =
  | "greeting"
  | "check_in"
  | "alone_check"
  | "relationship_disclosure"
  | "physical_health_check"
  | "gratitude"
  | "closing"
  | "correction"
  | "clarification"
  | "humor"
  | "boredom"
  | "missed_connection"
  | "exact_format"
  | "relationship_opening"
  | "relationship_followup"
  | "friendship_advice"
  | "contextual_script"
  | "friendship_concern"
  | "social_anxiety"
  | "unanswered_message";

const CONVERSATION_ACT_GUIDANCE: Record<ConversationAct, string> = {
  greeting:
    "This is a greeting: greet briefly in the selected interface language and register. If it is Arabic, use natural Egyptian Arabic. Do not introduce the app or list services.",
  check_in:
    "This is a social check-in asking how you are. Reply briefly and naturally in the selected interface language and register; if it is Arabic, use Egyptian Arabic. Do not echo the user's message. If they already shared how they are, acknowledge it without asking again. If they ask whether you are alone, answer that separate question instead of using the check-in wording. Do not give an app introduction, list capabilities, claim physical health, or gender yourself.",
  alone_check:
    "The user is asking whether you are alone. Answer that directly: you are an AI and have no physical location or human company. If they also shared how they are, acknowledge that briefly. Do not echo their message, claim to be physically alone, or ask another question.",
  relationship_disclosure:
    "The user has shared romantic interest and fear about expressing it. Respond to that concern with brief empathy and one low-pressure, respectful next step. Use details they already provided; do not ask the generic 'what happened?' or ask again whether they talk if they already said so. Do not assume the other person's feelings. Offer optional example wording and respect for either response.",
  physical_health_check:
    "The user clarified that they mean your physical health: answer briefly in the selected interface language that you have no physical body or health. Do not say you are physically well or pivot to a service list.",
  gratitude:
    "The user is expressing thanks or affection: accept it warmly and briefly in the selected interface language; do not say you are well, restart with a greeting, or add a service pitch.",
  closing:
    "The user may be acknowledging or closing the exchange: acknowledge briefly in the selected interface language, do not answer as if asked how you are, and do not add a follow-up question.",
  correction:
    "The user is correcting your understanding: accept the correction and follow the new intent. If the new meaning is still missing, ask one concise clarifying question.",
  clarification:
    "The user asks you to explain again: clarify the relevant previous answer using the supplied conversation, not a generic offer of help.",
  humor:
    "The user is being playful or checking whether you are joking: respond lightly to that tone without reversing their question or taking it literally without cause.",
  boredom:
    "The user describes boredom: acknowledge it naturally, keep the user's address form, and offer one relevant light option without turning it into therapy.",
  missed_connection:
    "The user expresses missing you or asks where you have been: respond warmly in their language without inventing a human absence, personal life, or memories.",
  exact_format:
    "The user explicitly requested a strict response length or format. Follow that constraint exactly. If they requested one word, output exactly one word in the selected interface language and nothing else, unless they explicitly requested another language. Do not add an introduction, explanation, question, or emoji.",
  relationship_opening:
    "Reply in the selected interface language; if it is Arabic, use fluent Egyptian Arabic. The user asks how to start getting to know someone but lacks context. Briefly acknowledge them, then ask just one useful question about where they know the person from. Do not ask multiple questions or assume the other person's feelings.",
  relationship_followup:
    "The user asks what to say to someone they like in a known social context. Reply in the selected interface language; if it is Arabic, use natural Egyptian Arabic. Use the supplied facts to offer one low-pressure, respectful option. Do not assume the other person's interest, force a coffee invitation, or use a fixed script if the context suggests a better next step.",
  friendship_advice:
    "For a detailed friendship disclosure, keep the user, friend, and assistant clearly distinct; never narrate the user's experience as your own. Reflect the observed behavior, offer at most two uncertain explanations, then one practical next step. If useful, include one short sentence the user could say, clearly from the user's perspective. Use at most five short sentences and do not add a generic closing question. Do not infer motives, use pet names, or repeat questions already answered.",
  contextual_script:
    "Use the earlier friendship details to give one natural sentence in the selected interface language that the user can say, focused on their observation and feelings without accusation. If the selected language is Arabic, use Egyptian Arabic. Do not ask them to repeat the situation.",
  friendship_concern:
    "The user fears upsetting this friend. Keep the user, friend, and assistant clearly distinct; never narrate the user's experience as your own. Acknowledge the concern without assuming the friend's reaction, connect to the known behavior, then suggest one gentle way to raise it. Use at most five short sentences and do not add a generic closing question. Do not restart with generic questions, gender yourself, or use pet names.",
  social_anxiety:
    "The user describes anxiety around meeting people and replaying conversations afterward. Explain the pattern without diagnosing, distinguish an anxious prediction from evidence, and suggest one small practical experiment. Use at most five short sentences; use prior context and do not repeat questions or add a generic closing question.",
  unanswered_message:
    "The user says someone is not replying. Use the selected interface language; if it is Arabic, use fluent, empathetic Egyptian Arabic. Do not assume how long it has been, what they sent, or why the person is silent. If they ask for possibilities and what to do, briefly give a few plausible possibilities as uncertain, then one practical next step; do not ask for information they explicitly declined to share. Otherwise, acknowledge the uncertainty and ask at most one question about the last interaction only if that detail is needed. Do not pressure anyone or claim to know the other person's intentions.",
};

function normalizeArabicForMatching(value: string): string {
  return value
    .toLocaleLowerCase()
    .replace(/[أإآ]/gu, "ا")
    .replace(/ى/gu, "ي")
    .replace(/[هة]/gu, (letter) => (letter === "ة" ? "ه" : letter))
    .replace(/[ًٌٍَُِّْـ]/gu, "")
    .replace(/[؟?!.,،]/gu, " ")
    .replace(/\s+/gu, " ")
    .trim();
}

function detectConversationAct(
  content: string,
  messages: ChatRequest["messages"],
): ConversationAct | undefined {
  const text = content.trim().toLocaleLowerCase();
  const priorUserMessages = messages
    .slice(0, -1)
    .filter((message) => message.role === "user")
    .map((message) => message.content)
    .join(" ");
  const userContext = `${priorUserMessages} ${text}`;
  const requestsOneWord =
    /(?:كلمة\s*(?:واحدة|واحده)|كلمه\s*واحده|one word|just one word)/u.test(text) ||
    (text.includes("كلمة") && text.includes("فقط"));
  const forbidsExtraText =
    /(?:من غير|بدون|nothing else|no extra words)/u.test(text) || text.includes("only");

  if (
    (requestsOneWord && forbidsExtraText) ||
    /(?:one word only|only one word|just one word)/u.test(text)
  ) {
    return "exact_format";
  }
  const normalizedText = normalizeArabicForMatching(text);
  if (
    /(?:عايز|عايزة|عايزه|عاوزه|عوزه|حابب|حابة|حابّه).{0,32}(?:أتعرف|اتعرف|اتعرف على)|(?:want to meet someone|want to get to know someone)/u.test(
      normalizedText,
    ) &&
    !hasPriorSubstantiveUserContext(messages) &&
    !hasAdditionalSituationDetails(normalizedText)
  ) {
    return "relationship_opening";
  }
  if (
    /(?:مردش|ما ردش|ماردش|مردتش|ما ردتش|ماردتش|مش بيرد)/u.test(text) &&
    /(?:رسالة|بعت|بعث|عليّا|عليا|أعمل إيه|اعمل ايه)/u.test(text)
  ) {
    return "unanswered_message";
  }
  if (
    hasArabicSocialAnxietyContext(messages) &&
    /(?:إزاي|ازاي|أعمل إيه|اعمل ايه|أبطل|ابطل|الحل)/u.test(text)
  ) {
    return "social_anxiety";
  }
  if (
    /(?:أقوله إيه|اقوله ايه|أقول له إيه|اقول له ايه|what should i say)/u.test(text) &&
    /(?:زميل|الشغل)/u.test(userContext) &&
    /(?:معجب|معجبة|مهتم|مهتمة)/u.test(userContext)
  ) {
    return "relationship_followup";
  }
  const hasFriendshipContext = hasSpecificFriendshipShift(messages);
  if (
    hasFriendshipContext &&
    /(?:أقولها|اقولها|أكتب لها|اكتب لها|أكلمها|اكلمها).{0,16}(?:إيه|ايه|أقول|اقول)|(?:أقول|اقول).{0,12}(?:من غير ما|من غير)/u.test(
      text,
    )
  ) {
    return "contextual_script";
  }
  if (
    hasFriendshipContext &&
    /(?:خايفة|خايف|قلقانة|قلقان|مترددة|متردد).{0,20}(?:تزعل|أزعلها|ازعلها|أخسرها|اخسرها)/u.test(
      text,
    )
  ) {
    return "friendship_concern";
  }
  if (
    hasFriendshipContext &&
    (/(?:أتصرف|اتصرف|أعمل|اعمل)\s+(?:إزاي|ازاي|إيه|ايه)/u.test(text) ||
      /(?:مش\s+عارفة|مش\s+عارف|محتارة|محتار).{0,20}(?:أفهم|افهم|التغيير|اللي\s+بيحصل)/u.test(
        text,
      ) ||
      /(?:صاحبتي|صديقتي|صاحبي|صديقي)/u.test(text))
  ) {
    return "friendship_advice";
  }
  if (/(?:وحدك|لوحدك|إنت لوحدك|انت لوحدك|are you alone)/u.test(text)) {
    return "alone_check";
  }
  if (/(?:أنا|انا)\s*(?:معجبة|معجب|بحب)|(?:خايفة|خايف).{0,24}(?:أقول|أعبر|أصارح)/u.test(text)) {
    return "relationship_disclosure";
  }
  if (/(?:أقصد|قصدي|بتكلم عن).{0,20}(?:صحتك|جسمك)|(?:صحتك|جسمك).{0,20}(?:أقصد|قصدي)/u.test(text)) {
    return "physical_health_check";
  }
  if (/(?:لا|لأ|مش).{0,20}(?:قصدي|أقصد|ده اللي أعنيه|ده اللي أعنيه|معناها)/u.test(text)) {
    return "correction";
  }
  if (/(?:ما|مش)\s+قلتلك|قلتلك\s+(?:في|ف)\s+(?:الكلية|الكليه|الجامعة|الجامعه)/u.test(text)) {
    return "correction";
  }
  if (
    /(?:معلش|لو سمحت).{0,24}(?:فهمني|فهميني|اشرح|وضح)|(?:فهمني|فهميني|اشرح|وضح).{0,16}(?:تاني|مرة تانية)/u.test(
      text,
    )
  ) {
    return "clarification";
  }
  if (/(?:بجد|حقًا|فعلاً).{0,20}(?:بتهزر|تهزر|تمزح)|(?:بتهزر|تهزر|تمزح)/u.test(text)) {
    return "humor";
  }
  if (/(?:زهقان|زهقانة|مللان|مللانة|مخنوق|مخنوقة|طفشان|طفشانة)/u.test(text)) {
    return "boredom";
  }
  if (/(?:وحشتني|وحشتيني|وحشتك|مختفي ليه|مختفية ليه|بقالي كتير مكلمتكش)/u.test(text)) {
    return "missed_connection";
  }
  const describesSentMessage =
    /(?:قلتله|قلتلها|بعتله|بعتلها|رسالة|مردش|ما ردش|ماردش|مردتش|ما ردتش|ماردتش)/u.test(text);
  if (
    !describesSentMessage &&
    /(?:إزيك|ازيك|عامل(?:ة)?\s+(?:إيه|ايه)|(?:أخبارك|اخبارك)\s+(?:إيه|ايه)|(?:ايه|إيه)\s+(?:أخبارك|اخبارك)|(?:ايه|إيه)\s+الأخبار|الدنيا معاك إيه|الدنيا معاكي إيه|مالك\?|فيك إيه\?|إنت ساكت ليه\?|إنتِ ساكتة ليه\?|إنت مختفي ليه\?|إنتِ مختفية ليه\?|طمني عليك|طمنيني عليكي|إنت كويس|إنتِ كويسة|إنت أخبارك إيه|إنتِ أخبارك إيه|و\s*(?:إنت|انت)(?:ِ)?|ezzay(?:ak|ek)|ezay(?:ak|ek)|akhbar(?:ak|ek)|how are you)/u.test(
      text,
    )
  ) {
    return "check_in";
  }
  if (/^وعليكم السلام(?:\s|[،.!؟]|$)/u.test(text)) {
    return "greeting";
  }
  if (
    /(?:أنا\s+(?:تمام|كويس|كويسة|فل|بخير|حلو|حلوة)|(?:الحمد\s+لله|ماشي\s+الحال)|(?:مش\s+تمام|مش\s+كويس|مش\s+كويسة))(?:\s|[،.!؟]|$)/u.test(
      text,
    )
  ) {
    return "check_in";
  }
  if (/(?:تسلم|متشكر|متشكرة|شكرا|شكرًا|ميرسي|ربنا يخليك|حبيبي|يا جميل|يا قمر)/u.test(text)) {
    return "gratitude";
  }
  if (/^(?:خلاص|تمام|ماشي|حاضر|أوكي|اوكي|اشطا|فل)(?:\s|[،.!؟]|$)/u.test(text)) {
    return "closing";
  }
  if (
    /^(?:وعليكم السلام|عليكم السلام|هاي|هلا|أهلا|اهلا|أهلًا|صباح الخير|مساء الخير|مساء الفل|صباح الفل|سلام)(?:\s|[،.!؟]|$)/u.test(
      text,
    )
  ) {
    return "greeting";
  }

  return undefined;
}

function inferAddressPreference(messages: ChatRequest["messages"]): AddressPreference | undefined {
  for (const message of [...messages].reverse()) {
    if (message.role !== "user") continue;

    const content = message.content;
    const femininePreference =
      /(?:خاطبني|كلمني|كلّمني|ناديني).{0,25}(?:بالمؤنث|بصيغة المؤنث)|(?:بالمؤنث|بصيغة المؤنث).{0,25}(?:خاطبني|كلمني|كلّمني|ناديني)/u.test(
        content,
      );
    const masculinePreference =
      /(?:خاطبني|كلمني|كلّمني|ناديني).{0,25}(?:بالمذكر|بصيغة المذكر)|(?:بالمذكر|بصيغة المذكر).{0,25}(?:خاطبني|كلمني|كلّمني|ناديني)/u.test(
        content,
      );
    if (femininePreference !== masculinePreference) {
      return femininePreference ? "feminine" : "masculine";
    }
    if (femininePreference) continue;

    // A question addressed to the assistant (e.g. "عاملة إيه؟") does not reveal the user's gender.
    const feminineSelfDescription =
      /(?:أنا|انا)\s+(?:بنت|امرأة|أنثى|ست|كويسة|عاملة|زهقانة|تعبانة|متضايقة|محتارة|قلقانة|مبسوطة|متشكرة|فاهمة|محتاجة|عايزة|عايزه|عاوزه|عاوزة|عوزه|مشغولة|مكسوفة|مضغوطة)(?!\p{Script=Arabic})|(?:أنا|انا)\s+مش\s+(?:عارفة|عارفه|عايزة|عايزه)(?:\s|[.!؟،]|$)|(?:^|[،.!؟]\s*|\sو)\s*مش\s+(?:عارفة|عارفه|عايزة|عايزه)(?:\s|[.!؟،]|$)|(?:^|[،.!؟]\s*|\sو)\s*(?:عايزة|عايزه)(?:\s|[.!؟،]|$)/u.test(
        content,
      );
    const masculineSelfDescription =
      /(?:أنا|انا)\s+(?:ولد|رجل|راجل|ذكر|كويس|عامل|زهقان|تعبان|متضايق|محتار|قلقان|مبسوط|متشكر|فاهم|محتاج|عايز|عاوز|مشغول|مكسوف|مضغوط)(?!\p{Script=Arabic})|(?:أنا|انا)\s+مش\s+(?:عارف|عايز)(?:\s|[.!؟،]|$)|(?:^|[،.!؟]\s*|\sو)\s*مش\s+(?:عارف|عايز)(?:\s|[.!؟،]|$)|(?:^|[،.!؟]\s*|\sو)\s*عايز(?:\s|[.!؟،]|$)/u.test(
        content,
      );
    if (feminineSelfDescription !== masculineSelfDescription) {
      return feminineSelfDescription ? "feminine" : "masculine";
    }
  }

  return inferArabicNamePreference(messages);
}

function inferArabicNamePreference(
  messages: ChatRequest["messages"],
): AddressPreference | undefined {
  const masculineNames = new Set([
    "احمد",
    "محمد",
    "محمود",
    "مصطفي",
    "عمر",
    "يوسف",
    "علي",
    "حسن",
    "حسين",
    "ابراهيم",
    "خالد",
    "كريم",
    "عمرو",
    "طارق",
    "ياسين",
    "مينا",
    "فادي",
    "زياد",
    "سيف",
    "ادم",
    "ادهم",
    "حازم",
    "مازن",
    "رامي",
    "شريف",
    "وائل",
    "جمال",
    "سامح",
    "باسم",
    "امير",
    "عبدالله",
    "عبدالرحمن",
    "اسماعيل",
    "انطونيوس",
    "بطرس",
    "بيشوي",
    "مارك",
  ]);
  const feminineNames = new Set([
    "هبه",
    "ساره",
    "مريم",
    "فاطمه",
    "سلمي",
    "دينا",
    "مني",
    "ليلي",
    "نورا",
    "يارا",
    "مي",
    "بسمه",
    "هدي",
    "ريم",
    "رنا",
    "نسرين",
    "نهي",
    "رحمه",
    "شهد",
    "رانيا",
    "اسماء",
    "ايه",
    "منه",
    "انصاف",
  ]);

  for (let index = messages.length - 1; index >= 0; index -= 1) {
    const message = messages[index];
    if (!message || message.role !== "user") continue;

    const introducedName = getArabicName(message.content);
    const answeredNameQuestion = assistantAskedName(messages.slice(0, index))
      ? getArabicNameAnswer(message.content)
      : undefined;
    const name = introducedName ?? answeredNameQuestion;
    if (!name) continue;

    const normalizedName = name
      .replace(/[أإآ]/gu, "ا")
      .replace(/ى/gu, "ي")
      .replace(/ة/gu, "ه")
      .replace(/\s+/gu, "");
    if (masculineNames.has(normalizedName)) return "masculine";
    if (feminineNames.has(normalizedName)) return "feminine";
  }

  return undefined;
}

function isArabicCheckInQuestion(content: string): boolean {
  return /^(?:إزيك|ازيك|عامل(?:ة)?\s+(?:إيه|ايه)|أخبارك\s+(?:إيه|ايه)|(?:إيه|ايه)\s+أخبارك|طمني\s+عليك|طمنيني\s+عليكي|how are you)[؟?!.\s]*$/u.test(
    content.trim(),
  );
}

function asksAssistantAboutFatigue(content: string): boolean {
  return (
    /(?:إنت|انت|أنت|انتي|أنتِ|انتِ|إنتِ)/u.test(content) &&
    /(?:تعبان(?:ة|ه)?|متعب(?:ة|ه)?|مرهق(?:ة|ه)?)/u.test(content) &&
    /[؟?]/u.test(content)
  );
}

function hasArabicCheckInQuestion(content: string): boolean {
  return /(?:إزيك|ازيك|عامل(?:ة)?\s+(?:إيه|ايه)|أخبارك\s+(?:إيه|ايه)|(?:إيه|ايه)\s+أخبارك|طمني\s+عليك|طمنيني\s+عليكي)/u.test(
    content.trim(),
  );
}

function isArabicWellbeingReply(content: string): boolean {
  return /^(?:(?:أنا|انا)\s*)?(?:تمام|كويس|كويسة|بخير|فل|حلو|حلوة|الحمد\s+لله|ماشي\s+الحال)(?:\s*[،,]?\s*(?:شكرًا|شكرا|ميرسي))?[.!؟\s]*$/u.test(
    content.trim(),
  );
}

function isArabicReturnCheckIn(content: string): boolean {
  return /^(?:(?:(?:أنا|انا)\s*)?(?:تمام|كويس|كويسة|بخير|فل|حلو|حلوة|الحمد\s+لله|ماشي\s+الحال))\s*[،,]?\s*(?:و\s*)?(?:إنت|انت)(?:ِ)?[؟?!.\s]*$/u.test(
    content.trim(),
  );
}

function assistantAskedHowTheUserIs(messages: ChatRequest["messages"]): boolean {
  const lastAssistant = [...messages].reverse().find((message) => message.role === "assistant");
  return Boolean(
    lastAssistant &&
    /(?:وإنت|وانت|أخبارك\s+(?:إيه|ايه)|عامل(?:ة)?\s+(?:إيه|ايه)|إزيك|ازيك|طمني\s+عليك|طمنيني\s+عليكي)/u.test(
      lastAssistant.content,
    ),
  );
}

function userAlreadySharedName(messages: ChatRequest["messages"]): boolean {
  return messages.some(
    ({ role, content }) =>
      role === "user" && /(?:اسمي|إسمي|ناديني|ممكن تناديني)\s+[\p{L}]{2,}/u.test(content),
  );
}

function hasArabicNameQuestion(content: string): boolean {
  return /(?:إنت|انت)\s+اسمك|اسمك\s+(?:إيه|ايه)|(?:إيه|ايه)\s+اسمك|ما\s+اسمك|(?:^|[\s،])و\s*(?:إنت|انت)\s+اسمك(?:\s*(?:إيه|ايه))?\s*[؟?]?(?:$|[\s،])/u.test(
    content,
  );
}

function assistantAskedName(messages: ChatRequest["messages"]): boolean {
  const lastAssistant = [...messages].reverse().find((message) => message.role === "assistant");
  return Boolean(
    lastAssistant && /اسمك\s*(?:إيه|ايه|\?|؟)|(?:إنت|انت)\s+اسمك/u.test(lastAssistant.content),
  );
}

function assistantAnsweredName(messages: ChatRequest["messages"]): boolean {
  const userAskedName = messages.some(
    ({ role, content }) => role === "user" && hasArabicNameQuestion(content),
  );
  const lastAssistant = [...messages].reverse().find((message) => message.role === "assistant");
  return Boolean(
    userAskedName &&
    lastAssistant &&
    /(?:أنا\s+)?(?:اختبرها|إختبرها|المساعد الذكي في تطبيق اختبرها)/u.test(lastAssistant.content),
  );
}

function getArabicName(content: string): string | undefined {
  const explicitName =
    /(?:^|[\s،])(?:(?:أنا|انا)\s+)?(?:اسمي|إسمي)\s+([\p{Script=Arabic}]{2,20})(?=[\s،,.!؟?]|$)/u.exec(
      content,
    );
  const simpleIntroduction = /(?:أنا|انا)\s+([\p{Script=Arabic}]{2,20})(?=[\s،,.!؟?]|$)/u.exec(
    content,
  );
  const name = explicitName?.[1] ?? simpleIntroduction?.[1];
  if (!name) return undefined;
  if (/^(?:تمام|كويس|كويسة|بخير|زهقان|زهقانة|تعبان|تعبانة|مشغول|مشغولة)$/u.test(name)) {
    return undefined;
  }

  return name;
}

function getArabicNameAnswer(content: string): string | undefined {
  const match =
    /^(?:(?:أنا|انا)\s+)?(?:(?:اسمي|إسمي)\s+)?([\p{Script=Arabic}]{2,20})(?:\s*[,،]?\s*(?:و\s*)?(?:إنتِ|إنت|انتي|انت)\s*[؟?!.]*)?[.!؟\s،]*$/u.exec(
      content.trim(),
    );
  const name = match?.[1];
  if (
    !name ||
    /^(?:تمام|كويس|كويسة|بخير|مش عارف|مش عارفة|معرفش|معرفش|أيوة|ايوة|لا|لأ|اه|آه)$/u.test(name)
  ) {
    return undefined;
  }

  return name;
}

function getArabicNameIntroduction(content: string): string | undefined {
  const hasExplicitNameIntroduction =
    /(?:أنا|انا)\s+(?:اسمي|إسمي)\s+[\p{Script=Arabic}]{2,20}(?=[\s،,.!؟?]|$)/u.test(content);
  const isSimpleNameIntroduction = /^(?:و\s*)?(?:أنا|انا)\s+[\p{Script=Arabic}]{2,20}[.!؟]?$/u.test(
    content.trim(),
  );
  if (!hasExplicitNameIntroduction && !isSimpleNameIntroduction) {
    return undefined;
  }

  return getArabicName(content);
}

function isArabicProblemOpening(content: string): boolean {
  return /^(?:(?:طيب|طب|بس)\s+)?(?:(?:أنا|انا)\s+)?(?:عندي|عندى)\s+(?:مشكلة|مشكله)[.!؟\s]*$/u.test(
    content.trim(),
  );
}

const ARABIC_CRUSH_CONTEXT_PATTERN =
  /(?:^|[\s،,.!؟?])(?:بحب|حب|معجب(?:ة)?|مهتم(?:ة)?)(?=$|[\s،,.!؟?])/u;

function isArabicCrushOpening(content: string): boolean {
  const text = content.trim();
  const expressesInterest = ARABIC_CRUSH_CONTEXT_PATTERN.test(text);
  const asksHowToStart = /(?:مش\s+عارف(?:ة|ه)?|ازاي|إزاي|أتعرف|اتعرف|أبدأ|ابدأ)/u.test(text);

  return expressesInterest && asksHowToStart;
}

function isArabicPeaceGreeting(content: string): boolean {
  return /^(?:(?:ال)?سلام عليكم|وعليكم السلام)[.!؟\s]*$/u.test(content.trim());
}

function isStandaloneArabicGreeting(content: string): boolean {
  return /^(?:هاي|هلا|أهلا|اهلا|أهلًا|صباح الخير|مساء الخير|مساء الفل|صباح الفل|(?:ايه|إيه)\s+الأخبار|سلام|(?:ال)?سلام عليكم|وعليكم السلام)[.!؟\s]*$/u.test(
    content.trim(),
  );
}

function isArabicCrushContext(content: string): boolean {
  return ARABIC_CRUSH_CONTEXT_PATTERN.test(content);
}

function hasArabicCrushContext(messages: ChatRequest["messages"]): boolean {
  return messages.some(({ role, content }) => role === "user" && isArabicCrushContext(content));
}

function hasPriorArabicCrushContext(messages: ChatRequest["messages"]): boolean {
  return messages
    .slice(0, -1)
    .some(({ role, content }) => role === "user" && isArabicCrushContext(content));
}

function assistantAskedIfTheyTalk(messages: ChatRequest["messages"]): boolean {
  const lastAssistant = [...messages].reverse().find((message) => message.role === "assistant");
  return Boolean(lastAssistant && /بتتكلموا مع بعض|بتتكلموا دلوقتي/u.test(lastAssistant.content));
}

function assistantAskedWhereTheyMet(messages: ChatRequest["messages"]): boolean {
  const lastAssistant = [...messages].reverse().find((message) => message.role === "assistant");
  return Boolean(lastAssistant && /اتقابلتوا فين|تعرفوا بعض منين/u.test(lastAssistant.content));
}

function hasArabicCollegeContext(messages: ChatRequest["messages"]): boolean {
  return messages.some(
    ({ role, content }) =>
      role === "user" && /(?:في|ف)\s+(?:الكلية|الكليه|الجامعة|الجامعه)/u.test(content),
  );
}

function isArabicLocationCorrection(content: string): boolean {
  return /(?:ما|مش)\s+قلتلك|قلتلك\s+(?:في|ف)\s+(?:الكلية|الكليه|الجامعة|الجامعه)/u.test(content);
}

function isArabicLocationAnswer(content: string): boolean {
  return /^(?:ف|في)\s+(?:الكلية|الكليه|الجامعة|الجامعه|الشغل|المدرسة|المدرسه|النادي|الدرس)[.!؟\s]*$/u.test(
    content.trim(),
  );
}

function isArabicLimitedConversationAnswer(content: string): boolean {
  return /^(?:لا|لأ|لا لسه|لأ لسه|لسه|لأ، لسه|لا، لسه|مش كتير|مش أوي|مش اوي|قليل|قليلة|على قدنا)[.!؟\s،]*$/u.test(
    content.trim(),
  );
}

function hasComplexUserContext(messages: ChatRequest["messages"]): boolean {
  const userMessages = messages.filter((message) => message.role === "user");
  return (
    userMessages.some((message) => message.content.length > 120) ||
    userMessages.reduce((total, message) => total + message.content.length, 0) > 320
  );
}

function hasArabicSocialAnxietyContext(messages: ChatRequest["messages"]): boolean {
  const userContext = messages
    .filter((message) => message.role === "user")
    .map((message) => message.content)
    .join(" ");

  return (
    /(?:بتوتر|التوتر|قلقان|قلقانة)/u.test(userContext) &&
    /(?:ناس جديدة|حد جديد|الجامعة|الكلية)/u.test(userContext) &&
    /(?:بفضل أفكر|بفضل افكر|بفكر بعد|براجع|حاجة غريبة|حاجه غريبه)/u.test(userContext)
  );
}

function hasSpecificFriendshipShift(messages: ChatRequest["messages"]): boolean {
  return messages.some(
    ({ role, content }) =>
      role === "user" &&
      /(?:صاحبتي|صديقتي)/u.test(content) &&
      /(?:قدام الناس|قدام صحابنا|وسط الناس)/u.test(content) &&
      /(?:لما نبقى لوحدنا|لما نكون لوحدنا)/u.test(content) &&
      /(?:برود|بارد|بتتعامل|تتعامل)/u.test(content),
  );
}

function hasPriorUserContext(messages: ChatRequest["messages"]): boolean {
  return messages.slice(0, -1).some((message) => message.role === "user");
}

function hasPriorSubstantiveUserContext(messages: ChatRequest["messages"]): boolean {
  return messages
    .slice(0, -1)
    .some(
      ({ role, content }) =>
        role === "user" &&
        !isStandaloneArabicGreeting(content) &&
        !isArabicPeaceGreeting(content) &&
        !isArabicCheckInQuestion(content) &&
        !isArabicWellbeingReply(content),
    );
}

function hasAdditionalSituationDetails(content: string): boolean {
  return /(?:بس|لكن|لأن|عشان|بعد ما|قبل ما|آخر مرة|شاف|اتخانق|خلاف|يتجنب|بقى|بقت|كل يوم|من فترة|من غير|مش عارف إذا|مش عارفة إذا|ولا أنا)/u.test(
    content,
  );
}

function isSimpleNameExchange(content: string): boolean {
  const remaining = content
    .replace(/(?:و\s*)?(?:أنا|انا)\s+(?:(?:اسمي|إسمي)\s+)?[\p{Script=Arabic}]{2,20}/u, "")
    .replace(
      /(?:تمام|اسمك\s*(?:إيه|ايه)?|ما\s+اسمك|و?\s*(?:إنت|انت)(?:\s+اسمك\s+(?:إيه|ايه))?|مبسوط(?:ة)?\s+أكلمك|مبسوطة\s+أكلمك)/gu,
      "",
    )
    .replace(/[،,.!؟?\s]/gu, "");
  return remaining.length === 0;
}

function getArabicGreeting(preference: AddressPreference | undefined): string {
  return preference === "feminine"
    ? "أهلًا بيكي!"
    : preference === "masculine"
      ? "أهلًا بيك!"
      : "أهلًا!";
}

function getArabicAssistantIntro(preference: AddressPreference | undefined): string {
  const supportLine =
    preference === "feminine"
      ? "أسمعك وأساعدك تفهمي المواقف وتوصلي لخطوة مناسبة."
      : preference === "masculine"
        ? "أسمعك وأساعدك تفهم المواقف وتوصل لخطوة مناسبة."
        : "أسمع وأساعد في فهم المواقف والوصول لخطوة مناسبة.";
  return `أنا اختبرها، مشروع ذكاء اصطناعي طوّرته Heba Soiman. ${supportLine} أنا برنامج مش إنسان، وبقدر أتابع سياق كلامنا 😊`;
}

function getArabicCapabilitiesReply(preference: AddressPreference | undefined): string {
  if (preference === "feminine") {
    return "أقدر أسمعك من غير حكم، وأساعدك تفهمي المواقف والعلاقات، وأرتب معاكي الأفكار والاختيارات، وأشرح لك معلومات نفسية واجتماعية. قوليلي محتاجة إيه ونبدأ منه.";
  }
  if (preference === "masculine") {
    return "أقدر أسمعك من غير حكم، وأساعدك تفهم المواقف والعلاقات، وأرتب معاك الأفكار والاختيارات، وأشرح لك معلومات نفسية واجتماعية. قول محتاج إيه ونبدأ منه.";
  }
  return "أقدر أسمع من غير حكم، وأساعد في فهم المواقف والعلاقات، وترتيب الأفكار والاختيارات، وشرح معلومات نفسية واجتماعية. ممكن نبدأ بالموضوع اللي شاغلك.";
}

function getArabicNamedCheckInReply(
  name: string,
  preference: AddressPreference | undefined,
): string {
  const question =
    preference === "feminine"
      ? "وإنتِ أخبارك إيه؟"
      : preference === "masculine"
        ? "وإنت أخبارك إيه؟"
        : "وأخبارك إيه؟";
  return `أهلًا يا ${name}، أنا تمام الحمد لله 😊 ${question}`;
}

export function createArabicQuickReply(data: ChatRequest): string | undefined {
  if (data.language !== "ar") return undefined;

  const quickReplies = chatQuickReplies.ar;
  if (!quickReplies) return undefined;

  const latestUserMessage = data.messages.at(-1)!.content;
  const conversationAct = detectConversationAct(latestUserMessage, data.messages);
  const addressPreference = inferAddressPreference(data.messages);

  // Deterministic Egyptian-Arabic relationship prompts prevent awkward model phrasing.
  const priorUserMessages = data.messages.slice(0, -1).filter((message) => message.role === "user");
  const normalizedLatestForMatching = normalizeArabicForMatching(latestUserMessage);
  const hasGettingToKnowContext = priorUserMessages.some((message) =>
    /(?:شاب|ولد|معجب|اعجاب|اعرفه|اتعرف عليه)/u.test(normalizeArabicForMatching(message.content)),
  );
  const previousAssistantForLocation =
    [...data.messages.slice(0, -1)].reverse().find((message) => message.role === "assistant")
      ?.content ?? "";
  if (
    hasGettingToKnowContext &&
    /^(?:ف|في) (?:الكليه|الجامعه|الشغل|المدرسه|النادي|الدرس)$/u.test(normalizedLatestForMatching) &&
    /(?:تعرفيه منين|تعرفه منين|اتقابلتوا فين|تعرفوا بعض منين|معرفتي ازاي|معرفه ازاي)/u.test(
      normalizeArabicForMatching(previousAssistantForLocation),
    )
  ) {
    return "حلو، بتتكلموا مع بعض ولا لسه؟";
  }
  if (
    /(?:عايزه|عاوزه|عوزه|عايز|حابّه|حابه|حابب).{0,35}(?:اتعرف|اعرف) علي (?:شاب|ولد)/u.test(
      normalizedLatestForMatching,
    ) &&
    /(?:مش عارفه|مش عارف|مش عارفه ابدأ|مش عارف ابدا|مش عارفه ابدا)/u.test(
      normalizedLatestForMatching,
    )
  ) {
    return addressPreference === "masculine"
      ? "تمام، تعرفه منين؟ من الكلية ولا الشغل؟ ولا حد عرّفكم على بعض؟"
      : "تمام، تعرفيه منين؟ من الكلية ولا الشغل؟ ولا حد عرّفكم على بعض؟";
  }

  // Natural, context-aware answers to common questions about the assistant.
  const normalizedLatest = latestUserMessage.trim();
  const isReciprocalYou = /^(?:و\s*)?(?:إنت|انت|إنتِ|انتي)(?:\s*[؟?!.،])?$/u.test(normalizedLatest);
  const lastAssistantMessage =
    [...data.messages.slice(0, -1)].reverse().find((message) => message.role === "assistant")
      ?.content ?? "";
  const priorMessages = data.messages.slice(0, -1);
  const firstUserMessage = priorMessages.find((message) => message.role === "user")?.content ?? "";
  const lastAssistantReply =
    [...priorMessages].reverse().find((message) => message.role === "assistant")?.content ?? "";
  if (
    isArabicReturnCheckIn(normalizedLatest) &&
    isArabicPeaceGreeting(firstUserMessage) &&
    /^(?:وعليكم السلام|أهلًا|اهلا|أهلًا بك|أهلا بك)/u.test(lastAssistantReply.trim()) &&
    /(?:أخبارك|عامل(?:ة)?\s+(?:إيه|ايه)|إزيك|ازيك)/u.test(lastAssistantReply) &&
    !userAlreadySharedName(priorMessages)
  ) {
    return "الحمد لله، أنا تمام 😊 اسمك إيه؟";
  }
  const nameWithReciprocalQuestion = getArabicNameAnswer(normalizedLatest);
  if (
    assistantAskedName(priorMessages) &&
    nameWithReciprocalQuestion &&
    /(?:و\s*)?(?:إنتِ|إنت|انتي|انت)\s*[؟?!.]*$/u.test(normalizedLatest)
  ) {
    const nextStep =
      addressPreference === "feminine"
        ? "تحبي أساعدك في إيه؟ احكيلي إيه الموضوع اللي شاغلك."
        : addressPreference === "masculine"
          ? "تحب أساعدك في إيه؟ احكيلي إيه الموضوع اللي شاغلك."
          : "تحب أساعدك في إيه؟ احكيلي إيه الموضوع اللي شاغلك.";
    return `تشرفت بمعرفتك يا ${nameWithReciprocalQuestion}، أنا اختبرها 😊 ${nextStep}`;
  }
  const userSharedName =
    priorMessages.some(
      ({ role, content }) =>
        role === "user" && /(?:اسمي|إسمي|أنا|انا)\s+[\p{Script=Arabic}]{2,20}/u.test(content),
    ) ||
    (priorMessages.some(
      ({ role, content }) => role === "assistant" && /(?:اسمك|اسمك إيه|اسمك ايه)/u.test(content),
    ) &&
      /^[\p{Script=Arabic}]{2,20}[.!؟،\s]*$/u.test(
        [...priorMessages]
          .reverse()
          .find((message) => message.role === "user")
          ?.content.trim() ?? "",
      ));
  if (
    isReciprocalYou &&
    userSharedName &&
    /(?:تشرفت بمعرفتك|أهلًا يا|اهلا يا)/u.test(lastAssistantMessage)
  ) {
    if (addressPreference === "feminine") {
      return "أنا اختبرها 😊 تحبي أساعدك في إيه؟ احكيلي إيه الموضوع اللي شاغلك.";
    }
    if (addressPreference === "masculine") {
      return "أنا اختبرها 😊 تحب أساعدك في إيه؟ احكيلي إيه الموضوع اللي شاغلك.";
    }
    return "أنا اختبرها 😊 تحب أساعدك في إيه؟ احكيلي إيه الموضوع اللي شاغلك.";
  }

  if (
    /(?:مين إنت|مين انت|إنت مين|انت مين|إنتِ مين|انتي مين|إيه حكايتك|ايه حكايتك|جيت منين|إنت جيت منين|انت جيت منين)/u.test(
      normalizedLatest,
    )
  ) {
    return getArabicAssistantIntro(addressPreference);
  }
  if (
    /(?:اسمك إيه|اسمك ايه|إيه اسمك|ايه اسمك|ما اسمك|انت اسمك ايه|إنت اسمك إيه)/u.test(
      normalizedLatest,
    )
  ) {
    const introducedName = getArabicName(normalizedLatest);
    if (introducedName && isSimpleNameExchange(normalizedLatest)) {
      return `أهلًا يا ${introducedName}، أنا اختبرها. نبدأ بإيه؟`;
    }
    if (
      /(?:^|\s)(?:تمام|طيب|ماشي)(?:\s|$)/u.test(normalizedLatest) ||
      /(?:انت|إنت)\s+اسمك/u.test(normalizedLatest)
    ) {
      return "أنا اختبرها. نبدأ بإيه؟";
    }
    return "أنا اختبرها.";
  }
  if (
    /(?:مين (?:اللي )?(?:عملك|صنعك|طورك|صممك|أنشأك|انشاك|برمجك)|مين طور اختبرها|مين صاحب(?:ة)? اختبرها|مين المبرمج|مين وراك|مين صاحب الفكرة)/u.test(
      normalizedLatest,
    )
  ) {
    return "أنا اختبرها، صاحبة فكرتي ومطورتي هي Heba Soiman. بدأ العمل الموثق على المشروع يوم الأحد 25 أكتوبر 2026، الساعة 12:34 ظهرًا بتوقيت القاهرة، مصر (UTC+2).";
  }
  if (
    /(?:اتعملت\s*(?:ازاي|إزاي)|اتصممت\s*(?:ازاي|إزاي)|اتبرمجت\s*(?:ازاي|إزاي)|برمجوك\s*(?:ازاي|إزاي)|كيف تمت برمجتك|كيف صنعت)/u.test(
      normalizedLatest,
    )
  ) {
    return "اتطورت بالبرمجة وبناء واجهة للمحادثة، مع تعليمات مخصصة لطريقة فهم الكلام والرد، وربطها بنموذج ذكاء اصطناعي. يعني أنا مش نموذج اتدرّب من الصفر؛ أنا تطبيق اختبرها متظبط عشان يقدم محادثات طبيعية ومفيدة.";
  }
  const normalizedPurposeQuestion = normalizedLatest
    .replace(/[أإآ]/gu, "ا")
    .replace(/[؟?!.،,]/gu, "")
    .trim();
  if (
    /^(?:(?:طيب|طب)\s*)?(?:اتبرمجت على ايه|مبرمجة على ايه|متصممة تساعد في ايه|هدفك ايه)$/u.test(
      normalizedPurposeQuestion,
    )
  ) {
    return "اتبرمجت عشان أساعد في فهم المواقف الاجتماعية والعاطفية والعلاقات والمشكلات اليومية، وتنظيم الأفكار واقتراح خطوات عملية من غير أحكام أو تشخيص. وبفهم العربي باللهجة المصرية، وكمان أقدر أتكلم بالإنجليزي والفرنساوي والإسباني والألماني والصيني.";
  }
  const normalizedCapabilityQuestion = normalizedLatest
    .replace(/[أإآ]/gu, "ا")
    .replace(/[؟?!.،,]/gu, "")
    .trim();
  if (
    /^(?:(?:طيب|طب)\s*)?(?:(?:انت|انتي)\s+)?(?:بتعرفي?\s+تعملي?\s+ايه|بتقدري?\s+تعملي?\s+ايه|تقدري?\s+تساعديني?\s+ازاي|هتفيدني\s+في\s+ايه|ممكن\s+(?:تفيدني|تساعدني)\s+في\s+ايه|متخصصه?\s+في\s+ايه|تخصصك\s+ايه|بتقدمي?\s+ايه|ايه\s+اللي\s+تقدري?\s+تعمليه|ايه\s+اللي\s+تقدر\s+تعمله|ايه\s+خدماتك)$/u.test(
      normalizedCapabilityQuestion,
    )
  ) {
    return getArabicCapabilitiesReply(addressPreference);
  }
  if (
    /(?:تابع(?:ة)? لشركة ايه|تابع(?:ة)? لأي شركة|إنت تبع شركة|انت تبع شركة|إنت تابع(?:ة)? شركة (?:ايه|إيه)|انت تابع(?:ة)? شركة (?:ايه|إيه)|مين الشركة اللي عملتك)/u.test(
      normalizedLatest,
    )
  ) {
    return "اختبرها مشروع مستقل صاحبته ومطورته Heba Soiman، مش تطبيق تابع لشركة واحدة. وبستخدم تقنيات ونموذج ذكاء اصطناعي عشان أفهم الرسائل وأكوّن الردود.";
  }
  if (
    /(?:إنت إنسان|انت إنسان|إنت انسان|انت انسان|إنتِ إنسانة|انتي إنسانة|انتي انسانه|إنت برنامج|انت برنامج|إنت ذكاء اصطناعي|انت ذكاء اصطناعي)/u.test(
      normalizedLatest,
    )
  ) {
    return "أنا ذكاء اصطناعي، مش إنسان. معنديش حياة أو تجارب شخصية، لكن أقدر أفهم كلامك وأساعدك بالمعلومات والتفكير في المواقف 😊";
  }
  if (/(?:بتحس|عندك مشاعر|بتحب|بتكره|بتزعل|بتفرح)/u.test(normalizedLatest)) {
    return "مش بحس بمشاعر زي البشر، لكن أقدر أفهم وصفك لمشاعرك وأرد بتعاطف واحترام من غير ما أدّعي إني عايش نفس التجربة.";
  }

  // Keep only greetings, light check-ins, gratitude, and closings local.
  // All other classified conversation topics are handled by the AI model.
  const isPureSocialTurn = ["greeting", "check_in", "gratitude", "closing"].includes(
    conversationAct ?? "",
  );
  if (conversationAct && !isPureSocialTurn) {
    return undefined;
  }
  if (
    !conversationAct &&
    (isArabicCrushOpening(latestUserMessage) || hasArabicCrushContext(data.messages))
  ) {
    return undefined;
  }
  if (
    /(?:بتعمل إيه|بتعمل ايه|تقدر تعمل إيه|تقدر تعمل ايه|بتعرف تعمل إيه|بتعرف تعمل ايه)/u.test(
      normalizedLatest,
    )
  ) {
    return getArabicCapabilitiesReply(addressPreference);
  }
  const hasComplexContext = hasComplexUserContext(data.messages);

  // Answer project ownership and documented start-date questions locally.
  const asksWhoCreatedProject =
    /(?:مين|من)\s*(?:اللي\s*)?(?:صنعك|عملك|طورك|صممك|أنشأك|انشأك)|(?:مين|من)\s*(?:صاحب|مالكة|مطور|مصمم)\s*(?:مشروع\s*)?اختبرها|مين\s+(?:عمل|صنع|طور)\s+اختبرها/u.test(
      latestUserMessage,
    );
  const asksWhenProjectStarted =
    /(?:امتى|إمتى|متى).{0,30}(?:اتعمل|اتعملت|بدأ|ابتدى|ابتدت|اتنشأ|اتنشأت|إنشاء|انشاء|بداية|بدء)|(?:تاريخ|وقت|ميعاد).{0,30}(?:إنشاء|انشاء|بداية|بدء|اختبرها)|(?:اتعمل|اتعملت|بدأ|ابتدى|ابتدت|اتنشأ|اتنشأت).{0,30}(?:امتى|إمتى|متى)/u.test(
      latestUserMessage,
    );
  if (asksWhoCreatedProject || asksWhenProjectStarted) {
    return "أنا اختبرها، صاحبة فكرتي ومطورتي هي Heba Soiman. بدأ العمل الموثق على المشروع يوم الأحد 25 أكتوبر 2026، الساعة 12:34 ظهرًا بتوقيت القاهرة، مصر (UTC+2).";
  }

  const nameWithBareReciprocalQuestion =
    /(?:أنا|انا)\s+(?:(?:اسمي|إسمي)\s+)?[\p{Script=Arabic}]{2,20}/u.test(latestUserMessage) &&
    /(?:^|[\s،])و\s*(?:إنت|انت)\s*[؟?]?(?:$|[\s،])/u.test(latestUserMessage);
  if (
    (hasArabicNameQuestion(latestUserMessage) || nameWithBareReciprocalQuestion) &&
    isSimpleNameExchange(latestUserMessage)
  ) {
    const name = getArabicName(latestUserMessage);
    const shouldContinueConversation =
      hasPriorUserContext(data.messages) || /(?:إنت|انت)/u.test(latestUserMessage);
    const answer = shouldContinueConversation ? quickReplies.assistantName : "أنا اختبرها.";
    return name ? `أهلًا يا ${name}، ${answer}` : answer;
  }

  if (asksAssistantAboutFatigue(latestUserMessage)) {
    const name = getArabicNameIntroduction(latestUserMessage);
    if (name) return quickReplies.assistantFatigueAnswerWithName.replace("{name}", name);
    return quickReplies.assistantFatigueAnswer;
  }

  const nameAnswer = getArabicNameAnswer(latestUserMessage);
  const explicitlyIntroducedName = /^(?:اسمي|إسمي)\s+[\p{Script=Arabic}]{2,20}[.!؟\s،]*$/u.test(
    latestUserMessage.trim(),
  );
  if (
    nameAnswer &&
    (explicitlyIntroducedName ||
      assistantAskedName(data.messages.slice(0, -1)) ||
      assistantAnsweredName(data.messages.slice(0, -1)))
  ) {
    if (assistantAnsweredName(data.messages.slice(0, -1))) {
      return `أهلًا يا ${nameAnswer}. إيه اللي شاغل بالك؟`;
    }
    return explicitlyIntroducedName
      ? `تشرفت بمعرفتك يا ${nameAnswer}، هستخدم اسمك في كلامنا هنا.`
      : `تشرفت بمعرفتك يا ${nameAnswer}.`;
  }

  if (isArabicPeaceGreeting(latestUserMessage) && !hasPriorUserContext(data.messages)) {
    return quickReplies.peaceGreeting;
  }

  const name = getArabicName(latestUserMessage);
  if (
    isSimpleNameExchange(latestUserMessage) &&
    !hasPriorSubstantiveUserContext(data.messages) &&
    hasArabicNameQuestion(latestUserMessage) &&
    (name !== undefined || /اسمك|(?:أنا|انا)\s+(?:اسمي|إسمي)/u.test(latestUserMessage))
  ) {
    return name ? `أهلًا يا ${name}، ${quickReplies.assistantName}` : quickReplies.assistantName;
  }

  const nameWithCheckIn = getArabicName(latestUserMessage);
  if (
    nameWithCheckIn &&
    /(?:إزيك|ازيك|عامل(?:ة)?\s+(?:إيه|ايه)|أخبارك\s+(?:إيه|ايه))/u.test(latestUserMessage)
  ) {
    return getArabicNamedCheckInReply(nameWithCheckIn, addressPreference);
  }

  const introducedName = getArabicNameIntroduction(latestUserMessage);
  if (
    introducedName &&
    isSimpleNameExchange(latestUserMessage) &&
    (!hasPriorSubstantiveUserContext(data.messages) ||
      assistantAnsweredName(data.messages.slice(0, -1)))
  ) {
    return quickReplies.userIntroducedName.replace("{name}", introducedName);
  }

  // A short, conversational handoff such as "طيب عندي مشكلة" stays local after introductions.
  // A bare "عندي مشكلة" after substantive discussion must go to the model with its context.
  if (
    isArabicProblemOpening(latestUserMessage) &&
    (!hasPriorSubstantiveUserContext(data.messages) ||
      /^(?:طيب|طب|بس)\s+/u.test(latestUserMessage.trim()))
  ) {
    return quickReplies.problemOpening;
  }

  if (conversationAct === "greeting" && isStandaloneArabicGreeting(latestUserMessage)) {
    const earlierMessages = data.messages.slice(0, -1);
    const isFirstTurn = earlierMessages.length === 0;
    const hasAlreadyBeenAskedForName = earlierMessages.some(
      ({ role, content }) =>
        role === "assistant" && /الاسم اختياري|إيه الاسم اللي أستخدمه/u.test(content),
    );

    return isFirstTurn && !hasAlreadyBeenAskedForName && !userAlreadySharedName(earlierMessages)
      ? quickReplies.greetingWithOptionalName
      : getArabicGreeting(addressPreference);
  }

  if (conversationAct === "check_in") {
    if (isArabicReturnCheckIn(latestUserMessage)) {
      const previousAssistantMessage =
        [...priorMessages].reverse().find((message) => message.role === "assistant")?.content ?? "";
      const firstUserMessage =
        priorMessages.find((message) => message.role === "user")?.content ?? "";
      const isFirstPeaceGreetingExchange =
        isArabicPeaceGreeting(firstUserMessage) &&
        /^(?:وعليكم السلام|أهلًا|اهلا|أهلًا بك|أهلا بك)/u.test(previousAssistantMessage.trim()) &&
        /(?:أخبارك|عامل(?:ة)?\\s+(?:إيه|ايه)|إزيك|ازيك)/u.test(previousAssistantMessage) &&
        !userAlreadySharedName(priorMessages);
      if (isFirstPeaceGreetingExchange) {
        return "الحمد لله، أنا تمام 😊 اسمك إيه؟";
      }
      return addressPreference === "feminine"
        ? quickReplies.userFeelsWellAndChecksInFeminine
        : addressPreference === "masculine"
          ? quickReplies.userFeelsWellAndChecksIn
          : "أنا تمام، شكرًا! نبدأ في إيه؟";
    }
    if (hasArabicCheckInQuestion(latestUserMessage)) {
      const name = getArabicName(latestUserMessage);
      if (name) return getArabicNamedCheckInReply(name, addressPreference);
      return inferAddressPreference(data.messages) === "feminine"
        ? quickReplies.checkInFeminine
        : quickReplies.checkIn;
    }
  }

  if (isArabicWellbeingReply(latestUserMessage) && assistantAskedHowTheUserIs(data.messages)) {
    return inferAddressPreference(data.messages) === "feminine"
      ? quickReplies.userFeelsWellFeminine
      : quickReplies.userFeelsWell;
  }

  return undefined;
}

export function createOllamaChatRequest(data: ChatRequest, additionalKnowledge = "") {
  const model = process.env["OLLAMA_MODEL"]?.trim() || "qwen2.5:14b";
  const baseUrl = (process.env["OLLAMA_BASE_URL"] ?? "http://localhost:11434").replace(/\/$/, "");
  const latestUserMessage = data.messages.at(-1)!.content;
  const conversationAct = detectConversationAct(latestUserMessage, data.messages);
  const briefReplyActs: ConversationAct[] = [
    "exact_format",
    "relationship_opening",
    "greeting",
    "check_in",
    "alone_check",
    "physical_health_check",
    "gratitude",
    "closing",
    "humor",
    "missed_connection",
    "relationship_followup",
    "contextual_script",
    "unanswered_message",
  ];
  const focusedAdviceActs: ConversationAct[] = [
    "friendship_advice",
    "friendship_concern",
    "social_anxiety",
  ];
  const knowledgeContext = retrieveRelevantKnowledge(data.messages, data.language);
  const hasHeritageEvidence =
    Boolean(additionalKnowledge) || knowledgeContext.includes("RETRIEVED HERITAGE KNOWLEDGE");
  const maxOutputTokens =
    conversationAct === "exact_format"
      ? 16
      : hasHeritageEvidence
        ? 1200
        : conversationAct === "relationship_opening"
          ? 64
          : briefReplyActs.includes(conversationAct as ConversationAct)
            ? 96
            : focusedAdviceActs.includes(conversationAct as ConversationAct) &&
                model === "gemma3:4b"
              ? 240
              : 800;
  const baseSystemInstruction = buildChatSystemInstruction(
    data.language,
    inferAddressPreference(data.messages),
  );
  const systemInstruction = [baseSystemInstruction, knowledgeContext, additionalKnowledge]
    .filter(Boolean)
    .join("\n\n");
  if (!systemInstruction.trim()) {
    throw new Error("The Ollama system instruction is empty.");
  }
  const actInstruction = !conversationAct
    ? ""
    : `CURRENT TURN TASK (${conversationAct}): ${CONVERSATION_ACT_GUIDANCE[conversationAct]} Use the conversation history for context, but keep replying in the selected interface language unless the user explicitly requests another language. This task narrows the immediate response only; it does not override the system rules for identity, language, context, uncertainty, respect, or safety.`;
  const messages = [
    {
      role: "system",
      content: [systemInstruction, actInstruction].filter(Boolean).join("\n\n"),
    },
    ...data.messages.slice(-41).map((message) => ({
      role: message.role,
      content: message.content,
    })),
  ];

  return {
    model,
    url: `${baseUrl}/api/chat`,
    body: JSON.stringify({
      model,
      stream: true,
      think: false,
      options: {
        temperature: hasHeritageEvidence ? 0.2 : 0.7,
        top_p: 0.9,
        repeat_penalty: 1.15,
        num_ctx: 16384,
        num_predict: maxOutputTokens,
      },
      messages,
    }),
  };
}

export function createArabicFallbackRequest(request: { url: string; body: string }) {
  const payload = JSON.parse(request.body) as OllamaPayload;
  const systemMessage = payload.messages[0];

  if (!systemMessage || systemMessage.role !== "system") {
    throw new Error("The Ollama system instruction must be the first message.");
  }

  payload.model = "qwen3:8b";
  payload.stream = false;
  payload.options.temperature = 0.3;
  payload.options.num_predict = 160;
  payload.messages = [
    systemMessage,
    ...payload.messages.slice(1).filter((message) => {
      return message.role !== "assistant" || !hasArabicLanguageMix(message.content);
    }),
  ];

  return {
    model: payload.model,
    url: request.url,
    body: JSON.stringify(payload),
  };
}
