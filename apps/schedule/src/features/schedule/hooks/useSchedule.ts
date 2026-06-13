import { useState, useEffect } from 'react';
import { supabase } from '../../../services/supabase';

export interface GroupSchedule {
  id: string
  group_id: string
  day_of_week: number
  start_time: string
  end_time: string
  location: string
  groups?: { name: string; courses?: { title_ar: string } }
}

export function useSchedule() {
  const [schedule, setSchedule] = useState<GroupSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSchedule();
  }, []);

  async function fetchSchedule() {
    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('schedule')
        .select('*, groups(name, courses(title_ar))')
        .order('day_of_week', { ascending: true });
      if (fetchError) throw fetchError;
      setSchedule((data as GroupSchedule[]) || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error loading schedule');
    } finally {
      setLoading(false);
    }
  }

  return { schedule, loading, error, refetch: fetchSchedule };
}
