import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  ScrollView, StyleSheet, Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Crypto from 'expo-crypto';
import {
  Deck, Page, PageType, ToneName, PaletteName, TextureName, LayoutName,
} from '../types';
import { paletteFor, CUSTOM_BG_COLORS } from '../palette';
import { copyMediaToAppStorage } from '../storage/fileStorage';
import { PageCard } from './PageCard';
import { TopBar } from './TopBar';
import { DESTRUCTIVE } from '../constants/theme';

const PAGE_TYPES: PageType[] = ['quote', 'attributed', 'image', 'video', 'link', 'multi'];
const TONE_NAMES: ToneName[] = ['cream', 'ink', 'sand'];

interface Props {
  page: Page;
  decks: Deck[];
  palette: PaletteName;
  texture: TextureName;
  layout: LayoutName;
  dark: boolean;
  onCancel: () => void;
  onSave: (page: Page) => void;
  onDelete?: (id: string) => void;
}

export function EditorScreen({ page, decks, palette, texture, layout, dark, onCancel, onSave, onDelete }: Props) {
  const tone = paletteFor(palette)[dark ? 'ink' : 'cream'];
  const [draft, setDraft] = useState<Page>({ ...page });

  const set = <K extends keyof Page>(k: K, v: Page[K]) =>
    setDraft(d => ({ ...d, [k]: v }));
  const setLink = (k: 'label' | 'url', v: string) =>
    setDraft(d => ({ ...d, link: { label: '', url: '', ...d.link, [k]: v } }));

  const deckTitle = (decks.find(d => d.id === draft.deckId) ?? decks[0])?.title ?? '';
  const previewPage: Page = { ...draft, _deckTitle: deckTitle };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      quality: 0.85,
      allowsEditing: true,
    });
    if (!result.canceled && result.assets[0]) {
      const uri = result.assets[0].uri;
      const filename = `img_${Crypto.randomUUID()}.jpg`;
      const localUri = await copyMediaToAppStorage(uri, filename);
      set('localMediaUri', localUri);
    }
  };

  const pickVideo = async () => {
    // Use ImagePicker for videos — returns file:// URI with proper permissions
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'videos',
      quality: 1,
    });
    if (!result.canceled && result.assets[0]) {
      const uri = result.assets[0].uri;
      const ext = uri.split('.').pop()?.toLowerCase() ?? 'mp4';
      const filename = `vid_${Crypto.randomUUID()}.${ext}`;
      const localUri = await copyMediaToAppStorage(uri, filename);
      set('localMediaUri', localUri);
    }
  };

  const handleSave = () => {
    if (!draft.text && !draft.localMediaUri && !draft.link) {
      Alert.alert('Empty page', 'Add some content before saving.');
      return;
    }
    onSave(draft);
  };

  const handleDelete = () => {
    Alert.alert('Delete page?', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => onDelete?.(page.id) },
    ]);
  };

  const needsMedia = ['image', 'video', 'multi'].includes(draft.type);
  const needsAuthor = ['attributed', 'multi'].includes(draft.type);
  const needsLink = ['link', 'multi'].includes(draft.type);
  const needsCaption = draft.type !== 'quote';

  return (
    <View style={[styles.screen, { backgroundColor: tone.bg }]}>
      <TopBar
        tone={tone}
        left={
          <TouchableOpacity onPress={onCancel}>
            <Text style={[styles.navBtn, { color: tone.ink }]}>Cancel</Text>
          </TouchableOpacity>
        }
        title={page.id ? 'Edit page' : 'New page'}
        right={
          <TouchableOpacity
            onPress={handleSave}
            style={[styles.saveBtn, { backgroundColor: tone.ink }]}
          >
            <Text style={[styles.saveBtnText, { color: tone.bg }]}>Save</Text>
          </TouchableOpacity>
        }
      />

      {/* Live Preview */}
      <View style={[styles.previewSection, { borderBottomColor: tone.hairline }]}>
        <Label tone={tone}>Preview</Label>
        <View style={[styles.previewCard, { borderColor: tone.hairline }]}>
          <PageCard
            page={previewPage}
            palette={palette}
            texture={texture || 'flat'}
            layout={layout || 'centered'}
            fade={false}
          />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.form}>
        <Label tone={tone}>Type</Label>
        <Chips
          options={PAGE_TYPES}
          value={draft.type}
          onChange={(v) => set('type', v as PageType)}
          tone={tone}
        />

        <Spacer />
        <Label tone={tone}>Deck</Label>
        <Chips
          options={decks.map(d => d.id)}
          labels={decks.reduce((m, d) => ({ ...m, [d.id]: d.title }), {})}
          value={draft.deckId}
          onChange={(v) => set('deckId', v)}
          tone={tone}
        />

        <Spacer />
        <Label tone={tone}>Text</Label>
        <FieldTextarea
          value={draft.text || ''}
          onChange={(v) => set('text', v)}
          placeholder="What do you want to remember?"
          tone={tone}
          rows={4}
        />

        {needsAuthor && (
          <>
            <Spacer />
            <Label tone={tone}>Author / Source</Label>
            <FieldInput
              value={draft.author || ''}
              onChange={(v) => set('author', v)}
              placeholder="e.g. James Clear"
              tone={tone}
            />
          </>
        )}

        {needsMedia && (
          <>
            <Spacer />
            <Label tone={tone}>Media</Label>
            <UploadSlot
              kind={draft.type === 'video' ? 'video' : 'image'}
              tone={tone}
              hasMedia={!!draft.localMediaUri}
              onPick={draft.type === 'video' ? pickVideo : pickImage}
            />
            <FieldInput
              value={draft.placeholder || ''}
              onChange={(v) => set('placeholder', v)}
              placeholder="Caption for the placeholder"
              tone={tone}
            />
          </>
        )}

        {needsLink && (
          <>
            <Spacer />
            <Label tone={tone}>Link</Label>
            <FieldInput
              value={draft.link?.label || ''}
              onChange={(v) => setLink('label', v)}
              placeholder="Button label"
              tone={tone}
            />
            <View style={{ height: 8 }} />
            <FieldInput
              value={draft.link?.url || ''}
              onChange={(v) => setLink('url', v)}
              placeholder="https://"
              tone={tone}
              keyboardType="url"
              autoCapitalize="none"
            />
          </>
        )}

        {needsCaption && (
          <>
            <Spacer />
            <Label tone={tone}>Caption</Label>
            <FieldInput
              value={draft.caption || ''}
              onChange={(v) => set('caption', v)}
              placeholder="Optional small text"
              tone={tone}
            />
          </>
        )}

        <Spacer />
        <Label tone={tone}>Base tone</Label>
        <Chips
          options={TONE_NAMES}
          value={draft.tone ?? 'cream'}
          onChange={(v) => set('tone', v as ToneName)}
          tone={tone}
          swatch
          palette={palette}
        />

        <Spacer />
        <Label tone={tone}>Background color</Label>
        <View style={styles.swatchRow}>
          <TouchableOpacity
            onPress={() => set('bgColor', undefined)}
            style={[
              styles.swatch,
              styles.swatchAuto,
              {
                borderColor: !draft.bgColor ? tone.ink : tone.hairline,
                borderWidth: 2,
              },
            ]}
          >
            <Text style={[styles.swatchAutoText, { color: tone.muted }]}>auto</Text>
          </TouchableOpacity>
          {CUSTOM_BG_COLORS.map(c => (
            <TouchableOpacity
              key={c}
              onPress={() => set('bgColor', c)}
              style={[
                styles.swatch,
                { backgroundColor: c, borderColor: draft.bgColor === c ? tone.ink : 'transparent', borderWidth: 2 },
              ]}
            />
          ))}
        </View>

        <Spacer />
        <Label tone={tone}>Tag</Label>
        <FieldInput
          value={draft.tag || ''}
          onChange={(v) => set('tag', v)}
          placeholder="e.g. evening"
          tone={tone}
        />

        {page.id && onDelete && (
          <>
            <View style={{ height: 32 }} />
            <TouchableOpacity
              onPress={handleDelete}
              style={[styles.deleteBtn, { borderColor: tone.hairline }]}
            >
              <Text style={styles.deleteBtnText}>Delete page</Text>
            </TouchableOpacity>
          </>
        )}
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

// ——— Form helpers ———

function Label({ children, tone }: { children: React.ReactNode; tone: any }) {
  return (
    <Text style={[styles.label, { color: tone.muted }]}>{children}</Text>
  );
}

function Spacer() {
  return <View style={{ height: 18 }} />;
}

function FieldInput({ value, onChange, placeholder, tone, keyboardType, autoCapitalize }: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  tone: any;
  keyboardType?: any;
  autoCapitalize?: any;
}) {
  return (
    <TextInput
      value={value}
      onChangeText={onChange}
      placeholder={placeholder}
      placeholderTextColor={tone.muted}
      keyboardType={keyboardType}
      autoCapitalize={autoCapitalize}
      style={[styles.fieldInput, { color: tone.ink, borderColor: tone.hairline }]}
    />
  );
}

function FieldTextarea({ value, onChange, placeholder, tone, rows = 3 }: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  tone: any;
  rows?: number;
}) {
  return (
    <TextInput
      value={value}
      onChangeText={onChange}
      placeholder={placeholder}
      placeholderTextColor={tone.muted}
      multiline
      numberOfLines={rows}
      style={[styles.fieldTextarea, { color: tone.ink, borderColor: tone.hairline, minHeight: rows * 24 }]}
    />
  );
}

function Chips({ options, value, onChange, tone, labels, swatch, palette }: {
  options: string[];
  value: string;
  onChange: (v: string) => void;
  tone: any;
  labels?: Record<string, string>;
  swatch?: boolean;
  palette?: PaletteName;
}) {
  return (
    <View style={styles.chips}>
      {options.map(o => {
        const active = value === o;
        const swatchBg = swatch && palette ? paletteFor(palette)[o as ToneName]?.bg : null;
        return (
          <TouchableOpacity
            key={o}
            onPress={() => onChange(o)}
            style={[
              styles.chip,
              {
                borderColor: active ? tone.ink : tone.hairline,
                backgroundColor: active ? tone.ink : 'transparent',
                paddingLeft: swatchBg ? 6 : 11,
              },
            ]}
          >
            {swatchBg ? (
              <View style={[styles.chipSwatch, { backgroundColor: swatchBg, borderColor: tone.hairline }]} />
            ) : null}
            <Text style={[styles.chipText, { color: active ? tone.bg : tone.ink }]}>
              {labels ? labels[o] : o}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

function UploadSlot({ kind, tone, hasMedia, onPick }: {
  kind: 'image' | 'video';
  tone: any;
  hasMedia: boolean;
  onPick: () => void;
}) {
  const icon = kind === 'video' ? '▶' : '◍';
  return (
    <TouchableOpacity
      onPress={onPick}
      style={[styles.uploadSlot, { borderColor: tone.hairline }]}
    >
      <Text style={[styles.uploadIcon, { color: tone.muted }]}>{icon}</Text>
      <Text style={[styles.uploadText, { color: tone.muted }]}>
        {hasMedia ? `✓ ${kind} selected — tap to change` : `Tap to upload ${kind}`}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  navBtn: { fontFamily: 'JetBrainsMono_400Regular', fontSize: 13 },
  saveBtn: {
    paddingVertical: 6, paddingHorizontal: 12,
    borderRadius: 999,
  },
  saveBtnText: { fontFamily: 'DMSans_500Medium', fontSize: 12 },
  previewSection: {
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 0,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  previewCard: {
    width: '100%',
    height: 180,
    borderRadius: 10,
    borderWidth: 1,
    overflow: 'hidden',
    marginTop: 8,
    marginBottom: 14,
  },
  form: { padding: 18, paddingTop: 14 },
  label: {
    fontFamily: 'JetBrainsMono_400Regular',
    fontSize: 10,
    letterSpacing: 1.6,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  fieldInput: {
    width: '100%',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderRadius: 4,
    fontFamily: 'DMSans_400Regular',
    fontSize: 14,
  },
  fieldTextarea: {
    width: '100%',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderRadius: 4,
    fontFamily: 'InstrumentSerif_400Regular',
    fontSize: 17,
    lineHeight: 24,
    textAlignVertical: 'top',
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  chip: {
    paddingVertical: 6,
    paddingRight: 11,
    borderWidth: 1,
    borderRadius: 999,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  chipText: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 12,
  },
  chipSwatch: {
    width: 14, height: 14,
    borderRadius: 7,
    borderWidth: 1,
  },
  swatchRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  swatch: {
    width: 32, height: 32, borderRadius: 6,
  },
  swatchAuto: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  swatchAutoText: {
    fontFamily: 'JetBrainsMono_400Regular',
    fontSize: 8,
    letterSpacing: 0.5,
  },
  uploadSlot: {
    width: '100%',
    height: 120,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginBottom: 8,
  },
  uploadIcon: { fontSize: 20, opacity: 0.6 },
  uploadText: {
    fontFamily: 'JetBrainsMono_400Regular',
    fontSize: 10,
    letterSpacing: 1,
    textTransform: 'uppercase',
    textAlign: 'center',
    paddingHorizontal: 16,
  },
  deleteBtn: {
    width: '100%',
    padding: 12,
    borderWidth: 1,
    borderRadius: 4,
    alignItems: 'center',
  },
  deleteBtnText: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 13,
    color: DESTRUCTIVE,
  },
});
