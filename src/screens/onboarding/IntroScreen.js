import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Video } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../../constants/Colors';

export default function IntroScreen({ onGetStarted }) {
  const videoRef = useRef(null);
  const cardTranslateY = useRef(new Animated.Value(40)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const placeholderOpacity = useRef(new Animated.Value(1)).current;
  
  // Text animation values
  const welcomeTranslateX = useRef(new Animated.Value(100)).current;
  const welcomeOpacity = useRef(new Animated.Value(0)).current;
  const appTitleTranslateX = useRef(new Animated.Value(120)).current;
  const appTitleOpacity = useRef(new Animated.Value(0)).current;
  const subtitleOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {

    // Card slide up
    Animated.spring(cardTranslateY, {
      toValue: 0,
      friction: 8,
      tension: 40,
      useNativeDriver: true,
      delay: 200,
    }).start();

    Animated.timing(cardOpacity, {
      toValue: 1,
      duration: 350,
      useNativeDriver: true,
      delay: 200,
    }).start();

    // Staggered text animations - "Welcome to" first (faster)
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(welcomeTranslateX, {
          toValue: 0,
          duration: 500,
          easing: require('react-native').Easing.out(require('react-native').Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(welcomeOpacity, {
          toValue: 1,
          duration: 500,
          easing: require('react-native').Easing.out(require('react-native').Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();
    }, 300);

    // "OptiMeal" second (slower, more dramatic)
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(appTitleTranslateX, {
          toValue: 0,
          duration: 800,
          easing: require('react-native').Easing.out(require('react-native').Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(appTitleOpacity, {
          toValue: 1,
          duration: 800,
          easing: require('react-native').Easing.out(require('react-native').Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();
    }, 500);

    // Subtitle fade in last
    setTimeout(() => {
      Animated.timing(subtitleOpacity, {
        toValue: 1,
        duration: 400,
        easing: require('react-native').Easing.out(require('react-native').Easing.cubic),
        useNativeDriver: true,
      }).start();
    }, 800);
  }, []);

  const handleGetStarted = () => {
    onGetStarted();
  };

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.placeholderContainer, { opacity: placeholderOpacity }] }>
        <View style={styles.placeholder}>
          <Video
            ref={videoRef}
            source={require('../../../StarterVideo.mp4')}
            style={styles.video}
            resizeMode="cover"
            shouldPlay
            isMuted
            isLooping={false}
            useNativeControls={false}
            onPlaybackStatusUpdate={(status) => {
              if (status?.didJustFinish && videoRef.current) {
                const endMs = Math.max(0, (status.durationMillis ?? 1) - 1);
                videoRef.current.setPositionAsync(endMs).finally(() => {
                  videoRef.current && videoRef.current.pauseAsync();
                });
              }
            }}
          />
        </View>
      </Animated.View>

      <Animated.View style={[styles.bottomCard, { transform: [{ translateY: cardTranslateY }], opacity: cardOpacity }]}>
        <Animated.Text 
          style={[
            styles.welcomeText,
            { 
              transform: [{ translateX: welcomeTranslateX }],
              opacity: welcomeOpacity 
            }
          ]}
        >
          Welcome to
        </Animated.Text>
        <Animated.Text 
          style={[
            styles.appTitle,
            { 
              transform: [{ translateX: appTitleTranslateX }],
              opacity: appTitleOpacity 
            }
          ]}
        >
          OptiMeal
        </Animated.Text>
        <Animated.Text 
          style={[
            styles.subtitle,
            { 
              opacity: subtitleOpacity 
            }
          ]}
        >
          Your AI Nutritionist
        </Animated.Text>

        <TouchableOpacity style={styles.getStartedButton} onPress={handleGetStarted} activeOpacity={0.85}>
          <LinearGradient colors={[Colors.primary, Colors.primaryDark]} style={styles.getStartedGradient}>
            <Text style={styles.getStartedText}>Get Started</Text>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'space-between',
  },
  placeholderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  placeholder: {
    width: '100%',
    height: '60%',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    overflow: 'hidden',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  placeholderText: {
    color: Colors.textSecondary,
  },
  bottomCard: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 32,
    elevation: 12,
  },
  welcomeText: {
    fontSize: 20,
    color: Colors.textSecondary,
    fontWeight: '300',
  },
  appTitle: {
    fontSize: 40,
    fontWeight: 'bold',
    color: Colors.primary,
    marginTop: 6,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    fontWeight: '500',
    marginTop: 2,
    marginBottom: 16,
  },
  getStartedButton: {
    borderRadius: 14,
    overflow: 'hidden',
    marginTop: 8,
  },
  getStartedGradient: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  getStartedText: {
    color: Colors.textLight,
    fontWeight: 'bold',
    fontSize: 16,
  },
});
