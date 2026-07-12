/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Suspense, lazy } from 'react';
import {
  HeroAddition, ScrollIndicator,
} from '../components/LandingSections';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { SkipLink } from '../components/accessibility/SkipLink';
import { CardSkeleton } from '../components/ui/Skeleton';
import { AnimatedBackground } from '../components/landing/AnimatedBackground';

const LazyLandingSections = lazy(() => import('../components/LandingSections').then(m => ({ default: m.LandingSections })));

export const Home = () => {
  return (
    <AnimatedBackground intensity="subtle">
      <div className="relative w-full min-h-screen text-slate-100 selection:bg-indigo-500/30">
        <SkipLink />
        <Navbar />

        <section className="relative w-full min-h-screen flex flex-col items-center justify-center pt-28 pb-12 select-none overflow-hidden">

          <div className="relative z-10 flex flex-col items-center justify-center w-full px-4">
            <h1 className="text-white font-extrabold tracking-tight flex justify-center text-[10vw] sm:text-7xl md:text-8xl lg:text-[7.5rem] z-10 font-display drop-shadow-md mb-2 sm:mb-6 text-center w-full flex-nowrap whitespace-nowrap" dir="ltr">
              SVU Community
            </h1>
            <HeroAddition />
          </div>

          <ScrollIndicator />
        </section>

        <main id="main-content" className="relative w-full pb-20">
          <ErrorBoundary>
            <Suspense fallback={
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-10 mt-32 max-w-7xl mx-auto align-center h-[50vh]">
                <CardSkeleton />
                <CardSkeleton />
                <CardSkeleton />
              </div>
            }>
              <LazyLandingSections />
            </Suspense>
          </ErrorBoundary>
        </main>

        <Footer />
      </div>
    </AnimatedBackground>
  );
};
