import { describe, it, expect, beforeEach, vi } from 'vitest';
const {
  isDone,
  resetFeedback,
  hideModal,
  showModal,
} = await import('../../js/modules/feedback.js');

import * as core from '../../js/modules/core.js';

describe('feedback', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    resetFeedback();
    document.body.innerHTML = '';
  });

  it('isDone returns false when no submission stored', () => {
    expect(isDone()).toBe(false);
  });

  it('isDone returns true after marking done', () => {
    core.safeStorageSet('svu_feedback_done', 'true');
    expect(isDone()).toBe(true);
  });

  it('resetFeedback clears the done flag', () => {
    core.safeStorageSet('svu_feedback_done', 'true');
    resetFeedback();
    expect(isDone()).toBe(false);
  });

  it('resetFeedback calls safeStorageRemove for the done key', () => {
    core.safeStorageSet('svu_feedback_done', 'true');
    const removeSpy = vi.spyOn(core, 'safeStorageRemove').mockImplementation(() => {});
    resetFeedback();
    expect(removeSpy).toHaveBeenCalledWith('svu_feedback_done');
  });

  it('showModal creates overlay and sets display to flex', () => {
    showModal();
    const overlay = document.getElementById('svu-feedback-modal');
    expect(overlay).toBeTruthy();
    expect(overlay.style.display).toBe('flex');
  });

  it('hideModal with real overlay sets display to none after transition', async () => {
    vi.useFakeTimers();
    showModal();
    const overlay = document.getElementById('svu-feedback-modal');
    expect(overlay).toBeTruthy();
    hideModal(overlay);
    await vi.advanceTimersByTimeAsync(500);
    expect(overlay.style.display).toBe('none');
    vi.useRealTimers();
  });

  it('hideModal does not throw when passed null', () => {
    expect(() => hideModal(null)).not.toThrow();
  });
});
