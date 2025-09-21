import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ProgressBar from './ProgressBar';
import { Colors } from '../constants/Colors';

const OnboardingHeader = ({ onBack, progress, showBackButton }) => {
  return (
    <View style={styles.container}>
      {showBackButton ? (
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.textSecondary} />
        </TouchableOpacity>
      ) : (
        <View style={styles.backButtonPlaceholder} />
      )}
      <View style={styles.progressBarContainer}>
        <ProgressBar progress={progress} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50, // Adjust as needed for status bar height
    backgroundColor: Colors.background,
  },
  backButton: {
    marginRight: 20,
  },
  backButtonPlaceholder: {
    width: 24, // Same size as the icon
    marginRight: 20,
  },
  progressBarContainer: {
    flex: 1,
  },
});

export default OnboardingHeader;
