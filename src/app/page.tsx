import { Blueprint } from "@/components/Blueprint";
import { ContactoSection } from "@/components/ContactoSection";
import { HeroFolder } from "@/components/HeroFolder";
import { PremiosSection } from "@/components/PremiosSection";
import { Stack } from "@/components/StackLayer";
import { TrayectoriaSection } from "@/components/TrayectoriaSection";
import { TweaksPanel } from "@/components/TweaksPanel";
import { WebsSection } from "@/components/WebsSection";

export default function Home() {
  return (
    <>
      <Blueprint />
      {/* El cajón: todas las carpetas son hermanas para que cada una suba y tape a la anterior */}
      <main className="relative">
        <Stack>
          <HeroFolder />
          <WebsSection />
          <TrayectoriaSection />
          <PremiosSection />
          <ContactoSection />
        </Stack>
      </main>
      <TweaksPanel />
    </>
  );
}
