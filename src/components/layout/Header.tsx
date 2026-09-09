"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import {
  Menu,
  X,
  Swords,
  Shield,
  Zap,
  Egg,
  History,
  BookOpen,
} from "lucide-react";
import { useUiStore } from "@/stores/ui-store";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const NAV_LINKS = [
  { href: "/battle-lab", label: "Battle Lab", icon: Swords },
  { href: "/team-builder", label: "Team Builder", icon: Shield },
  { href: "/build-optimizer", label: "Optimizer", icon: Zap },
  { href: "/breeding", label: "Breeding", icon: Egg },
  { href: "/generations", label: "Generations", icon: History },
  { href: "/pokedex", label: "Pokédex", icon: BookOpen },
] as const;

function isActivePath(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Header() {
  const pathname = usePathname() ?? "";
  const { isMobileMenuOpen, toggleMobileMenu, closeMobileMenu } = useUiStore();

  useEffect(() => {
    if (pathname !== null) {
      closeMobileMenu();
    }
  }, [pathname, closeMobileMenu]);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-200 bg-white/80 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/80">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 md:px-8">
        {/* Marca / Logotipo */}
        <Link
          href="/"
          onClick={closeMobileMenu}
          className="flex items-center gap-2 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
        >
          <span className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            PokeGuide
          </span>
        </Link>

        {/* Navegación Desktop */}
        <nav
          className="hidden items-center gap-6 lg:flex"
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
                  "flex items-center gap-2 rounded-md px-2 py-1 text-sm font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-blue-600",
                  active
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-zinc-600 hover:text-blue-600 dark:text-zinc-400",
                )}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Toggle Menú Móvil */}
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
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

      {/* Navegación Móvil */}
      {isMobileMenuOpen && (
        <div
          id="mobile-nav"
          className="border-b border-zinc-200 bg-zinc-50 px-4 py-4 dark:border-zinc-800 dark:bg-zinc-900 lg:hidden"
        >
          <nav className="flex flex-col gap-2" aria-label="Navegación móvil">
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
                    "flex items-center gap-3 rounded-lg px-3 py-3 text-base font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-blue-600",
                    active
                      ? "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400"
                      : "text-zinc-700 hover:bg-zinc-200 dark:text-zinc-300 dark:hover:bg-zinc-800",
                  )}
                >
                  <Icon className="h-5 w-5" aria-hidden="true" />
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
}
