import React, { useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, Linking, StyleSheet, Animated,
} from 'react-native';
import { Image } from 'expo-image';
import { VideoView, useVideoPlayer } from 'expo-video';
import { Page, Tone, PaletteName, TextureName, LayoutName } from '../types';
import { paletteFor, applyBgColor } from '../palette';
import { MediaSlot } from './MediaSlot';

interface Props {
  page: Page;
  palette: PaletteName;
  texture: TextureName;
  layout: LayoutName;
  fade: boolean;
}

const MEDIA_TYPES = ['image', 'video', 'gif', 'multi'] as const;

export function PageCard({ page, palette, texture, layout, fade }: Props) {
  const baseTone = paletteFor(palette)[page.tone ?? 'cream'];
  const tone = applyBgColor(baseTone, page.bgColor);
  const isFull = layout === 'fullbleed' && (MEDIA_TYPES as readonly string[]).includes(page.type);
  const isEditorial = layout === 'editorial';
  const textAlign = isEditorial ? 'left' : 'center';
  const alignItems = isEditorial ? 'flex-start' : 'center';
  const padX = 28;
  const padY = isEditorial ? 32 : 24;

  const opacity = useRef(new Animated.Value(1)).current;
  const translateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: fade ? 0 : 1, duration: 220, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: fade ? 6 : 0, duration: 220, useNativeDriver: true }),
    ]).start();
  }, [fade]);

  return (
    <Animated.View style={[styles.card, { backgroundColor: tone.bg }, { opacity, transform: [{ translateY }] }]}>
      {texture !== 'flat' && <TextureLayer texture={texture} tone={tone} />}

      {isFull ? (
        <FullBleedLayout page={page} tone={tone} />
      ) : (
        <NormalLayout
          page={page}
          tone={tone}
          textAlign={textAlign}
          alignItems={alignItems}
          padX={padX}
          padY={padY}
          layout={layout}
        />
      )}
    </Animated.View>
  );
}

// ——— Texture overlay ———

function TextureLayer({ texture, tone }: { texture: TextureName; tone: Tone }) {
  if (texture === 'grain') {
    return (
      <View
        style={[StyleSheet.absoluteFill, { backgroundColor: tone.ink, opacity: 0.04 }]}
        pointerEvents="none"
      />
    );
  }
  if (texture === 'gradient') {
    return (
      <>
        <View
          style={[StyleSheet.absoluteFill, {
            backgroundColor: tone.ink, opacity: 0.04,
            borderRadius: 200, top: -100, left: -80,
          }]}
          pointerEvents="none"
        />
        <View
          style={[StyleSheet.absoluteFill, {
            backgroundColor: tone.ink, opacity: 0.06,
            borderRadius: 200, bottom: -100, right: -80,
          }]}
          pointerEvents="none"
        />
      </>
    );
  }
  if (texture === 'paper') {
    return (
      <View
        style={[StyleSheet.absoluteFill, { backgroundColor: tone.ink, opacity: 0.02 }]}
        pointerEvents="none"
      />
    );
  }
  return null;
}

// ——— Fullbleed layout (image/video/multi with media as full bg) ———

function FullBleedLayout({ page, tone }: { page: Page; tone: Tone }) {
  return (
    <View style={StyleSheet.absoluteFill}>
      {page.localMediaUri && page.type === 'video' ? (
        <VideoCard uri={page.localMediaUri} style={[StyleSheet.absoluteFill, { backgroundColor: '#000' }]} />
      ) : page.localMediaUri ? (
        <Image
          source={{ uri: page.localMediaUri }}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          autoplay
        />
      ) : (
        <MediaSlot
          kind={page.type === 'video' ? 'video' : 'image'}
          label={page.placeholder}
          tone={tone}
          full
        />
      )}

      {/* gradient overlay for text legibility */}
      <View style={styles.fullBleedGradient} pointerEvents="none" />

      <View style={styles.fullBleedContent}>
        {page._deckTitle && (
          <Text style={styles.fullBleedDeck}>{page._deckTitle}</Text>
        )}
        {page.text && (
          <Text style={styles.fullBleedText}>{page.text}</Text>
        )}
        {page.caption && (
          <Text style={styles.fullBleedCaption}>{page.caption}</Text>
        )}
        {page.link && (
          <TouchableOpacity
            onPress={() => Linking.openURL(page.link!.url)}
            style={styles.fullBleedLink}
          >
            <Text style={styles.fullBleedLinkText}>{page.link.label} →</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

// ——— Normal layout ———

interface NormalProps {
  page: Page;
  tone: Tone;
  textAlign: 'left' | 'center';
  alignItems: 'flex-start' | 'center';
  padX: number;
  padY: number;
  layout: LayoutName;
}

function NormalLayout({ page, tone, textAlign, alignItems, padX, padY, layout }: NormalProps) {
  const isQuote = page.type === 'quote' || page.type === 'attributed';
  const isMedia = page.type === 'image' || page.type === 'video' || page.type === 'gif';
  const fontSize = isQuote ? 34 : 26;

  // Image / video cards: flex column so media fills available height
  if (isMedia) {
    return (
      <View style={{ flex: 1 }}>
        {/* Deck badge */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: padX, paddingTop: 18, flexShrink: 0 }}>
          {page._deckTitle ? <Text style={[styles.deckBadge, { color: tone.muted }]}>{page._deckTitle}</Text> : <View />}
          {page.tag ? <Text style={[styles.tag, { color: tone.tag }]}>{page.tag}</Text> : null}
        </View>

        {/* Media fills remaining space */}
        <View style={{ flex: 1, paddingHorizontal: padX, paddingTop: 10, paddingBottom: 8, overflow: 'hidden' }}>
          {(page.type === 'image' || page.type === 'gif') ? (
            page.localMediaUri ? (
              <Image
                source={{ uri: page.localMediaUri }}
                style={{ flex: 1, borderRadius: 4 }}
                contentFit="contain"
                autoplay
              />
            ) : (
              <MediaSlot kind="image" label={page.placeholder} tone={tone} full />
            )
          ) : (
            page.localMediaUri ? (
              <VideoCard uri={page.localMediaUri} style={{ flex: 1, borderRadius: 4, backgroundColor: '#000' }} />
            ) : (
              <MediaSlot kind="video" label={page.placeholder} tone={tone} full />
            )
          )}
        </View>

        {/* Text / caption below media */}
        {(page.text || page.caption) ? (
          <View style={{ paddingHorizontal: padX, paddingBottom: padY, gap: 6, flexShrink: 0 }}>
            {page.text ? (
              <Text style={[styles.mainText, { fontSize: 22, color: tone.ink, textAlign }]}>
                {page.text}
              </Text>
            ) : null}
            {page.caption ? (
              <Text style={[styles.caption, { color: tone.muted, textAlign }]}>{page.caption}</Text>
            ) : null}
          </View>
        ) : null}
      </View>
    );
  }

  // Quote / attributed / link / multi: centered absolute layout
  return (
    <>
      {/* Deck badge at top */}
      <View style={[styles.deckBadgeRow, { paddingHorizontal: padX, paddingTop: 18 }]}>
        {page._deckTitle ? (
          <Text style={[styles.deckBadge, { color: tone.muted }]}>{page._deckTitle}</Text>
        ) : <View />}
        {page.tag ? <Text style={[styles.tag, { color: tone.tag }]}>{page.tag}</Text> : null}
      </View>

      <View style={[styles.contentArea, { paddingHorizontal: padX, paddingTop: padY + 36, paddingBottom: padY + 12, alignItems }]}>

        {page.text ? (
          <Text style={[styles.mainText, { fontSize, color: tone.ink, textAlign }]}>
            {isQuote ? (
              <>
                <Text style={{ fontStyle: 'italic', opacity: 0.55 }}>"</Text>
                {page.text}
                <Text style={{ fontStyle: 'italic', opacity: 0.55 }}>"</Text>
              </>
            ) : page.text}
          </Text>
        ) : null}

        {page.author ? (
          <Text style={[styles.author, { color: tone.muted, textAlign }]}>
            {page.author.startsWith('—') ? page.author : `— ${page.author}`}
          </Text>
        ) : null}

        {page.caption ? (
          <Text style={[styles.caption, { color: tone.muted, textAlign }]}>{page.caption}</Text>
        ) : null}

        {page.link ? (
          <TouchableOpacity
            onPress={() => Linking.openURL(page.link!.url)}
            style={[styles.linkBtn, { borderColor: tone.hairline, alignSelf: layout === 'editorial' ? 'flex-start' : 'center' }]}
          >
            <Text style={[styles.linkBtnText, { color: tone.ink }]}>
              {page.link.label} <Text style={{ opacity: 0.6 }}>↗</Text>
            </Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </>
  );
}


// Separate component so useVideoPlayer hook rules are satisfied
function VideoCard({ uri, style }: { uri: string; style: any }) {
  const player = useVideoPlayer(uri, (p) => {
    p.loop = false;
  });
  return (
    <VideoView
      player={player}
      style={style}
      nativeControls
      contentFit="contain"
    />
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    width: '100%',
    overflow: 'hidden',
  },
  deckBadgeRow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 1,
  },
  deckBadge: {
    fontFamily: 'JetBrainsMono_400Regular',
    fontSize: 10,
    letterSpacing: 1.6,
    textTransform: 'uppercase',
  },
  tag: {
    fontFamily: 'JetBrainsMono_400Regular',
    fontSize: 10,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  contentArea: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    justifyContent: 'center',
    gap: 16,
  },
  mainText: {
    fontFamily: 'InstrumentSerif_400Regular',
    lineHeight: 40,
    letterSpacing: -0.2,
    maxWidth: '100%',
  },
  author: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 12,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  caption: {
    fontFamily: 'JetBrainsMono_400Regular',
    fontSize: 10,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  linkBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderRadius: 999,
  },
  linkBtnText: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 13,
    letterSpacing: 0.1,
  },
  // Fullbleed
  fullBleedGradient: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.4)',
    // Real gradient would need expo-linear-gradient; using flat dark overlay for now
  },
  fullBleedContent: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: 28,
    paddingBottom: 32,
    gap: 10,
  },
  fullBleedDeck: {
    fontFamily: 'JetBrainsMono_400Regular',
    fontSize: 10,
    letterSpacing: 1.6,
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.8)',
  },
  fullBleedText: {
    fontFamily: 'InstrumentSerif_400Regular',
    fontSize: 32,
    lineHeight: 38,
    color: '#fff',
  },
  fullBleedCaption: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    fontFamily: 'DMSans_400Regular',
  },
  fullBleedLink: {
    marginTop: 6,
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
    borderRadius: 999,
  },
  fullBleedLinkText: {
    color: '#fff',
    fontSize: 12,
    fontFamily: 'DMSans_500Medium',
    letterSpacing: 0.2,
  },
});
