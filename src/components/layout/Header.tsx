"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Menu,
  X,
  Swords,
  Shield,
  Zap,
  Egg,
  History,
  BookOpen,
  Flame,
} from "lucide-react";
import { useUiStore } from "@/stores/ui-store";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const NAV_LINKS = [
  {
    href: "/battle-lab",
    label: "Batalla",
    labelEn: "Battle Lab",
    icon: Swords,
  },
  {
    href: "/team-builder",
    label: "Equipo",
    labelEn: "Team Builder",
    icon: Shield,
  },
  {
    href: "/build-optimizer",
    label: "Optimizar",
    labelEn: "Optimizer",
    icon: Zap,
  },
  { href: "/breeding", label: "Crianza", labelEn: "Breeding", icon: Egg },
  {
    href: "/generations",
    label: "Generaciones",
    labelEn: "Generations",
    icon: History,
  },
  { href: "/pokedex", label: "Pokédex", labelEn: "Pokédex", icon: BookOpen },
] as const;

function isActivePath(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Header() {
  const pathname = usePathname() ?? "";
  const { isMobileMenuOpen, toggleMobileMenu, closeMobileMenu } = useUiStore();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (pathname) closeMobileMenu();
  }, [pathname, closeMobileMenu]);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full border-b transition-all",
        scrolled
          ? "border-[#EDE8E0] bg-[#FFFEFB]/90 backdrop-blur-xl shadow-[0_1px_12px_rgba(0,0,0,0.04)]"
          : "border-[#EDE8E0] bg-[#FFFEFB]/80 backdrop-blur-md",
      )}
    >
      <div className="mx-auto flex h-14 w-full max-w-[1600px] items-center justify-between px-4 md:px-6 lg:px-8">
        <Link
          href="/"
          onClick={closeMobileMenu}
          className="flex items-center gap-2 rounded-xl px-1 py-1 outline-none focus-visible:ring-2 focus-visible:ring-[#111]/20 group"
        >
          <div className="size-7 rounded-lg bg-linear-to-br from-[#D93B32] to-[#B91C1C] flex items-center justify-center shadow-[0_2px_8px_rgba(217,59,50,0.25)]">
            <Flame className="size-4 text-white" />
          </div>
          <span className="text-[15px] font-bold tracking-[-0.02em] text-[#111] flex items-center gap-1.5">
            PokeGuide
            <span className="size-1.5 rounded-full bg-[#D93B32] animate-pulse" />
          </span>
        </Link>

        <nav
          className="hidden items-center gap-1 lg:flex"
          aria-label="Navegación principal"
        >
          {NAV_LINKS.map((link) => {
            const Icon = link.icon;
            const active = isActivePath(pathname, link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                title={link.labelEn}
                className={cn(
                  "flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[12px] font-medium transition-all outline-none focus-visible:ring-2 focus-visible:ring-[#111]/20",
                  active
                    ? "bg-[#111] text-white shadow-sm"
                    : "text-[#7A7570] hover:bg-[#F8F5F0] hover:text-[#111]",
                )}
              >
                <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                {link.label}
              </Link>
            );
          })}
        </nav>

        <Button
          variant="ghost"
          size="icon"
          className="size-8 rounded-full lg:hidden hover:bg-[#F8F5F0]"
          onClick={toggleMobileMenu}
          aria-label={isMobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={isMobileMenuOpen}
          aria-controls="mobile-nav"
        >
          {isMobileMenuOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </Button>
      </div>

      {isMobileMenuOpen && (
        <div
          id="mobile-nav"
          className="border-t border-[#EDE8E0] bg-[#FFFEFB] px-4 py-3 lg:hidden animate-in slide-in-from-top-2 duration-200"
        >
          <nav className="flex flex-col gap-1" aria-label="Navegación móvil">
            {NAV_LINKS.map((link) => {
              const Icon = link.icon;
              const active = isActivePath(pathname, link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={closeMobileMenu}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-colors",
                    active
                      ? "bg-[#111] text-white"
                      : "text-[#5A5652] hover:bg-[#F8F5F0]",
                  )}
                >
                  <div
                    className={cn(
                      "size-7 rounded-lg flex items-center justify-center",
                      active ? "bg-white/15" : "bg-[#F8F5F0]",
                    )}
                  >
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </div>
                  {link.label}
                  <span className="ml-auto text-[10px] font-mono text-[#9A9590]">
                    {link.labelEn}
                  </span>
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
}
