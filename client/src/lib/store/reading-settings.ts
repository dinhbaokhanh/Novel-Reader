import { create } from 'zustand';
import { ReadingSettings } from '../types';
import { storage } from '../storage';

const STORAGE_KEY = 'readingSettings';

const DEFAULTS: ReadingSettings = {
  theme:      'light',
  fontSize:   18,
  lineHeight: 1.8,
  maxWidth:   680,
};

interface ReadingSettingsState {
  settings: ReadingSettings;
  update: (partial: Partial<ReadingSettings>) => void;
  reset: () => void;
  load: () => void;
}

export const useReadingSettings = create<ReadingSettingsState>((set) => ({
  settings: DEFAULTS,

  load: () => {
    const saved = storage.getJSON<ReadingSettings>(STORAGE_KEY);
    if (saved) {
      // Strip any stale `font` field saved from previous version
      const { theme, fontSize, lineHeight, maxWidth } = { ...DEFAULTS, ...saved };
      set({ settings: { theme, fontSize, lineHeight, maxWidth } });
    }
  },

  update: (partial) => {
    set((state) => {
      const next = { ...state.settings, ...partial };
      storage.setJSON(STORAGE_KEY, next);
      return { settings: next };
    });
  },

  reset: () => {
    storage.removeItem(STORAGE_KEY);
    set({ settings: DEFAULTS });
  },
}));
