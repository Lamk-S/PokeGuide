import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PokeGuide — Inteligencia Competitiva de Pokémon",
  description:
    "Analiza, simula y optimiza estrategias competitivas de Pokémon.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
