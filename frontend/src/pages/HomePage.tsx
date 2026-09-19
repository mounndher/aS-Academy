import { useScrollToState } from "@/hooks/useScrollToState";
import { Hero } from "@/components/sections/Hero";
import { IntroSection } from "@/components/sections/IntroSection";
import { FormationGrid } from "@/components/sections/FormationGrid";
import { FormationFeature } from "@/components/sections/FormationFeature";
import { AcademySection } from "@/components/sections/AcademySection";
import { TrainingExperience } from "@/components/sections/TrainingExperience";
import { Gallery } from "@/components/sections/Gallery";
import { InstagramSection } from "@/components/sections/InstagramSection";
import { ContactSection } from "@/components/sections/ContactSection";
import { FinalCTA } from "@/components/sections/FinalCTA";

export function HomePage() {
  useScrollToState();

  return (
    <>
      <Hero />
      <IntroSection />
      <FormationGrid />
      <FormationFeature />
      <AcademySection />
      <TrainingExperience />
      <Gallery />
      <InstagramSection />
      <ContactSection />
      <FinalCTA />
    </>
  );
}
