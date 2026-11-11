import { HeroSection } from '../components/hero/HeroSection.tsx';
import { JourneySection } from '../components/journey/JourneySection.tsx';
import { ExhibitsSection } from '../components/exhibits/ExhibitsSection.tsx';
import { PlannerIsland } from '../components/planner/PlannerIsland.tsx';
import { BestTimeSection } from '../components/crowd/BestTimeSection.tsx';
import { VisitSection } from '../components/visit/VisitSection.tsx';
import {
  QualityStripSection,
  SocialProofSection,
} from '../components/proof/SocialAndQuality.tsx';

export function HomePage() {
  return (
    <main id="main-content" tabIndex={-1}>
      <HeroSection />
      <JourneySection />
      <ExhibitsSection />
      <PlannerIsland />
      <BestTimeSection />
      <VisitSection />
      <SocialProofSection />
      <QualityStripSection />
    </main>
  );
}
