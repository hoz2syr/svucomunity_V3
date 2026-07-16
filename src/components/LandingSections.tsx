import { AIStudioSection } from './landing/AIStudioSection';
import { ComingSoonSection } from './landing/ComingSoonSection';
import { FeaturesSection } from './landing/FeaturesSection';
import { FinalCTASection } from './landing/FinalCTASection';
import { HeroAddition } from './landing/HeroAddition';
import { HowItWorksSection } from './landing/HowItWorksSection';
import { ProblemsSection } from './landing/ProblemsSection';
import { ReviewsSection } from './landing/ReviewsSection';
import { ScrollIndicator } from './landing/ScrollIndicator';
import { SolutionBridge } from './landing/SolutionBridge';
import { TestsFeatureSection } from './landing/tests/TestsFeatureSection';

export { AIStudioSection, ComingSoonSection, FeaturesSection, FinalCTASection, HeroAddition, HowItWorksSection, ProblemsSection, ReviewsSection, ScrollIndicator, SolutionBridge, TestsFeatureSection };

export const LandingSections = () => (
  <>
    <ProblemsSection />
    <SolutionBridge />
    <FeaturesSection />
    <HowItWorksSection />
    <AIStudioSection />
    <TestsFeatureSection />
    <ReviewsSection />
    <FinalCTASection />
  </>
);
