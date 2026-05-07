import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Spacing, BorderRadius } from '../constants/theme';

interface SplashScreenProps {
  onComplete: () => void;
  onGetStarted: () => void;
}

export default function SplashScreen({ onComplete, onGetStarted }: SplashScreenProps) {
  const fadeAnim1 = useRef(new Animated.Value(0)).current;
  const fadeAnim2 = useRef(new Animated.Value(0)).current;
  const fadeAnim3 = useRef(new Animated.Value(0)).current;
  const fadeAnim4 = useRef(new Animated.Value(0)).current;
  const fadeAnim5 = useRef(new Animated.Value(0)).current;
  const fadeAnim6 = useRef(new Animated.Value(0)).current;

  const translateY1 = useRef(new Animated.Value(20)).current;
  const translateY2 = useRef(new Animated.Value(20)).current;
  const translateY3 = useRef(new Animated.Value(20)).current;
  const translateY4 = useRef(new Animated.Value(20)).current;
  const translateY5 = useRef(new Animated.Value(20)).current;
  const translateY6 = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    // Staggered fade-up animations
    const animations = [
      { fade: fadeAnim1, translate: translateY1, delay: 50 },
      { fade: fadeAnim2, translate: translateY2, delay: 120 },
      { fade: fadeAnim3, translate: translateY3, delay: 200 },
      { fade: fadeAnim4, translate: translateY4, delay: 270 },
      { fade: fadeAnim5, translate: translateY5, delay: 320 },
      { fade: fadeAnim6, translate: translateY6, delay: 350 },
    ];

    const animationSequence = animations.map(({ fade, translate, delay }) =>
      Animated.parallel([
        Animated.timing(fade, {
          toValue: 1,
          duration: 500,
          delay,
          useNativeDriver: true,
        }),
        Animated.timing(translate, {
          toValue: 0,
          duration: 500,
          delay,
          useNativeDriver: true,
        }),
      ])
    );

    Animated.parallel(animationSequence).start();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* Background gradient */}
      <LinearGradient
        colors={[Colors.pink, '#C7517D']}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Decorative shapes */}
      <View style={[styles.shape, styles.shape1]} />
      <View style={[styles.shape, styles.shape2]} />
      <View style={[styles.shape, styles.shape3]} />
      <View style={[styles.shape, styles.shape4]} />
      <View style={[styles.shape, styles.shape5]} />
      <View style={[styles.shape, styles.shape6]} />

      {/* Main content */}
      <View style={styles.content}>
        {/* Hero section - centered */}
        <View style={styles.hero}>
          <Animated.Text
            style={[
              styles.eyebrow,
              {
                opacity: fadeAnim1,
                transform: [{ translateY: translateY1 }],
              },
            ]}
          >
            TRUST-FIRST · SOLANA-NATIVE
          </Animated.Text>

          <Animated.View
            style={{
              opacity: fadeAnim2,
              transform: [{ translateY: translateY2 }],
            }}
          >
            <Text style={styles.wordmark}>
              SOL<Text style={styles.wordmarkMate}>mate</Text>
            </Text>
          </Animated.View>

          <Animated.Text
            style={[
              styles.tagline,
              {
                opacity: fadeAnim3,
                transform: [{ translateY: translateY3 }],
              },
            ]}
          >
            <Text style={styles.taglineBold}>Anonymous by default.</Text>
            {'\n'}Trusted by mechanism.
            {'\n'}Show up or it burns.
          </Animated.Text>

          <Animated.View
            style={[
              styles.decoRow,
              {
                opacity: fadeAnim4,
                transform: [{ translateY: translateY4 }],
              },
            ]}
          >
            <View style={styles.decoLine} />
            <View style={[styles.decoDot, { backgroundColor: Colors.white }]} />
            <View style={[styles.decoDot, styles.decoDotOrange]} />
            <View style={[styles.decoDot, styles.decoDotPurple]} />
            <View style={[styles.decoDot, { backgroundColor: Colors.white, opacity: 0.4 }]} />
          </Animated.View>

          <Animated.View
            style={[
              styles.badges,
              {
                opacity: fadeAnim5,
                transform: [{ translateY: translateY5 }],
              },
            ]}
          >
            <View style={styles.badge}>
              <View style={[styles.badgeDot, styles.badgeDotOrange]} />
              <Text style={styles.badgeText}>Stake to confirm</Text>
            </View>
            <View style={styles.badge}>
              <View style={[styles.badgeDot, styles.badgeDotPurple]} />
              <Text style={styles.badgeText}>Moment NFT</Text>
            </View>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>♥ Heart score</Text>
            </View>
          </Animated.View>
        </View>

        {/* Bottom CTA */}
        <Animated.View
          style={[
            styles.bottomArea,
            {
              opacity: fadeAnim6,
              transform: [{ translateY: translateY6 }],
            },
          ]}
        >
          <TouchableOpacity style={styles.ctaBtn} onPress={onGetStarted}>
            <Text style={styles.ctaBtnText}>Get started</Text>
            <View style={styles.ctaArrow}>
              <Text style={styles.ctaArrowText}>›</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity onPress={onComplete}>
            <Text style={styles.anonLink}>
              or <Text style={styles.anonLinkSpan}>explore anonymously</Text>
            </Text>
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
  shape: {
    position: 'absolute',
    borderRadius: 9999,
  },
  shape1: {
    width: 420,
    height: 420,
    backgroundColor: 'rgba(255,255,255,0.09)',
    top: -160,
    right: -140,
  },
  shape2: {
    width: 260,
    height: 260,
    backgroundColor: 'rgba(255,255,255,0.06)',
    top: -60,
    right: -80,
  },
  shape3: {
    width: 560,
    height: 560,
    backgroundColor: 'rgba(13,13,13,0.15)',
    bottom: -240,
    left: -180,
  },
  shape4: {
    width: 180,
    height: 180,
    backgroundColor: Colors.orange,
    opacity: 0.5,
    bottom: 180,
    right: -50,
  },
  shape5: {
    width: 220,
    height: 220,
    backgroundColor: Colors.purple,
    opacity: 0.28,
    top: 180,
    left: -80,
  },
  shape6: {
    width: 100,
    height: 100,
    backgroundColor: Colors.white,
    opacity: 0.08,
    top: 320,
    right: 60,
  },
  content: {
    flex: 1,
    paddingHorizontal: 36,
    paddingTop: 28,
    paddingBottom: 56,
    zIndex: 2,
  },
  hero: {
    flex: 1,
    justifyContent: 'center',
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.5)',
    marginBottom: 14,
  },
  wordmark: {
    fontSize: 72,
    fontWeight: '800',
    lineHeight: 72,
    color: Colors.white,
    letterSpacing: -2.5,
    marginBottom: 22,
  },
  wordmarkMate: {
    color: 'rgba(13,13,13,0.5)',
  },
  tagline: {
    fontSize: 17,
    fontWeight: '400',
    color: 'rgba(255,255,255,0.68)',
    lineHeight: 28,
    maxWidth: 270,
    marginBottom: 40,
  },
  taglineBold: {
    color: Colors.white,
    fontWeight: '800',
  },
  decoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 32,
  },
  decoLine: {
    width: 32,
    height: 1.5,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: BorderRadius.round,
  },
  decoDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  decoDotOrange: {
    backgroundColor: Colors.orange,
    shadowColor: Colors.orange,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 8,
  },
  decoDotPurple: {
    backgroundColor: Colors.purple,
    shadowColor: Colors.purple,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 8,
    elevation: 8,
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  badge: {
    backgroundColor: 'rgba(255,255,255,0.13)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    borderRadius: BorderRadius.round,
    paddingVertical: 8,
    paddingHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.white,
  },
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  badgeDotOrange: {
    backgroundColor: Colors.orange,
    shadowColor: Colors.orange,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 6,
    elevation: 6,
  },
  badgeDotPurple: {
    backgroundColor: Colors.purple,
    shadowColor: Colors.purple,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 6,
    elevation: 6,
  },
  bottomArea: {},
  ctaBtn: {
    width: '100%',
    paddingVertical: 19,
    backgroundColor: Colors.white,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 18,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.22,
    shadowRadius: 40,
    elevation: 12,
  },
  ctaBtnText: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.black,
    letterSpacing: 0.1,
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
    fontWeight: '600',
    color: Colors.white,
    lineHeight: 24,
  },
  anonLink: {
    textAlign: 'center',
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.5)',
    letterSpacing: 0.1,
  },
  anonLinkSpan: {
    color: 'rgba(255,255,255,0.82)',
    textDecorationLine: 'underline',
    textDecorationColor: 'rgba(255,255,255,0.28)',
  },
});
