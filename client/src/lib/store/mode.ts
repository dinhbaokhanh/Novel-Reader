import { create } from 'zustand';
import { storage } from '../storage';

export type AppMode = 'author' | 'reader';

const STORAGE_KEY = 'appMode';

interface ModeState {
  mode: AppMode;
  isInitialized: boolean;
  setMode: (mode: AppMode) => void;
  toggle: () => void;
  load: () => void;
}

export const useModeStore = create<ModeState>((set, get) => ({
  mode: 'author',
  isInitialized: false,

  load: () => {
    const saved = storage.getItem(STORAGE_KEY);
    const mode: AppMode =
      saved === 'author' || saved === 'reader' ? saved : 'author';
    set({ mode, isInitialized: true });
  },

  setMode: (mode) => {
    storage.setItem(STORAGE_KEY, mode);
    set({ mode });
  },

  toggle: () => {
    const next: AppMode = get().mode === 'author' ? 'reader' : 'author';
    storage.setItem(STORAGE_KEY, next);
    set({ mode: next });
  },
}));
