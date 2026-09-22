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
    label: "Battle Lab",
    labelEs: "Batalla",
    icon: Swords,
  },
  {
    href: "/team-builder",
    label: "Team Builder",
    labelEs: "Equipo",
    icon: Shield,
  },
  {
    href: "/build-optimizer",
    label: "Optimizer",
    labelEs: "Optimizar",
    icon: Zap,
  },
  { href: "/breeding", label: "Breeding", labelEs: "Crianza", icon: Egg },
  {
    href: "/generations",
    label: "Generations",
    labelEs: "Gens",
    icon: History,
  },
  { href: "/pokedex", label: "Pokédex", labelEs: "Pokédex", icon: BookOpen },
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
          ? "border-zinc-200/80 bg-white/90 backdrop-blur-xl shadow-[0_1px_12px_rgba(0,0,0,0.04)] dark:border-zinc-800/80 dark:bg-zinc-950/90"
          : "border-zinc-200 bg-white/80 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/80",
      )}
    >
      <div className="mx-auto flex h-15 w-full max-w-7xl items-center justify-between px-4 md:px-6 lg:px-8">
        {/* Logo */}
        <Link
          href="/"
          onClick={closeMobileMenu}
          className="flex items-center gap-2.5 rounded-xl px-1 py-1 outline-none focus-visible:ring-2 focus-visible:ring-blue-600 group"
        >
          <div className="size-8 rounded-lg bg-linear-to-br from-[#D93B32] to-[#B91C1C] flex items-center justify-center shadow-[0_2px_8px_rgba(217,59,50,0.25)] group-hover:shadow-[0_4px_12px_rgba(217,59,50,0.3)] transition-shadow">
            <Flame className="size-4 text-white" />
          </div>
          <span className="text-[17px] font-bold tracking-[-0.02em] text-zinc-900 dark:text-zinc-50">
            PokeGuide
          </span>
        </Link>

        {/* Desktop Nav */}
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
                className={cn(
                  "flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[13px] font-medium transition-all outline-none focus-visible:ring-2 focus-visible:ring-blue-600",
                  active
                    ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-sm"
                    : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-100",
                )}
              >
                <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                <span className="hidden xl:inline">{link.label}</span>
                <span className="xl:hidden">{link.labelEs}</span>
              </Link>
            );
          })}
        </nav>

        {/* Mobile toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="size-9 rounded-full lg:hidden hover:bg-zinc-100 dark:hover:bg-zinc-900"
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

      {/* Mobile Nav */}
      {isMobileMenuOpen && (
        <div
          id="mobile-nav"
          className="border-t border-zinc-200 bg-white px-4 py-4 dark:border-zinc-800 dark:bg-zinc-950 lg:hidden animate-in slide-in-from-top-2 duration-200"
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
                    "flex items-center gap-3 rounded-xl px-4 py-3 text-[14px] font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-blue-600",
                    active
                      ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
                      : "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-900",
                  )}
                >
                  <div
                    className={cn(
                      "size-8 rounded-lg flex items-center justify-center",
                      active
                        ? "bg-white/15 dark:bg-zinc-900/10"
                        : "bg-zinc-100 dark:bg-zinc-800",
                    )}
                  >
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </div>
                  {link.label}
                  <span className="ml-auto text-[11px] text-zinc-400">
                    {link.labelEs}
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
