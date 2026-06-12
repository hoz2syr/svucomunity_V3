/**
 * SVU Community — Courses listing page
 */
import { loadSVUCourses } from '../shared.js';
import { escapeHtml } from '../core.js';

async function init() {
  const container = document.getElementById('courses-grid');
  if (!container) return;

  try {
    const courses = await loadSVUCourses();
    if (!Object.keys(courses).length) {
      container.innerHTML = '<p data-i18n="noCourses">لا توجد مقررات متاحة حالياً</p>';
      return;
    }

    container.innerHTML = Object.values(courses).map(c => `
      <article class="course-card">
        <header>
          <h3>${escapeHtml(c.name || 'مقرر')}</h3>
        </header>
        <p>${escapeHtml(c.description || '')}</p>
        <a href="index.html#course/${encodeURIComponent(c.path || c.id)}" data-i18n="openCourse">فتح المقرر</a>
      </article>
    `).join('');
  } catch {
    container.innerHTML = '<p class="error-text" data-i18n="loadError">تعذر تحميل المقررات</p>';
  }
}

document.addEventListener('DOMContentLoaded', init);
