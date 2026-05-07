import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  StatusBar,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Fonts, Spacing, BorderRadius } from '../constants/theme';
import { BackButton } from '../components';
import { useWallet } from '../contexts/WalletContext';

interface WalletConnectScreenProps {
  onWalletConnected: () => void;
  onExploreAnonymously: () => void;
  onBack: () => void;
}

export default function WalletConnectScreen({
  onWalletConnected,
  onExploreAnonymously,
  onBack,
}: WalletConnectScreenProps) {
  const { connect, isConnecting, error } = useWallet();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        delay: 100,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        delay: 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleWalletConnect = async (walletName: string) => {
    try {
      await connect();
      // Connection successful, navigate to next screen
      onWalletConnected();
    } catch (err: any) {
      // Error handling
      Alert.alert(
        'Connection Failed',
        err.message || 'Could not connect to wallet. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleSocialLogin = () => {
    // TODO: Implement social login (Apple/Google)
    Alert.alert(
      'Coming Soon',
      'Social login will be available soon!',
      [{ text: 'OK' }]
    );
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

      {/* Back button */}
      <BackButton onPress={onBack} />

      {/* Main content */}
      <View style={styles.content}>
        {/* Hero section */}
        <View style={styles.hero}>
          <Text style={styles.wordmark}>
            SOL<Text style={styles.wordmarkDot}>mate</Text>
          </Text>
          <Text style={styles.tagline}>
            Connect your wallet to get started.{'\n'}Your identity stays yours.
          </Text>
        </View>

        {/* Bottom sheet */}
        <Animated.View
          style={[
            styles.bottomSheet,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.sheetHandle} />

          <Text style={styles.sheetHeading}>Find your SOLmate</Text>
          <Text style={styles.sheetSub}>
            Choose how you want to connect
          </Text>

          {/* Wallet buttons */}
          <View style={styles.walletButtons}>
            <TouchableOpacity
              style={[styles.walletBtn, styles.walletBtnPrimary]}
              onPress={() => handleWalletConnect('Phantom')}
              disabled={isConnecting}
            >
              <View style={[styles.walletIcon, styles.iconPhantom]}>
                {isConnecting ? (
                  <ActivityIndicator size="small" color={Colors.white} />
                ) : (
                  <Text style={styles.walletIconText}>👻</Text>
                )}
              </View>
              <View style={styles.walletBtnLabel}>
                <Text style={[styles.walletBtnText, styles.walletBtnTextPrimary]}>
                  Phantom
                </Text>
                <Text style={[styles.walletBtnSub, styles.walletBtnSubPrimary]}>
                  {isConnecting ? 'Connecting...' : 'Recommended'}
                </Text>
              </View>
              <Text style={[styles.walletArrow, styles.walletArrowPrimary]}>›</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.walletBtn}
              onPress={() => handleWalletConnect('Backpack')}
              disabled={isConnecting}
            >
              <View style={[styles.walletIcon, styles.iconBackpack]}>
                <Text style={styles.walletIconText}>🎒</Text>
              </View>
              <View style={styles.walletBtnLabel}>
                <Text style={styles.walletBtnText}>Backpack</Text>
                <Text style={styles.walletBtnSub}>Seeker-optimized</Text>
              </View>
              <Text style={styles.walletArrow}>›</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.walletBtn}
              onPress={handleSocialLogin}
              disabled={isConnecting}
            >
              <View style={[styles.walletIcon, styles.iconApple]}>
                <Text style={styles.walletIconText}>🍎</Text>
              </View>
              <View style={styles.walletBtnLabel}>
                <Text style={styles.walletBtnText}>Apple / Google</Text>
                <Text style={styles.walletBtnSub}>Social sign-in</Text>
              </View>
              <Text style={styles.walletArrow}>›</Text>
            </TouchableOpacity>
          </View>

          {/* Divider */}
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Explore anonymously */}
          <TouchableOpacity
            style={styles.exploreBtn}
            onPress={onExploreAnonymously}
          >
            <Text style={styles.exploreBtnText}>Explore anonymously →</Text>
          </TouchableOpacity>

          {/* Legal */}
          <Text style={styles.legal}>
            By continuing you agree to our Terms and Privacy Policy.{'\n'}
            Your wallet address is never shown publicly.
          </Text>
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
  hero: {
    flex: 1,
    justifyContent: 'center',
    paddingBottom: Spacing.xxl,
  },
  wordmark: {
    fontSize: 52,
    fontFamily: Fonts.nunito.bold,
    lineHeight: 52,
    color: Colors.white,
    letterSpacing: -1.5,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  wordmarkDot: {
    color: Colors.muted,
    fontFamily: Fonts.nunito.bold,
  },
  tagline: {
    fontSize: 15,
    fontFamily: Fonts.nunito.regular,
    color: 'rgba(255,255,255,0.7)',
    lineHeight: 22,
    textAlign: 'center',
    maxWidth: 280,
    alignSelf: 'center',
  },
  bottomSheet: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    paddingHorizontal: 28,
    paddingTop: 28,
    paddingBottom: 40,
  },
  sheetHandle: {
    width: 36,
    height: 4,
    backgroundColor: 'rgba(13,13,13,0.12)',
    borderRadius: BorderRadius.round,
    alignSelf: 'center',
    marginBottom: Spacing.lg,
  },
  sheetHeading: {
    fontSize: 22,
    fontFamily: Fonts.nunito.bold,
    color: Colors.black,
    marginBottom: 6,
  },
  sheetSub: {
    fontSize: 14,
    fontFamily: Fonts.nunito.regular,
    color: 'rgba(13,13,13,0.45)',
    marginBottom: Spacing.lg,
    lineHeight: 21,
  },
  walletButtons: {
    gap: 10,
    marginBottom: Spacing.md,
  },
  walletBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    borderColor: 'rgba(13,13,13,0.1)',
    backgroundColor: Colors.white,
  },
  walletBtnPrimary: {
    backgroundColor: Colors.black,
    borderColor: Colors.black,
  },
  walletIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  walletIconText: {
    fontSize: 16,
  },
  iconPhantom: {
    backgroundColor: '#AB9FF2',
  },
  iconBackpack: {
    backgroundColor: '#FF6B35',
  },
  iconApple: {
    backgroundColor: Colors.black,
  },
  walletBtnLabel: {
    flex: 1,
  },
  walletBtnText: {
    fontSize: 15,
    fontFamily: Fonts.nunito.semiBold,
    color: Colors.black,
  },
  walletBtnTextPrimary: {
    color: Colors.white,
  },
  walletBtnSub: {
    fontSize: 11,
    fontFamily: Fonts.nunito.semiBold,
    opacity: 0.4,
    marginTop: 1,
  },
  walletBtnSubPrimary: {
    color: Colors.white,
  },
  walletArrow: {
    fontSize: 20,
    fontFamily: Fonts.nunito.semiBold,
    opacity: 0.3,
    color: Colors.black,
  },
  walletArrowPrimary: {
    color: Colors.white,
    opacity: 0.5,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: Spacing.md,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(13,13,13,0.08)',
  },
  dividerText: {
    fontSize: 12,
    fontFamily: Fonts.nunito.semiBold,
    color: 'rgba(13,13,13,0.3)',
  },
  exploreBtn: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    borderColor: 'rgba(13,13,13,0.1)',
    backgroundColor: 'transparent',
  },
  exploreBtnText: {
    fontSize: 14,
    fontFamily: Fonts.nunito.semiBold,
    color: 'rgba(13,13,13,0.5)',
    textAlign: 'center',
  },
  legal: {
    textAlign: 'center',
    fontSize: 11,
    fontFamily: Fonts.nunito.semiBold,
    color: 'rgba(13,13,13,0.3)',
    marginTop: Spacing.md,
    lineHeight: 17,
  },
});
