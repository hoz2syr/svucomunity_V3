import { CalendarDays } from 'lucide-react';
import { FeatureCard } from './FeatureCard';

export const ScheduleExtractionCard = () => (
  <FeatureCard
    title="Schedule Extraction"
    description="AI will extract your courses and find matching study groups"
    icon={<CalendarDays />}
    iconBgClass="bg-[var(--color-info)]"
    iconColorClass="var(--color-info-400)"
    linkTo="/dashboard/schedule"
    linkLabel="استخراج الجدول"
    index={2}
  />
);
