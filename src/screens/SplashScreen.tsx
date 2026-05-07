import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  StatusBar,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Fonts, Spacing, BorderRadius } from '../constants/theme';

const { width, height } = Dimensions.get('window');

interface SplashScreenProps {
  onComplete: () => void;
}

const GALLERY_PAGES = [
  {
    title: 'The Problem',
    description: 'Ghosting. No-shows. Catfishing. Zero consequences for bad behavior.',
    emoji: '💔',
  },
  {
    title: 'The Solution',
    description: 'Stake SOL to confirm. Show up, get it back. Ghost, it burns forever.',
    emoji: '🔥',
  },
  {
    title: 'The Outcome',
    description: 'Mint a Moment NFT. Build your heart score. Trust becomes your reputation.',
    emoji: '✨',
  },
];

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scrollX = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        delay: 200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        delay: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleScroll = (event: any) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const page = Math.round(scrollPosition / (width - 64));
    setCurrentPage(page);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Background gradient */}
      <LinearGradient
        colors={[Colors.pink, '#C7517D']}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Noise texture overlay */}
      <View style={styles.noiseOverlay} />

      {/* Decorative shapes */}
      <View style={[styles.shape, styles.shape1]} />
      <View style={[styles.shape, styles.shape2]} />
      <View style={[styles.shape, styles.shape3]} />
      <View style={[styles.shape, styles.shape4]} />
      <View style={[styles.shape, styles.shape5]} />

      {/* Main content */}
      <View style={styles.content}>
        {/* Wordmark */}
        <Text style={styles.wordmark}>
          SOL<Text style={styles.wordmarkDot}>mate</Text>
        </Text>

        {/* Gallery Card */}
        <Animated.View
          style={[
            styles.galleryCard,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            style={styles.galleryScroll}
          >
            {GALLERY_PAGES.map((page, index) => (
              <View key={index} style={[styles.page, { width: width - 64 }]}>
                <Text style={styles.pageEmoji}>{page.emoji}</Text>
                <Text style={styles.pageTitle}>{page.title}</Text>
                <Text style={styles.pageDescription}>{page.description}</Text>
              </View>
            ))}
          </ScrollView>

          {/* Page indicators */}
          <View style={styles.pageIndicators}>
            {GALLERY_PAGES.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.indicator,
                  currentPage === index && styles.indicatorActive,
                ]}
              />
            ))}
          </View>
        </Animated.View>

        {/* Get Started Button */}
        <Animated.View
          style={[
            styles.ctaContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <TouchableOpacity style={styles.ctaButton} onPress={onComplete}>
            <Text style={styles.ctaText}>Get started</Text>
            <View style={styles.ctaArrow}>
              <Text style={styles.ctaArrowText}>›</Text>
            </View>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.pink,
  },
  noiseOverlay: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.06,
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  shape: {
    position: 'absolute',
    borderRadius: 9999,
  },
  shape1: {
    width: 380,
    height: 380,
    backgroundColor: 'rgba(255,255,255,0.1)',
    top: -140,
    right: -120,
  },
  shape2: {
    width: 260,
    height: 260,
    backgroundColor: 'rgba(255,255,255,0.07)',
    top: -60,
    right: -80,
  },
  shape3: {
    width: 500,
    height: 500,
    backgroundColor: 'rgba(13,13,13,0.12)',
    bottom: -200,
    left: -160,
  },
  shape4: {
    width: 120,
    height: 120,
    backgroundColor: Colors.orange,
    opacity: 0.55,
    bottom: 220,
    right: -30,
  },
  shape5: {
    width: 180,
    height: 180,
    backgroundColor: Colors.purple,
    opacity: 0.3,
    top: 200,
    left: -60,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xxl,
    paddingBottom: Spacing.xl,
    zIndex: 2,
    justifyContent: 'space-between',
  },
  wordmark: {
    fontSize: 72,
    fontFamily: Fonts.nunito.bold,
    lineHeight: 72,
    color: Colors.white,
    letterSpacing: -2.5,
    textAlign: 'center',
    marginTop: 100,
    marginBottom: Spacing.lg,
  },
  wordmarkDot: {
    color: Colors.muted,
    fontFamily: Fonts.nunito.bold,
  },
  galleryCard: {
    height: 420,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
    overflow: 'hidden',
    marginBottom: Spacing.lg,
  },
  galleryScroll: {
    flex: 1,
  },
  page: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pageEmoji: {
    fontSize: 56,
    marginBottom: Spacing.lg,
  },
  pageTitle: {
    fontSize: 26,
    fontFamily: Fonts.nunito.bold,
    color: Colors.white,
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  pageDescription: {
    fontSize: 15,
    fontFamily: Fonts.nunito.regular,
    color: 'rgba(255,255,255,0.85)',
    lineHeight: 22,
    textAlign: 'center',
    maxWidth: 260,
  },
  pageIndicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
  },
  indicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  indicatorActive: {
    backgroundColor: Colors.white,
    width: 20,
  },
  ctaContainer: {
    marginTop: 0,
  },
  ctaButton: {
    width: '100%',
    paddingVertical: 18,
    paddingHorizontal: 24,
    backgroundColor: Colors.white,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.22,
    shadowRadius: 40,
    elevation: 8,
  },
  ctaText: {
    fontSize: 16,
    fontFamily: Fonts.nunito.bold,
    color: Colors.black,
    marginRight: 8,
  },
  ctaArrow: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.pink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaArrowText: {
    fontSize: 18,
    fontFamily: Fonts.nunito.semiBold,
    color: Colors.white,
    lineHeight: 24,
  },
});
