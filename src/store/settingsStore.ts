import { create } from 'zustand';
import { AppSettings } from '../types';
import { getItem, setItem } from '../storage/asyncStorage';
import { STORAGE_KEYS } from '../constants/keys';

const DEFAULTS: AppSettings = {
  palette: 'Linen',
  texture: 'grain',
  layout: 'centered',
  dark: false,
  showDeckBadge: true,
};

interface SettingsStore {
  settings: AppSettings;
  loadSettings: () => Promise<void>;
  setSetting: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => void;
}

export const useSettingsStore = create<SettingsStore>((set, get) => ({
  settings: DEFAULTS,

  loadSettings: async () => {
    const stored = await getItem<AppSettings>(STORAGE_KEYS.SETTINGS);
    if (stored) set({ settings: { ...DEFAULTS, ...stored } });
  },

  setSetting: (key, value) => {
    const settings = { ...get().settings, [key]: value };
    set({ settings });
    setItem(STORAGE_KEYS.SETTINGS, settings);
  },
}));
