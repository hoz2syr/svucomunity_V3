/**
 * SVU Community — Home / Dashboard page
 */
import { loadSVUCourses } from '../shared.js';
import { escapeHtml } from '../core.js';

async function init() {
  const container = document.getElementById('main-content');
  if (!container) return;

  try {
    const courses = await loadSVUCourses();
    const names = Object.values(courses).slice(0, 6);
    const list = names.map(c => `
      <li class="course-item">
        <a href="../courses/index.html#course/${encodeURIComponent(c.path || c.id)}">${escapeHtml(c.name || c.id)}</a>
      </li>
    `).join('');

    container.innerHTML = `
      <section class="home-hero" aria-label="Home">
        <h1 data-i18n="homeTitle">مرحباً بك في SVU Community</h1>
        <p data-i18n="homeTagline">منصتك التعليمية الجامعية</p>
        <h2 data-i18n="recentCourses">المقررات الدراسية</h2>
        <ul class="course-list">${list}</ul>
      </section>
    `;
  } catch (err) {
    container.innerHTML = `<p class="error-text" data-i18n="loadError">تعذر تحميل المقررات</p>`;
  }
}

document.addEventListener('DOMContentLoaded', init);
