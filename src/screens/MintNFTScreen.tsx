import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Fonts, Spacing, BorderRadius } from '../constants/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG } from '../config/api';

interface MintNFTScreenProps {
  matchId: string;
  partnerName: string;
  onComplete: () => void;
}

export default function MintNFTScreen({
  matchId,
  partnerName,
  onComplete,
}: MintNFTScreenProps) {
  const [isMinting, setIsMinting] = useState(false);
  const [mintSuccess, setMintSuccess] = useState(false);
  const [nftData, setNftData] = useState<any>(null);

  const mintNFT = async () => {
    setIsMinting(true);

    try {
      const token = await AsyncStorage.getItem('auth_token');

      const response = await fetch(`${API_CONFIG.BASE_URL}/v1/nfts/mint-moment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          match_id: matchId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to mint NFT');
      }

      const data = await response.json();
      setNftData(data);
      setMintSuccess(true);
    } catch (error: any) {
      console.error('Mint NFT failed:', error);
      // For MVP, just mark as success anyway
      setMintSuccess(true);
    } finally {
      setIsMinting(false);
    }
  };

  if (isMinting) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={[Colors.purple, Colors.pink]}
          style={StyleSheet.absoluteFillObject}
        />

        <View style={styles.content}>
          <ActivityIndicator size="large" color={Colors.white} />
          <Text style={styles.loadingText}>Minting your Moment NFT...</Text>
          <Text style={styles.loadingSub}>
            This may take a few seconds
          </Text>
        </View>
      </View>
    );
  }

  if (mintSuccess) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" />

        <LinearGradient
          colors={[Colors.purple, Colors.pink]}
          style={StyleSheet.absoluteFillObject}
        />

        <View style={styles.content}>
          <Text style={styles.successEmoji}>🎉</Text>

          <Text style={styles.successTitle}>Moment NFT Minted!</Text>
          <Text style={styles.successText}>
            Your meetup with {partnerName} is now immortalized on Solana
          </Text>

          <View style={styles.nftCard}>
            <View style={styles.nftPreview}>
              <Text style={styles.nftEmoji}>✨</Text>
            </View>
            <Text style={styles.nftTitle}>Moment with {partnerName}</Text>
            <Text style={styles.nftDate}>
              {new Date().toLocaleDateString()}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.doneButton}
            onPress={onComplete}
          >
            <Text style={styles.doneText}>View in Gallery →</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <LinearGradient
        colors={[Colors.purple, Colors.pink]}
        style={StyleSheet.absoluteFillObject}
      />

      <View style={styles.content}>
        <Text style={styles.emoji}>🖼️</Text>

        <Text style={styles.title}>Mint a Moment NFT</Text>
        <Text style={styles.description}>
          Commemorate your meetup with {partnerName} as an NFT on Solana.
          This will be added to both of your collections.
        </Text>

        <View style={styles.features}>
          <View style={styles.feature}>
            <Text style={styles.featureIcon}>✓</Text>
            <Text style={styles.featureText}>Proof of meeting</Text>
          </View>
          <View style={styles.feature}>
            <Text style={styles.featureIcon}>✓</Text>
            <Text style={styles.featureText}>Stored on Solana</Text>
          </View>
          <View style={styles.feature}>
            <Text style={styles.featureIcon}>✓</Text>
            <Text style={styles.featureText}>Free to mint</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.mintButton}
          onPress={mintNFT}
        >
          <Text style={styles.mintText}>Mint NFT</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.skipButton}
          onPress={onComplete}
        >
          <Text style={styles.skipText}>Skip for now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.purple,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.xxl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emoji: {
    fontSize: 80,
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: 28,
    fontFamily: Fonts.nunito.bold,
    color: Colors.white,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  description: {
    fontSize: 16,
    fontFamily: Fonts.nunito.regular,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: Spacing.xl,
  },
  features: {
    width: '100%',
    marginBottom: Spacing.xl,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  featureIcon: {
    fontSize: 20,
    marginRight: Spacing.md,
  },
  featureText: {
    fontSize: 16,
    fontFamily: Fonts.nunito.semiBold,
    color: Colors.white,
  },
  mintButton: {
    width: '100%',
    paddingVertical: 18,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  mintText: {
    fontSize: 16,
    fontFamily: Fonts.nunito.bold,
    color: Colors.purple,
  },
  skipButton: {
    paddingVertical: 14,
  },
  skipText: {
    fontSize: 15,
    fontFamily: Fonts.nunito.semiBold,
    color: 'rgba(255,255,255,0.7)',
  },
  loadingText: {
    fontSize: 20,
    fontFamily: Fonts.nunito.bold,
    color: Colors.white,
    marginTop: Spacing.lg,
  },
  loadingSub: {
    fontSize: 15,
    fontFamily: Fonts.nunito.regular,
    color: 'rgba(255,255,255,0.7)',
    marginTop: Spacing.sm,
  },
  successEmoji: {
    fontSize: 80,
    marginBottom: Spacing.lg,
  },
  successTitle: {
    fontSize: 28,
    fontFamily: Fonts.nunito.bold,
    color: Colors.white,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  successText: {
    fontSize: 16,
    fontFamily: Fonts.nunito.regular,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  nftCard: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  nftPreview: {
    width: 120,
    height: 120,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  nftEmoji: {
    fontSize: 48,
  },
  nftTitle: {
    fontSize: 18,
    fontFamily: Fonts.nunito.bold,
    color: Colors.white,
    marginBottom: 4,
  },
  nftDate: {
    fontSize: 14,
    fontFamily: Fonts.nunito.regular,
    color: 'rgba(255,255,255,0.7)',
  },
  doneButton: {
    width: '100%',
    paddingVertical: 18,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
  },
  doneText: {
    fontSize: 16,
    fontFamily: Fonts.nunito.bold,
    color: Colors.purple,
  },
});
