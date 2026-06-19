/**
 * SVU Community — Home / Dashboard page
 */
import { loadSVUCourses } from '../shared.js';
import { escapeHtml } from '../core.js';

function createStars(container, count = 120) {
  if (!container) return;
  const fragment = document.createDocumentFragment();
  for (let i = 0; i < count; i++) {
    const star = document.createElement('span');
    star.className = 'home-star';
    const size = Math.random() < 0.75 ? '' : Math.random() < 0.5 ? 'small' : 'large';
    if (size) star.classList.add(size);
    const x = Math.random() * 100;
    const y = Math.random() * 100;
    const dur = 2 + Math.random() * 4;
    const delay = Math.random() * -5;
    star.style.cssText = `left:${x}%;top:${y}%;--dur:${dur}s;--delay:${delay}s;`;
    fragment.appendChild(star);
  }
  container.appendChild(fragment);
}

async function init() {
  const container = document.getElementById('main-content');
  if (!container) return;

  const starField = document.getElementById('homeStarField');
  createStars(starField, 140);

  const courseList = document.getElementById('courseList');
  if (!courseList) return;

  try {
    const courses = await loadSVUCourses();
    const names = Object.values(courses).slice(0, 6);
    if (names.length === 0) {
      const emptyMsg = document.getElementById('course-empty-msg');
      if (emptyMsg) emptyMsg.style.display = '';
      return;
    }
    const list = names.map(c => `
      <li class="course-item">
        <a href="../courses/index.html#course/${encodeURIComponent(c.path || c.id)}">${escapeHtml(c.name || c.id)}</a>
      </li>
    `).join('');
    courseList.innerHTML = list;
  } catch (err) {
    courseList.innerHTML = `<li class="error-text" data-i18n="loadError">تعذر تحميل المقررات</li>`;
  }
}

document.addEventListener('DOMContentLoaded', init);
