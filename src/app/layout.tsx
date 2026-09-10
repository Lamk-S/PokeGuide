import type { Metadata } from "next";
import "./globals.css";
import { SkipLink } from "@/components/accessibility/SkipLink";
import { ReportWebVitals } from "@/infrastructure/performance/ReportWebVitals";
import { Header } from "@/components/layout/Header";

export const metadata: Metadata = {
  title: {
    default: "PokeGuide — Inteligencia Competitiva de Pokémon",
    template: "%s | PokeGuide",
  },
  description:
    "Analiza, simula y optimiza estrategias competitivas de Pokémon.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body className="flex min-h-screen flex-col bg-zinc-50 text-zinc-900 antialiased dark:bg-zinc-950 dark:text-zinc-50">
        <SkipLink />
        <ReportWebVitals />
        <Header />
        <main
          id="main-content"
          tabIndex={-1}
          className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-8 py-6 md:py-8 outline-none"
        >
          {children}
        </main>
      </body>
    </html>
  );
}
