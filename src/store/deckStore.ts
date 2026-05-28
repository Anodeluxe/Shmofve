import { create } from 'zustand';
import { Deck, Page } from '../types';
import { getItem, setItem } from '../storage/asyncStorage';
import { deleteMediaFile } from '../storage/fileStorage';
import { DEFAULT_DECKS, DEFAULT_PAGES } from '../data/defaultDecks';
import { STORAGE_KEYS } from '../constants/keys';

interface DeckStore {
  decks: Deck[];
  pages: Page[];
  isLoaded: boolean;
  loadFromStorage: () => Promise<void>;
  addDeck: (deck: Omit<Deck, 'id' | 'createdAt'>) => string;
  updateDeck: (id: string, patch: Partial<Deck>) => void;
  deleteDeck: (id: string) => void;
  addPage: (page: Omit<Page, 'id'>) => string;
  updatePage: (id: string, patch: Partial<Page>) => void;
  deletePage: (id: string) => void;
  resetToDefaults: () => void;
}

function persist(decks: Deck[], pages: Page[]) {
  setItem(STORAGE_KEYS.DECKS, decks);
  setItem(STORAGE_KEYS.PAGES, pages);
}

export const useDeckStore = create<DeckStore>((set, get) => ({
  decks: [],
  pages: [],
  isLoaded: false,

  loadFromStorage: async () => {
    const storedDecks = await getItem<Deck[]>(STORAGE_KEYS.DECKS);
    const storedPages = await getItem<Page[]>(STORAGE_KEYS.PAGES);
    const initialized = await getItem<string>(STORAGE_KEYS.INITIALIZED);

    if (!initialized) {
      await setItem(STORAGE_KEYS.INITIALIZED, 'true');
      persist(DEFAULT_DECKS, DEFAULT_PAGES);
      set({ decks: DEFAULT_DECKS, pages: DEFAULT_PAGES, isLoaded: true });
    } else {
      set({
        decks: storedDecks ?? DEFAULT_DECKS,
        pages: storedPages ?? DEFAULT_PAGES,
        isLoaded: true,
      });
    }
  },

  addDeck: (deckData) => {
    const id = 'd' + Date.now();
    const deck: Deck = { ...deckData, id, createdAt: Date.now() };
    const decks = [...get().decks, deck];
    set({ decks });
    persist(decks, get().pages);
    return id;
  },

  updateDeck: (id, patch) => {
    const decks = get().decks.map(d => d.id === id ? { ...d, ...patch } : d);
    set({ decks });
    persist(decks, get().pages);
  },

  deleteDeck: (id) => {
    const pagesToDelete = get().pages.filter(p => p.deckId === id);
    pagesToDelete.forEach(p => {
      if (p.localMediaUri) deleteMediaFile(p.localMediaUri);
    });
    const decks = get().decks.filter(d => d.id !== id);
    const pages = get().pages.filter(p => p.deckId !== id);
    set({ decks, pages });
    persist(decks, pages);
  },

  addPage: (pageData) => {
    const id = 'p' + Date.now();
    const page: Page = { ...pageData, id };
    const pages = [...get().pages, page];
    set({ pages });
    persist(get().decks, pages);
    return id;
  },

  updatePage: (id, patch) => {
    const pages = get().pages.map(p => p.id === id ? { ...p, ...patch } : p);
    set({ pages });
    persist(get().decks, pages);
  },

  deletePage: (id) => {
    const page = get().pages.find(p => p.id === id);
    if (page?.localMediaUri) deleteMediaFile(page.localMediaUri);
    const pages = get().pages.filter(p => p.id !== id);
    set({ pages });
    persist(get().decks, pages);
  },

  resetToDefaults: () => {
    const existing = get().decks.filter(d => !d.isDefault);
    const existingPages = get().pages.filter(p => {
      const deck = existing.find(d => d.id === p.deckId);
      return !!deck;
    });
    const decks = [...DEFAULT_DECKS, ...existing];
    const pages = [...DEFAULT_PAGES, ...existingPages];
    set({ decks, pages });
    persist(decks, pages);
  },
}));
