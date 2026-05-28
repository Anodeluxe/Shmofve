import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Linking } from 'react-native';
import * as Sharing from 'expo-sharing';
import { Tone } from '../types';

const BARS = [6, 14, 22, 18, 30, 24, 36, 28, 22, 12, 18, 26, 14, 8];

interface Props {
  tone: Tone;
  caption?: string;
  onPlay?: () => void;
  localMediaUri?: string;
}

export function AudioBlock({ tone, caption, localMediaUri }: Props) {
  const handlePlay = async () => {
    if (!localMediaUri) return;
    try {
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(localMediaUri, { mimeType: 'audio/*', UTI: 'public.audio' });
      } else {
        Linking.openURL(localMediaUri);
      }
    } catch {}
  };

  return (
    <View style={[styles.container, { borderColor: tone.hairline }]}>
      <TouchableOpacity
        onPress={handlePlay}
        style={[styles.playBtn, { backgroundColor: tone.ink }]}
      >
        <Text style={[styles.playIcon, { color: tone.bg }]}>▶</Text>
      </TouchableOpacity>

      <View style={styles.waveform}>
        {BARS.map((h, i) => (
          <View
            key={i}
            style={[
              styles.bar,
              {
                height: h,
                backgroundColor: i < 5 ? tone.ink : tone.muted,
                opacity: i < 5 ? 0.9 : 0.4,
              },
            ]}
          />
        ))}
      </View>

      {caption && (
        <Text style={[styles.caption, { color: tone.muted }]}>{caption}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    padding: 16,
    borderWidth: 1,
    borderRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  playBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  playIcon: {
    fontSize: 14,
    marginLeft: 2,
  },
  waveform: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    flex: 1,
    height: 36,
  },
  bar: {
    width: 3,
    borderRadius: 2,
  },
  caption: {
    fontFamily: 'JetBrainsMono_400Regular',
    fontSize: 10,
    letterSpacing: 0.6,
  },
});
