import { afterEach, describe, expect, it } from "vitest";
import { verifyCredentials } from "./auth";

afterEach(() => {
  delete process.env.APP_USERNAME;
  delete process.env.ADMIN_PASSWORD;
  delete process.env.APP_PASSWORD_HASH;
  delete process.env.APP_SESSION_SECRET;
});

describe("local administrator authentication", () => {
  it("accepts the configured plain-text password before a stale hash", () => {
    process.env.APP_USERNAME = "إنصاف 50012";
    process.env.ADMIN_PASSWORD = "01101493372";
    process.env.APP_PASSWORD_HASH = "stale.invalid.hash";
    process.env.APP_SESSION_SECRET = "test-session-secret";

    expect(verifyCredentials("إنصاف 50012", "01101493372")).toBe(true);
  });

  it("normalizes whitespace and invisible RTL marks", () => {
    process.env.APP_USERNAME = "إنصاف 50012";
    process.env.ADMIN_PASSWORD = "01101493372";
    process.env.APP_SESSION_SECRET = "test-session-secret";

    expect(verifyCredentials("\u202e إنصاف50012 \u202c", "\u200f01101493372\u200e")).toBe(true);
  });

  it("accepts the user’s exact username spelling and repeated Arabic alef variants", () => {
    process.env.APP_USERNAME = "إنصاف 50012";
    process.env.ADMIN_PASSWORD = "01101493372";
    process.env.APP_SESSION_SECRET = "test-session-secret";

    expect(verifyCredentials("انصاف 50012", "01101493372")).toBe(true);
    expect(verifyCredentials("إإإنصاف50012", "01101493372")).toBe(true);
  });
});
