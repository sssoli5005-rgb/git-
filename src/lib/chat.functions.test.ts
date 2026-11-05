import { describe, expect, it } from "vitest";
import { buildChatSystemInstruction } from "./chat-instructions";
import {
  chatInput,
  createArabicFallbackRequest,
  createOllamaChatRequest,
  hasArabicLanguageMix,
} from "./chat.functions";

describe("Egypt Smart Guide conversation instructions", () => {
  it("applies the specialist protocol to every provider request and conversation", () => {
    const request = JSON.parse(createOllamaChatRequest({
      language: "ar",
      messages: [
        { role: "user", content: "ما الفرق بين طيبة والكرنك؟" },
        { role: "assistant", content: "طيبة اسم إقليمي قديم للمدن المحيطة بالأقصر." },
        { role: "user", content: "ثم ماذا كان يقال عن معبد الكرنك؟" },
      ],
    }).body);

    expect(request.messages[0].role).toBe("system");
    expect(request.messages[0].content).toContain("EGYPT SPECIALIST PROTOCOL AND IDENTITY");
    expect(request.messages[0].content).toContain("UNDERSTANDING AND CONVERSATION");
    expect(request.messages.map((message: { role: string }) => message.role)).toEqual([
      "system",
      "user",
      "assistant",
      "user",
    ]);
  });

  it("answers naturally and corrects mistaken premises instead of refusing comparisons", () => {
    const prompt = buildChatSystemInstruction("ar");
    expect(prompt).toContain("DIALOGUE QUALITY");
    expect(prompt).toContain("Gently correct factual mistakes");
    expect(prompt).toContain("compare relevant historical figures");
  });

  it("allows English proper names inside otherwise Arabic answers", () => {
    expect(hasArabicLanguageMix("حتشبسوت (Hatshepsut) كانت من أبرز ملكات مصر.")).toBe(false);
    expect(hasArabicLanguageMix("Hatshepsut was an Egyptian ruler.")).toBe(true);
    expect(hasArabicLanguageMix("حتشبسوت היא מלכת מצרים")).toBe(true);
  });

  it.each(["ar", "en", "fr", "es", "de", "zh", "it", "ru", "ja"])(
    "sets a consistent guide identity and language for %s",
    (language) => {
      const prompt = buildChatSystemInstruction(language);
      expect(prompt).toContain("دليل مصر الذكي");
      expect(prompt).toContain("Egyptian archaeological sites");
      expect(prompt).toContain("Never invent");
    },
  );

  it("keeps the distinction between verified facts, hypotheses and legends", () => {
    const prompt = buildChatSystemInstruction("ar");
    expect(prompt).toContain("Verified historical or archaeological information");
    expect(prompt).toContain("Scholarly hypotheses or interpretations");
    expect(prompt).toContain("Popular stories, legends and mythology");
    expect(prompt).toContain("never present a guessed reading as a confirmed translation");
  });

  it("requires sourced, question-focused and evidence-led Egyptian history answers", () => {
    const prompt = buildChatSystemInstruction("ar");
    expect(prompt).toContain("do not answer from general model memory alone");
    expect(prompt).toContain("Check that each historical claim is actually supported");
    expect(prompt).toContain("do not turn correlation into causation");
    expect(prompt).toContain("Answer only what was asked");
    expect(prompt).toContain("do not stop with a generic sources-unavailable refusal");
    expect(prompt).toContain(
      "distinguish established general knowledge from facts verified during this turn",
    );
    expect(prompt).toContain(
      "do not display or list source names, links, citations, or a sources section unless the user explicitly asks",
    );
  });

  it("explains archaeological terms and English spellings for first-time Arabic visitors", () => {
    const prompt = buildChatSystemInstruction("ar");
    expect(prompt).toContain("Assume the visitor is a beginner with no archaeology background");
    expect(prompt).toContain("Arabic phonetic reading first");
    expect(prompt).toContain("Expand abbreviations on first use");
    expect(prompt).toContain("what it is, where it was found/is now");
    expect(prompt).toContain("theory rather than fact");
  });

  it("uses the user's explicit Arabic grammatical preference", () => {
    expect(buildChatSystemInstruction("ar", "feminine")).toContain(
      "feminine grammatical preference",
    );
    expect(buildChatSystemInstruction("ar", "masculine")).toContain(
      "masculine grammatical preference",
    );
  });

  it("builds a valid tourism chat request with the full conversation context", () => {
    const data = chatInput.parse({
      language: "ar",
      messages: [
        { role: "user", content: "أنا في المتحف المصري" },
        { role: "assistant", content: "أهلًا بيك، بتزور أنهي قاعة؟" },
        { role: "user", content: "عايزة أعرف عن تمثال رمسيس" },
      ],
    });
    const request = createOllamaChatRequest(data);
    const payload = JSON.parse(request.body) as { messages: { role: string; content: string }[] };
    expect(payload.messages[0]?.role).toBe("system");
    expect(payload.messages[0]?.content).toContain("ATHARA");
    expect(payload.messages.slice(-3).map((message) => message.content)).toEqual(
      data.messages.map((message) => message.content),
    );
  });

  it("lowers generation randomness when live evidence is supplied", () => {
    const data = chatInput.parse({
      language: "ar",
      messages: [{ role: "user", content: "إيه الآثار في المتحف المصري؟" }],
    });
    const payload = JSON.parse(createOllamaChatRequest(data, "STRICT EVIDENCE MODE").body) as {
      options: { temperature: number; num_predict: number };
      messages: { role: string; content: string }[];
    };

    expect(payload.options.temperature).toBe(0.2);
    expect(payload.options.num_predict).toBe(1200);
    expect(payload.messages[0]?.content).toContain("STRICT EVIDENCE MODE");
  });

  it("allows detailed grounded answers when a curated heritage reference matches", () => {
    const data = chatInput.parse({
      language: "ar",
      messages: [{ role: "user", content: "إيه أهم الآثار اللي في سقارة؟" }],
    });
    const payload = JSON.parse(createOllamaChatRequest(data).body) as {
      options: { temperature: number; num_predict: number };
      messages: { role: string; content: string }[];
    };

    expect(payload.options.temperature).toBe(0.2);
    expect(payload.options.num_predict).toBe(1200);
    expect(payload.messages[0]?.content).toContain("RETRIEVED HERITAGE KNOWLEDGE");
  });

  it("uses the same heritage accuracy rules in the Arabic fallback", () => {
    const data = chatInput.parse({
      language: "ar",
      messages: [{ role: "user", content: "ترجم النقش ده" }],
    });
    const primary = createOllamaChatRequest(data);
    const fallback = createArabicFallbackRequest(primary);
    const payload = JSON.parse(fallback.body) as {
      model: string;
      messages: { role: string; content: string }[];
    };
    expect(payload.model).toBe("qwen3:8b");
    expect(payload.messages[0]?.content).toContain("Never invent");
    expect(payload.messages[0]?.content).toContain("ATHARA");
  });
});
