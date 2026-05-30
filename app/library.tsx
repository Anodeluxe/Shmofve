import React from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LibraryScreen } from '../src/components/LibraryScreen';
import { useDeckStore } from '../src/store/deckStore';
import { useShuffleStore } from '../src/store/shuffleStore';
import { useSettingsStore } from '../src/store/settingsStore';

export default function LibraryRoute() {
  const router = useRouter();
  const { decks, pages, addDeck, deleteDeck } = useDeckStore();
  const { settings } = useSettingsStore();
  const { setScope } = useShuffleStore();

  const handleShuffleAll = () => {
    setScope('all', pages);
    router.back();
  };

  const handleOpenDeck = (id: string) => {
    router.push({ pathname: '/deck/[id]', params: { id } });
  };

  const handleNew = () => {
    router.push({ pathname: '/editor', params: { deckId: decks[0]?.id } });
  };

  const handleCreateDeck = (title: string, subtitle: string) => {
    return addDeck({ title, subtitle, isDefault: false });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <LibraryScreen
        decks={decks}
        pages={pages}
        palette={settings.palette}
        dark={settings.dark}
        onBack={() => router.back()}
        onOpenDeck={handleOpenDeck}
        onNew={handleNew}
        onShuffleAll={handleShuffleAll}
        onCreateDeck={handleCreateDeck}
        onDeleteDeck={deleteDeck}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
});
