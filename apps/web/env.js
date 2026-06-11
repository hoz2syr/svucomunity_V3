/**
 * ════════════════════════════════════════════════════════════════
 * SVU Community — Environment Variables (Dev Fallback)
 * ⚠️ هذا الملف في .gitignore — لا تُرسله للمستودع
 *
 * في البناء: Vite يحقن القيم من .env عبر define في vite.config.js
 * في التطوير المحلي: أنشئ هذا الملف من env.example.js
 * ════════════════════════════════════════════════════════════════
 */
window.SVU_ENV = window.SVU_ENV || {
  SUPABASE_URL: '',
  SUPABASE_ANON_KEY: '',
};
