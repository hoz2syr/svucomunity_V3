export const CLASSES = Array.from({ length: 50 }, (_, i) => `C${i + 1}`);

export const STUDY_GROUP_INITIAL_FILTERS = {
  search: '',
  major: '',
  course_code: '',
  class_number: '',
  status: 'all' as const,
};
