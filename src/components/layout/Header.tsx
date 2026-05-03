"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const WA_LINK = "https://wa.me/525562123864";

const NAV_LINKS = [
  { label: "Servicios", href: "#servicios" },
  { label: "Clientes",  href: "#clientes"  },
  { label: "Contacto",  href: "#contacto"  },
] as const;

export function Header() {
  const [scrolled, setScrolled]   = useState(false);
  const [menuOpen, setMenuOpen]   = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 48);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* lock body scroll when mobile menu is open */
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-[#080808]/95 backdrop-blur-md border-b border-[#1f1f1f]"
          : "bg-transparent"
      )}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 md:px-8 py-4">

        {/* ── Logo ── */}
        <Link href="/" className="relative z-10 flex items-center gap-3 shrink-0" aria-label="Fractal MX — inicio">
          <Image
            src="/logo_fractal_verde.png"
            alt="Fractal MX ícono"
            width={40}
            height={40}
            priority
            className="h-9 w-9 rounded-sm"
          />
          <span className="font-headline text-lg font-bold tracking-tight leading-none">
            FRACTAL<span className="text-[#3BEA3B]">MX</span>
          </span>
        </Link>

        {/* ── Desktop nav ── */}
        <nav className="hidden md:flex items-center gap-10" aria-label="Navegación principal">
          {NAV_LINKS.map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              className="relative text-sm font-medium text-[#888888] hover:text-[#F5F5F5] transition-colors duration-200
                         after:absolute after:-bottom-0.5 after:left-0 after:h-px after:w-0
                         after:bg-[#3BEA3B] after:transition-all after:duration-300 hover:after:w-full"
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* ── Desktop CTA ── */}
        <a
          href={WA_LINK}
          target="_blank"
          rel="noopener noreferrer"
          className="hidden md:inline-flex items-center gap-2 bg-[#3BEA3B] px-5 py-2.5
                     font-semibold text-sm text-black
                     hover:bg-[#2fd132] active:scale-95
                     transition-all duration-200"
        >
          {/* WhatsApp icon */}
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
            <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.556 4.117 1.528 5.845L.057 23.667a.5.5 0 00.61.61l5.822-1.471A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.91 0-3.697-.504-5.238-1.384l-.376-.215-3.893.984.984-3.893-.215-.376A10 10 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
          </svg>
          Hablemos
        </a>

        {/* ── Mobile hamburger ── */}
        <button
          onClick={() => setMenuOpen((v) => !v)}
          className="md:hidden relative z-10 flex flex-col justify-center gap-[5px] w-8 h-8"
          aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
        >
          <span className={cn("block h-px w-6 bg-[#F5F5F5] transition-all duration-300 origin-center",
            menuOpen && "rotate-45 translate-y-[7px]")} />
          <span className={cn("block h-px w-6 bg-[#F5F5F5] transition-all duration-300",
            menuOpen && "opacity-0 scale-x-0")} />
          <span className={cn("block h-px w-6 bg-[#F5F5F5] transition-all duration-300 origin-center",
            menuOpen && "-rotate-45 -translate-y-[7px]")} />
        </button>
      </div>

      {/* ── Mobile menu overlay ── */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            key="mobile-menu"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="md:hidden absolute inset-x-0 top-full bg-[#080808] border-b border-[#1f1f1f]"
          >
            <nav className="flex flex-col px-5 py-8 gap-6">
              {NAV_LINKS.map(({ label, href }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMenuOpen(false)}
                  className="text-xl font-semibold text-[#F5F5F5] hover:text-[#3BEA3B] transition-colors"
                >
                  {label}
                </Link>
              ))}
              <a
                href={WA_LINK}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMenuOpen(false)}
                className="mt-2 inline-flex items-center justify-center gap-2 bg-[#3BEA3B] px-6 py-3 font-bold text-black text-sm"
              >
                Hablemos por WhatsApp
              </a>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
