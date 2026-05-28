import { Deck, Page } from '../types';

export const DEFAULT_DECKS: Deck[] = [
  { id: 'morning',   title: 'Morning Pages',   subtitle: 'Start the day grounded',       isDefault: true, createdAt: 0 },
  { id: 'work',      title: 'Deep Work',        subtitle: 'Focus, craft, finish',         isDefault: true, createdAt: 0 },
  { id: 'kindness',  title: 'Be Kind',          subtitle: 'For people, including yourself', isDefault: true, createdAt: 0 },
  { id: 'reminders', title: 'My Reminders',     subtitle: 'Personal notes & links',       isDefault: true, createdAt: 0 },
];

export const DEFAULT_PAGES: Page[] = [
  // — Morning —
  {
    id: 'p1', deckId: 'morning', type: 'attributed',
    text: 'You do not rise to the level of your goals. You fall to the level of your systems.',
    author: 'James Clear',
    tone: 'cream',
  },
  {
    id: 'p2', deckId: 'morning', type: 'quote',
    text: 'The obstacle is the way.',
    tone: 'ink',
  },
  {
    id: 'p3', deckId: 'morning', type: 'image',
    text: 'Begin again.',
    caption: 'Sunrise over the Sierra · iPhone 14',
    placeholder: 'photo — quiet landscape',
    tone: 'cream',
  },
  {
    id: 'p4', deckId: 'morning', type: 'multi',
    text: 'Three pages, by hand, before anything else.',
    author: "Julia Cameron, The Artist's Way",
    placeholder: 'photo — notebook on desk',
    link: { label: 'Read the practice', url: 'https://juliacameronlive.com' },
    tone: 'sand',
  },

  // — Deep Work —
  {
    id: 'p5', deckId: 'work', type: 'attributed',
    text: 'It is not that we have so little time, but that we lose so much.',
    author: 'Seneca',
    tone: 'ink',
  },
  {
    id: 'p6', deckId: 'work', type: 'quote',
    text: 'Slow is smooth. Smooth is fast.',
    tone: 'cream',
  },
  {
    id: 'p7', deckId: 'work', type: 'video',
    text: 'A short reset.',
    caption: '02:14 · breathing exercise',
    placeholder: 'video — looped b-roll',
    tone: 'ink',
  },
  {
    id: 'p8', deckId: 'work', type: 'link',
    text: "Today's one essential thing",
    link: { label: 'Open the brief', url: 'https://todoist.com' },
    caption: 'From your Monday plan',
    tone: 'sand',
  },

  // — Kindness —
  {
    id: 'p9', deckId: 'kindness', type: 'quote',
    text: 'Tenderness is the highest form of intelligence.',
    tone: 'sand',
  },
  {
    id: 'p10', deckId: 'kindness', type: 'attributed',
    text: 'Be kind, for everyone you meet is fighting a hard battle.',
    author: '— attributed to Ian Maclaren',
    tone: 'cream',
  },
  {
    id: 'p11', deckId: 'kindness', type: 'image',
    text: 'Soften.',
    placeholder: 'photo — hands, warm light',
    tone: 'ink',
  },

  // — Reminders —
  {
    id: 'p12', deckId: 'reminders', type: 'multi',
    text: 'Call mom on Sunday.',
    caption: 'Last call: 11 days ago',
    link: { label: 'Open Contacts', url: 'https://contacts.google.com' },
    tone: 'cream',
  },
  {
    id: 'p13', deckId: 'reminders', type: 'quote',
    text: 'Write it down. Make it real.',
    tone: 'sand',
  },
  {
    id: 'p14', deckId: 'reminders', type: 'quote',
    text: 'You have done hard things before.',
    tone: 'ink',
  },
];
