const TRANSLATIONS: Record<string, Record<string, string>> = {
  ar: {
    pageTitle: 'المقررات الدراسية',
    pageSubtitle: 'تصفح جميع مقرراتك الدراسية',
    searchPlaceholder: 'ابحث عن مقرر...',
    noResults: 'لا توجد نتائج',
    loading: 'جاري التحميل...',
    error: 'حدث خطأ',
    retry: 'إعادة المحاولة',
  },
  en: {
    pageTitle: 'Courses',
    pageSubtitle: 'Browse all your courses',
    searchPlaceholder: 'Search courses...',
    noResults: 'No results found',
    loading: 'Loading...',
    error: 'An error occurred',
    retry: 'Retry',
  },
};

let currentLang: string = 'ar';

function t(key: string, lang: string = currentLang): string {
  const resolvedLang = lang === 'en' ? 'en' : 'ar';
  return TRANSLATIONS[resolvedLang]?.[key] || TRANSLATIONS.ar[key] || key;
}

function changeLang(lang: string): void {
  if (!['ar', 'en'].includes(lang)) return;
  currentLang = lang;
}

export { t, changeLang };
export const getCurrentLang = (): string => currentLang;
