import { Check, Compass, HeartHandshake, Scale } from "lucide-react";
import { useLanguage } from "@/i18n/language";

const featureIcons = [HeartHandshake, Compass, Scale];

export function Features() {
  const { t } = useLanguage();

  return (
    <section id="features" className="mx-auto max-w-6xl scroll-mt-24 px-4 py-20 sm:px-6">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-bold tracking-tight text-balance sm:text-4xl">
          {t.features.title}
        </h2>
        <p className="mt-4 text-lg text-muted-foreground">{t.features.subtitle}</p>
      </div>

      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {t.features.items.map((item, index) => {
          const Icon = featureIcons[index] ?? HeartHandshake;
          return (
            <article
              key={index}
              className="rounded-3xl border border-border bg-card p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-soft"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Icon className="h-6 w-6" aria-hidden />
              </span>
              <h3 className="mt-5 text-xl font-bold">{item.title}</h3>
              <p className="mt-3 leading-relaxed text-muted-foreground">{item.desc}</p>
            </article>
          );
        })}
      </div>
    </section>
  );
}

export function HowItWorks() {
  const { t } = useLanguage();

  return (
    <section id="how" className="scroll-mt-24 bg-secondary/50 py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-balance sm:text-4xl">
            {t.how.title}
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">{t.how.subtitle}</p>
        </div>

        <ol className="mt-14 grid gap-10 md:grid-cols-3 md:gap-6">
          {t.how.steps.map((step, index) => (
            <li key={index} className="relative text-center md:text-start">
              <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground shadow-soft md:mx-0">
                {index + 1}
              </span>
              <h3 className="mt-5 text-lg font-bold">{step.title}</h3>
              <p className="mt-2 leading-relaxed text-muted-foreground">{step.desc}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export function Principles() {
  const { t } = useLanguage();

  return (
    <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
      <div className="rounded-[2rem] border border-primary/15 bg-primary/5 p-8 sm:p-12">
        <h2 className="text-center text-2xl font-bold tracking-tight sm:text-3xl">
          {t.principles.title}
        </h2>
        <ul className="mt-10 grid gap-8 text-center md:grid-cols-3">
          {t.principles.items.map((item, index) => (
            <li key={index} className="flex flex-col items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <Check className="h-5 w-5" aria-hidden />
              </span>
              <p className="font-semibold leading-relaxed">{item}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
