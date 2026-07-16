// Rate limiting constants
export const RATE_LIMIT_WINDOW_MS = 5 * 60 * 1000; // 5 minutes
export const RATE_LIMIT_POLL_INTERVAL_MS = 1000; // 1 second

// Particle canvas constants
export const DEFAULT_PARTICLE_COUNT = 80;
export const MOUSE_INTERACTION_MAX_DIST = 200;
export const LOOP_DURATION_MS = 8000;
export const PARTICLE_TEXT_ASSEMBLY_OFFSET_MS = 500;
export const PARTICLE_DISSOLVE_OFFSET_BASE_MS = 6500;
export const PARTICLE_TEXT_CHAR_SPACING_MS = 50;
export const PARTICLE_EASE_DURATION_MS = 1000;

// UI feedback constants
export const SUCCESS_MESSAGE_TIMEOUT_MS = 3000;
export const TOAST_AUTO_DISMISS_MS = 4000;
export const RESET_EMAIL_RESEND_TIMEOUT_MS = 4000;
export const PREFERENCE_SAVE_FEEDBACK_MS = 2000;
export const CLIPBOARD_COPIED_FEEDBACK_MS = 2000;
export const COURSE_CELEBRATION_DISPLAY_MS = 6000;

// Auth and retry constants
export const AUTH_CALLBACK_TIMEOUT_MS = 30000;
export const RETRY_BASE_DELAY_MS = 1000;
export const RETRY_MAX_DELAY_MS = 5000;

// Query cache constants
export const QUERY_STALE_TIME_MS = 1000 * 60;
export const QUERY_GC_TIME_MS = 1000 * 60 * 5;
export const STALE_TIME_1_MIN_MS = 60 * 1000;
export const STALE_TIME_5_MIN_MS = 5 * 60 * 1000;

// Export and print constants
export const EXPORT_RENDER_DELAY_MS = 2000;
export const EXPORT_STEP_DELAY_MS = 1000;
export const EXPORT_PRINT_RENDER_DELAY_MS = 400;
export const PRINT_WINDOW_TIMEOUT_MS = 2000;
export const PRINT_WINDOW_CLOSE_DELAY_MS = 1000;

// Interactive map step delays (ms)
export const MAP_STEP_DELAYS = [1000, 1000, 600, 300, 5000, 1000] as const;

// Admin pagination constants
export const ADMIN_USER_PAGE_LIMIT = 50;
export const ADMIN_NOTIFICATION_PAGE_LIMIT = 20;

// Core play test tick interval
export const CORE_PLAY_TICK_INTERVAL_MS = 1000;
