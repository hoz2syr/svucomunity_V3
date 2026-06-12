import { motion } from 'motion/react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Upload, Search, Users } from 'lucide-react';

interface LandingPageProps {
  onLogin: () => void;
}

export function LandingPage({ onLogin }: LandingPageProps) {
  return (
    <motion.section
      key="landing"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="text-center py-20"
    >
      <h1 className="text-5xl font-extrabold tracking-tight mb-6 bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
        Find Your Perfect Study Group <br /> with AI Precision
      </h1>
      <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
        Upload a photo of your university schedule, and our AI will instantly match you with existing study groups or help you start a new one for your courses.
      </p>
      <div className="flex flex-wrap justify-center gap-4">
        <Button size="lg" onClick={onLogin}>Get Started Now</Button>
      </div>

      <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
        {[
          { icon: Upload, title: 'Snap & Upload', desc: 'Take a photo of your schedule or course registration.' },
          { icon: Search, title: 'AI Extraction', desc: 'Our AI extracts course codes, names, and timings automatically.' },
          { icon: Users, title: 'Join Groups', desc: 'Instantly see available groups for your specific courses.' },
        ].map((feature) => (
          <Card key={feature.title} className="p-6">
            <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center mb-4">
              <feature.icon className="text-indigo-600 w-6 h-6" aria-hidden="true" />
            </div>
            <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
            <p className="text-slate-500 text-sm leading-relaxed">{feature.desc}</p>
          </Card>
        ))}
      </div>
    </motion.section>
  );
}
