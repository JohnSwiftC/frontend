import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../constants/Colors';

export default function ProgressBar({ progress, currentStep, totalSteps }) {
  const computedProgress = typeof progress === 'number' && !isNaN(progress)
    ? Math.max(0, Math.min(1, progress))
    : (typeof currentStep === 'number' && typeof totalSteps === 'number' && totalSteps > 0
      ? Math.max(0, Math.min(1, currentStep / totalSteps))
      : 0);

  const [trackWidth, setTrackWidth] = useState(0);
  const animatedWidth = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (trackWidth > 0) {
      const target = trackWidth * computedProgress;
      Animated.timing(animatedWidth, {
        toValue: target,
        duration: 220,
        useNativeDriver: false,
      }).start();
    }
  }, [computedProgress, trackWidth]);

  return (
    <View style={styles.container}>
      <View
        style={styles.progressTrack}
        onLayout={e => setTrackWidth(e.nativeEvent.layout.width)}
      >
        <Animated.View style={[styles.animatedFill, { width: animatedWidth }] }>
          <LinearGradient
            colors={[Colors.primary, Colors.primaryDark]}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  progressTrack: {
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  animatedFill: {
    height: '100%',
    borderRadius: 2,
    overflow: 'hidden',
  },
});
