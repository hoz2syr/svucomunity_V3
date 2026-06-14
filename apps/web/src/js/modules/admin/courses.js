import { escapeHtml } from '../core.js';
import { showToast } from '../shared.js';
import { callAdmin } from './adminApi.js';

export async function loadCourses(db) {
  try {
    const result = await db
      .from('courses')
      .select('*')
      .order('created_at', { ascending: false });

    if (result.error) throw result.error;
    const allCourses = result.data || [];
    renderCourses(allCourses);
    return allCourses;
  } catch (e) {
    showToast('فشل تحميل المقررات: ' + (e.message || ''), 'error');
  }
}

export function renderCourses(courses) {
  const grid = document.getElementById('adminCoursesGrid');
  if (!grid) return;

  if (!courses.length) {
    grid.innerHTML = '<p class="text-secondary-400 col-span-full text-center py-8" data-i18n="noCourses">لا توجد مقررات</p>';
    return;
  }

  grid.innerHTML = courses.map(c => {
    const snippet = (c.description || '').slice(0, 100);
    return '<div class="glass rounded-2xl p-5 border border-white/10 flex flex-col gap-3">'
      + '<div class="flex items-start justify-between gap-2">'
      + '<div>'
      + '<h3 class="font-bold text-white">' + escapeHtml(c.name || '-') + '</h3>'
      + '<p class="text-secondary-400 text-sm">' + escapeHtml(c.code || '') + ' — ' + escapeHtml(c.major || '') + '</p>'
      + '</div>'
      + '<span class="text-xs text-secondary-500 whitespace-nowrap">' + escapeHtml(c.instructor || '-') + '</span>'
      + '</div>'
      + (c.description ? '<p class="text-secondary-300 text-sm leading-relaxed">' + escapeHtml(snippet) + (c.description.length > 100 ? '...' : '') + '</p>' : '')
      + '<div class="flex items-center justify-between text-sm text-secondary-400">'
      + '<span>' + (c.max_members ?? '-') + ' ' + (document.documentElement.lang === 'ar' ? 'حد أقصى' : 'max') + '</span>'
      + '<div class="flex gap-2">'
      + '<button class="action-btn btn-warning" data-action="editCourse" data-id="' + escapeHtml(c.id) + '">تعديل</button>'
      + '<button class="action-btn btn-danger" data-action="deleteCourse" data-id="' + escapeHtml(c.id) + '">حذف</button>'
      + '</div>'
      + '</div>'
      + '</div>';
  }).join('');
}

export function filterCourses(allCourses) {
  const query = (document.getElementById('adminCourseSearch')?.value || '').toLowerCase();
  if (!query) return renderCourses(allCourses);

  const filtered = allCourses.filter(c => {
    const text = ((c.name || '') + ' ' + (c.code || '') + ' ' + (c.major || '') + ' ' + (c.instructor || '')).toLowerCase();
    return text.includes(query);
  });
  renderCourses(filtered);
}

export async function deleteCourse(db, courseId) {
  if (!confirm('هل أنت متأكد من حذف هذا المقرر؟')) return;
  const result = await callAdmin('deleteCourse', { courseId });
  if (result.ok) {
    showToast('تم حذف المقرر بنجاح', 'success');
    loadCourses(db);
  }
}

export async function createCourse(db, courseData) {
  const result = await callAdmin('createCourse', { courseData });
  if (result.ok) {
    showToast('تم إضافة المقرر بنجاح', 'success');
    loadCourses(db);
  }
}
