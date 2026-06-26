import { TestTube2 } from 'lucide-react';
import { FeatureCard } from './FeatureCard';

export const TestsCard = () => (
  <FeatureCard
    title="الاختبارات"
    description="تصفح الاختبارات والامتحانات"
    icon={<TestTube2 />}
    iconBgClass="bg-[var(--color-info)]"
    iconColorClass="var(--color-info-400)"
    linkTo="/exam"
    linkLabel="بدء اختبار"
    index={3}
  />
);
