import type { Metadata } from "next";
import "./globals.css";
import { SkipLink } from "@/components/accessibility/SkipLink";
import { ReportWebVitals } from "@/infrastructure/performance/ReportWebVitals";

export const metadata: Metadata = {
  title: "PokeGuide — Inteligencia Competitiva de Pokémon",
  description:
    "Analiza, simula y optimiza estrategias competitivas de Pokémon.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans antialiased">
        <SkipLink />
        <ReportWebVitals />
        <main id="main-content" tabIndex={-1} className="outline-none">
          {children}
        </main>
      </body>
    </html>
  );
}
