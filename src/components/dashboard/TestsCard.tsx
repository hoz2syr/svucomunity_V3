import { TestTube2 } from 'lucide-react';
import { FeatureCard } from './FeatureCard';

export const TestsCard = () => (
  <FeatureCard
    title="الاختبارات"
    description="تصفح الاختبارات والامتحانات"
    icon={<TestTube2 />}
    linkTo="/exam"
    linkLabel="بدء اختبار"
    accent="success"
    index={3}
  />
);
