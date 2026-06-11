import { api } from './api.js';

export async function sendEmail(to, subject, html) {
  return api('/api/email/send', {
    method: 'POST',
    body: JSON.stringify({ to, subject, html })
  });
}
