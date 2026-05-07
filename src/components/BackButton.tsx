import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Colors, Fonts, Spacing } from '../constants/theme';

interface BackButtonProps {
  onPress: () => void;
  style?: object;
}

export default function BackButton({ onPress, style }: BackButtonProps) {
  return (
    <TouchableOpacity style={[styles.backButton, style]} onPress={onPress}>
      <Text style={styles.backButtonText}>‹</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  backButton: {
    position: 'absolute',
    top: 48,
    left: Spacing.md,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  backButtonText: {
    fontSize: 32,
    fontFamily: Fonts.nunito.bold,
    color: Colors.white,
    lineHeight: 40,
  },
});
