import { PROJECT_INFO } from "@/lib/project-info";
import { useLanguage } from "@/i18n/language";

export function ProjectFooter() {
  const { t } = useLanguage();

  return (
    <footer className="mt-auto w-full border-t border-border/60 bg-card/60 px-4 py-5 text-center">
      <div className="mx-auto max-w-6xl border-t border-primary/20 pt-4" aria-label={t.projectAdmin.label}>
        <p className="text-sm font-semibold tracking-wide text-primary sm:text-base">{t.projectAdmin.admin} {PROJECT_INFO.ownerName}</p>
        <p className="mt-1 text-xs font-medium text-muted-foreground sm:text-sm">{t.projectAdmin.created} {PROJECT_INFO.creatorName}</p>
      </div>
    </footer>
  );
}
