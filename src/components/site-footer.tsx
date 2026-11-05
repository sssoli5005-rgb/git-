import { ArrowRight, HeartHandshake } from "lucide-react";
import { useLanguage } from "@/i18n/language";

export function SiteFooter() {
  const { t } = useLanguage();

  return (
    <footer>
      <section id="cta" className="mx-auto max-w-6xl scroll-mt-24 px-4 pb-20 pt-4 sm:px-6">
        <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-calm px-6 py-16 text-center text-primary-foreground shadow-soft sm:px-12">
          <div
            aria-hidden
            className="pointer-events-none absolute -top-24 start-[-6%] h-72 w-72 rounded-full bg-primary-foreground/10 blur-3xl"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-24 end-[-6%] h-72 w-72 rounded-full bg-apricot/25 blur-3xl"
          />

          <div className="relative">
            <h2 className="text-3xl font-bold tracking-tight text-balance sm:text-4xl">
              {t.cta.title}
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-lg opacity-90">{t.cta.text}</p>
            <a
              href="#chat-preview"
              className="group mt-9 inline-flex items-center gap-2 rounded-full bg-background px-8 py-4 text-base font-bold text-primary transition-transform hover:scale-105"
            >
              {t.cta.button}
              <ArrowRight
                className="h-4 w-4 transition-transform group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1"
                aria-hidden
              />
            </a>
            <p className="mt-4 text-sm opacity-80">{t.cta.note}</p>
          </div>
        </div>
      </section>

      <div className="border-t border-border/60 bg-card/60">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <HeartHandshake className="h-4 w-4" aria-hidden />
            </span>
            <span className="font-bold tracking-tight">اختبرها · Ekhtaberha</span>
          </div>
          <p className="mt-3 text-sm font-medium text-muted-foreground">{t.footer.tagline}</p>
          <p className="mt-6 max-w-3xl text-xs leading-relaxed text-muted-foreground">
            {t.footer.note}
          </p>
          <p className="mt-4 text-xs text-muted-foreground">{t.footer.rights}</p>
        </div>
      </div>
    </footer>
  );
}
