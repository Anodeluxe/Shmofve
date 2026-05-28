import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Tone } from '../types';

interface Props {
  left?: React.ReactNode;
  title?: string;
  right?: React.ReactNode;
  tone: Tone;
  divider?: boolean;
}

export function TopBar({ left, title, right, tone, divider = true }: Props) {
  return (
    <View
      style={[
        styles.bar,
        {
          backgroundColor: tone.bg,
          borderBottomColor: tone.hairline,
          borderBottomWidth: divider ? StyleSheet.hairlineWidth : 0,
        },
      ]}
    >
      <View style={styles.side}>{left}</View>
      {title ? (
        <Text style={[styles.title, { color: tone.ink }]}>{title}</Text>
      ) : <View />}
      <View style={[styles.side, styles.sideRight]}>{right}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexShrink: 0,
  },
  side: {
    minWidth: 72,
    flexDirection: 'row',
    alignItems: 'center',
  },
  sideRight: {
    justifyContent: 'flex-end',
  },
  title: {
    fontFamily: 'InstrumentSerif_400Regular',
    fontSize: 18,
    fontStyle: 'italic',
    letterSpacing: -0.1,
  },
});
