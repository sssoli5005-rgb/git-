import { describe, expect, it } from "vitest";
import { buildChatSystemInstruction } from "./chat-instructions";

describe("Arabic address consistency for the Egyptian tourism guide", () => {
  it("uses explicit feminine address preference when provided", () => {
    expect(buildChatSystemInstruction("ar", "feminine")).toContain("feminine grammatical preference");
  });

  it("uses explicit masculine address preference when provided", () => {
    expect(buildChatSystemInstruction("ar", "masculine")).toContain("masculine grammatical preference");
  });

  it("does not infer the user's gender from a third person or ambiguous name", () => {
    const prompt = buildChatSystemInstruction("ar");
    expect(prompt).toContain("Do not infer gender from a third party or an ambiguous name");
    expect(prompt).toContain("use neutral phrasing when uncertain");
  });
});
