import { TestTube2 } from 'lucide-react';
import { FeatureCard } from './FeatureCard';

export const TestsCard = () => (
  <FeatureCard
    title="الاختبارات"
    description="تصفح الاختبارات والامتحانات"
    icon={<TestTube2 />}
    iconBg="#0e7490"
    iconColor="#22d3ee"
    linkTo="/exam"
    linkLabel="بدء اختبار"
    index={3}
  />
);
