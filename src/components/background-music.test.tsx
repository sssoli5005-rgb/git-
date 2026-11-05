import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { LanguageProvider } from "@/i18n/language";
import { BackgroundMusic } from "./background-music";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("BackgroundMusic", () => {
  it("keeps music control available and lets the user play and pause music", async () => {
    const play = vi.spyOn(HTMLMediaElement.prototype, "play").mockResolvedValue(undefined);
    const pause = vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(() => {});

    render(
      <LanguageProvider>
        <BackgroundMusic />
      </LanguageProvider>,
    );

    expect(screen.getByRole("button", { name: "تشغيل الموسيقى" })).toBeInTheDocument();
    expect(document.querySelector("audio")).toHaveAttribute("src", "/audio/intro.mp3");

    fireEvent.click(screen.getByRole("button", { name: "تشغيل الموسيقى" }));
    expect(await screen.findByRole("button", { name: "كتم الموسيقى" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(play).toHaveBeenCalledOnce();

    fireEvent.click(screen.getByRole("button", { name: "كتم الموسيقى" }));
    expect(await screen.findByRole("button", { name: "تشغيل الموسيقى" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
    expect(pause).toHaveBeenCalledOnce();
  });
});
