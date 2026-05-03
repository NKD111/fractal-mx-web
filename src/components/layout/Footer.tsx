import Link from "next/link";
import Image from "next/image";

const WA_LINK = "https://wa.me/525562123864";
const EMAIL   = "proyectosfractalmx@gmail.com";
const IG_LINK = "https://instagram.com/fractal_mexico";

const NAV = [
  { label: "Servicios", href: "#services"  },
  { label: "Portafolio",href: "#portafolio"},
  { label: "Clientes",  href: "#clientes"  },
  { label: "Contacto",  href: "#contacto"  },
] as const;

const SOCIAL = [
  {
    label: "Instagram",
    href: IG_LINK,
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
        <circle cx="12" cy="12" r="4"/>
        <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none"/>
      </svg>
    ),
  },
  {
    label: "WhatsApp",
    href: WA_LINK,
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
        <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.556 4.117 1.528 5.845L.057 23.667a.5.5 0 00.61.61l5.822-1.471A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.91 0-3.697-.504-5.238-1.384l-.376-.215-3.893.984.984-3.893-.215-.376A10 10 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
      </svg>
    ),
  },
  {
    label: "Email",
    href: `mailto:${EMAIL}`,
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <rect x="2" y="4" width="20" height="16" rx="2"/>
        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
      </svg>
    ),
  },
] as const;

export function Footer() {
  return (
    <footer className="relative bg-[#080808] border-t border-[#1f1f1f]">
      <div className="mx-auto max-w-7xl px-5 md:px-8 py-16 md:py-20">

        {/* main row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8 pb-12 border-b border-[#1f1f1f]">

          {/* brand block */}
          <div className="flex flex-col gap-5">
            <Link href="/" aria-label="Fractal MX — inicio" className="inline-flex items-center gap-3 w-fit">
              <Image
                src="/logo_fractal_verde.png"
                alt="Fractal MX"
                width={36}
                height={36}
                className="h-8 w-8 rounded-sm"
              />
              <span className="font-headline text-lg font-bold tracking-tight text-[#F5F5F5] leading-none">
                FRACTAL<span className="text-[#3BEA3B]">MX</span>
              </span>
            </Link>
            <p className="font-body text-sm text-[#555555] leading-relaxed max-w-[220px]">
              Vivimos para crear.
            </p>
            {/* social icons */}
            <div className="flex items-center gap-4 mt-1">
              {SOCIAL.map(({ label, href, icon }) => (
                <a
                  key={label}
                  href={href}
                  target={href.startsWith("mailto") ? undefined : "_blank"}
                  rel={href.startsWith("mailto") ? undefined : "noopener noreferrer"}
                  aria-label={label}
                  className="text-[#333333] hover:text-[#3BEA3B] transition-colors duration-200"
                >
                  {icon}
                </a>
              ))}
            </div>
          </div>

          {/* nav */}
          <div className="flex flex-col gap-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#333333] mb-1">
              Navegación
            </p>
            {NAV.map(({ label, href }) => (
              <Link
                key={href}
                href={href}
                className="font-body text-sm text-[#555555] hover:text-[#F5F5F5] transition-colors duration-200 w-fit"
              >
                {label}
              </Link>
            ))}
          </div>

          {/* contact */}
          <div className="flex flex-col gap-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#333333] mb-1">
              Contacto
            </p>
            <a
              href={WA_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="font-body text-sm text-[#555555] hover:text-[#3BEA3B] transition-colors duration-200 w-fit"
            >
              WhatsApp directo
            </a>
            <a
              href={`mailto:${EMAIL}`}
              className="font-body text-sm text-[#555555] hover:text-[#F5F5F5] transition-colors duration-200 w-fit break-all"
            >
              {EMAIL}
            </a>
            <p className="font-body text-sm text-[#333333]">
              CDMX, México
            </p>
          </div>
        </div>

        {/* bottom bar */}
        <div className="pt-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <p className="font-mono text-[11px] text-[#2a2a2a] uppercase tracking-widest">
            © {new Date().getFullYear()} Fractal MX. CDMX, México.
          </p>
          <p className="font-mono text-[11px] text-[#2a2a2a] uppercase tracking-widest">
            Hecho con IA en México
          </p>
        </div>
      </div>
    </footer>
  );
}
