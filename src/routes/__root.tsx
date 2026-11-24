import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
  type ErrorComponentProps,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { BackgroundMusic } from "../components/background-music";
import { LanguageProvider } from "../i18n/language";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">الصفحة مش موجودة</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          الصفحة اللي بتدور عليها مش موجودة أو اتنقلت.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            الصفحة الرئيسية
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: ErrorComponentProps) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          الصفحة مش راضية تفتح
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          حصلت مشكلة مؤقتة. جرّب تحدّث الصفحة أو ارجع للرئيسية.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            جرّب تاني
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-full border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "أثَرة | دليل مصر الذكي" },
      {
        name: "description",
        content:
          "دليل سياحي رقمي متعدد اللغات للتعرّف على التراث المصري والقطع الأثرية والنقوش والتاريخ.",
      },
      { property: "og:title", content: "أثَرة | دليل مصر الذكي" },
      {
        property: "og:description",
        content: "اكتشف التراث المصري والقطع الأثرية والنقوش والحكايات التاريخية بلغتك.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:site", content: "@Lovable" },
    ],
    links: [
      // Start the remote image connections early so CSS background images do not
      // have to wait for a separate DNS/TLS connection after the stylesheet loads.
      { rel: "preconnect", href: "https://commons.wikimedia.org" },
      { rel: "preconnect", href: "https://smarthistory.org" },
      { rel: "preconnect", href: "https://static.wixstatic.com" },
      { rel: "preconnect", href: "https://www.ansa.it" },
      { rel: "preconnect", href: "https://i0.wp.com" },
      { rel: "preconnect", href: "https://the-past.com" },
      // These are the first backgrounds users encounter (login + welcome cards).
      // Preloading them lets the browser fetch them while the app stylesheet is parsed.
      {
        rel: "preload",
        as: "image",
        href: "https://commons.wikimedia.org/wiki/Special:FilePath/Pyramids%20of%20Giza.jpg?width=2000",
      },
      {
        rel: "preload",
        as: "image",
        href: "https://commons.wikimedia.org/wiki/Special:FilePath/Pyramids%20of%20Giza.jpg?width=1200",
      },
      {
        rel: "preload",
        as: "image",
        href: "https://commons.wikimedia.org/wiki/Special:FilePath/Sphinx%20and%20pyramids%20of%20Giza%20panorama.jpg?width=1200",
      },
      // Preload the four actual category-card backgrounds used on the home screen.
      {
        rel: "preload",
        as: "image",
        href: "https://smarthistory.org/wp-content/uploads/2022/01/18999591014_5a0b6d2b9a_k.jpg",
      },
      {
        rel: "preload",
        as: "image",
        href: "https://static.wixstatic.com/media/8a573e_d67f6bd991dc474991dd41b038075fad~mv2.png/v1/fill/w_980%2Ch_1307%2Cal_c%2Cq_90%2Cusm_0.66_1.00_0.01%2Cenc_avif%2Cquality_auto/8a573e_d67f6bd991dc474991dd41b038075fad~mv2.png",
      },
      {
        rel: "preload",
        as: "image",
        href: "https://www.ansa.it/webimages/news_base/2025/6/14/1ab3286f8d80d2a4527088c1c40ae267.jpg",
      },
      {
        rel: "preload",
        as: "image",
        href: "https://i0.wp.com/the-past.com/wp-content/uploads/2025/04/AE148OutandAbout13.jpg?resize=782%2C1024&ssl=1",
      },
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;500;600;700&family=Manrope:wght@400;500;600;700;800&family=Noto+Sans+SC:wght@400;500;700&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
        <Outlet />
        <BackgroundMusic />
      </LanguageProvider>
    </QueryClientProvider>
  );
}
