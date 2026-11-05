import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, Landmark, Languages, LogOut } from "lucide-react";
import { LANGUAGES } from "@/i18n/translations";
import { useLanguage } from "@/i18n/language";

export function SiteHeader({ showNavigation = true, onLogout }: { showNavigation?: boolean; onLogout?: () => void }) {
  const { lang, setLang, t } = useLanguage();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  const current = LANGUAGES.find((l) => l.code === lang) ?? LANGUAGES[0];

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <a href="/" className="flex items-center gap-2.5" aria-label="ATHARA">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-soft">
            <Landmark className="h-5 w-5" aria-hidden />
          </span>
          <span className="flex items-baseline gap-2 font-bold tracking-tight">
            <span className="text-lg font-extrabold">أثَرة</span>
          </span>
        </a>

        {showNavigation && (
          <nav className="hidden items-center gap-7 text-sm font-medium text-muted-foreground md:flex">
            <a href="#features" className="transition-colors hover:text-foreground">
              {t.nav.features}
            </a>
            <a href="#how" className="transition-colors hover:text-foreground">
              {t.nav.how}
            </a>
          </nav>
        )}

        <div className="flex items-center gap-2">
        {onLogout && (
          <button
            type="button"
            onClick={onLogout}
            className="flex items-center gap-2 rounded-full border border-border bg-card px-3.5 py-2 text-sm font-semibold transition-colors hover:bg-accent/50"
          >
            <LogOut className="h-4 w-4 text-primary" aria-hidden />
            <span className="hidden sm:inline">{t.auth.logout}</span>
          </button>
        )}
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-haspopup="listbox"
            aria-expanded={open}
            aria-label={t.meta.language}
            className="flex items-center gap-2 rounded-full border border-border bg-card px-3.5 py-2 text-sm font-semibold transition-colors hover:bg-accent/50"
          >
            <Languages className="h-4 w-4 text-primary" aria-hidden />
            <span>{current.label}</span>
            <ChevronDown
              className={`h-3.5 w-3.5 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`}
              aria-hidden
            />
          </button>

          {open && (
            <div
              role="listbox"
              aria-label={t.meta.language}
              className="absolute end-0 top-[calc(100%+8px)] z-50 w-48 rounded-2xl border border-border bg-popover p-1.5 shadow-soft"
            >
              {LANGUAGES.map((l) => (
                <button
                  key={l.code}
                  type="button"
                  role="option"
                  aria-selected={l.code === lang}
                  onClick={() => {
                    setLang(l.code);
                    setOpen(false);
                  }}
                  className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm transition-colors hover:bg-accent/50"
                >
                  <span className={l.code === lang ? "font-bold" : ""}>{l.label}</span>
                  {l.code === lang && <Check className="h-4 w-4 text-primary" aria-hidden />}
                </button>
              ))}
            </div>
          )}
        </div>
        </div>
      </div>
    </header>
  );
}
