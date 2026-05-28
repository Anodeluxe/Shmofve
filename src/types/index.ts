export type PageType = 'quote' | 'attributed' | 'image' | 'video' | 'link' | 'multi';
export type ToneName = 'cream' | 'ink' | 'sand';
export type PaletteName = 'Linen' | 'Mist' | 'Sage' | 'Bone';
export type TextureName = 'flat' | 'grain' | 'gradient' | 'paper';
export type LayoutName = 'centered' | 'editorial' | 'fullbleed';

export interface Tone {
  bg: string;
  ink: string;
  muted: string;
  hairline: string;
  tag: string;
}

export interface Page {
  id: string;
  deckId: string;
  type: PageType;
  text?: string;
  author?: string;
  tone: ToneName;
  bgColor?: string;
  placeholder?: string;
  localMediaUri?: string;
  caption?: string;
  link?: { label: string; url: string };
  tag?: string;
  _deckTitle?: string; // runtime-decorated, not stored
}

export interface Deck {
  id: string;
  title: string;
  subtitle?: string;
  isDefault: boolean;
  createdAt: number;
}

export interface AppSettings {
  palette: PaletteName;
  texture: TextureName;
  layout: LayoutName;
  dark: boolean;
  showDeckBadge: boolean;
}
