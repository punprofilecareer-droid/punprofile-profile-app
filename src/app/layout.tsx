import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Fraunces, Inter, Noto_Sans_Thai, Noto_Serif_Thai } from "next/font/google";
import "./globals.css";
import ConvexClientProvider from "./ConvexClientProvider";
import { ConvexAuthNextjsServerProvider } from "@convex-dev/auth/nextjs/server";
import LocaleProvider from "@/components/LocaleProvider";
import LocaleToggle from "@/components/LocaleToggle";
import { DEFAULT_LOCALE, LOCALE_COOKIE, isLocale, t } from "@/lib/locale";

/**
 * The four faces the design system names: Fraunces and Inter for Latin, Noto
 * Serif Thai and Noto Sans Thai for Thai. `globals.css` composes them into one
 * stack per tier, so Thai and Latin coexist in a single string without a
 * language switch. See `design.md` in the sibling coaching repo.
 */
const fraunces = Fraunces({ variable: "--font-fraunces", subsets: ["latin"] });
const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const notoSerifThai = Noto_Serif_Thai({
  variable: "--font-noto-serif-thai",
  subsets: ["thai", "latin"],
});
const notoSansThai = Noto_Sans_Thai({
  variable: "--font-noto-sans-thai",
  subsets: ["thai", "latin"],
});

const fontVars = [
  fraunces.variable,
  inter.variable,
  notoSerifThai.variable,
  notoSansThai.variable,
].join(" ");

export const metadata: Metadata = {
  title: "PunProfile",
  description:
    "An honest, coach-informed first read on your EU job-market readiness.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Read on the server so the first paint is already in the right language and
  // <html lang> is honest. `cookies()` is async here, and cannot be written
  // during render: the toggle writes it client-side instead.
  const stored = (await cookies()).get(LOCALE_COOKIE)?.value;
  const locale = isLocale(stored) ? stored : DEFAULT_LOCALE;

  return (
    <ConvexAuthNextjsServerProvider>
      {/* Browser extensions stamp attributes onto <html> before React hydrates
          (LanguageTool's `data-lt-installed`, password managers, translators),
          which reads as a hydration mismatch in dev. This suppresses attribute
          mismatches on this element only, so it cannot mask a real one in a
          component. */}
      <html
        lang={locale}
        suppressHydrationWarning
        className={`${fontVars} h-full antialiased`}
      >
        <body className="min-h-full flex flex-col">
          <LocaleProvider initial={locale}>
            {/* nav-header: surface, ink, 72px, and never competing with page
                content for colour attention. */}
            <header className="flex h-[72px] shrink-0 items-center justify-between gap-4 border-b border-neutral-300 bg-surface px-6">
              <span className="text-label text-ink">{t("nav.brand", locale)}</span>
              <LocaleToggle />
            </header>
            <ConvexClientProvider>
              <main className="flex flex-1 flex-col">{children}</main>
            </ConvexClientProvider>
            <footer className="border-t border-neutral-300 bg-surface px-6 py-12 text-caption text-slate">
              {t("footer.brand", locale)}
            </footer>
          </LocaleProvider>
        </body>
      </html>
    </ConvexAuthNextjsServerProvider>
  );
}
