import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Fonts, Spacing, BorderRadius } from '../constants/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useWallet } from '../contexts/WalletContext';
import { API_CONFIG } from '../config/api';

interface Persona {
  id: string;
  display_name: string;
  age: number;
  interests: string[];
  min_stake_requirement: number;
}

interface Reputation {
  hearts: number;
  total_meetups: number;
  total_matches: number;
  active_stakes: number;
}

interface MomentNFT {
  id: string;
  mint_address: string;
  metadata_uri: string;
  date: string;
  partner_name: string;
}

export default function SettingsScreen() {
  const { publicKey, disconnect } = useWallet();
  const [persona, setPersona] = useState<Persona | null>(null);
  const [reputation, setReputation] = useState<Reputation | null>(null);
  const [nfts, setNfts] = useState<MomentNFT[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);

    try {
      const token = await AsyncStorage.getItem('auth_token');
      const personaId = await AsyncStorage.getItem('current_persona_id');

      if (!token || !personaId) {
        return;
      }

      // Load persona
      const personaRes = await fetch(
        `${API_CONFIG.BASE_URL}/v1/personas/${personaId}`,
        {
          headers: { 'Authorization': `Bearer ${token}` },
        }
      );

      if (personaRes.ok) {
        const personaData = await personaRes.json();
        setPersona(personaData);
      }

      // Load reputation
      const repRes = await fetch(
        `${API_CONFIG.BASE_URL}/v1/reputation/me`,
        {
          headers: { 'Authorization': `Bearer ${token}` },
        }
      );

      if (repRes.ok) {
        const repData = await repRes.json();
        setReputation(repData);
      }

      // Load Moment NFTs
      const nftRes = await fetch(
        `${API_CONFIG.BASE_URL}/v1/nfts/moments`,
        {
          headers: { 'Authorization': `Bearer ${token}` },
        }
      );

      if (nftRes.ok) {
        const nftData = await nftRes.json();
        setNfts(nftData.nfts || []);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = async () => {
    Alert.alert(
      'Disconnect Wallet',
      'Are you sure you want to disconnect?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Disconnect',
          style: 'destructive',
          onPress: async () => {
            await disconnect();
            // App will reset to splash
          },
        },
      ]
    );
  };

  const renderHearts = () => {
    const hearts = reputation?.hearts || 0;
    const maxHearts = 10;

    return (
      <View style={styles.heartsContainer}>
        {Array.from({ length: maxHearts }).map((_, i) => (
          <Text key={i} style={styles.heartIcon}>
            {i < hearts ? '♥' : '♡'}
          </Text>
        ))}
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={[Colors.pink, Colors.purple]}
          style={StyleSheet.absoluteFillObject}
        />
        <ActivityIndicator size="large" color={Colors.white} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <LinearGradient
        colors={[Colors.pink, Colors.purple]}
        style={StyleSheet.absoluteFillObject}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.heading}>Profile</Text>
        </View>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {persona?.display_name.charAt(0).toUpperCase()}
            </Text>
          </View>

          <Text style={styles.displayName}>{persona?.display_name}</Text>
          <Text style={styles.age}>{persona?.age} years old</Text>

          <View style={styles.interests}>
            {persona?.interests.slice(0, 5).map((interest, idx) => (
              <View key={idx} style={styles.interestChip}>
                <Text style={styles.interestText}>{interest}</Text>
              </View>
            ))}
          </View>

          <View style={styles.stakeReq}>
            <Text style={styles.stakeReqLabel}>Min stake to message:</Text>
            <Text style={styles.stakeReqAmount}>
              {persona?.min_stake_requirement} SOL
            </Text>
          </View>
        </View>

        {/* Reputation Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Reputation</Text>

          <View style={styles.reputationCard}>
            {renderHearts()}

            <Text style={styles.heartsLabel}>
              {reputation?.hearts || 0} hearts
            </Text>

            <View style={styles.stats}>
              <View style={styles.stat}>
                <Text style={styles.statValue}>{reputation?.total_meetups || 0}</Text>
                <Text style={styles.statLabel}>Meetups</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.stat}>
                <Text style={styles.statValue}>{reputation?.total_matches || 0}</Text>
                <Text style={styles.statLabel}>Matches</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.stat}>
                <Text style={styles.statValue}>{reputation?.active_stakes || 0}</Text>
                <Text style={styles.statLabel}>Active</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Moment NFTs */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Moment NFTs</Text>

          {nfts.length === 0 ? (
            <View style={styles.emptyNFT}>
              <Text style={styles.emptyNFTEmoji}>🖼️</Text>
              <Text style={styles.emptyNFTText}>No moments yet</Text>
              <Text style={styles.emptyNFTSub}>
                Complete meetups to mint NFTs
              </Text>
            </View>
          ) : (
            <View style={styles.nftGrid}>
              {nfts.map((nft) => (
                <View key={nft.id} style={styles.nftCard}>
                  <View style={styles.nftPlaceholder}>
                    <Text style={styles.nftEmoji}>✨</Text>
                  </View>
                  <Text style={styles.nftName} numberOfLines={1}>
                    {nft.partner_name}
                  </Text>
                  <Text style={styles.nftDate}>
                    {new Date(nft.date).toLocaleDateString()}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Wallet Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Wallet</Text>

          <View style={styles.walletCard}>
            <Text style={styles.walletLabel}>Connected</Text>
            <Text style={styles.walletAddress}>
              {publicKey
                ? `${publicKey.slice(0, 4)}...${publicKey.slice(-4)}`
                : 'Not connected'}
            </Text>

            <TouchableOpacity
              style={styles.disconnectButton}
              onPress={handleDisconnect}
            >
              <Text style={styles.disconnectText}>Disconnect</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={styles.appInfoText}>SOLmate v1.0.0</Text>
          <Text style={styles.appInfoText}>MVP Edition</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.pink,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingBottom: 100,
  },
  header: {
    paddingHorizontal: Spacing.xl,
    paddingTop: 60,
    paddingBottom: Spacing.lg,
  },
  heading: {
    fontSize: 32,
    fontFamily: Fonts.nunito.bold,
    color: Colors.white,
  },
  profileCard: {
    marginHorizontal: Spacing.lg,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.purple,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  avatarText: {
    fontSize: 32,
    fontFamily: Fonts.nunito.bold,
    color: Colors.white,
  },
  displayName: {
    fontSize: 24,
    fontFamily: Fonts.nunito.bold,
    color: Colors.black,
  },
  age: {
    fontSize: 15,
    fontFamily: Fonts.nunito.regular,
    color: 'rgba(13,13,13,0.5)',
    marginBottom: Spacing.md,
  },
  interests: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  interestChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(13,13,13,0.06)',
    borderRadius: BorderRadius.round,
  },
  interestText: {
    fontSize: 13,
    fontFamily: Fonts.nunito.semiBold,
    color: 'rgba(13,13,13,0.7)',
  },
  stakeReq: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stakeReqLabel: {
    fontSize: 14,
    fontFamily: Fonts.nunito.regular,
    color: 'rgba(13,13,13,0.5)',
  },
  stakeReqAmount: {
    fontSize: 16,
    fontFamily: Fonts.nunito.bold,
    color: Colors.pink,
  },
  section: {
    marginBottom: Spacing.lg,
    paddingHorizontal: Spacing.lg,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: Fonts.nunito.bold,
    color: Colors.white,
    marginBottom: Spacing.md,
  },
  reputationCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    alignItems: 'center',
  },
  heartsContainer: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: Spacing.sm,
  },
  heartIcon: {
    fontSize: 20,
    color: Colors.pink,
  },
  heartsLabel: {
    fontSize: 16,
    fontFamily: Fonts.nunito.bold,
    color: Colors.black,
    marginBottom: Spacing.lg,
  },
  stats: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-around',
  },
  stat: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontFamily: Fonts.nunito.bold,
    color: Colors.black,
  },
  statLabel: {
    fontSize: 13,
    fontFamily: Fonts.nunito.regular,
    color: 'rgba(13,13,13,0.5)',
  },
  statDivider: {
    width: 1,
    backgroundColor: 'rgba(13,13,13,0.1)',
  },
  emptyNFT: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    alignItems: 'center',
  },
  emptyNFTEmoji: {
    fontSize: 48,
    marginBottom: Spacing.md,
  },
  emptyNFTText: {
    fontSize: 16,
    fontFamily: Fonts.nunito.bold,
    color: Colors.black,
    marginBottom: Spacing.sm,
  },
  emptyNFTSub: {
    fontSize: 14,
    fontFamily: Fonts.nunito.regular,
    color: 'rgba(13,13,13,0.5)',
    textAlign: 'center',
  },
  nftGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  nftCard: {
    width: '48%',
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
  },
  nftPlaceholder: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: 'rgba(13,13,13,0.05)',
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  nftEmoji: {
    fontSize: 32,
  },
  nftName: {
    fontSize: 14,
    fontFamily: Fonts.nunito.semiBold,
    color: Colors.black,
  },
  nftDate: {
    fontSize: 12,
    fontFamily: Fonts.nunito.regular,
    color: 'rgba(13,13,13,0.5)',
  },
  walletCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
  },
  walletLabel: {
    fontSize: 13,
    fontFamily: Fonts.nunito.regular,
    color: 'rgba(13,13,13,0.5)',
    marginBottom: 4,
  },
  walletAddress: {
    fontSize: 16,
    fontFamily: Fonts.nunito.bold,
    color: Colors.black,
    marginBottom: Spacing.lg,
  },
  disconnectButton: {
    paddingVertical: 14,
    backgroundColor: 'rgba(240,64,122,0.1)',
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  disconnectText: {
    fontSize: 15,
    fontFamily: Fonts.nunito.semiBold,
    color: Colors.pink,
  },
  appInfo: {
    alignItems: 'center',
    paddingVertical: Spacing.lg,
  },
  appInfoText: {
    fontSize: 12,
    fontFamily: Fonts.nunito.regular,
    color: 'rgba(255,255,255,0.5)',
  },
});
