import { showToast } from '../shared.js';
import { callAdmin } from './adminApi.js';

export function setupSettingsListeners(db) {
  const resetBtn = document.getElementById('resetDataBtn');
  if (resetBtn) {
    resetBtn.addEventListener('click', async () => {
      if (!confirm('هل أنت متأكد؟ سيتم حذف جميع البيانات ولا يمكن التراجع عن هذا الإجراء.')) return;
      if (!confirm('تأكيد أخير: جميع البيانات ستُحذف نهائياً.')) return;
      const result = await callAdmin('resetAllData', {});
      if (result.ok) showToast('تم إعادة ضبط البيانات', 'success');
    });
  }

  const saveFields = ['settingSiteName', 'settingDefaultLang', 'settingRequireEmail', 'settingAllowRegistration'];
  let saveTimer;

  const doSave = async () => {
    const siteName = document.getElementById('settingSiteName')?.value || '';
    const defaultLang = document.getElementById('settingDefaultLang')?.value || 'ar';
    const requireEmail = document.getElementById('settingRequireEmail')?.checked ?? true;
    const allowRegistration = document.getElementById('settingAllowRegistration')?.checked ?? true;
    const result = await callAdmin('saveSettings', { siteName, defaultLang, requireEmail, allowRegistration });
    if (result.ok) showToast('تم حفظ الإعدادات', 'success');
  };

  saveFields.forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener(el.type === 'checkbox' ? 'change' : 'input', () => {
      clearTimeout(saveTimer);
      saveTimer = setTimeout(doSave, 600);
    });
  });
}
