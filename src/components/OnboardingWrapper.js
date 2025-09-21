import React from 'react';
import { View, StyleSheet, SafeAreaView, Animated } from 'react-native';
import OnboardingHeader from './OnboardingHeader';
import OnboardingFooter from './OnboardingFooter';

const OnboardingWrapper = ({ children, onBack, onContinue, progress, showBackButton, showHeader = true, showFooter = true, isContinueDisabled, style }) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <Animated.View style={[styles.container, style]}>
        {showHeader && (
          <OnboardingHeader onBack={onBack} progress={progress} showBackButton={showBackButton} />
        )}
        <View style={styles.content}>
          {children}
        </View>
        {showFooter && (
          <OnboardingFooter onContinue={onContinue} isDisabled={isContinueDisabled} />
        )}
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
});

export default OnboardingWrapper;
