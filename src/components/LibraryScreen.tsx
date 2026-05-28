import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView,
  TextInput, Alert, StyleSheet,
} from 'react-native';
import { Deck, Page, PaletteName } from '../types';
import { paletteFor } from '../palette';
import { TopBar } from './TopBar';
import { DESTRUCTIVE } from '../constants/theme';

interface Props {
  decks: Deck[];
  pages: Page[];
  palette: PaletteName;
  dark: boolean;
  onBack: () => void;
  onOpenDeck: (id: string) => void;
  onNew: () => void;
  onShuffleAll: () => void;
  onCreateDeck: () => string;
  onUpdateDeck: (id: string, patch: Partial<Deck>) => void;
  onDeleteDeck: (id: string) => void;
}

export function LibraryScreen({
  decks, pages, palette, dark,
  onBack, onOpenDeck, onNew, onShuffleAll,
  onCreateDeck, onUpdateDeck, onDeleteDeck,
}: Props) {
  const tone = paletteFor(palette)[dark ? 'ink' : 'cream'];
  const [editing, setEditing] = useState(false);

  const confirmDelete = (deck: Deck, count: number) => {
    Alert.alert(
      `Delete "${deck.title}"?`,
      count > 0 ? `This will also remove ${count} page${count === 1 ? '' : 's'}.` : undefined,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => onDeleteDeck(deck.id) },
      ]
    );
  };

  return (
    <View style={[styles.screen, { backgroundColor: tone.bg }]}>
      <TopBar
        tone={tone}
        left={
          <TouchableOpacity onPress={onBack}>
            <Text style={[styles.navBtn, { color: tone.ink }]}>← Done</Text>
          </TouchableOpacity>
        }
        title="Library"
        right={
          <TouchableOpacity onPress={() => setEditing(e => !e)}>
            <Text style={[styles.navBtn, { color: tone.ink }]}>{editing ? 'Done' : 'Manage'}</Text>
          </TouchableOpacity>
        }
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={[styles.heading, { color: tone.ink }]}>Your decks</Text>
        <Text style={[styles.subheading, { color: tone.muted }]}>
          {pages.length} pages across {decks.length} decks
        </Text>

        {!editing && (
          <TouchableOpacity
            onPress={onShuffleAll}
            style={[styles.shuffleAllBtn, { backgroundColor: tone.ink, borderColor: tone.hairline }]}
          >
            <Text style={[styles.shuffleAllBtnText, { color: tone.bg }]}>⇋ Shuffle everything</Text>
          </TouchableOpacity>
        )}

        <View style={{ marginTop: 4 }}>
          {decks.map((deck, i) => {
            const count = pages.filter(p => p.deckId === deck.id).length;
            return (
              <DeckRow
                key={deck.id}
                deck={deck}
                count={count}
                tone={tone}
                first={i === 0}
                editing={editing}
                onOpen={() => onOpenDeck(deck.id)}
                onUpdate={(patch) => onUpdateDeck(deck.id, patch)}
                onDelete={() => confirmDelete(deck, count)}
              />
            );
          })}
        </View>

        <TouchableOpacity
          onPress={() => { onCreateDeck(); setEditing(true); }}
          style={[styles.newDeckBtn, { borderColor: tone.hairline }]}
        >
          <Text style={[styles.newDeckBtnText, { color: tone.muted }]}>＋ New deck</Text>
        </TouchableOpacity>

        {editing && (
          <Text style={[styles.editHint, { color: tone.muted }]}>
            Tap a field to rename · ⊖ to delete
          </Text>
        )}
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity
        onPress={onNew}
        style={[styles.fab, { backgroundColor: tone.ink }]}
      >
        <Text style={[styles.fabText, { color: tone.bg }]}>＋</Text>
      </TouchableOpacity>
    </View>
  );
}

interface DeckRowProps {
  deck: Deck;
  count: number;
  tone: ReturnType<typeof paletteFor>['cream'];
  first: boolean;
  editing: boolean;
  onOpen: () => void;
  onUpdate: (patch: Partial<Deck>) => void;
  onDelete: () => void;
}

function DeckRow({ deck, count, tone, first, editing, onOpen, onUpdate, onDelete }: DeckRowProps) {
  const borderTop = first ? { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: tone.hairline } : {};

  if (editing) {
    return (
      <View style={[styles.deckRowBase, borderTop, { borderBottomColor: tone.hairline }]}>
        <TouchableOpacity onPress={onDelete} style={styles.deleteCircle}>
          <Text style={styles.deleteCircleText}>–</Text>
        </TouchableOpacity>
        <View style={{ flex: 1, gap: 4 }}>
          <TextInput
            value={deck.title}
            onChangeText={(v) => onUpdate({ title: v })}
            style={[styles.deckTitleInput, { color: tone.ink, borderBottomColor: tone.hairline }]}
          />
          <TextInput
            value={deck.subtitle || ''}
            onChangeText={(v) => onUpdate({ subtitle: v })}
            placeholder="Add a description"
            placeholderTextColor={tone.muted}
            style={[styles.deckSubtitleInput, { color: tone.muted }]}
          />
        </View>
        <Text style={[styles.deckCount, { color: tone.muted }]}>
          {String(count).padStart(2, '0')}
        </Text>
      </View>
    );
  }

  return (
    <TouchableOpacity
      onPress={onOpen}
      style={[styles.deckRowBase, styles.deckRowInteractive, borderTop, { borderBottomColor: tone.hairline }]}
    >
      <View style={{ flex: 1, gap: 4 }}>
        <Text style={[styles.deckTitle, { color: tone.ink }]}>{deck.title}</Text>
        {deck.subtitle ? (
          <Text style={[styles.deckSubtitle, { color: tone.muted }]}>{deck.subtitle}</Text>
        ) : null}
      </View>
      <View style={styles.deckRowRight}>
        <Text style={[styles.deckCount, { color: tone.muted }]}>
          {String(count).padStart(2, '0')}
        </Text>
        <Text style={[styles.chevron, { color: tone.muted }]}>›</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 100 },
  heading: {
    fontFamily: 'InstrumentSerif_400Regular',
    fontSize: 36,
    lineHeight: 40,
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  subheading: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 13,
    marginBottom: 22,
  },
  navBtn: {
    fontFamily: 'JetBrainsMono_400Regular',
    fontSize: 13,
  },
  shuffleAllBtn: {
    width: '100%',
    padding: 14,
    borderRadius: 4,
    borderWidth: 1,
    alignItems: 'center',
    marginBottom: 22,
  },
  shuffleAllBtnText: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 14,
    letterSpacing: 0.1,
  },
  deckRowBase: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingVertical: 14,
    paddingHorizontal: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  deckRowInteractive: {
    paddingVertical: 18,
    justifyContent: 'space-between',
  },
  deckTitle: {
    fontFamily: 'InstrumentSerif_400Regular',
    fontSize: 22,
    fontStyle: 'italic',
    lineHeight: 26,
  },
  deckSubtitle: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 12,
  },
  deckTitleInput: {
    fontFamily: 'InstrumentSerif_400Regular',
    fontStyle: 'italic',
    fontSize: 20,
    paddingVertical: 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  deckSubtitleInput: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 12,
    paddingVertical: 2,
  },
  deckRowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  deckCount: {
    fontFamily: 'JetBrainsMono_400Regular',
    fontSize: 11,
    letterSpacing: 0.6,
  },
  chevron: { fontSize: 16, opacity: 0.6 },
  deleteCircle: {
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: DESTRUCTIVE,
    alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  deleteCircleText: {
    color: '#fff', fontSize: 16, fontWeight: '600', lineHeight: 20,
  },
  newDeckBtn: {
    marginTop: 22,
    width: '100%',
    padding: 14,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 4,
    alignItems: 'center',
  },
  newDeckBtnText: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 13,
  },
  editHint: {
    marginTop: 18,
    fontFamily: 'JetBrainsMono_400Regular',
    fontSize: 10,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 52,
    height: 52,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  fabText: { fontSize: 24, lineHeight: 28 },
});
