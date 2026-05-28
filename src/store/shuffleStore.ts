import { create } from 'zustand';
import { Page } from '../types';

function fisherYates(ids: string[]): string[] {
  const arr = [...ids];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

interface ShuffleStore {
  order: string[];
  cursor: number;
  scope: 'all' | string;
  initQueue: (pages: Page[], scope: 'all' | string) => void;
  advance: (pages: Page[]) => void;
  prev: () => void;
  setScope: (scope: 'all' | string, pages: Page[]) => void;
  currentPageId: () => string | null;
}

export const useShuffleStore = create<ShuffleStore>((set, get) => ({
  order: [],
  cursor: 0,
  scope: 'all',

  currentPageId: () => {
    const { order, cursor } = get();
    return order[cursor] ?? null;
  },

  initQueue: (pages, scope) => {
    const pool = scope === 'all' ? pages : pages.filter(p => p.deckId === scope);
    const ids = fisherYates(pool.map(p => p.id));
    set({ order: ids, cursor: 0, scope });
  },

  advance: (pages) => {
    const { order, cursor, scope } = get();
    const next = cursor + 1;
    if (next >= order.length) {
      const pool = scope === 'all' ? pages : pages.filter(p => p.deckId === scope);
      const fresh = fisherYates(pool.map(p => p.id));
      set({ order: fresh, cursor: 0 });
    } else {
      set({ cursor: next });
    }
  },

  prev: () => {
    const { cursor } = get();
    if (cursor > 0) set({ cursor: cursor - 1 });
  },

  setScope: (scope, pages) => {
    const pool = scope === 'all' ? pages : pages.filter(p => p.deckId === scope);
    const ids = fisherYates(pool.map(p => p.id));
    set({ order: ids, cursor: 0, scope });
  },
}));
