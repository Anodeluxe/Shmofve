import { PaletteName, Tone, ToneName } from './types';

type PaletteMap = Record<ToneName, Tone>;

const PALETTES: Record<PaletteName, PaletteMap> = {
  Linen: {
    cream: { bg: '#fbf8f1', ink: '#211d18', muted: '#7a7064', hairline: '#e5dfd1', tag: '#b04a2b' },
    ink:   { bg: '#231f1a', ink: '#f1ead9', muted: '#a59c8b', hairline: '#3a3429', tag: '#e8a07a' },
    sand:  { bg: '#ecdfc7', ink: '#3a2f22', muted: '#6e5f4a', hairline: '#d6c6a8', tag: '#9a5530' },
  },
  Mist: {
    cream: { bg: '#f3f4f6', ink: '#1a1f2b', muted: '#67707f', hairline: '#dfe2e8', tag: '#3a5e8a' },
    ink:   { bg: '#1b2230', ink: '#e7ecf3', muted: '#94a0b3', hairline: '#2c3344', tag: '#9bb6de' },
    sand:  { bg: '#dde3ec', ink: '#1a2433', muted: '#5d6779', hairline: '#c6cfdc', tag: '#365789' },
  },
  Sage: {
    cream: { bg: '#f1f0e7', ink: '#1f241d', muted: '#6c715f', hairline: '#dcdcca', tag: '#5e7a52' },
    ink:   { bg: '#1f241d', ink: '#ebebd9', muted: '#9aa18d', hairline: '#333a30', tag: '#a9c19a' },
    sand:  { bg: '#dfe1c8', ink: '#26301f', muted: '#5f6850', hairline: '#c5c8aa', tag: '#4d6543' },
  },
  Bone: {
    cream: { bg: '#f4f1ec', ink: '#161513', muted: '#6b6862', hairline: '#e0dcd4', tag: '#161513' },
    ink:   { bg: '#161513', ink: '#f1ede5', muted: '#a09c93', hairline: '#2a2826', tag: '#e9e3d5' },
    sand:  { bg: '#e3ddd1', ink: '#1d1b18', muted: '#5e5a52', hairline: '#cdc6b6', tag: '#1d1b18' },
  },
};

export function paletteFor(name: PaletteName): PaletteMap {
  return PALETTES[name] ?? PALETTES.Linen;
}

export function getLuminance(hex: string): number {
  if (!hex || hex.length < 7) return 1;
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

export function applyBgColor(tone: Tone, bgColor?: string): Tone {
  if (!bgColor) return tone;
  const lum = getLuminance(bgColor);
  const isLight = lum > 0.45;
  return {
    ...tone,
    bg: bgColor,
    ink:      isLight ? '#1e1b17' : '#f2ece0',
    muted:    isLight ? '#7a7164' : '#a09585',
    hairline: isLight ? 'rgba(0,0,0,0.12)' : 'rgba(255,255,255,0.12)',
    tag:      isLight ? '#8a4a2b' : '#e8a07a',
  };
}

export const CUSTOM_BG_COLORS = [
  '#f7f0e6', '#f0eaf8', '#e7f2e9', '#fce9e9',
  '#1a1614', '#1b2233', '#1a231a', '#261921',
];

export const PALETTE_OPTIONS: PaletteName[] = ['Linen', 'Mist', 'Sage', 'Bone'];

export { PALETTES };
