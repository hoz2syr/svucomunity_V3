import { BookOpen } from 'lucide-react';
import { FeatureCard } from './FeatureCard';

export const CourseMaterialsCard = () => (
  <FeatureCard
    title="Course Materials"
    description="Browse your courses"
    icon={<BookOpen />}
    iconBgClass="bg-[var(--color-warning)]"
    iconColorClass="var(--color-warning-400)"
    linkTo="/dashboard/courses"
    linkLabel="تصفّح المقررات"
    index={1}
  />
);
