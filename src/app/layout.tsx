import type { Metadata } from "next";
import "./globals.css";
import { SkipLink } from "@/components/accessibility/SkipLink";
import { ReportWebVitals } from "@/infrastructure/performance/ReportWebVitals";
import { Header } from "@/components/layout/Header";
import { Inter, JetBrains_Mono } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});
const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: {
    default: "PokeGuide — Inteligencia Competitiva de Pokémon",
    template: "%s | PokeGuide",
  },
  description:
    "Analiza, simula y optimiza estrategias competitivas de Pokémon con precisión de laboratorio.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="es"
      suppressHydrationWarning
      className={`${inter.className} ${mono.variable}`}
    >
      <body className="flex min-h-screen flex-col bg-[#F8F5F0] text-[#1A1A1A] antialiased">
        <SkipLink />
        <ReportWebVitals />
        <Header />
        <main
          id="main-content"
          tabIndex={-1}
          className="flex-1 w-full max-w-[1600px] mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-8 outline-none"
        >
          {children}
        </main>
      </body>
    </html>
  );
}
