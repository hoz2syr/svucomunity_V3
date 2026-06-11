import { api } from './api.js';

export async function generateResponse(prompt) {
  return api('/api/gemini/generate', {
    method: 'POST',
    body: JSON.stringify({ prompt })
  });
}
