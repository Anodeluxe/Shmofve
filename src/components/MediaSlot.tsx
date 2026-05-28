import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Tone } from '../types';

interface Props {
  kind?: 'image' | 'video' | 'audio';
  label?: string;
  tone: Tone;
  height?: number;
  full?: boolean;
}

export function MediaSlot({ kind = 'image', label, tone, height = 220, full = false }: Props) {
  const icon = kind === 'video' ? '▶' : kind === 'audio' ? '◉' : '◍';

  return (
    <View
      style={[
        styles.container,
        {
          height: full ? undefined : height,
          flex: full ? 1 : undefined,
          borderRadius: full ? 0 : 4,
          borderWidth: full ? 0 : 1,
          borderColor: tone.hairline,
        },
      ]}
    >
      {/* Diagonal stripe pattern via nested views is not practical in RN, so we use a subtle bg */}
      <View
        style={[StyleSheet.absoluteFill, { backgroundColor: tone.ink, opacity: 0.04 }]}
      />
      <Text style={[styles.icon, { color: tone.muted }]}>{icon}</Text>
      <Text style={[styles.label, { color: tone.muted }]}>
        {label || `${kind} placeholder`}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    gap: 10,
  },
  icon: {
    fontSize: 28,
    opacity: 0.5,
  },
  label: {
    fontSize: 10,
    fontFamily: 'JetBrainsMono_400Regular',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    textAlign: 'center',
    paddingHorizontal: 16,
    opacity: 0.7,
  },
});
