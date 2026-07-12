import { ComingSoonSection } from './landing/ComingSoonSection';
import { FeaturesSection } from './landing/FeaturesSection';
import { FinalCTASection } from './landing/FinalCTASection';
import { HeroAddition } from './landing/HeroAddition';
import { HowItWorksSection } from './landing/HowItWorksSection';
import { ProblemsSection } from './landing/ProblemsSection';
import { ScrollIndicator } from './landing/ScrollIndicator';
import { SolutionBridge } from './landing/SolutionBridge';
import { TestsFeatureSection } from './landing/tests/TestsFeatureSection';

export { ComingSoonSection, FeaturesSection, FinalCTASection, HeroAddition, HowItWorksSection, ProblemsSection, ScrollIndicator, SolutionBridge, TestsFeatureSection };

export const LandingSections = () => (
  <>
    <ProblemsSection />
    <SolutionBridge />
    <FeaturesSection />
    <HowItWorksSection />
    <TestsFeatureSection />
    <FinalCTASection />
  </>
);
