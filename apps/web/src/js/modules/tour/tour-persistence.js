import { safeStorageGet, safeStorageSet, safeStorageRemove } from '../core.js';
import { STORAGE_KEY } from './tour-steps.js';

export function isDone() {
  try {
    return safeStorageGet(STORAGE_KEY) === '1';
  } catch (e) {
    return false;
  }
}

export function markDone() {
  try { safeStorageSet(STORAGE_KEY, '1'); } catch (e) {}
}
