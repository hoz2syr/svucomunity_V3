import { Users } from 'lucide-react';
import { FeatureCard } from './FeatureCard';

export const StudyGroupsCard = () => (
  <FeatureCard
    title="Study Groups"
    description="Join your study groups"
    icon={<Users />}
    iconBgClass="bg-[var(--color-info)]"
    iconColorClass="var(--color-info-400)"
    linkTo="/dashboard/study-groups"
    linkLabel="عرض المجموعات"
    index={0}
  />
);
