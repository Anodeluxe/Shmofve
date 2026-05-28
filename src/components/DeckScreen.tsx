import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Deck, Page, PaletteName } from '../types';
import { paletteFor } from '../palette';
import { TopBar } from './TopBar';

interface Props {
  deck: Deck;
  pages: Page[];
  palette: PaletteName;
  dark: boolean;
  onBack: () => void;
  onEdit: (pageId: string | null, deckId?: string) => void;
  onShuffleDeck: () => void;
}

export function DeckScreen({ deck, pages, palette, dark, onBack, onEdit, onShuffleDeck }: Props) {
  const tone = paletteFor(palette)[dark ? 'ink' : 'cream'];
  const items = pages.filter(p => p.deckId === deck.id);

  return (
    <View style={[styles.screen, { backgroundColor: tone.bg }]}>
      <TopBar
        tone={tone}
        left={
          <TouchableOpacity onPress={onBack}>
            <Text style={[styles.navBtn, { color: tone.ink }]}>← Library</Text>
          </TouchableOpacity>
        }
        title={deck.title}
        right={
          <TouchableOpacity onPress={() => onEdit(null, deck.id)}>
            <Text style={[styles.navBtn, { color: tone.ink }]}>＋</Text>
          </TouchableOpacity>
        }
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <TouchableOpacity
          onPress={onShuffleDeck}
          style={[styles.shuffleBtn, { backgroundColor: tone.ink }]}
        >
          <Text style={[styles.shuffleBtnText, { color: tone.bg }]}>Shuffle this deck</Text>
        </TouchableOpacity>

        {items.length === 0 ? (
          <Text style={[styles.emptyText, { color: tone.muted }]}>
            No pages yet — tap ＋ to add one.
          </Text>
        ) : (
          <View>
            {items.map((page, i) => (
              <TouchableOpacity
                key={page.id}
                onPress={() => onEdit(page.id)}
                style={[
                  styles.pageRow,
                  {
                    borderTopColor: tone.hairline,
                    borderBottomColor: i === items.length - 1 ? tone.hairline : 'transparent',
                    borderTopWidth: StyleSheet.hairlineWidth,
                    borderBottomWidth: i === items.length - 1 ? StyleSheet.hairlineWidth : 0,
                  },
                ]}
              >
                <View style={{ flex: 1, gap: 6 }}>
                  <Text style={[styles.pageType, { color: tone.muted }]}>{page.type}</Text>
                  <Text
                    numberOfLines={2}
                    style={[styles.pageText, { color: tone.ink }]}
                  >
                    {page.text || page.caption || '—'}
                  </Text>
                  {page.author ? (
                    <Text style={[styles.pageAuthor, { color: tone.muted }]}>{page.author}</Text>
                  ) : null}
                </View>
                <Text style={[styles.chevron, { color: tone.muted }]}>›</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 40 },
  navBtn: {
    fontFamily: 'JetBrainsMono_400Regular',
    fontSize: 13,
  },
  shuffleBtn: {
    padding: 12,
    borderRadius: 4,
    alignItems: 'center',
    marginBottom: 14,
  },
  shuffleBtnText: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 13,
  },
  pageRow: {
    paddingVertical: 14,
    paddingHorizontal: 4,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
  },
  pageType: {
    fontFamily: 'JetBrainsMono_400Regular',
    fontSize: 9,
    letterSpacing: 1.6,
    textTransform: 'uppercase',
  },
  pageText: {
    fontFamily: 'InstrumentSerif_400Regular',
    fontSize: 16,
    lineHeight: 20,
  },
  pageAuthor: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 11,
  },
  chevron: { fontSize: 16, opacity: 0.6, paddingTop: 12 },
  emptyText: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 14,
    marginTop: 20,
    textAlign: 'center',
  },
});
