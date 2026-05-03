import type { Metadata, Viewport } from "next";
import { Syne, JetBrains_Mono, DM_Sans } from "next/font/google";
import "./globals.css";
import SmoothScroll         from "@/components/core/SmoothScroll";
import { GrainOverlay }     from "@/components/core/GrainOverlay";
import { NeonCursor }       from "@/components/core/NeonCursor";
import { SpotlightTactica } from "@/components/core/SpotlightTactica";
import { GridRipple }       from "@/components/core/GridRipple";
import { Navbar }           from "@/components/core/Navbar";
import LiquidMetalAmbient  from "@/components/ambient/LiquidMetalAmbient";
import { AudioProvider }    from "@/context/AudioContext";
import { AudioToggle }      from "@/components/ui/AudioToggle";
import { BackToTop }        from "@/components/ui/BackToTop";

/* ─── Fonts ──────────────────────────────────────────────────────────────── */

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  display: "swap",
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
});

/* ─── Metadata ───────────────────────────────────────────────────────────── */

export const metadata: Metadata = {
  title: {
    default: "Fractal MX — Agencia Creativa con IA",
    template: "%s | Fractal MX",
  },
  description:
    "Agencia creativa en CDMX especializada en contenido audiovisual y gráfico potenciado con inteligencia artificial.",
  keywords: [
    "agencia creativa", "CDMX", "contenido audiovisual",
    "diseño gráfico", "inteligencia artificial", "IA", "Fractal MX",
  ],
  authors: [{ name: "Fractal MX", url: "https://fractalmx.com" }],
  creator: "Fractal MX",
  openGraph: {
    type: "website", locale: "es_MX", url: "https://fractalmx.com",
    siteName: "Fractal MX",
    title: "Fractal MX — Agencia Creativa con IA",
    description: "Agencia creativa en CDMX especializada en contenido audiovisual y gráfico potenciado con IA.",
    images: [{ url: "/og.jpg", width: 1200, height: 630, alt: "Fractal MX" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Fractal MX — Agencia Creativa con IA",
    description: "Contenido audiovisual y gráfico potenciado con IA. CDMX.",
    creator: "@fractalmx",
    images: ["/og.jpg"],
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#080808",
  colorScheme: "dark",
};

/* ─── Root Layout ────────────────────────────────────────────────────────── */

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="es"
      className={`${syne.variable} ${jetbrainsMono.variable} ${dmSans.variable} dark`}
      suppressHydrationWarning
    >
      <body className="min-h-dvh antialiased overflow-x-hidden cursor-none [&_a]:cursor-none [&_button]:cursor-none">
        <AudioProvider>
            <SmoothScroll>
              <GrainOverlay />
              <NeonCursor />
              <SpotlightTactica />
              <GridRipple />
              <LiquidMetalAmbient />
              <Navbar />
              {children}
              <AudioToggle />
              <BackToTop />
            </SmoothScroll>
        </AudioProvider>
      </body>
    </html>
  );
}
