import { View, Text, TouchableOpacity, StyleSheet, PanResponder } from 'react-native';
import { useMemo } from 'react';
import * as Haptics from 'expo-haptics';
import { Page, PaletteName, TextureName, LayoutName } from '../types';
import { paletteFor } from '../palette';
import { PageCard } from './PageCard';

interface Props {
  page: Page | null;
  palette: PaletteName;
  texture: TextureName;
  layout: LayoutName;
  dark: boolean;
  fading: boolean;
  cursor: number;
  total: number;
  scopeLabel: string;
  canPrev: boolean;
  onNext: () => void;
  onPrev: () => void;
  onLibrary: () => void;
  onEdit: () => void;
  onSettings: () => void;
}

export function ShuffleScreen({
  page, palette, texture, layout, dark, fading,
  cursor, total, scopeLabel, canPrev,
  onNext, onPrev, onLibrary, onEdit, onSettings,
}: Props) {
  const tone = paletteFor(palette)[dark ? 'ink' : 'cream'];

  const swipePan = useMemo(() => PanResponder.create({
    onMoveShouldSetPanResponder: (_, g) =>
      Math.abs(g.dx) > Math.abs(g.dy) && g.dx > 10,
    onPanResponderRelease: (_, g) => {
      if (g.dx > 60 && Math.abs(g.dy) < 80) onNext();
    },
  }), [onNext]);

  if (!page) {
    return (
      <View style={[styles.screen, { backgroundColor: tone.bg }]}>
        <EmptyState tone={tone} onLibrary={onLibrary} />
      </View>
    );
  }

  return (
    <View style={[styles.screen, { backgroundColor: tone.bg }]}>
      {/* Top chrome */}
      <View style={styles.topChrome}>
        <TouchableOpacity onPress={onLibrary} style={styles.topBtn}>
          <Text style={[styles.topBtnText, { color: tone.ink }]}>≡ Library</Text>
        </TouchableOpacity>

        <Text style={[styles.scopeLabel, { color: tone.muted }]}>{scopeLabel}</Text>

        <View style={styles.topRight}>
          <TouchableOpacity onPress={onSettings} style={styles.topBtn}>
            <Text style={{ color: tone.ink, fontSize: 18 }}>⚙</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onEdit} style={styles.topBtn}>
            <Text style={[styles.topBtnText, { color: tone.ink }]}>Edit</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Card */}
      <View style={styles.cardArea} {...swipePan.panHandlers}>
        <View style={[styles.cardWrapper, { borderColor: tone.hairline }]}>
          <PageCard
            page={page}
            palette={palette}
            texture={texture}
            layout={layout}
            fade={fading}
          />
        </View>
      </View>

      {/* Bottom controls */}
      <View style={styles.bottomControls}>
        <TouchableOpacity
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onPrev();
          }}
          disabled={!canPrev}
          style={[styles.prevBtn, { borderColor: tone.hairline, opacity: canPrev ? 1 : 0.4 }]}
        >
          <Text style={[styles.prevBtnText, { color: canPrev ? tone.ink : tone.muted }]}>←</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            onNext();
          }}
          style={[styles.nextBtn, { backgroundColor: tone.ink }]}
        >
          <Text style={[styles.nextBtnLabel, { color: tone.bg }]}>Next</Text>
          <Text style={[styles.nextBtnCounter, { color: tone.bg }]}>
            {String(cursor + 1).padStart(2, '0')}/{String(total).padStart(2, '0')}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function EmptyState({ tone, onLibrary }: { tone: any; onLibrary: () => void }) {
  return (
    <View style={styles.emptyState}>
      <Text style={[styles.emptyTitle, { color: tone.ink }]}>No pages yet</Text>
      <Text style={[styles.emptySubtitle, { color: tone.muted }]}>
        Add pages to your decks to start shuffling.
      </Text>
      <TouchableOpacity onPress={onLibrary} style={[styles.emptyBtn, { backgroundColor: tone.ink }]}>
        <Text style={[styles.emptyBtnText, { color: tone.bg }]}>Open Library</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  topChrome: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 10,
    flexShrink: 0,
  },
  topBtn: { padding: 4 },
  topBtnText: {
    fontFamily: 'JetBrainsMono_400Regular',
    fontSize: 11,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  scopeLabel: {
    fontFamily: 'JetBrainsMono_400Regular',
    fontSize: 10,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  topRight: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  cardArea: {
    flex: 1,
    paddingHorizontal: 18,
    paddingBottom: 14,
    paddingTop: 8,
  },
  cardWrapper: {
    flex: 1,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  bottomControls: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 14,
    gap: 10,
    flexShrink: 0,
  },
  prevBtn: {
    width: 52, height: 52, borderRadius: 999, borderWidth: 1,
    alignItems: 'center', justifyContent: 'center',
  },
  prevBtnText: { fontSize: 20 },
  nextBtn: {
    flex: 1, height: 52, borderRadius: 999,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
  },
  nextBtnLabel: { fontFamily: 'DMSans_500Medium', fontSize: 15, letterSpacing: 0.2 },
  nextBtnCounter: {
    fontFamily: 'JetBrainsMono_400Regular', fontSize: 10, opacity: 0.55, letterSpacing: 0.6,
  },
  emptyState: {
    flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, paddingHorizontal: 40,
  },
  emptyTitle: { fontFamily: 'InstrumentSerif_400Regular', fontSize: 28, fontStyle: 'italic' },
  emptySubtitle: { fontFamily: 'DMSans_400Regular', fontSize: 14, textAlign: 'center', lineHeight: 20 },
  emptyBtn: { marginTop: 8, paddingVertical: 12, paddingHorizontal: 24, borderRadius: 999 },
  emptyBtnText: { fontFamily: 'DMSans_500Medium', fontSize: 14 },
});
