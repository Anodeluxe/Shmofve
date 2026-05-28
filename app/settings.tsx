import React from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { SettingsScreen } from '../src/components/SettingsScreen';
import { useSettingsStore } from '../src/store/settingsStore';
import { AppSettings } from '../src/types';

export default function SettingsRoute() {
  const router = useRouter();
  const { settings, setSetting } = useSettingsStore();

  return (
    <SafeAreaView style={styles.safe}>
      <SettingsScreen
        palette={settings.palette}
        texture={settings.texture}
        layout={settings.layout}
        dark={settings.dark}
        showDeckBadge={settings.showDeckBadge}
        onBack={() => router.back()}
        onSet={setSetting}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
});
