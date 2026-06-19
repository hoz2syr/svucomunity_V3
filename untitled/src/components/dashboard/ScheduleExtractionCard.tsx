import { CalendarDays } from 'lucide-react';
import { FeatureCard } from './FeatureCard';

export const ScheduleExtractionCard = () => (
  <FeatureCard
    title="Schedule Extraction"
    description="AI will extract your courses and find matching study groups"
    icon={<CalendarDays />}
    iconBg="#0e7490"
    iconColor="#22d3ee"
    linkTo="/dashboard/schedule"
    linkLabel="استخراج الجدول"
    index={2}
  />
);
