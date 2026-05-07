import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Fonts, Spacing, BorderRadius } from '../constants/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG } from '../config/api';

const INTERESTS = [
  'music', 'art', 'crypto', 'travel', 'fitness',
  'food', 'tech', 'gaming', 'reading', 'movies',
  'hiking', 'yoga', 'photography', 'dancing', 'cooking',
];

const STAKE_OPTIONS = [
  { value: 0.1, label: '0.1 SOL' },
  { value: 0.25, label: '0.25 SOL' },
  { value: 0.5, label: '0.5 SOL' },
  { value: 1, label: '1 SOL' },
  { value: 2, label: '2 SOL' },
];

interface ProfileSetupScreenProps {
  onComplete: () => void;
}

export default function ProfileSetupScreen({ onComplete }: ProfileSetupScreenProps) {
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [minStake, setMinStake] = useState(0.1);
  const [isLoading, setIsLoading] = useState(false);

  const toggleInterest = (interest: string) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter(i => i !== interest));
    } else {
      if (selectedInterests.length < 5) {
        setSelectedInterests([...selectedInterests, interest]);
      } else {
        Alert.alert('Max Interests', 'You can select up to 5 interests');
      }
    }
  };

  const handleSubmit = async () => {
    // Validation
    if (!name || name.length < 2) {
      Alert.alert('Name Required', 'Please enter your name (min 2 characters)');
      return;
    }

    const ageNum = parseInt(age);
    if (!ageNum || ageNum < 18 || ageNum > 100) {
      Alert.alert('Age Required', 'Please enter a valid age (18-100)');
      return;
    }

    if (selectedInterests.length < 3) {
      Alert.alert('Interests Required', 'Please select at least 3 interests');
      return;
    }

    setIsLoading(true);

    try {
      // Get auth token
      const token = await AsyncStorage.getItem('auth_token');
      if (!token) {
        throw new Error('Not authenticated');
      }

      // Create persona
      const response = await fetch(`${API_CONFIG.BASE_URL}/v1/personas`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          display_name: name,
          age: ageNum,
          interests: selectedInterests,
          min_stake_requirement: minStake,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to create profile');
      }

      const persona = await response.json();

      // Store persona ID
      await AsyncStorage.setItem('current_persona_id', persona.id);

      console.log('✅ Profile created:', persona);
      onComplete();
    } catch (error: any) {
      console.error('❌ Profile setup failed:', error);
      Alert.alert('Error', error.message || 'Failed to create profile');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <LinearGradient
        colors={[Colors.pink, '#C7517D']}
        style={StyleSheet.absoluteFillObject}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.heading}>Create your profile</Text>
        <Text style={styles.subheading}>
          Let's get you started. This only takes a minute.
        </Text>

        {/* Name Input */}
        <View style={styles.section}>
          <Text style={styles.label}>Display Name</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., .nova"
            placeholderTextColor="rgba(13,13,13,0.3)"
            value={name}
            onChangeText={setName}
            maxLength={20}
            autoCapitalize="none"
          />
        </View>

        {/* Age Input */}
        <View style={styles.section}>
          <Text style={styles.label}>Age</Text>
          <TextInput
            style={styles.input}
            placeholder="21"
            placeholderTextColor="rgba(13,13,13,0.3)"
            value={age}
            onChangeText={setAge}
            keyboardType="number-pad"
            maxLength={3}
          />
        </View>

        {/* Interests */}
        <View style={styles.section}>
          <Text style={styles.label}>
            Interests ({selectedInterests.length}/5)
          </Text>
          <Text style={styles.labelSub}>Pick 3-5 things you love</Text>
          <View style={styles.interestGrid}>
            {INTERESTS.map((interest) => (
              <TouchableOpacity
                key={interest}
                style={[
                  styles.interestChip,
                  selectedInterests.includes(interest) && styles.interestChipActive,
                ]}
                onPress={() => toggleInterest(interest)}
              >
                <Text
                  style={[
                    styles.interestText,
                    selectedInterests.includes(interest) && styles.interestTextActive,
                  ]}
                >
                  {interest}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Min Stake Requirement */}
        <View style={styles.section}>
          <Text style={styles.label}>Minimum Stake to Message You</Text>
          <Text style={styles.labelSub}>
            How much SOL should someone stake to send you a message?
          </Text>
          <View style={styles.stakeOptions}>
            {STAKE_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.stakeOption,
                  minStake === option.value && styles.stakeOptionActive,
                ]}
                onPress={() => setMinStake(option.value)}
              >
                <Text
                  style={[
                    styles.stakeOptionText,
                    minStake === option.value && styles.stakeOptionTextActive,
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color={Colors.black} />
          ) : (
            <Text style={styles.submitText}>Continue →</Text>
          )}
        </TouchableOpacity>
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
    paddingHorizontal: Spacing.xl,
    paddingTop: 80,
    paddingBottom: Spacing.xl,
  },
  heading: {
    fontSize: 32,
    fontFamily: Fonts.nunito.bold,
    color: Colors.white,
    marginBottom: Spacing.sm,
  },
  subheading: {
    fontSize: 15,
    fontFamily: Fonts.nunito.regular,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: Spacing.xl,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  label: {
    fontSize: 15,
    fontFamily: Fonts.nunito.semiBold,
    color: Colors.white,
    marginBottom: Spacing.sm,
  },
  labelSub: {
    fontSize: 13,
    fontFamily: Fonts.nunito.regular,
    color: 'rgba(255,255,255,0.6)',
    marginBottom: Spacing.md,
  },
  input: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.md,
    paddingVertical: 16,
    paddingHorizontal: 20,
    fontSize: 16,
    fontFamily: Fonts.nunito.semiBold,
    color: Colors.black,
  },
  interestGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  interestChip: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: BorderRadius.round,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  interestChipActive: {
    backgroundColor: Colors.white,
    borderColor: Colors.white,
  },
  interestText: {
    fontSize: 14,
    fontFamily: Fonts.nunito.semiBold,
    color: 'rgba(255,255,255,0.9)',
  },
  interestTextActive: {
    color: Colors.pink,
  },
  stakeOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  stakeOption: {
    flex: 1,
    minWidth: '30%',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: BorderRadius.md,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
  },
  stakeOptionActive: {
    backgroundColor: Colors.white,
    borderColor: Colors.white,
  },
  stakeOptionText: {
    fontSize: 14,
    fontFamily: Fonts.nunito.bold,
    color: 'rgba(255,255,255,0.9)',
  },
  stakeOptionTextActive: {
    color: Colors.pink,
  },
  submitButton: {
    width: '100%',
    paddingVertical: 18,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.lg,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitText: {
    fontSize: 16,
    fontFamily: Fonts.nunito.bold,
    color: Colors.black,
  },
});
