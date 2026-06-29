import { useState, useCallback } from 'react';
import type { ScheduleExtractionResult, MatchedGroup, DraftGroup, ValidationResult } from '../types';
import { extractScheduleFromImage } from '../services/ocrParser';
import { matchCoursesToGroups } from '../services/matchingService';
import { getAllWithCreators } from '@/src/features/study-groups/services/studyGroupsApi';

export function useScheduleMatching() {
  const [isExtracting, setIsExtracting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ScheduleExtractionResult | null>(null);
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [matchedGroups, setMatchedGroups] = useState<Record<string, MatchedGroup[]>>({});
  const [autoDrafts, setAutoDrafts] = useState<DraftGroup[]>([]);
  const [groups, setGroups] = useState<MatchedGroup[]>([]);

  const loadGroups = useCallback(async () => {
    const res = await getAllWithCreators();
    if (res.error) {
      setError(res.error.message);
      return;
    }
    const mapped: MatchedGroup[] = (res.data || []).map((g) => ({
      id: g.id,
      name: g.name,
      course_code: g.course_code,
      course_name: g.course_name,
      major: g.major,
      class_number: g.class_number ?? null,
      current_members: g.current_members,
      max_members: g.max_members,
      is_full: g.is_full,
      creator_name: g.creator_name,
      creator_id: g.creator_id,
      whatsapp_link: g.whatsapp_link ?? null,
      group_link: g.group_link ?? null,
    }));
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

      let existing = groups;
      if (existing.length === 0) {
        const res = await getAllWithCreators();
        if (res.error) {
          setError(res.error.message);
          return;
        }
        existing = (res.data || []).map((g) => ({
          id: g.id,
          name: g.name,
          course_code: g.course_code,
          course_name: g.course_name,
          major: g.major,
          class_number: g.class_number ?? null,
          current_members: g.current_members,
          max_members: g.max_members,
          is_full: g.is_full,
          creator_name: g.creator_name,
          creator_id: g.creator_id,
          whatsapp_link: g.whatsapp_link ?? null,
          group_link: g.group_link ?? null,
        }));
        setGroups(existing);
      }

      const { matched, unmatched } = matchCoursesToGroups(ocrResult.courses, existing, ocrResult.major);

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
        major: ocrResult.major,
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
  }, [groups]);

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
