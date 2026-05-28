import React from 'react';
import {
  View, Text, TouchableOpacity, ScrollView,
  Switch, StyleSheet,
} from 'react-native';
import { PaletteName, TextureName, LayoutName, AppSettings } from '../types';
import { paletteFor, PALETTE_OPTIONS, PALETTES } from '../palette';
import { TopBar } from './TopBar';

const TEXTURE_OPTIONS: TextureName[] = ['flat', 'grain', 'gradient', 'paper'];
const LAYOUT_OPTIONS: LayoutName[] = ['centered', 'editorial', 'fullbleed'];

interface Props {
  palette: PaletteName;
  texture: TextureName;
  layout: LayoutName;
  dark: boolean;
  showDeckBadge: boolean;
  onBack: () => void;
  onSet: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => void;
}

export function SettingsScreen({ palette, texture, layout, dark, showDeckBadge, onBack, onSet }: Props) {
  const tone = paletteFor(palette)[dark ? 'ink' : 'cream'];

  return (
    <View style={[styles.screen, { backgroundColor: tone.bg }]}>
      <TopBar
        tone={tone}
        left={
          <TouchableOpacity onPress={onBack}>
            <Text style={[styles.navBtn, { color: tone.ink }]}>← Done</Text>
          </TouchableOpacity>
        }
        title="Settings"
      />

      <ScrollView contentContainerStyle={styles.content}>
        <SectionLabel label="Palette" tone={tone} />
        <View style={styles.paletteRow}>
          {PALETTE_OPTIONS.map(name => {
            const swatchBg = paletteFor(name).cream.bg;
            const active = palette === name;
            return (
              <TouchableOpacity
                key={name}
                onPress={() => onSet('palette', name)}
                style={[
                  styles.paletteChip,
                  { borderColor: active ? tone.ink : tone.hairline },
                ]}
              >
                <View style={[styles.paletteSwatch, { backgroundColor: swatchBg }]} />
                <Text style={[styles.paletteLabel, { color: active ? tone.ink : tone.muted }]}>
                  {name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <SectionLabel label="Background texture" tone={tone} />
        <OptionChips
          options={TEXTURE_OPTIONS}
          value={texture}
          onChange={(v) => onSet('texture', v as TextureName)}
          tone={tone}
        />

        <SectionLabel label="Card layout" tone={tone} />
        <OptionChips
          options={LAYOUT_OPTIONS}
          value={layout}
          onChange={(v) => onSet('layout', v as LayoutName)}
          tone={tone}
        />

        <SectionLabel label="Display" tone={tone} />
        <SettingRow label="Dark mode" tone={tone}>
          <Switch
            value={dark}
            onValueChange={(v) => onSet('dark', v)}
            trackColor={{ true: tone.ink, false: tone.hairline }}
            thumbColor={dark ? tone.bg : '#fff'}
          />
        </SettingRow>
        <SettingRow label="Show deck name on card" tone={tone}>
          <Switch
            value={showDeckBadge}
            onValueChange={(v) => onSet('showDeckBadge', v)}
            trackColor={{ true: tone.ink, false: tone.hairline }}
            thumbColor={showDeckBadge ? tone.bg : '#fff'}
          />
        </SettingRow>
      </ScrollView>
    </View>
  );
}

function SectionLabel({ label, tone }: { label: string; tone: any }) {
  return (
    <Text style={[styles.sectionLabel, { color: tone.muted }]}>{label}</Text>
  );
}

function OptionChips({ options, value, onChange, tone }: {
  options: string[];
  value: string;
  onChange: (v: string) => void;
  tone: any;
}) {
  return (
    <View style={styles.chips}>
      {options.map(o => {
        const active = value === o;
        return (
          <TouchableOpacity
            key={o}
            onPress={() => onChange(o)}
            style={[
              styles.chip,
              {
                borderColor: active ? tone.ink : tone.hairline,
                backgroundColor: active ? tone.ink : 'transparent',
              },
            ]}
          >
            <Text style={[styles.chipText, { color: active ? tone.bg : tone.ink }]}>{o}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

function SettingRow({ label, tone, children }: { label: string; tone: any; children: React.ReactNode }) {
  return (
    <View style={[styles.settingRow, { borderBottomColor: tone.hairline }]}>
      <Text style={[styles.settingLabel, { color: tone.ink }]}>{label}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  navBtn: { fontFamily: 'JetBrainsMono_400Regular', fontSize: 13 },
  content: { padding: 20, paddingBottom: 60 },
  sectionLabel: {
    fontFamily: 'JetBrainsMono_400Regular',
    fontSize: 10,
    letterSpacing: 1.6,
    textTransform: 'uppercase',
    marginBottom: 12,
    marginTop: 24,
  },
  paletteRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  paletteChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingLeft: 6,
    paddingRight: 11,
    borderWidth: 1,
    borderRadius: 999,
  },
  paletteSwatch: {
    width: 16, height: 16, borderRadius: 8,
  },
  paletteLabel: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 12,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  chip: {
    paddingVertical: 6,
    paddingHorizontal: 11,
    borderWidth: 1,
    borderRadius: 999,
  },
  chipText: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 12,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  settingLabel: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 14,
    flex: 1,
  },
});
