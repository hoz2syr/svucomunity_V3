export { extractScheduleFromImage, type OCRResult, type ValidationResult } from './ocrParser';
export { matchCoursesToGroups, type MatchResult } from './matchingService';
export {
  saveRawExtraction,
  saveExtractedCourses,
  upsertDiscoveredCourses,
  upsertDiscoveredInstructors,
  upsertDiscoveredMajors,
  loadCurrentSemesterCourses,
  loadDiscoveredCourses,
  loadDiscoveredInstructors,
  loadDiscoveredMajors,
  type ServiceResult,
} from './extractionService.supabase';
export {
  matchExtractedCoursesToProgress,
  suggestStudyGroups,
  calculateRelevance,
} from './matchingService.supabase';
