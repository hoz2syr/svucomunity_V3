import BackgroundVideo from './components/BackgroundVideo.jsx';
import Navbar from './components/Navbar.jsx';
import Hero from './components/Hero.jsx';
import Features from './components/Features.jsx';
import Stats from './components/Stats.jsx';
import Testimonials from './components/Testimonials.jsx';
import CTA from './components/CTA.jsx';
import Footer from './components/Footer.jsx';

export default function App() {
  return (
    <main className="relative bg-black min-h-screen flex flex-col overflow-x-hidden selection:bg-white selection:text-black">
      <BackgroundVideo />
      <Navbar />
      <Hero />
      <Features />
      <Stats />
      <Testimonials />
      <CTA />
      <Footer />
    </main>
  );
}
