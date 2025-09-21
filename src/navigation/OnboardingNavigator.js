import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Dimensions, Animated, PanResponder } from 'react-native';
import OnboardingWrapper from '../components/OnboardingWrapper';
import { OnboardingProvider, useOnboarding } from '../context/OnboardingContext';

import IntroScreen from '../screens/onboarding/IntroScreen';
import WelcomeScreen from '../screens/onboarding/WelcomeScreen';
import PhysicalProfileScreen from '../screens/onboarding/PhysicalProfileScreen';
import ActivityLevelScreen from '../screens/onboarding/ActivityLevelScreen';
import DietaryPreferencesScreen from '../screens/onboarding/DietaryPreferencesScreen';
import AllergiesScreen from '../screens/onboarding/AllergiesScreen';
import FinalSetupScreen from '../screens/onboarding/FinalSetupScreen';
import LoadingScreen from '../screens/onboarding/LoadingScreen';
import PlanReadyScreen from '../screens/onboarding/PlanReadyScreen';

const contentScreens = [
  PhysicalProfileScreen,
  WelcomeScreen,
  ActivityLevelScreen,
  DietaryPreferencesScreen,
  AllergiesScreen,
  FinalSetupScreen,
];
const contentCount = contentScreens.length;

const progressScreens = [
  IntroScreen,
  ...contentScreens,
  LoadingScreen,
];
const progressDenominator = Math.max(1, progressScreens.length - 1);

const { width: screenWidth } = Dimensions.get('window');

const OnboardingNavigator = ({ onComplete }) => {
  const [currentStageIndex, setCurrentStageIndex] = useState(1); // 1..contentCount, then loading
  const [introVisible, setIntroVisible] = useState(true);
  const introTranslateX = useRef(new Animated.Value(0)).current;

  const scrollViewRef = useRef(null);
  const { onboardingData } = useOnboarding();

  useEffect(() => {
    if (currentStageIndex > 0 && currentStageIndex <= contentCount && scrollViewRef.current) {
      const pageIndex = currentStageIndex - 1;
      scrollViewRef.current.scrollTo({ x: screenWidth * pageIndex, animated: true });
    }
  }, [currentStageIndex]);

  const handleContinue = () => {
    const nextIndex = currentStageIndex + 1;
    if (nextIndex <= contentCount) {
      setCurrentStageIndex(nextIndex);
    } else {
      setCurrentStageIndex(nextIndex); // move toward loading
    }
  };

  const reShowIntro = () => {
    setIntroVisible(true);
    introTranslateX.setValue(screenWidth);
    Animated.timing(introTranslateX, {
      toValue: 0,
      duration: 220,
      useNativeDriver: true,
    }).start();
  };

  const handleBack = () => {
    if (currentStageIndex === 1 && !introVisible) {
      // From Welcome back to Intro overlay
      reShowIntro();
      return;
    }
    const prevIndex = currentStageIndex - 1;
    if (prevIndex >= 1) {
      setCurrentStageIndex(prevIndex);
    }
  };

  const handleScrollEnd = (event) => {
    const pageIndex = Math.round(event.nativeEvent.contentOffset.x / screenWidth);
    const stageIndex = pageIndex + 1;
    if (stageIndex !== currentStageIndex) {
      setCurrentStageIndex(stageIndex);
    }
  };

  const dismissIntro = () => {
    Animated.timing(introTranslateX, {
      toValue: -screenWidth,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setIntroVisible(false);
    });
  };

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gesture) => introVisible && gesture.dx < -8 && Math.abs(gesture.dy) < 10,
      onPanResponderMove: (_, gesture) => {
        if (!introVisible) return;
        const translate = Math.max(gesture.dx, -screenWidth);
        introTranslateX.setValue(translate);
      },
      onPanResponderRelease: (_, gesture) => {
        if (!introVisible) return;
        const shouldDismiss = gesture.dx < -80 || gesture.vx < -0.4;
        if (shouldDismiss) {
          dismissIntro();
        } else {
          Animated.spring(introTranslateX, {
            toValue: 0,
            useNativeDriver: true,
            friction: 8,
            tension: 80,
          }).start();
        }
      },
    })
  ).current;

  const Current = currentStageIndex <= contentCount ? contentScreens[currentStageIndex - 1] : null;
  const isContentStage = currentStageIndex >= 1 && currentStageIndex <= contentCount;
  const isLoading = currentStageIndex === contentCount + 1;
  const isPlanReady = currentStageIndex >= contentCount + 2;

  const isContinueDisabled = Current === WelcomeScreen && !onboardingData.goal;

  // Progress (show full during loading and ready)
  const currentForProgress = introVisible
    ? IntroScreen
    : (isLoading || isPlanReady)
      ? LoadingScreen
      : Current || LoadingScreen;
  const progressIndex = progressScreens.findIndex((s) => s === currentForProgress);
  const progress = progressIndex >= 0 ? progressIndex / progressDenominator : 0;

  const showHeader = !isPlanReady;
  const showFooter = !isPlanReady && !isLoading;
  const showBackButton = showHeader && !introVisible;

  return (
    <View style={styles.root}>
      <OnboardingWrapper
        onBack={handleBack}
        onContinue={handleContinue}
        progress={progress}
        showBackButton={showBackButton}
        showHeader={showHeader}
        showFooter={showFooter}
        isContinueDisabled={isContinueDisabled}
      >
        {isContentStage ? (
          <ScrollView
            ref={scrollViewRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={handleScrollEnd}
            scrollEventThrottle={16}
            decelerationRate="fast"
          >
            {contentScreens.map((ScreenComponent, index) => (
              <View key={index} style={{ width: screenWidth }}>
                <ScreenComponent />
              </View>
            ))}
          </ScrollView>
        ) : isLoading ? (
          <LoadingScreen onLoadingComplete={() => setCurrentStageIndex(contentCount + 2)} />
        ) : (
          <PlanReadyScreen onComplete={onComplete} />
        )}
      </OnboardingWrapper>

      {introVisible && (
        <Animated.View style={[styles.introOverlay, { transform: [{ translateX: introTranslateX }] }]} {...panResponder.panHandlers}>
          <IntroScreen onGetStarted={dismissIntro} />
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  introOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
  },
});

export default ({ onComplete }) => (
  <OnboardingProvider>
    <OnboardingNavigator onComplete={onComplete} />
  </OnboardingProvider>
); 