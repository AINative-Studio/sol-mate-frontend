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
  Dimensions,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Colors, Fonts, Spacing, BorderRadius } from '../constants/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG } from '../config/api';

const { width, height } = Dimensions.get('window');

interface Persona {
  id: string;
  display_name: string;
  age: number;
  interests: string[];
  min_stake_requirement: number;
  compatibility_score?: number;
}

interface BrowseScreenProps {
  onRequestMatch: (persona: Persona) => void;
}

export default function BrowseScreen({ onRequestMatch }: BrowseScreenProps) {
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  // Filter states
  const [maxStake, setMaxStake] = useState(2.0);
  const [minCompatibility, setMinCompatibility] = useState(0);
  const [maxDistance, setMaxDistance] = useState(50);
  const [ageMin, setAgeMin] = useState(18);
  const [ageMax, setAgeMax] = useState(100);

  useEffect(() => {
    loadPersonas();
  }, []);

  const loadPersonas = async () => {
    setIsLoading(true);
    try {
      const token = await AsyncStorage.getItem('auth_token');
      if (!token) {
        throw new Error('Not authenticated');
      }

      const params = new URLSearchParams({
        max_stake: maxStake.toString(),
        min_compatibility: minCompatibility.toString(),
        distance: `${maxDistance}km`,
        age_min: ageMin.toString(),
        age_max: ageMax.toString(),
        limit: '20',
      });

      const response = await fetch(
        `${API_CONFIG.BASE_URL}/v1/personas/browse?${params}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to load personas');
      }

      const data = await response.json();
      setPersonas(data.personas || []);
      setCurrentIndex(0);
    } catch (error: any) {
      console.error('❌ Load personas failed:', error);
      Alert.alert('Error', 'Failed to load matches');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNext = () => {
    if (currentIndex < personas.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      Alert.alert('No More Matches', 'Check back later for more!');
    }
  };

  const handleStakeAndMessage = () => {
    if (personas[currentIndex]) {
      onRequestMatch(personas[currentIndex]);
    }
  };

  const currentPersona = personas[currentIndex];

  if (isLoading) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={[Colors.pink, '#C7517D']}
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

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.logo}>
          SOL<Text style={styles.logoDot}>mate</Text>
        </Text>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilters(true)}
        >
          <Text style={styles.filterIcon}>⚙</Text>
        </TouchableOpacity>
      </View>

      {/* Main Card */}
      {currentPersona ? (
        <View style={styles.cardContainer}>
          <View style={styles.card}>
            {/* Blurred Photo Placeholder */}
            <BlurView intensity={100} style={styles.photoBlur}>
              <Text style={styles.blurText}>Match to reveal</Text>
            </BlurView>

            {/* Info Section */}
            <View style={styles.cardInfo}>
              <View style={styles.nameRow}>
                <Text style={styles.name}>
                  {currentPersona.display_name}, {currentPersona.age}
                </Text>
                {currentPersona.compatibility_score && (
                  <View style={styles.compatibilityBadge}>
                    <Text style={styles.compatibilityText}>
                      {Math.round(currentPersona.compatibility_score)}% match
                    </Text>
                  </View>
                )}
              </View>

              {/* Interests */}
              <View style={styles.interests}>
                {currentPersona.interests.slice(0, 5).map((interest, idx) => (
                  <View key={idx} style={styles.interestChip}>
                    <Text style={styles.interestText}>{interest}</Text>
                  </View>
                ))}
              </View>

              {/* Stake Requirement */}
              <View style={styles.stakeInfo}>
                <Text style={styles.stakeLabel}>Stake to message:</Text>
                <Text style={styles.stakeAmount}>
                  {currentPersona.min_stake_requirement} SOL
                </Text>
              </View>
            </View>
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.skipButton}
              onPress={handleNext}
            >
              <Text style={styles.skipText}>Skip</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.matchButton}
              onPress={handleStakeAndMessage}
            >
              <Text style={styles.matchText}>
                Stake & Message →
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No more matches</Text>
          <TouchableOpacity
            style={styles.refreshButton}
            onPress={loadPersonas}
          >
            <Text style={styles.refreshText}>Refresh</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Filter Modal */}
      <Modal
        visible={showFilters}
        animationType="slide"
        transparent
        onRequestClose={() => setShowFilters(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.filterModal}>
            <View style={styles.filterHeader}>
              <Text style={styles.filterTitle}>Filters</Text>
              <TouchableOpacity onPress={() => setShowFilters(false)}>
                <Text style={styles.filterClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView>
              <View style={styles.filterSection}>
                <Text style={styles.filterLabel}>
                  Max Stake: {maxStake} SOL
                </Text>
                {/* In a real app, use a slider component */}
                <View style={styles.stakeButtons}>
                  {[0.1, 0.25, 0.5, 1, 2, 5].map((val) => (
                    <TouchableOpacity
                      key={val}
                      style={[
                        styles.stakeBtn,
                        maxStake === val && styles.stakeBtnActive,
                      ]}
                      onPress={() => setMaxStake(val)}
                    >
                      <Text
                        style={[
                          styles.stakeBtnText,
                          maxStake === val && styles.stakeBtnTextActive,
                        ]}
                      >
                        {val}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.filterSection}>
                <Text style={styles.filterLabel}>
                  Min Compatibility: {minCompatibility}%
                </Text>
                <View style={styles.stakeButtons}>
                  {[0, 50, 70, 80, 90].map((val) => (
                    <TouchableOpacity
                      key={val}
                      style={[
                        styles.stakeBtn,
                        minCompatibility === val && styles.stakeBtnActive,
                      ]}
                      onPress={() => setMinCompatibility(val)}
                    >
                      <Text
                        style={[
                          styles.stakeBtnText,
                          minCompatibility === val && styles.stakeBtnTextActive,
                        ]}
                      >
                        {val}%
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <TouchableOpacity
                style={styles.applyButton}
                onPress={() => {
                  setShowFilters(false);
                  loadPersonas();
                }}
              >
                <Text style={styles.applyText}>Apply Filters</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.pink,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingTop: 60,
    paddingBottom: Spacing.lg,
  },
  logo: {
    fontSize: 28,
    fontFamily: Fonts.nunito.bold,
    color: Colors.white,
  },
  logoDot: {
    opacity: 0.6,
  },
  filterButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterIcon: {
    fontSize: 20,
  },
  cardContainer: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  card: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    marginBottom: Spacing.lg,
  },
  photoBlur: {
    height: '60%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(13,13,13,0.05)',
  },
  blurText: {
    fontSize: 16,
    fontFamily: Fonts.nunito.semiBold,
    color: 'rgba(13,13,13,0.4)',
  },
  cardInfo: {
    padding: Spacing.lg,
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  name: {
    fontSize: 22,
    fontFamily: Fonts.nunito.bold,
    color: Colors.black,
  },
  compatibilityBadge: {
    backgroundColor: Colors.purple,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BorderRadius.round,
  },
  compatibilityText: {
    fontSize: 12,
    fontFamily: Fonts.nunito.bold,
    color: Colors.white,
  },
  interests: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: Spacing.md,
  },
  interestChip: {
    backgroundColor: 'rgba(13,13,13,0.06)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BorderRadius.round,
  },
  interestText: {
    fontSize: 13,
    fontFamily: Fonts.nunito.semiBold,
    color: 'rgba(13,13,13,0.7)',
  },
  stakeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stakeLabel: {
    fontSize: 14,
    fontFamily: Fonts.nunito.regular,
    color: 'rgba(13,13,13,0.5)',
  },
  stakeAmount: {
    fontSize: 16,
    fontFamily: Fonts.nunito.bold,
    color: Colors.pink,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  skipButton: {
    flex: 1,
    paddingVertical: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
  },
  skipText: {
    fontSize: 16,
    fontFamily: Fonts.nunito.semiBold,
    color: Colors.white,
  },
  matchButton: {
    flex: 2,
    paddingVertical: 16,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
  },
  matchText: {
    fontSize: 16,
    fontFamily: Fonts.nunito.bold,
    color: Colors.pink,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontFamily: Fonts.nunito.semiBold,
    color: Colors.white,
    marginBottom: Spacing.lg,
  },
  refreshButton: {
    paddingHorizontal: 32,
    paddingVertical: 14,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
  },
  refreshText: {
    fontSize: 16,
    fontFamily: Fonts.nunito.bold,
    color: Colors.pink,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  filterModal: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    paddingTop: Spacing.lg,
    paddingBottom: 40,
    paddingHorizontal: Spacing.xl,
    maxHeight: '80%',
  },
  filterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  filterTitle: {
    fontSize: 22,
    fontFamily: Fonts.nunito.bold,
    color: Colors.black,
  },
  filterClose: {
    fontSize: 24,
    color: 'rgba(13,13,13,0.5)',
  },
  filterSection: {
    marginBottom: Spacing.xl,
  },
  filterLabel: {
    fontSize: 15,
    fontFamily: Fonts.nunito.semiBold,
    color: Colors.black,
    marginBottom: Spacing.md,
  },
  stakeButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  stakeBtn: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    backgroundColor: 'rgba(13,13,13,0.06)',
    borderRadius: BorderRadius.md,
  },
  stakeBtnActive: {
    backgroundColor: Colors.pink,
  },
  stakeBtnText: {
    fontSize: 14,
    fontFamily: Fonts.nunito.semiBold,
    color: 'rgba(13,13,13,0.7)',
  },
  stakeBtnTextActive: {
    color: Colors.white,
  },
  applyButton: {
    paddingVertical: 16,
    backgroundColor: Colors.pink,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    marginTop: Spacing.lg,
  },
  applyText: {
    fontSize: 16,
    fontFamily: Fonts.nunito.bold,
    color: Colors.white,
  },
});
