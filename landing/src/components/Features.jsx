import { motion } from 'motion/react';
import { GraduationCap, Users, BookOpen, Calendar, Brain, Sparkles, ArrowUpRight } from 'lucide-react';

const features = [
  {
    icon: BookOpen,
    title: 'Smart Course Access',
    desc: 'Browse and access all your courses in one organized hub with notes, quizzes, and materials.',
  },
  {
    icon: Users,
    title: 'Peer Collaboration',
    desc: 'Connect with classmates, form study groups, and collaborate on projects in real time.',
  },
  {
    icon: Calendar,
    title: 'Schedule Planner',
    desc: 'Manage classes, assignments, and exams with an intelligent calendar tailored for students.',
  },
  {
    icon: Brain,
    title: 'AI-Powered Assistant',
    desc: 'Get instant answers, study tips, and writing support powered by advanced AI.',
  },
  {
    icon: Sparkles,
    title: 'Smart Notifications',
    desc: 'Stay updated with deadlines, announcements, and community events automatically.',
  },
  {
    icon: GraduationCap,
    title: 'Academic Progress',
    desc: 'Track your GPA, attendance, and learning journey with beautiful visual reports.',
  },
];

export default function Features() {
  return (
    <section className="relative z-10 px-6 py-24 md:py-32">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16 md:mb-20"
        >
          <p className="text-white/50 text-[10px] md:text-[11px] font-medium tracking-[0.25em] uppercase mb-4">
            Everything You Need
          </p>
          <h2 className="text-3xl md:text-5xl font-medium tracking-[-0.01em] leading-[1.15] bg-gradient-to-b from-white via-white/95 to-white/70 bg-clip-text text-transparent font-serif max-w-3xl mx-auto">
            Built for the modern student experience
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.6, delay: index * 0.08 }}
              className="liquid-glass rounded-2xl p-6 md:p-8 flex flex-col gap-4 group cursor-default"
            >
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
                  <feature.icon className="w-5 h-5 text-white/80" />
                </div>
                <ArrowUpRight className="w-4 h-4 text-white/20 group-hover:text-white/60 transition-colors duration-300" />
              </div>
              <div>
                <h3 className="text-white font-semibold text-[15px] mb-1.5 tracking-tight">
                  {feature.title}
                </h3>
                <p className="text-white/45 text-[13px] leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
