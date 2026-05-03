import { Hero }            from "@/components/sections/Hero";
import { Statement }       from "@/components/sections/Statement";
import { NumberScreen }    from "@/components/sections/NumberScreen";
import { Clients }         from "@/components/sections/Clients";
import { Services }        from "@/components/sections/Services";
import { Manifesto }       from "@/components/sections/Manifesto";
import { Portfolio }       from "@/components/sections/Portfolio";
import { TacticalBriefingStrip } from "@/components/sections/TacticalBriefingStrip";
import { CTA }             from "@/components/sections/CTA";
import { ContactSection }  from "@/components/sections/ContactSection";
import { WhatsAppFloat }   from "@/components/ui/WhatsAppFloat";
import { Footer }          from "@/components/layout/Footer";

export default function Home() {
  return (
    <>
      <main>
        <Hero />
        <Statement />
        <NumberScreen />
        <Clients />
        <Services />
        <Portfolio />
        <TacticalBriefingStrip />
        <Manifesto />
        <CTA />
        <ContactSection />
      </main>
      <Footer />
      <WhatsAppFloat />
    </>
  );
}
