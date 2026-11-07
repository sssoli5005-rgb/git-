import { describe, expect, it } from "vitest";
import { buildChatSystemInstruction } from "./chat-instructions";

describe("buildChatSystemInstruction for Egypt Smart Guide", () => {
  it("uses the selected interface language consistently and keeps Egyptian Arabic natural", () => {
    const prompt = buildChatSystemInstruction("ar");
    expect(prompt).toContain("Use Arabic, the selected interface language, for the entire reply");
    expect(prompt).toContain("takes precedence over the language used in conversation history");
    expect(prompt).toContain("Do not mix languages or give bilingual greetings");
    expect(prompt).toContain("switch only when the user explicitly asks for another language");
    expect(prompt).toContain("natural Egyptian colloquial Arabic");
    expect(buildChatSystemInstruction("en")).toContain(
      "Use English, the selected interface language, for the entire reply",
    );
    expect(buildChatSystemInstruction("de")).toContain(
      "Translate explanations into German",
    );
    expect(buildChatSystemInstruction("fr")).toContain(
      "Use French, the selected interface language, for the entire reply",
    );
  });

  it("handles spelling mistakes gently without changing the user's intent", () => {
    const prompt = buildChatSystemInstruction("ar");
    expect(prompt).toContain("infer the most likely intended wording from context");
    expect(prompt).toContain("Never shame the user");
    expect(prompt).toContain("ask one short, friendly clarification");
  });

  it("corrects mistaken premises and keeps answering instead of refusing or stopping", () => {
    const prompt = buildChatSystemInstruction("ar");
    expect(prompt).toContain("If a premise is factually wrong, gently correct it and explain the supported account");
    expect(prompt).toContain("infer the likely intended meaning");
    expect(prompt).toContain("provide the best supported answer");
    expect(prompt).toContain("do not stop with a generic refusal");
  });

  it("prioritizes archaeological accuracy and labels uncertainty", () => {
    const prompt = buildChatSystemInstruction("en");
    expect(prompt).toContain("Never invent an artifact's identity");
    expect(prompt).toContain("Scholarly hypotheses or interpretations");
    expect(prompt).toContain("Popular stories, legends and mythology");
  });

  it("explains evidence and uncertainty concisely without a default second model pass", () => {
    const prompt = buildChatSystemInstruction("ar");
    expect(prompt).toContain("EXPLANATION QUALITY AND RESPONSE TIME");
    expect(prompt).toContain(
      "lead with a direct answer, then briefly show how the evidence supports it and where inference begins",
    );
    expect(prompt).toContain("Give a clear user-facing rationale, not hidden chain-of-thought");
    expect(prompt).toContain(
      "Prefer a few well-supported details over a long list of names, dates, or examples",
    );
    expect(prompt).toContain("Do not add a second model-review pass by default");
    expect(prompt).toContain("Preserve the configured provider order and fallback behavior");
  });

  it("normalizes clear historical name variants but clarifies ambiguous references", () => {
    const prompt = buildChatSystemInstruction("ar");
    expect(prompt).toContain(
      "Resolve common transliteration, spelling, and phonetic variants of Egyptian rulers, sites, deities, and artifacts from context",
    );
    expect(prompt).toContain("Thutmose/Thutmosis or Khufu/Cheops");
    expect(prompt).toContain(
      "Do not silently normalize when multiple people or places could match; ask one brief clarification",
    );
    expect(prompt).toContain(
      "When a historical premise is mistaken, correct it gently and directly",
    );
    expect(prompt).toContain(
      "If sources disagree or evidence is uncertain, say what is established",
    );
  });

  it("separates artistic style, iconography, theology, and politics", () => {
    const prompt = buildChatSystemInstruction("ar");
    expect(prompt).toContain("VISUAL REPRESENTATION AND RELIGIOUS CHANGE — CRITICAL");
    expect(prompt).toContain("artistic style");
    expect(prompt).toContain("iconography");
    expect(prompt).toContain("religious theology or cult");
    expect(prompt).toContain("political patronage or institutional power");
    expect(prompt).toContain(
      "Never describe Egyptian art as a simple evolution from symbolic to realistic",
    );
    expect(prompt).toContain("STATUE SCALE AND POLITICAL STATUS — CRITICAL");
    expect(prompt).toContain("a visual fact, not proof of equal political authority");
    expect(prompt).toContain("does not establish why this scale was chosen");
  });

  it("guards against the specific unsupported Amun claims from the failed chat answer", () => {
    const prompt = buildChatSystemInstruction("ar");
    expect(prompt).toContain("assign him a bull-headed form");
    expect(prompt).toContain("place the origin of Amun-Re under Tutankhamun");
    expect(prompt).toContain("Horemheb reigned after Akhenaten and Tutankhamun");
    expect(prompt).toContain(
      "If the sources do not support a specific before-and-after comparison",
    );
  });

  it("encourages structured detail for broad archaeological site questions", () => {
    const prompt = buildChatSystemInstruction("ar");
    expect(prompt).toContain("DEPTH FOR HERITAGE AND SITE QUESTIONS");
    expect(prompt).toContain("what each is, what the visitor can observe, and why it matters");
    expect(prompt).toContain("only when supported by current verified information");
  });

  it("shows sources only when the user explicitly asks for them", () => {
    expect(buildChatSystemInstruction("ar")).toContain(
      "do not display or list source names, links, citations, or a sources section unless the user explicitly asks",
    );
  });

  it("avoids Markdown tables that the chat UI cannot render as tables", () => {
    expect(buildChatSystemInstruction("ar")).toContain(
      "Never format an answer as a Markdown table",
    );
  });

  it("uses user-provided sources directly and cites them beside supported claims", () => {
    const prompt = buildChatSystemInstruction("ar");
    expect(prompt).toContain("When the user supplies sources with a question, inspect and extract");
    expect(prompt).toContain(
      "Do not refuse the whole question merely because live search or another source service is unavailable",
    );
    expect(prompt).toContain("place each supplied source link beside the claim it supports");
    expect(prompt).toContain("identify only the specific detail it does not establish");
  });

  it("adapts its conversational style to the user's goal without leaving Egypt heritage scope", () => {
    const prompt = buildChatSystemInstruction("ar");
    expect(prompt).toContain(
      "a warm, attentive conversational assistant as well as an Egyptian heritage guide",
    );
    expect(prompt).toContain("Use relevant details from the current conversation");
    expect(prompt).toContain("teach step by step");
    expect(prompt).toContain("ask one focused clarifying question");
    expect(prompt).toContain("do not agree just to please the user");
    expect(prompt).toContain(
      "Stay focused on Egyptian tourism, history, archaeology, and heritage",
    );
  });

  it("uses contextual specialist analysis without falsely claiming university affiliation", () => {
    const prompt = buildChatSystemInstruction("ar");
    expect(prompt).toContain("CONTEXTUAL EGYPTLOGY ANALYSIS");
    expect(prompt).toContain("never claim to be affiliated with, trained by, or to speak for UCL");
    expect(prompt).toContain("connect archaeological context with textual evidence");
    expect(prompt).toContain(
      "apply them to attested examples only when a reliable text/reference is available",
    );
    expect(prompt).toContain(
      "If no suitable primary-text example is supplied or retrieved, say so rather than inventing one",
    );
    expect(prompt).toContain("do not force either format onto a simple factual question");
  });

  it("does not claim visual recognition or hieroglyphic translation without evidence", () => {
    const prompt = buildChatSystemInstruction("ar");
    expect(prompt).toContain("A photograph alone does not establish an object's identity");
    expect(prompt).toContain("never present a guessed reading as a confirmed translation");
  });

  it("distinguishes artistic color conventions from real skin tone and avoids overclaiming for Nefertiti", () => {
    const prompt = buildChatSystemInstruction("ar");
    expect(prompt).toContain("artistic color conventions");
    expect(prompt).toContain("idealized depiction");
    expect(prompt).toContain("Do not treat a painted Egyptian mask or statue as evidence of a person’s real skin tone");
    expect(prompt).toContain("Nefertiti");
  });

  it("distinguishes a hieroglyph's reading, sound value, function, and conventional sign counts", () => {
    const prompt = buildChatSystemInstruction("ar");
    expect(prompt).toContain(
      "separately verify the sign's depicted object, conventional consonantal value, and function",
    );
    expect(prompt).toContain("not the total number of signs across Egyptian history");
  });

  it("avoids overconfident archaeological dating from names, titles, and artifact styles", () => {
    const prompt = buildChatSystemInstruction("ar");
    expect(prompt).toContain("ARCHAEOLOGICAL DATING AND INFERENCE — CRITICAL");
    expect(prompt).toContain("A named ruler or an object's style does not by itself date the tomb");
    expect(prompt).toContain(
      "a ruler's name in a text is not automatically contemporary with that text",
    );
    expect(prompt).toContain(
      "Multiple occupational titles can be held concurrently, accumulated, or honorific",
    );
    expect(prompt).toContain(
      "A vessel that resembles an earlier typology is not proof of that date or of inheritance",
    );
    expect(prompt).toContain(
      "Do not claim that architecture alone dates a tomb or that mixed-age finds prove a particular reuse scenario",
    );
  });

  it("distinguishes the Berlin pregnancy test record from modern claims about validity", () => {
    const prompt = buildChatSystemInstruction("ar");
    expect(prompt).toContain("Do not deny that an ancient Egyptian pregnancy test is documented");
    expect(prompt).toContain("recorded in the Berlin medical papyrus");
    expect(prompt).toContain(
      "distinguish the ancient text's reported interpretation (sprouting as a pregnancy indication and the different grains as a claimed sex prediction) from modern scientific validity",
    );
    expect(prompt).toContain(
      "found no reliable relationship between which grain sprouted and fetal sex",
    );
    expect(prompt).toContain("do not confuse it with the Ebers Papyrus");
    expect(prompt).toContain(
      "Do not invent or attach turmeric, herbs, or other treatments to this test without direct evidence",
    );
    expect(prompt).toContain("Use accurate terms such as midwife when supported");
  });

  it("requires verifiable evidence for mummy examples and canopic associations", () => {
    const prompt = buildChatSystemInstruction("ar");
    expect(prompt).toContain("MUMMIES, CANOPIC EQUIPMENT, AND EMBALMING — CRITICAL");
    expect(prompt).toContain(
      "Never invent or loosely identify a mummy, person, tomb, object, museum collection, interview, or study",
    );
    expect(prompt).toContain(
      "Do not describe canopic jars as having been found with a particular ruler's mummy unless that association and find context are documented",
    );
    expect(prompt).toContain("Khufu's mummy has not been recovered");
    expect(prompt).toContain(
      'Reject vague or incomplete identifications such as an unqualified "Pepi," "Totem," "Khet," or "Um"',
    );
    expect(prompt).toContain(
      "Distinguish an empty sarcophagus, canopic equipment, a cache, a tomb, and a recovered, identified mummy",
    );
    expect(prompt).toContain("do not impose a simple, uniform, linear progression");
    expect(prompt).toContain(
      "Never cite a museum, scholar, interview, or study generically without a source that can be checked",
    );
  });

  it("keeps the Mostagedda embalming study distinct from Hierakonpolis observations", () => {
    const prompt = buildChatSystemInstruction("ar");
    expect(prompt).toContain("SPECIFIC STUDY — PREHISTORIC EMBALMING AT MOSTAGEDDA");
    expect(prompt).toContain(
      "the chemical analysis was conducted on directly AMS-dated funerary wrappings from Badarian and Predynastic tombs at Mostagedda",
    );
    expect(prompt).toContain(
      "those observations were not the study's biochemical analysis, and their composition was unknown",
    );
    expect(prompt).toContain("approximately 4500–3350 BC");
    expect(prompt).toContain("GC-MS and TD/Py-GC-MS analyses");
    expect(prompt).toContain(
      "pine resin, an aromatic plant extract, plant gum/sugar, a natural petroleum source, and plant oil/animal fat",
    );
    expect(prompt).toContain(
      "it does not demonstrate that every later embalming step or a single standardized dynastic mummification process already existed",
    );
  });

  it("distinguishes ancient Egyptian language stages from their writing systems", () => {
    const prompt = buildChatSystemInstruction("ar");
    expect(prompt).toContain("Treat ancient Egyptian as a language with historical stages");
    expect(prompt).toContain("Old Egyptian, Middle Egyptian, Late Egyptian, Demotic and Coptic");
    expect(prompt).toContain("Coptic is the latest historical stage of Egyptian");
    expect(prompt).toContain("Egyptological transliteration is a scholarly reading convention");
    expect(prompt).toContain("never invent a numeric confidence score");
  });

  it("uses the user's stated grammatical preference without guessing", () => {
    expect(buildChatSystemInstruction("ar", "feminine")).toContain(
      "feminine grammatical preference",
    );
    expect(buildChatSystemInstruction("ar", "masculine")).toContain(
      "masculine grammatical preference",
    );
    expect(buildChatSystemInstruction("ar")).toContain("use neutral phrasing when uncertain");
  });
});
