import { useState, useCallback, useRef, useEffect } from 'react';
import type { ScheduleExtractionResult, MatchedGroup, DraftGroup, ValidationResult } from '../types';
import { extractScheduleFromImage } from '../services/ocrParser';
import { matchCoursesToGroups } from '../services/matchingService';
import { getAllWithCreators } from '@/src/features/study-groups/services/studyGroup.supabase';

const mapToMatchedGroup = (g: {
  id: string;
  name: string;
  course_code: string;
  course_name: string;
  major: string;
  class_number?: string | null;
  current_members: number;
  max_members: number;
  creator_name: string;
  creator_id: string;
  whatsapp_link?: string | null;
  group_link?: string | null;
}): MatchedGroup => ({
  id: g.id,
  name: g.name,
  course_code: g.course_code,
  course_name: g.course_name,
  major: g.major,
  class_number: g.class_number ?? null,
  current_members: g.current_members,
  max_members: g.max_members,
  is_full: g.current_members >= g.max_members,
  creator_name: g.creator_name,
  creator_id: g.creator_id,
  whatsapp_link: g.whatsapp_link ?? null,
  group_link: g.group_link ?? null,
});

export function useScheduleMatching() {
  const [isExtracting, setIsExtracting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ScheduleExtractionResult | null>(null);
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [matchedGroups, setMatchedGroups] = useState<Record<string, MatchedGroup[]>>({});
  const [autoDrafts, setAutoDrafts] = useState<DraftGroup[]>([]);
  const [groups, setGroups] = useState<MatchedGroup[]>([]);
  const groupsRef = useRef<MatchedGroup[]>([]);

  useEffect(() => {
    groupsRef.current = groups;
    return () => {
      groupsRef.current = [];
    };
  }, [groups]);

  const loadGroups = useCallback(async () => {
    const res = await getAllWithCreators();
    if (res.error) {
      setError(res.error.message);
      return;
    }
    const mapped: MatchedGroup[] = (res.data || []).map(mapToMatchedGroup);
    setGroups(mapped);
  }, []);

  const extract = useCallback(async (base64Image: string, mimeType: string) => {
    setIsExtracting(true);
    setError(null);
    setResult(null);
    setValidation(null);
    setMatchedGroups({});
    setAutoDrafts([]);

    try {
      const { result: ocrResult, validation } = await extractScheduleFromImage(base64Image, mimeType);
      setResult(ocrResult);
      setValidation(validation);

      if (ocrResult.courses.length === 0) {
        setMatchedGroups({});
        setAutoDrafts([]);
        return;
      }

      let existing = groupsRef.current;
      if (existing.length === 0) {
        const res = await getAllWithCreators();
        if (res.error) {
          setError(res.error.message);
          return;
        }
        existing = (res.data || []).map(mapToMatchedGroup);
        setGroups(existing);
      }

      const { matched, unmatched } = matchCoursesToGroups(ocrResult.courses, existing);

      const grouped: Record<string, MatchedGroup[]> = {};
      for (const m of matched) {
        const key = m.course_code.toUpperCase();
        if (!grouped[key]) grouped[key] = [];
        grouped[key].push(m);
      }
      setMatchedGroups(grouped);

      const drafts: DraftGroup[] = unmatched.map((course, idx) => ({
        id: `draft-${Date.now()}-${idx}`,
        course_code: course.code,
        course_name: course.name,
        name: `مراجعة - ${course.name}`,
        major: course.major || '',
        class_number: course.section,
        instructor: course.instructor,
        max_members: 5,
        whatsapp_link: null,
      }));
      setAutoDrafts(drafts);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'فشل الاستخراج');
    } finally {
      setIsExtracting(false);
    }
  }, []);

  const reloadGroups = useCallback(async () => {
    await loadGroups();
  }, [loadGroups]);

  return {
    result,
    matchedGroups,
    autoDrafts,
    validation,
    isExtracting,
    error,
    extract,
    reloadGroups,
  };
}
