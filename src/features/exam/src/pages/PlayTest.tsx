"use client";

import { useParams, useNavigate } from 'react-router-dom';
import { useCorePlayTest } from '../hooks';
import { PlayTestShell } from '../../components/PlayTestShell';

export default function PlayTest() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const state = useCorePlayTest(id, navigate);

  return <PlayTestShell state={state} backPath="/exam/saved" />;
}
