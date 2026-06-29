import { Users } from 'lucide-react';
import { FeatureCard } from './FeatureCard';

export const StudyGroupsCard = () => (
  <FeatureCard
    title="Study Groups"
    description="Join your study groups"
    icon={<Users />}
    linkTo="/dashboard/study-groups"
    linkLabel="عرض المجموعات"
    accent="info"
    index={0}
  />
);
