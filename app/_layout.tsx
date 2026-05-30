import React, { useEffect, useRef } from 'react';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import {
  useFonts,
  InstrumentSerif_400Regular,
  InstrumentSerif_400Regular_Italic,
} from '@expo-google-fonts/instrument-serif';
import {
  DMSans_400Regular,
  DMSans_500Medium,
} from '@expo-google-fonts/dm-sans';
import {
  JetBrainsMono_400Regular,
} from '@expo-google-fonts/jetbrains-mono';
import { useDeckStore } from '../src/store/deckStore';
import { useShuffleStore } from '../src/store/shuffleStore';
import { useSettingsStore } from '../src/store/settingsStore';

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    InstrumentSerif_400Regular,
    InstrumentSerif_400Regular_Italic,
    DMSans_400Regular,
    DMSans_500Medium,
    JetBrainsMono_400Regular,
  });

  const loadFromStorage = useDeckStore(s => s.loadFromStorage);
  const isLoaded = useDeckStore(s => s.isLoaded);
  const pages = useDeckStore(s => s.pages);
  const initQueue = useShuffleStore(s => s.initQueue);
  const loadSettings = useSettingsStore(s => s.loadSettings);

  const splashHidden = useRef(false);
  const hideSplash = () => {
    if (!splashHidden.current) {
      splashHidden.current = true;
      SplashScreen.hideAsync();
    }
  };

  useEffect(() => {
    Promise.all([loadFromStorage(), loadSettings()]);
    // Safety net: hide splash after 4 s no matter what
    const timer = setTimeout(hideSplash, 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isLoaded && pages.length > 0) {
      initQueue(pages, 'all');
    }
  }, [isLoaded]);

  useEffect(() => {
    if ((fontsLoaded || fontError) && isLoaded) {
      hideSplash();
    }
  }, [fontsLoaded, fontError, isLoaded]);

  // Always render Stack so expo-router can initialise its navigation tree.
  // The native splash screen covers the app while fonts/data load.
  return (
    <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="library" />
      <Stack.Screen name="deck/[id]" />
      <Stack.Screen name="editor" options={{ animation: 'slide_from_bottom' }} />
      <Stack.Screen name="settings" />
    </Stack>
  );
}
