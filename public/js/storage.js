import { STORAGE_KEY, BACKUP_KEY } from './constants.js';

export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { state: null, status: 'empty' };

    const parsed = JSON.parse(raw);
    const isValid =
      parsed &&
      parsed.version === 1 &&
      parsed.profile &&
      Array.isArray(parsed.questions) &&
      parsed.questions.length >= 1 &&
      parsed.questions.length <= 5 &&
      parsed.activeQuestionId &&
      parsed.questions.some((q) => q.id === parsed.activeQuestionId);

    if (isValid) {
      return { state: parsed, status: 'ok' };
    }

    try {
      localStorage.setItem(BACKUP_KEY, raw);
    } catch {}
    return { state: null, status: 'corrupt' };
  } catch {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) localStorage.setItem(BACKUP_KEY, raw);
    } catch {}
    return { state: null, status: 'corrupt' };
  }
}

export function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    return 'ok';
  } catch (error) {
    if (error?.name === 'QuotaExceededError') {
      return 'quota';
    }
    return 'error';
  }
}

export function clearState() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {}
}
