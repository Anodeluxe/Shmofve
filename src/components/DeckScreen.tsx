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
  deck: Deck;
  pages: Page[];
  palette: PaletteName;
  dark: boolean;
  onBack: () => void;
  onEdit: (pageId: string | null, deckId?: string) => void;
  onShuffleDeck: () => void;
  onUpdateDeck: (patch: Partial<Deck>) => void;
  onDeleteDeck: () => void;
}

export function DeckScreen({
  deck, pages, palette, dark,
  onBack, onEdit, onShuffleDeck, onUpdateDeck, onDeleteDeck,
}: Props) {
  const tone = paletteFor(palette)[dark ? 'ink' : 'cream'];
  const items = pages.filter(p => p.deckId === deck.id);

  const [showEdit, setShowEdit] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const openEdit = () => setShowEdit(true);

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
          <TouchableOpacity onPress={openEdit}>
            <Text style={[styles.navBtn, { color: tone.ink }]}>Edit deck</Text>
          </TouchableOpacity>
        }
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {deck.subtitle ? (
          <Text style={[styles.deckSubtitle, { color: tone.muted }]}>{deck.subtitle}</Text>
        ) : null}

        <View style={styles.actionRow}>
          <TouchableOpacity
            onPress={onShuffleDeck}
            style={[styles.actionBtn, { backgroundColor: tone.ink, flex: 1 }]}
          >
            <Text style={[styles.actionBtnText, { color: tone.bg }]}>Shuffle this deck</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => onEdit(null, deck.id)}
            style={[styles.actionBtn, styles.actionBtnOutline, { borderColor: tone.hairline, flex: 1 }]}
          >
            <Text style={[styles.actionBtnText, { color: tone.ink }]}>＋ New page</Text>
          </TouchableOpacity>
        </View>

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
                  <Text numberOfLines={2} style={[styles.pageText, { color: tone.ink }]}>
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

      <EditDeckModal
        visible={showEdit}
        deck={deck}
        tone={tone}
        onSave={(patch) => { onUpdateDeck(patch); setShowEdit(false); }}
        onCancel={() => setShowEdit(false)}
        onDeleteRequest={() => { setShowEdit(false); setShowDeleteConfirm(true); }}
      />

      <DeleteDeckModal
        visible={showDeleteConfirm}
        deck={deck}
        pageCount={items.length}
        tone={tone}
        onConfirm={onDeleteDeck}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </View>
  );
}

// ─── Edit Deck Modal ──────────────────────────────────────────────────────────

function EditDeckModal({
  visible, deck, tone, onSave, onCancel, onDeleteRequest,
}: {
  visible: boolean;
  deck: Deck;
  tone: Tone;
  onSave: (patch: Partial<Deck>) => void;
  onCancel: () => void;
  onDeleteRequest: () => void;
}) {
  const [title, setTitle] = useState(deck.title);
  const [subtitle, setSubtitle] = useState(deck.subtitle ?? '');

  // Re-sync when deck changes (e.g. navigating to a different deck)
  React.useEffect(() => {
    if (visible) {
      setTitle(deck.title);
      setSubtitle(deck.subtitle ?? '');
    }
  }, [visible, deck.title, deck.subtitle]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View style={m.overlay}>
          <View style={[m.card, { backgroundColor: tone.bg, borderColor: tone.hairline }]}>
            <Text style={[m.heading, { color: tone.ink }]}>Edit deck</Text>

            <View style={m.field}>
              <Text style={[m.label, { color: tone.muted }]}>Name</Text>
              <TextInput
                value={title}
                onChangeText={setTitle}
                style={[m.input, { color: tone.ink, borderBottomColor: tone.hairline }]}
                autoFocus
                returnKeyType="next"
                selectTextOnFocus
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
                onSubmitEditing={() => onSave({ title: title.trim() || deck.title, subtitle })}
              />
            </View>

            <TouchableOpacity
              onPress={() => onSave({ title: title.trim() || deck.title, subtitle })}
              style={[m.primaryBtn, { backgroundColor: tone.ink }]}
            >
              <Text style={[m.primaryBtnText, { color: tone.bg }]}>Save</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={onCancel} style={m.cancelBtn}>
              <Text style={[m.cancelText, { color: tone.muted }]}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={onDeleteRequest} style={m.deleteBtn}>
              <Text style={m.deleteBtnText}>Delete deck</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ─── Delete Deck Confirmation Modal ──────────────────────────────────────────

function DeleteDeckModal({
  visible, deck, pageCount, tone, onConfirm, onCancel,
}: {
  visible: boolean;
  deck: Deck;
  pageCount: number;
  tone: Tone;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={m.overlay}>
        <View style={[m.card, { backgroundColor: tone.bg, borderColor: tone.hairline }]}>
          <Text style={[m.heading, { color: tone.ink }]}>
            Delete "{deck.title}"?
          </Text>
          {pageCount > 0 && (
            <Text style={[m.bodyText, { color: tone.muted }]}>
              This will permanently remove {pageCount} page{pageCount === 1 ? '' : 's'} inside this deck.
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
  scrollContent: { padding: 16, paddingBottom: 40 },
  navBtn: {
    fontFamily: 'JetBrainsMono_400Regular',
    fontSize: 13,
  },
  deckSubtitle: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 14,
    opacity: 0.8,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  actionBtn: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionBtnOutline: {
    borderWidth: 1,
  },
  actionBtnText: {
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
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 16,
  },
  heading: {
    fontFamily: 'InstrumentSerif_400Regular_Italic',
    fontSize: 26,
    lineHeight: 30,
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
    marginTop: 4,
  },
  primaryBtnText: {
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
  deleteBtn: {
    alignItems: 'center',
    paddingVertical: 6,
    marginTop: 2,
  },
  deleteBtnText: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 13,
    color: DESTRUCTIVE,
  },
  bodyText: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 14,
    lineHeight: 20,
    marginTop: -4,
  },
});
