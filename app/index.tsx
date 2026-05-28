import React, { useState, useMemo, useCallback } from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ShuffleScreen } from '../src/components/ShuffleScreen';
import { useDeckStore } from '../src/store/deckStore';
import { useShuffleStore } from '../src/store/shuffleStore';
import { useSettingsStore } from '../src/store/settingsStore';

export default function HomeScreen() {
  const router = useRouter();
  const pages = useDeckStore(s => s.pages);
  const decks = useDeckStore(s => s.decks);
  const { order, cursor, scope, advance, prev } = useShuffleStore();
  const { settings } = useSettingsStore();
  const [fading, setFading] = useState(false);

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

  const goNext = useCallback(() => {
    if (fading) return;
    setFading(true);
    setTimeout(() => {
      advance(pages);
      setFading(false);
    }, 220);
  }, [fading, advance, pages]);

  const goPrev = useCallback(() => {
    if (fading) return;
    setFading(true);
    setTimeout(() => {
      prev();
      setFading(false);
    }, 220);
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
        canPrev={cursor > 0}
        onNext={goNext}
        onPrev={goPrev}
        onLibrary={() => router.push('/library')}
        onEdit={() => currentPage && router.push({ pathname: '/editor', params: { pageId: currentPage.id } })}
        onSettings={() => router.push('/settings')}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
});
