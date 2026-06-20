import { BookOpen } from 'lucide-react';
import { FeatureCard } from './FeatureCard';

export const CourseMaterialsCard = () => (
  <FeatureCard
    title="Course Materials"
    description="Browse your courses"
    icon={<BookOpen />}
    iconBg="#a16207"
    iconColor="#facc15"
    linkTo="/dashboard/courses"
    linkLabel="تصفّح المقررات"
    index={1}
  />
);
