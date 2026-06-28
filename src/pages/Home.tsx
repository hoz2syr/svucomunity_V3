/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Suspense } from 'react';
import {
  HeroAddition, ScrollIndicator, ProblemsSection, SolutionBridge,
  FeaturesSection, HowItWorksSection, ComingSoonSection, FinalCTASection,
} from '../components/LandingSections';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { SkipLink } from '../components/accessibility/SkipLink';
import { CardSkeleton } from '../components/ui/Skeleton';
import { useParticleCanvas } from '../hooks/useParticleCanvas';
import { AppBackground } from '../components/AppBackground';

const LandingSections = () => (
  <>
    <ProblemsSection />
    <SolutionBridge />
    <FeaturesSection />
    <HowItWorksSection />
    <ComingSoonSection />
    <FinalCTASection />
  </>
);

export const Home = () => {
  const { canvasRef, charRefs, reducedMotion } = useParticleCanvas({
    particleCount: 120,
    enableTextAssemble: true,
    textChars: 'SVU Community'.split(''),
  });

  if (reducedMotion) {
    return (
      <div className="relative w-full min-h-screen text-slate-100 bg-[var(--color-bg-primary)] selection:bg-cyan-500/30">
        <SkipLink />
        <Navbar />
        <section className="relative w-full h-screen flex flex-col items-center justify-center select-none bg-[var(--color-bg-secondary)] overflow-hidden">
          <div className="relative z-10 flex flex-col items-center justify-center pointer-events-none w-full px-4 pt-16">
            <h1 className="text-white font-extrabold tracking-tight flex justify-center text-[10vw] sm:text-7xl md:text-8xl lg:text-[7.5rem] z-10 font-display drop-shadow-[var(--shadow-glow-cyan-40)] mb-6 text-center w-full flex-nowrap whitespace-nowrap" dir="ltr">
              SVU Community
            </h1>
            <HeroAddition />
          </div>
          <ScrollIndicator />
        </section>
        <main id="main-content" className="relative z-10 bg-[var(--color-bg-primary)] w-full pb-20">
          <ErrorBoundary>
            <Suspense fallback={
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-10 max-w-7xl mx-auto align-center h-[50vh]">
                <CardSkeleton />
                <CardSkeleton />
                <CardSkeleton />
              </div>
            }>
              <LandingSections />
            </Suspense>
          </ErrorBoundary>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="relative w-full min-h-screen text-slate-100 bg-[var(--color-bg-primary)] selection:bg-cyan-500/30">
      <SkipLink />
      <Navbar />

      <section className="relative w-full min-h-screen flex flex-col items-center justify-center pt-28 pb-12 bg-[var(--color-bg-secondary)] select-none overflow-hidden">
        <canvas ref={canvasRef} aria-hidden="true" className="absolute inset-0 block w-full h-full" />

        <div className="relative z-10 flex flex-col items-center justify-center w-full px-4">
           <h1 className="text-white font-extrabold tracking-tight flex justify-center text-[10vw] sm:text-7xl md:text-8xl lg:text-[7.5rem] z-10 font-display drop-shadow-[var(--shadow-glow-cyan-40)] mb-2 sm:mb-6 text-center w-full flex-nowrap whitespace-nowrap" dir="ltr">
            {'SVU Community'.split('').map((char, i) => (
              <span
                key={i}
                ref={(el) => {
                  if (charRefs?.current) charRefs.current[i] = el;
                }}
                className="inline-block"
                style={{ opacity: 0, filter: 'blur(10px)' }}
              >
                {char === ' ' ? '\u00A0' : char}
              </span>
            ))}
          </h1>
          <HeroAddition />
        </div>

        <ScrollIndicator />
      </section>

      <main id="main-content" className="relative z-10 bg-[var(--color-bg-primary)] w-full pb-20 overflow-hidden">
        <AppBackground variant="landing" />

        <ErrorBoundary>
          <Suspense fallback={
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-10 mt-32 max-w-7xl mx-auto align-center h-[50vh]">
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
            </div>
          }>
            <LandingSections />
          </Suspense>
        </ErrorBoundary>
      </main>

      <Footer />
    </div>
  );
};
