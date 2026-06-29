import { BookOpen } from 'lucide-react';
import { FeatureCard } from './FeatureCard';

export const CourseMaterialsCard = () => (
  <FeatureCard
    title="Course Materials"
    description="Browse your courses"
    icon={<BookOpen />}
    linkTo="/dashboard/courses"
    linkLabel="تصفّح المقررات"
    accent="warning"
    index={1}
  />
);
