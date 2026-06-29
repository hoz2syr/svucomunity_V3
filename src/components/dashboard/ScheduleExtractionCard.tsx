import { CalendarDays } from 'lucide-react';
import { FeatureCard } from './FeatureCard';

export const ScheduleExtractionCard = () => (
  <FeatureCard
    title="Schedule Extraction"
    description="AI will extract your courses and find matching study groups"
    icon={<CalendarDays />}
    linkTo="/dashboard/schedule"
    linkLabel="استخراج الجدول"
    accent="primary"
    index={2}
  />
);
