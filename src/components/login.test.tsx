import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { LanguageProvider } from "@/i18n/language";
import { Login } from "./login";

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("Login", () => {
  it("shows the setup warning when the login backend is unavailable or not configured", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network unavailable")));

    render(
      <LanguageProvider>
        <Login onAuthenticated={vi.fn()} />
      </LanguageProvider>,
    );

    fireEvent.change(screen.getByLabelText("اسم المستخدم"), {
      target: { value: "إنصاف 50012" },
    });
    fireEvent.change(screen.getByLabelText("كلمة المرور"), {
      target: { value: "01101493372" },
    });
    fireEvent.click(screen.getByRole("button", { name: "تسجيل الدخول" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "لم يتم إعداد تسجيل الدخول بعد. راجع إعداد الخادم الآمن.",
    );
  });
});
