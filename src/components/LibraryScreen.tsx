import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, StyleSheet,
  Modal, TextInput, KeyboardAvoidingView, Platform,
} from 'react-native';
import { Deck, Page, PaletteName, Tone } from '../types';
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
  onCreateDeck: (title: string, subtitle: string) => string;
  onDeleteDeck: (id: string) => void;
}

export function LibraryScreen({
  decks, pages, palette, dark,
  onBack, onOpenDeck, onNew, onShuffleAll,
  onCreateDeck, onDeleteDeck,
}: Props) {
  const tone = paletteFor(palette)[dark ? 'ink' : 'cream'];

  // New deck modal
  const [showNewDeck, setShowNewDeck] = useState(false);

  // Long-press delete flow: step 1 = actions sheet, step 2 = confirm
  const [actionDeck, setActionDeck] = useState<Deck | null>(null);
  const [confirmDeck, setConfirmDeck] = useState<Deck | null>(null);

  const handleLongPress = (deck: Deck) => setActionDeck(deck);

  const handleDeleteConfirmed = (deck: Deck) => {
    onDeleteDeck(deck.id);
    setConfirmDeck(null);
    setActionDeck(null);
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
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={[styles.heading, { color: tone.ink }]}>Your decks</Text>
        <Text style={[styles.subheading, { color: tone.muted }]}>
          {pages.length} pages across {decks.length} decks
        </Text>

        <TouchableOpacity
          onPress={onShuffleAll}
          style={[styles.shuffleAllBtn, { backgroundColor: tone.ink }]}
        >
          <Text style={[styles.shuffleAllBtnText, { color: tone.bg }]}>⇋ Shuffle everything</Text>
        </TouchableOpacity>

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
                onOpen={() => onOpenDeck(deck.id)}
                onLongPress={() => handleLongPress(deck)}
              />
            );
          })}
        </View>

        <TouchableOpacity
          onPress={() => setShowNewDeck(true)}
          style={[styles.newDeckBtn, { borderColor: tone.hairline }]}
        >
          <Text style={[styles.newDeckBtnText, { color: tone.muted }]}>＋ New deck</Text>
        </TouchableOpacity>

        <Text style={[styles.editHint, { color: tone.muted }]}>
          Hold a deck name to delete it
        </Text>
      </ScrollView>

      {/* FAB — add new page */}
      <TouchableOpacity
        onPress={onNew}
        style={[styles.fab, { backgroundColor: tone.ink }]}
      >
        <Text style={[styles.fabText, { color: tone.bg }]}>＋</Text>
      </TouchableOpacity>

      {/* New deck modal */}
      <NewDeckModal
        visible={showNewDeck}
        tone={tone}
        onCreate={(title, subtitle) => {
          onCreateDeck(title, subtitle);
          setShowNewDeck(false);
          setEditing(false);
        }}
        onCancel={() => setShowNewDeck(false)}
      />

      {/* Actions sheet (long-press) */}
      <DeckActionsModal
        deck={actionDeck}
        tone={tone}
        onDelete={() => { setConfirmDeck(actionDeck); setActionDeck(null); }}
        onCancel={() => setActionDeck(null)}
      />

      {/* Delete confirmation */}
      <DeleteConfirmModal
        deck={confirmDeck}
        count={confirmDeck ? pages.filter(p => p.deckId === confirmDeck.id).length : 0}
        tone={tone}
        onConfirm={() => confirmDeck && handleDeleteConfirmed(confirmDeck)}
        onCancel={() => setConfirmDeck(null)}
      />
    </View>
  );
}

// ─── Deck row ─────────────────────────────────────────────────────────────────

interface DeckRowProps {
  deck: Deck;
  count: number;
  tone: ReturnType<typeof paletteFor>['cream'];
  first: boolean;
  onOpen: () => void;
  onLongPress: () => void;
}

function DeckRow({ deck, count, tone, first, onOpen, onLongPress }: DeckRowProps) {
  const borderTop = first
    ? { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: tone.hairline }
    : {};

  return (
    <TouchableOpacity
      onPress={onOpen}
      onLongPress={onLongPress}
      delayLongPress={400}
      style={[styles.deckRowBase, borderTop, { borderBottomColor: tone.hairline }]}
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

// ─── New Deck Modal ───────────────────────────────────────────────────────────

function NewDeckModal({
  visible, tone, onCreate, onCancel,
}: {
  visible: boolean;
  tone: Tone;
  onCreate: (title: string, subtitle: string) => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');

  const reset = () => { setTitle(''); setSubtitle(''); };

  const handleCreate = () => {
    const t = title.trim();
    if (!t) return;
    onCreate(t, subtitle.trim());
    reset();
  };

  const handleCancel = () => { reset(); onCancel(); };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleCancel}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View style={m.overlay}>
          <View style={[m.card, { backgroundColor: tone.bg, borderColor: tone.hairline }]}>
            <Text style={[m.heading, { color: tone.ink }]}>New deck</Text>

            <View style={m.field}>
              <Text style={[m.label, { color: tone.muted }]}>Name</Text>
              <TextInput
                value={title}
                onChangeText={setTitle}
                placeholder="e.g. Morning Pages"
                placeholderTextColor={tone.muted}
                style={[m.input, { color: tone.ink, borderBottomColor: tone.hairline }]}
                autoFocus
                returnKeyType="next"
              />
            </View>

            <View style={m.field}>
              <Text style={[m.label, { color: tone.muted }]}>Description</Text>
              <TextInput
                value={subtitle}
                onChangeText={setSubtitle}
                placeholder="Optional"
                placeholderTextColor={tone.muted}
                style={[m.input, { color: tone.ink, borderBottomColor: tone.hairline }]}
                returnKeyType="done"
                onSubmitEditing={handleCreate}
              />
            </View>

            <TouchableOpacity
              onPress={handleCreate}
              style={[m.primaryBtn, { backgroundColor: tone.ink, opacity: title.trim() ? 1 : 0.4 }]}
              disabled={!title.trim()}
            >
              <Text style={[m.primaryBtnText, { color: tone.bg }]}>Create deck</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleCancel} style={m.cancelBtn}>
              <Text style={[m.cancelText, { color: tone.muted }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ─── Deck Actions Modal (long-press) ─────────────────────────────────────────

function DeckActionsModal({
  deck, tone, onDelete, onCancel,
}: {
  deck: Deck | null;
  tone: Tone;
  onDelete: () => void;
  onCancel: () => void;
}) {
  return (
    <Modal visible={!!deck} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={m.overlay}>
        <View style={[m.card, { backgroundColor: tone.bg, borderColor: tone.hairline }]}>
          <Text style={[m.heading, { color: tone.ink }]} numberOfLines={1}>
            {deck?.title}
          </Text>

          <TouchableOpacity
            onPress={onDelete}
            style={[m.dangerBtn, { borderColor: DESTRUCTIVE }]}
          >
            <Text style={[m.dangerBtnText, { color: DESTRUCTIVE }]}>Delete deck</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={onCancel} style={m.cancelBtn}>
            <Text style={[m.cancelText, { color: tone.muted }]}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

// ─── Delete Confirmation Modal ────────────────────────────────────────────────

function DeleteConfirmModal({
  deck, count, tone, onConfirm, onCancel,
}: {
  deck: Deck | null;
  count: number;
  tone: Tone;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <Modal visible={!!deck} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={m.overlay}>
        <View style={[m.card, { backgroundColor: tone.bg, borderColor: tone.hairline }]}>
          <Text style={[m.heading, { color: tone.ink }]}>
            Delete "{deck?.title}"?
          </Text>
          {count > 0 && (
            <Text style={[m.body, { color: tone.muted }]}>
              This will permanently remove {count} page{count === 1 ? '' : 's'} inside this deck.
            </Text>
          )}

          <TouchableOpacity
            onPress={onConfirm}
            style={[m.primaryBtn, { backgroundColor: DESTRUCTIVE }]}
          >
            <Text style={[m.primaryBtnText, { color: '#fff' }]}>Yes, delete</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={onCancel} style={m.cancelBtn}>
            <Text style={[m.cancelText, { color: tone.muted }]}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

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
    paddingVertical: 18,
    paddingHorizontal: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
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
    paddingTop: 28,
    paddingBottom: 24,
    paddingHorizontal: 24,
    gap: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 16,
  },
  heading: {
    fontFamily: 'InstrumentSerif_400Regular_Italic',
    fontSize: 24,
    lineHeight: 28,
  },
  body: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 14,
    lineHeight: 20,
    marginTop: -4,
  },
  field: { gap: 4 },
  label: {
    fontFamily: 'JetBrainsMono_400Regular',
    fontSize: 10,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  input: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 16,
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  primaryBtn: {
    height: 50,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  primaryBtnText: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 15,
    letterSpacing: 0.2,
  },
  dangerBtn: {
    height: 50,
    borderRadius: 999,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dangerBtnText: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 15,
    letterSpacing: 0.2,
  },
  cancelBtn: {
    alignItems: 'center',
    paddingVertical: 6,
  },
  cancelText: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 14,
  },
});
