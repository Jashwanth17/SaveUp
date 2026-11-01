const STORAGE_PREFIX = 'saveup_v1_';

export const storageService = {
  get: <T>(key: string, fallback: T): T => {
    try {
      const data = localStorage.getItem(`${STORAGE_PREFIX}${key}`);
      return data ? JSON.parse(data) : fallback;
    } catch {
      return fallback;
    }
  },

  set: <T>(key: string, value: T): void => {
    try {
      localStorage.setItem(`${STORAGE_PREFIX}${key}`, JSON.stringify(value));
    } catch (e) {
      console.warn('LocalStorage save failed', e);
    }
  },

  remove: (key: string): void => {
    localStorage.removeItem(`${STORAGE_PREFIX}${key}`);
  },

  clearAll: (): void => {
    localStorage.clear();
  },
};
