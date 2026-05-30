import React from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { DeckScreen } from '../../src/components/DeckScreen';
import { useDeckStore } from '../../src/store/deckStore';
import { useShuffleStore } from '../../src/store/shuffleStore';
import { useSettingsStore } from '../../src/store/settingsStore';

export default function DeckRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { decks, pages, updateDeck, deleteDeck } = useDeckStore();
  const { settings } = useSettingsStore();
  const { setScope } = useShuffleStore();

  const deck = decks.find(d => d.id === id);
  if (!deck) {
    router.back();
    return null;
  }

  const handleShuffleDeck = () => {
    setScope(id, pages);
    router.push('/');
  };

  const handleEdit = (pageId: string | null, deckId?: string) => {
    router.push({
      pathname: '/editor',
      params: pageId ? { pageId } : { deckId: deckId ?? id },
    });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <DeckScreen
        deck={deck}
        pages={pages}
        palette={settings.palette}
        dark={settings.dark}
        onBack={() => router.back()}
        onEdit={handleEdit}
        onShuffleDeck={handleShuffleDeck}
        onUpdateDeck={(patch) => updateDeck(id, patch)}
        onDeleteDeck={() => { deleteDeck(id); router.back(); }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
});
