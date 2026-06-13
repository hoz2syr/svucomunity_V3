/**
 * SVU Community — Courses listing page
 */
import { loadSVUCourses } from '../shared.js';
import { escapeHtml } from '../core.js';

async function init() {
  const container = document.getElementById('courses-grid');
  if (!container) return;

  const searchInput = document.getElementById('courseSearch');
  const semesterSelect = document.getElementById('semesterFilter');

  let courses = {};

  async function load() {
    courses = await loadSVUCourses();
    if (!Object.keys(courses).length) {
      container.innerHTML = '<p data-i18n="noCourses">لا توجد مقررات متاحة حالياً</p>';
      return;
    }
    render();
  }

  function render() {
    const query = (searchInput?.value || '').trim().toLowerCase();
    const semester = semesterSelect?.value || 'all';

    const filtered = Object.values(courses).filter(c => {
      const matchesSearch = !query || (c.name || '').toLowerCase().includes(query);
      const matchesSemester = semester === 'all' || String(c.semester) === semester;
      return matchesSearch && matchesSemester;
    });

    if (!filtered.length) {
      container.innerHTML = '<p class="text-secondary-400" data-i18n="noCourses">لا توجد مقررات متاحة حالياً</p>';
      return;
    }

    container.innerHTML = filtered.map(c => `
      <article class="course-card">
        <header>
          <h3>${escapeHtml(c.name || 'مقرر')}</h3>
        </header>
        <p>${escapeHtml(c.description || '')}</p>
        <a href="index.html#course/${encodeURIComponent(c.path || c.id)}" data-i18n="openCourse">فتح المقرر</a>
      </article>
    `).join('');
  }

  if (searchInput) searchInput.addEventListener('input', render);
  if (semesterSelect) semesterSelect.addEventListener('change', render);

  await load();
}

document.addEventListener('DOMContentLoaded', init);
