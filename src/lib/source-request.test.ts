import { describe, expect, it } from "vitest";

import { isSourceRequest } from "./source-request";

describe("isSourceRequest", () => {
  it.each([
    ["المصادر؟", true],
    ["جبت المعلومات دي منين؟", true],
    ["اكتب منين جايب المعلومات", true],
    ["What are your sources?", true],
    ["Tell me about Saqqara", false],
  ])("detects explicit source requests in %s", (message, expected) => {
    expect(isSourceRequest(message)).toBe(expected);
  });
});
