import { Users } from 'lucide-react';
import { FeatureCard } from './FeatureCard';

export const StudyGroupsCard = () => (
  <FeatureCard
    title="Study Groups"
    description="Join your study groups"
    icon={<Users />}
    iconBg="#0e7490"
    iconColor="#22d3ee"
    linkTo="/dashboard/study-groups"
    linkLabel="عرض المجموعات"
    index={0}
  />
);
