"use client";

import { useParams, useNavigate } from 'react-router-dom';
import { useCorePlayTest } from '../hooks';
import { PlayTestShell } from '../../components/PlayTestShell';

export default function PlayTestShared() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const state = useCorePlayTest(id, navigate, { publicTestId: id, backPath: '/exam/browse' });

  return (
    <PlayTestShell
      state={state}
      backPath="/exam"
      showBackIcon={false}
      showRateUI={false}
      showAnswerReview={false}
      showSettingsInPreStart={false}
      preStartIcon={<span className="text-2xl">🔗</span>}
    />
  );
}
