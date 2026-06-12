import type { Course, Specialization, SpecializationId, CourseCode, TrackId } from '../types';

export const iteData = {
  meta: {
    title: 'أسبقيات مواد فرع الهندسة المعلوماتية ITE',
    university: 'SVU',
    published: '2025-08-01',
    term: '24F',
    source: 'هكرات مزنوقين',
    rules: {
      min_credits_per_term: 16,
      max_credits_per_term: 36,
      promotion_thresholds: [
        { year: 2, min_credits: 40 },
        { year: 3, min_credits: 100 },
        { year: 4, min_credits: 160 },
        { year: 5, min_credits: 220 }
      ],
      specialization_required_at_credits: 160,
      english_note: 'يجب ترفيع مستوى الإنجليزي قبل تسجيل المستوى التالي (ليس فقط تسجيله)',
      english_registration_credit: 1,
      english_completion_credit: 3,
      prerequisite_rule:
        'يكفي تسجيل الأسبقية (حتى لو رسب الطالب فيها) لفتح المادة التالية، ما عدا الإنجليزي'
    }
  },

  specializations: [
    { id: 'AI', name_ar: 'الذكاء الاصطناعي', tracks: ['ML', 'IS'] as TrackId[] },
    { id: 'SE', name_ar: 'هندسة البرمجيات', tracks: ['DS', 'SD'] as TrackId[] },
    { id: 'SCN', name_ar: 'النظم والشبكات الحاسوبية', tracks: ['CS', 'NS'] as TrackId[] }
  ],

  courses: {} as Record<CourseCode, Course>,

  specialization_courses: {} as Record<SpecializationId, Specialization>
} as const;
