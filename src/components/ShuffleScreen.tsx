import {
  View, Text, TouchableOpacity, StyleSheet,
  PanResponder, Animated, Dimensions,
} from 'react-native';
import { useRef, useEffect } from 'react';
import * as Haptics from 'expo-haptics';
import { Page, PaletteName, TextureName, LayoutName } from '../types';
import { paletteFor } from '../palette';
import { PageCard } from './PageCard';

const SCREEN_W = Dimensions.get('window').width;
const SWIPE_THRESHOLD = 55;   // px to commit a swipe
const EXIT_X = SCREEN_W * 1.5; // how far the card travels off-screen

interface Props {
  page: Page | null;
  palette: PaletteName;
  texture: TextureName;
  layout: LayoutName;
  dark: boolean;
  fading: boolean;
  cursor: number;
  total: number;
  scopeLabel: string;
  canPrev: boolean;
  isLast: boolean;
  onNext: () => void;       // button + last-card swipe → may show popup
  onPrev: () => void;       // button ←
  onSwipeNext: () => void;  // swipe-left advance (no fade)
  onSwipePrev: () => void;  // swipe-right advance (no fade)
  onLibrary: () => void;
  onEdit: () => void;
  onSettings: () => void;
  onScopePress?: () => void;
}

export function ShuffleScreen({
  page, palette, texture, layout, dark, fading,
  cursor, total, scopeLabel, canPrev, isLast,
  onNext, onPrev, onSwipeNext, onSwipePrev,
  onLibrary, onEdit, onSettings, onScopePress,
}: Props) {
  const tone = paletteFor(palette)[dark ? 'ink' : 'cream'];

  // ─── Stable callback refs (PanResponder never needs to be recreated) ───────
  const cbNext      = useRef(onNext);
  const cbPrev      = useRef(onPrev);
  const cbSwipeNext = useRef(onSwipeNext);
  const cbSwipePrev = useRef(onSwipePrev);
  const cbIsLast    = useRef(isLast);
  useEffect(() => { cbNext.current      = onNext;      }, [onNext]);
  useEffect(() => { cbPrev.current      = onPrev;      }, [onPrev]);
  useEffect(() => { cbSwipeNext.current = onSwipeNext; }, [onSwipeNext]);
  useEffect(() => { cbSwipePrev.current = onSwipePrev; }, [onSwipePrev]);
  useEffect(() => { cbIsLast.current    = isLast;      }, [isLast]);

  // ─── Animated values ────────────────────────────────────────────────────────
  const translateX = useRef(new Animated.Value(0)).current;

  // Tilt: card rotates slightly in the direction it's being dragged.
  const rotate = translateX.interpolate({
    inputRange: [-SCREEN_W / 2, 0, SCREEN_W / 2],
    outputRange: ['-14deg', '0deg', '14deg'],
    extrapolate: 'clamp',
  });

  // Directional hint overlays (fade in as you drag)
  const nextHint = translateX.interpolate({   // left-drag → next
    inputRange: [-100, -30, 0],
    outputRange: [0.18, 0, 0],
    extrapolate: 'clamp',
  });
  const prevHint = translateX.interpolate({   // right-drag → prev
    inputRange: [0, 30, 100],
    outputRange: [0, 0, 0.18],
    extrapolate: 'clamp',
  });

  // ─── Animation helpers ───────────────────────────────────────────────────────
  const snapBack = () =>
    Animated.spring(translateX, {
      toValue: 0,
      useNativeDriver: true,
      damping: 22,
      stiffness: 260,
    }).start();

  /**
   * Fly the card to `exitX`, run `then()` (content update), then instantly
   * reposition the card at `enterX` so the new content slides in from the
   * opposite side. This eliminates any blank-card flash.
   */
  const flyOutAndIn = (exitX: number, enterX: number, then: () => void) => {
    Animated.timing(translateX, {
      toValue: exitX,
      duration: 210,
      useNativeDriver: true,
    }).start(() => {
      then();                        // update store → schedules React re-render
      translateX.setValue(enterX);   // park off-screen on the other side
      Animated.spring(translateX, {  // slide new card in
        toValue: 0,
        useNativeDriver: true,
        damping: 18,
        stiffness: 180,
        mass: 0.95,
      }).start();
    });
  };

  // ─── PanResponder (stable ref — callbacks accessed via cbXxx refs) ──────────
  const pan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, g) =>
        Math.abs(g.dx) > 6 && Math.abs(g.dx) > Math.abs(g.dy) * 1.2,
      onPanResponderMove: (_, g) => {
        translateX.setValue(g.dx);
      },
      onPanResponderRelease: (_, g) => {
        const dx = g.dx;
        const vx = g.vx;
        // Consider velocity: a fast short flick also commits
        const committed = Math.abs(dx) > SWIPE_THRESHOLD || Math.abs(vx) > 0.6;

        if (dx < 0 && committed) {
          // ← LEFT swipe → NEXT
          if (cbIsLast.current) {
            snapBack();
            cbNext.current();   // triggers popup
          } else {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            flyOutAndIn(-EXIT_X, EXIT_X, () => cbSwipeNext.current());
          }
        } else if (dx > 0 && committed) {
          // → RIGHT swipe → PREV
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          flyOutAndIn(EXIT_X, -EXIT_X, () => cbSwipePrev.current());
        } else {
          snapBack();
        }
      },
      onPanResponderTerminate: () => snapBack(),
    })
  ).current;

  // ─── Empty state ─────────────────────────────────────────────────────────────
  if (!page) {
    return (
      <View style={[styles.screen, { backgroundColor: tone.bg }]}>
        <EmptyState tone={tone} onLibrary={onLibrary} />
      </View>
    );
  }

  // ─── Main UI ──────────────────────────────────────────────────────────────────
  return (
    <View style={[styles.screen, { backgroundColor: tone.bg }]}>

      {/* ── Top bar: Library | scope | Settings ── */}
      <View style={styles.topChrome}>
        <TouchableOpacity onPress={onLibrary} style={styles.topBtn}>
          <Text style={[styles.topBtnText, { color: tone.ink }]}>≡ Library</Text>
        </TouchableOpacity>

        {onScopePress ? (
          <TouchableOpacity onPress={onScopePress} style={styles.topBtn}>
            <Text style={[styles.scopeLabel, { color: tone.muted }]}>
              {scopeLabel} ›
            </Text>
          </TouchableOpacity>
        ) : (
          <Text style={[styles.scopeLabel, { color: tone.muted }]}>{scopeLabel}</Text>
        )}

        <TouchableOpacity onPress={onSettings} style={styles.topBtn}>
          <Text style={[styles.topBtnText, { color: tone.ink }]}>⚙ Settings</Text>
        </TouchableOpacity>
      </View>

      {/* ── Card area (pan handlers here, card allowed to overflow) ── */}
      <View style={styles.cardArea} {...pan.panHandlers}>

        {/* Animated wrapper — drives both translate and tilt */}
        <Animated.View
          style={[
            styles.cardAnimated,
            { transform: [{ translateX }, { rotate }] },
          ]}
        >
          {/* Actual card */}
          <View style={[styles.innerCard, { borderColor: tone.hairline }]}>
            <PageCard
              page={page}
              palette={palette}
              texture={texture}
              layout={layout}
              fade={fading}
            />

            {/* Directional hint overlays */}
            <Animated.View
              style={[styles.hintOverlay, { opacity: nextHint, backgroundColor: tone.ink }]}
              pointerEvents="none"
            />
            <Animated.View
              style={[styles.hintOverlay, { opacity: prevHint, backgroundColor: tone.ink }]}
              pointerEvents="none"
            />
          </View>

          {/* Edit button — inside the Animated.View so it moves with the card,
              positioned absolute at bottom-right, above the card surface */}
          <TouchableOpacity
            onPress={onEdit}
            style={[styles.editFab, { borderColor: tone.hairline }]}
            activeOpacity={0.7}
          >
            <Text style={[styles.editFabText, { color: tone.muted }]}>Edit</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>

      {/* ── Bottom controls ── */}
      <View style={styles.bottomControls}>
        <TouchableOpacity
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onPrev();
          }}
          disabled={!canPrev}
          style={[styles.prevBtn, { borderColor: tone.hairline, opacity: canPrev ? 1 : 0.4 }]}
        >
          <Text style={[styles.prevBtnText, { color: canPrev ? tone.ink : tone.muted }]}>←</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            onNext();
          }}
          style={[styles.nextBtn, { backgroundColor: tone.ink }]}
        >
          <Text style={[styles.nextBtnLabel, { color: tone.bg }]}>Next</Text>
          <Text style={[styles.nextBtnCounter, { color: tone.bg }]}>
            {String(cursor + 1).padStart(2, '0')}/{String(total).padStart(2, '0')}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────
function EmptyState({ tone, onLibrary }: { tone: any; onLibrary: () => void }) {
  return (
    <View style={styles.emptyState}>
      <Text style={[styles.emptyTitle,    { color: tone.ink }]}>No pages yet</Text>
      <Text style={[styles.emptySubtitle, { color: tone.muted }]}>
        Add pages to your decks to start shuffling.
      </Text>
      <TouchableOpacity onPress={onLibrary} style={[styles.emptyBtn, { backgroundColor: tone.ink }]}>
        <Text style={[styles.emptyBtnText, { color: tone.bg }]}>Open Library</Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  screen: { flex: 1 },

  topChrome: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 10,
    flexShrink: 0,
  },
  topBtn: { padding: 4 },
  topBtnText: {
    fontFamily: 'JetBrainsMono_400Regular',
    fontSize: 11,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  scopeLabel: {
    fontFamily: 'JetBrainsMono_400Regular',
    fontSize: 10,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },

  // cardArea must NOT clip — the translated card needs to visibly leave the bounds
  cardArea: {
    flex: 1,
    paddingHorizontal: 18,
    paddingBottom: 14,
    paddingTop: 8,
    overflow: 'visible',
  },

  // Animated.View — fills cardArea, carries translate + rotate
  cardAnimated: {
    flex: 1,
  },

  // The actual card surface — clips PageCard content, shadow lives here
  innerCard: {
    flex: 1,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 18,
    elevation: 5,
  },

  hintOverlay: {
    ...StyleSheet.absoluteFill,
  },

  // Floating edit button — sits on top of the card, bottom-right corner
  editFab: {
    position: 'absolute',
    bottom: 14,
    right: 14,
    paddingVertical: 6,
    paddingHorizontal: 13,
    borderRadius: 999,
    borderWidth: 1,
    backgroundColor: 'rgba(0,0,0,0.04)',
  },
  editFabText: {
    fontFamily: 'JetBrainsMono_400Regular',
    fontSize: 10,
    letterSpacing: 1.1,
    textTransform: 'uppercase',
  },

  bottomControls: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 14,
    gap: 10,
    flexShrink: 0,
  },
  prevBtn: {
    width: 52, height: 52, borderRadius: 999, borderWidth: 1,
    alignItems: 'center', justifyContent: 'center',
  },
  prevBtnText: { fontSize: 20 },
  nextBtn: {
    flex: 1, height: 52, borderRadius: 999,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
  },
  nextBtnLabel: { fontFamily: 'DMSans_500Medium', fontSize: 15, letterSpacing: 0.2 },
  nextBtnCounter: {
    fontFamily: 'JetBrainsMono_400Regular', fontSize: 10, opacity: 0.55, letterSpacing: 0.6,
  },

  emptyState: {
    flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, paddingHorizontal: 40,
  },
  emptyTitle: {
    fontFamily: 'InstrumentSerif_400Regular', fontSize: 28, fontStyle: 'italic',
  },
  emptySubtitle: {
    fontFamily: 'DMSans_400Regular', fontSize: 14, textAlign: 'center', lineHeight: 20,
  },
  emptyBtn: { marginTop: 8, paddingVertical: 12, paddingHorizontal: 24, borderRadius: 999 },
  emptyBtnText: { fontFamily: 'DMSans_500Medium', fontSize: 14 },
});
