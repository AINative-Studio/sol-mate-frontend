import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Alert,
  ActivityIndicator,
} from 'react-native';
import * as Location from 'expo-location';
import { Colors, Fonts, Spacing, BorderRadius } from '../constants/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG } from '../config/api';

interface CheckInScreenProps {
  matchId: string;
  partnerName: string;
  onSuccess: () => void;
  onBack: () => void;
}

export default function CheckInScreen({
  matchId,
  partnerName,
  onSuccess,
  onBack,
}: CheckInScreenProps) {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);
  const [partnerConfirmed, setPartnerConfirmed] = useState(false);
  const [attestationId, setAttestationId] = useState<string | null>(null);
  const [status, setStatus] = useState<'locating' | 'waiting' | 'too_far' | 'ready' | 'confirmed'>('locating');

  useEffect(() => {
    requestLocationPermission();

    // Poll for partner status
    const interval = setInterval(() => {
      if (attestationId) {
        checkPartnerStatus();
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [attestationId]);

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert(
          'Location Required',
          'Please enable location permissions to check in.',
          [{ text: 'OK', onPress: onBack }]
        );
        return;
      }

      getLocation();
    } catch (error) {
      Alert.alert('Error', 'Failed to request location permission');
    }
  };

  const getLocation = async () => {
    try {
      setStatus('locating');

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      setLocation(location);

      // Submit location to backend
      await submitLocation(location);
    } catch (error) {
      Alert.alert('Error', 'Failed to get location. Please try again.');
      setStatus('waiting');
    }
  };

  const submitLocation = async (location: Location.LocationObject) => {
    try {
      const token = await AsyncStorage.getItem('auth_token');

      const response = await fetch(`${API_CONFIG.BASE_URL}/v1/attestations/proximity`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          match_id: matchId,
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          method: 'gps',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit location');
      }

      const data = await response.json();
      setAttestationId(data.id);

      if (data.distance !== undefined) {
        setDistance(data.distance);

        if (data.distance > 100) {
          setStatus('too_far');
        } else {
          setStatus('ready');
        }
      } else {
        setStatus('waiting');
      }
    } catch (error: any) {
      console.error('Submit location failed:', error);
      Alert.alert('Error', 'Failed to submit location');
    }
  };

  const checkPartnerStatus = async () => {
    try {
      const token = await AsyncStorage.getItem('auth_token');

      const response = await fetch(
        `${API_CONFIG.BASE_URL}/v1/attestations/me`,
        {
          headers: { 'Authorization': `Bearer ${token}` },
        }
      );

      if (!response.ok) return;

      const data = await response.json();

      if (data.partner_confirmed && !partnerConfirmed) {
        setPartnerConfirmed(true);

        if (data.both_confirmed) {
          handleBothConfirmed();
        }
      }
    } catch (error) {
      console.error('Check partner status failed:', error);
    }
  };

  const confirmArrival = async () => {
    setIsConfirming(true);

    try {
      const token = await AsyncStorage.getItem('auth_token');

      const response = await fetch(
        `${API_CONFIG.BASE_URL}/v1/attestations/meetup/${attestationId}/confirm`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            latitude: location?.coords.latitude,
            longitude: location?.coords.longitude,
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to confirm');
      }

      const data = await response.json();

      if (data.both_confirmed) {
        handleBothConfirmed();
      } else {
        setStatus('confirmed');
        Alert.alert(
          'Confirmed!',
          `Waiting for ${partnerName} to confirm...`,
        );
      }
    } catch (error: any) {
      Alert.alert('Error', 'Failed to confirm arrival');
    } finally {
      setIsConfirming(false);
    }
  };

  const handleBothConfirmed = () => {
    Alert.alert(
      '🎉 Success!',
      'Stakes released! You both earned +1 heart.',
      [
        {
          text: 'Mint Moment NFT',
          onPress: onSuccess,
        },
      ]
    );
  };

  const renderContent = () => {
    switch (status) {
      case 'locating':
        return (
          <View style={styles.statusContainer}>
            <ActivityIndicator size="large" color={Colors.purple} />
            <Text style={styles.statusText}>Getting your location...</Text>
          </View>
        );

      case 'waiting':
        return (
          <View style={styles.statusContainer}>
            <Text style={styles.emoji}>📍</Text>
            <Text style={styles.statusText}>
              Waiting for {partnerName}...
            </Text>
            <Text style={styles.statusSub}>
              They need to submit their location
            </Text>
          </View>
        );

      case 'too_far':
        return (
          <View style={styles.statusContainer}>
            <Text style={styles.emoji}>📏</Text>
            <Text style={styles.statusText}>
              You're {distance}m apart
            </Text>
            <Text style={styles.statusSub}>
              Move closer (within 100m) to check in
            </Text>
            <TouchableOpacity
              style={styles.refreshButton}
              onPress={getLocation}
            >
              <Text style={styles.refreshText}>Refresh Location</Text>
            </TouchableOpacity>
          </View>
        );

      case 'ready':
        return (
          <View style={styles.statusContainer}>
            <Text style={styles.emoji}>✅</Text>
            <Text style={styles.statusText}>
              You're nearby!
            </Text>
            <Text style={styles.statusSub}>
              {distance}m apart
            </Text>

            {partnerConfirmed && (
              <View style={styles.partnerStatus}>
                <Text style={styles.partnerText}>
                  ✓ {partnerName} confirmed
                </Text>
              </View>
            )}

            <TouchableOpacity
              style={styles.confirmButton}
              onPress={confirmArrival}
              disabled={isConfirming}
            >
              {isConfirming ? (
                <ActivityIndicator color={Colors.white} />
              ) : (
                <Text style={styles.confirmText}>Confirm Arrival</Text>
              )}
            </TouchableOpacity>
          </View>
        );

      case 'confirmed':
        return (
          <View style={styles.statusContainer}>
            <Text style={styles.emoji}>⏳</Text>
            <Text style={styles.statusText}>
              Waiting for {partnerName}...
            </Text>
            <Text style={styles.statusSub}>
              You've confirmed. Waiting for them to confirm.
            </Text>

            <View style={styles.checkmarks}>
              <View style={styles.checkmark}>
                <Text style={styles.checkmarkText}>✓ You</Text>
              </View>
              <View style={[styles.checkmark, styles.checkmarkPending]}>
                <Text style={[styles.checkmarkText, styles.checkmarkTextPending]}>
                  ⏳ {partnerName}
                </Text>
              </View>
            </View>
          </View>
        );
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Check In</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        <Text style={styles.heading}>Confirm meetup with</Text>
        <Text style={styles.partnerName}>{partnerName}</Text>

        {renderContent()}

        <View style={styles.info}>
          <Text style={styles.infoText}>
            Both of you must be within 100m to check in
          </Text>
        </View>
      </View>
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
    paddingHorizontal: Spacing.lg,
    paddingTop: 50,
    paddingBottom: Spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backText: {
    fontSize: 32,
    color: Colors.white,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: Fonts.nunito.bold,
    color: Colors.white,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
  },
  heading: {
    fontSize: 24,
    fontFamily: Fonts.nunito.regular,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
  },
  partnerName: {
    fontSize: 32,
    fontFamily: Fonts.nunito.bold,
    color: Colors.white,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  statusContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xxl,
  },
  emoji: {
    fontSize: 64,
    marginBottom: Spacing.lg,
  },
  statusText: {
    fontSize: 22,
    fontFamily: Fonts.nunito.bold,
    color: Colors.white,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  statusSub: {
    fontSize: 15,
    fontFamily: Fonts.nunito.regular,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  partnerStatus: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: BorderRadius.round,
    marginBottom: Spacing.lg,
  },
  partnerText: {
    fontSize: 15,
    fontFamily: Fonts.nunito.semiBold,
    color: Colors.white,
  },
  confirmButton: {
    width: '100%',
    paddingVertical: 18,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
  },
  confirmText: {
    fontSize: 16,
    fontFamily: Fonts.nunito.bold,
    color: Colors.pink,
  },
  refreshButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: BorderRadius.lg,
  },
  refreshText: {
    fontSize: 15,
    fontFamily: Fonts.nunito.semiBold,
    color: Colors.white,
  },
  checkmarks: {
    flexDirection: 'row',
    gap: 12,
    marginTop: Spacing.lg,
  },
  checkmark: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: BorderRadius.round,
  },
  checkmarkPending: {
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  checkmarkText: {
    fontSize: 14,
    fontFamily: Fonts.nunito.bold,
    color: Colors.white,
  },
  checkmarkTextPending: {
    opacity: 0.6,
  },
  info: {
    padding: Spacing.lg,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.xl,
  },
  infoText: {
    fontSize: 13,
    fontFamily: Fonts.nunito.regular,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    lineHeight: 19,
  },
});
