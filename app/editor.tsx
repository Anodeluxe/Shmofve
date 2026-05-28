import React from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { EditorScreen } from '../src/components/EditorScreen';
import { useDeckStore } from '../src/store/deckStore';
import { useShuffleStore } from '../src/store/shuffleStore';
import { useSettingsStore } from '../src/store/settingsStore';
import { Page } from '../src/types';

export default function EditorRoute() {
  const { pageId, deckId } = useLocalSearchParams<{ pageId?: string; deckId?: string }>();
  const router = useRouter();
  const { decks, pages, addPage, updatePage, deletePage } = useDeckStore();
  const { pages: allPages } = useDeckStore();
  const { initQueue } = useShuffleStore();
  const { settings } = useSettingsStore();

  const existingPage = pageId ? pages.find(p => p.id === pageId) : null;

  const defaultDeckId = deckId ?? decks[0]?.id ?? '';
  const page: Page = existingPage ?? {
    id: '',
    deckId: defaultDeckId,
    type: 'quote',
    text: '',
    tone: 'cream',
  };

  const handleSave = (draft: Page) => {
    if (draft.id) {
      updatePage(draft.id, draft);
    } else {
      addPage(draft);
    }
    // Rebuild shuffle queue with updated pages
    const updatedPages = useDeckStore.getState().pages;
    const { scope } = useShuffleStore.getState();
    initQueue(updatedPages, scope);
    router.back();
  };

  const handleDelete = (id: string) => {
    deletePage(id);
    const updatedPages = useDeckStore.getState().pages;
    const { scope } = useShuffleStore.getState();
    initQueue(updatedPages, scope);
    router.back();
  };

  return (
    <SafeAreaView style={styles.safe}>
      <EditorScreen
        page={page}
        decks={decks}
        palette={settings.palette}
        texture={settings.texture}
        layout={settings.layout}
        dark={settings.dark}
        onCancel={() => router.back()}
        onSave={handleSave}
        onDelete={page.id ? handleDelete : undefined}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
});
