import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { StyleSheet, Modal, View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ShuffleScreen } from '../src/components/ShuffleScreen';
import { useDeckStore } from '../src/store/deckStore';
import { useShuffleStore } from '../src/store/shuffleStore';
import { useSettingsStore } from '../src/store/settingsStore';
import { paletteFor } from '../src/palette';
import { Tone } from '../src/types';

export default function HomeScreen() {
  const router = useRouter();
  const pages = useDeckStore(s => s.pages);
  const decks = useDeckStore(s => s.decks);
  const { order, cursor, scope, advance, prev, initQueue } = useShuffleStore();
  const { settings } = useSettingsStore();
  const [fading, setFading] = useState(false);
  const [showFinished, setShowFinished] = useState(false);
  // Once the user dismisses the popup for this shuffle, don't show again
  // until a new shuffle begins (detected via order reference changing).
  const [finishedDismissed, setFinishedDismissed] = useState(false);

  // Reset dismissed flag whenever a new shuffle starts (order is a fresh array)
  useEffect(() => {
    setFinishedDismissed(false);
  }, [order]);

  const tone = paletteFor(settings.palette)[settings.dark ? 'ink' : 'cream'];

  // isLastCard is false after dismissal so swipes advance normally
  const isLastCard = order.length > 0 && cursor === order.length - 1 && !finishedDismissed;

  const currentPageId = order[cursor] ?? null;
  const pagesByDeck = useMemo(() => {
    const m: Record<string, string> = {};
    decks.forEach(d => { m[d.id] = d.title; });
    return m;
  }, [decks]);

  const currentPage = useMemo(() => {
    const p = pages.find(p => p.id === currentPageId);
    if (!p) return null;
    return { ...p, _deckTitle: settings.showDeckBadge ? (pagesByDeck[p.deckId] ?? '') : '' };
  }, [currentPageId, pages, pagesByDeck, settings.showDeckBadge]);

  const scopeLabel = scope === 'all'
    ? 'All decks'
    : (decks.find(d => d.id === scope)?.title ?? 'Deck');

  // Tap scope label → navigate to the deck's page (only when viewing a specific deck)
  const handleScopePress = scope !== 'all'
    ? () => router.push({ pathname: '/deck/[id]', params: { id: scope } })
    : undefined;

  // Button: fade animation; shows popup on last card
  const goNext = useCallback(() => {
    if (fading) return;
    if (isLastCard) { setShowFinished(true); return; }
    setFading(true);
    setTimeout(() => { advance(pages); setFading(false); }, 220);
  }, [fading, advance, pages, isLastCard]);

  const goPrev = useCallback(() => {
    if (fading) return;
    setFading(true);
    setTimeout(() => { prev(); setFading(false); }, 220);
  }, [fading, prev]);

  // Swipe: direct store call, no fade (swipe animation is the transition)
  const goNextSwipe = useCallback(() => {
    if (fading) return;
    advance(pages);
  }, [fading, advance, pages]);

  const goPrevSwipe = useCallback(() => {
    if (fading) return;
    prev();
  }, [fading, prev]);

  return (
    <SafeAreaView style={styles.safe}>
      <ShuffleScreen
        page={currentPage}
        palette={settings.palette}
        texture={settings.texture}
        layout={settings.layout}
        dark={settings.dark}
        fading={fading}
        cursor={cursor}
        total={order.length}
        scopeLabel={scopeLabel}
        canPrev={order.length > 0}
        isLast={isLastCard}
        onNext={goNext}
        onPrev={goPrev}
        onSwipeNext={goNextSwipe}
        onSwipePrev={goPrevSwipe}
        onLibrary={() => router.push('/library')}
        onEdit={() => currentPage && router.push({ pathname: '/editor', params: { pageId: currentPage.id } })}
        onSettings={() => router.push('/settings')}
        onScopePress={handleScopePress}
      />
      <FinishedModal
        visible={showFinished}
        tone={tone}
        scope={scope}
        scopeLabel={scopeLabel}
        onShuffleAll={() => { initQueue(pages, 'all'); setShowFinished(false); }}
        onShuffleDeck={() => { initQueue(pages, scope); setShowFinished(false); }}
        onLibrary={() => { setShowFinished(false); router.push('/library'); }}
        onCancel={() => { setFinishedDismissed(true); setShowFinished(false); }}
      />
    </SafeAreaView>
  );
}

function FinishedModal({
  visible, tone, scope, scopeLabel,
  onShuffleAll, onShuffleDeck, onLibrary, onCancel,
}: {
  visible: boolean;
  tone: Tone;
  scope: string;
  scopeLabel: string;
  onShuffleAll: () => void;
  onShuffleDeck: () => void;
  onLibrary: () => void;
  onCancel: () => void;
}) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={m.overlay}>
        <View style={[m.card, { backgroundColor: tone.bg, borderColor: tone.hairline }]}>
          <Text style={[m.title, { color: tone.ink }]}>
            You have finished{'\n'}all cards.
          </Text>

          <TouchableOpacity
            onPress={onShuffleAll}
            style={[m.primaryBtn, { backgroundColor: tone.ink }]}
          >
            <Text style={[m.primaryBtnText, { color: tone.bg }]}>Shuffle all cards</Text>
          </TouchableOpacity>

          {scope !== 'all' && (
            <TouchableOpacity
              onPress={onShuffleDeck}
              style={[m.secondaryBtn, { borderColor: tone.hairline }]}
            >
              <Text style={[m.secondaryBtnText, { color: tone.ink }]}>
                Shuffle "{scopeLabel}"
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            onPress={onLibrary}
            style={[m.secondaryBtn, { borderColor: tone.hairline }]}
          >
            <Text style={[m.secondaryBtnText, { color: tone.ink }]}>Go to Library</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={onCancel} style={m.cancelBtn}>
            <Text style={[m.cancelText, { color: tone.muted }]}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
});

const m = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingBottom: 36,
  },
  card: {
    width: '100%',
    borderRadius: 20,
    borderWidth: 1,
    paddingTop: 32,
    paddingBottom: 24,
    paddingHorizontal: 28,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 16,
  },
  title: {
    fontFamily: 'InstrumentSerif_400Regular_Italic',
    fontSize: 28,
    lineHeight: 34,
    marginBottom: 6,
  },
  primaryBtn: {
    height: 52,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnText: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 15,
    letterSpacing: 0.2,
  },
  secondaryBtn: {
    height: 52,
    borderRadius: 999,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryBtnText: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 15,
    letterSpacing: 0.2,
  },
  cancelBtn: {
    alignItems: 'center',
    paddingVertical: 6,
    marginTop: 2,
  },
  cancelText: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 14,
    letterSpacing: 0.2,
  },
});
