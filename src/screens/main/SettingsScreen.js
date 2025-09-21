import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { Colors } from '../../constants/Colors';
import { storage } from '../../utils/AsyncStorage';

export default function SettingsScreen({ navigation }) {
  const [isClearing, setIsClearing] = useState(false);

  const handleClearData = async () => {
    try {
      setIsClearing(true);
      await storage.clearAll();
      // Navigate to root and then to onboarding
      navigation.getParent()?.reset({
        index: 0,
        routes: [{ name: 'Onboarding' }],
      });
    } catch (error) {
      console.error('Error clearing data:', error);
    } finally {
      setIsClearing(false);
    }
  };

  const handleRestartOnboarding = () => {
    // Navigate to root navigator and reset to onboarding
    navigation.getParent()?.reset({
      index: 0,
      routes: [{ name: 'Onboarding' }],
    });
  };

  const handleAbout = () => {
    Alert.alert(
      'About OptiMeal',
      'OptiMeal helps you discover and plan optimal meals based on your dietary preferences and goals.\n\nVersion 1.0.0',
      [{ text: 'OK' }]
    );
  };

  const handleFeedback = () => {
    Alert.alert(
      'Send Feedback',
      'We\'d love to hear from you! Please send your feedback to feedback@optimeal.app',
      [{ text: 'OK' }]
    );
  };

  const renderSettingItem = (title, subtitle, icon, onPress, destructive = false) => (
    <TouchableOpacity
      style={[styles.settingItem, destructive && styles.destructiveItem]}
      onPress={onPress}
      activeOpacity={0.7}
      disabled={isClearing}
    >
      <View style={styles.settingIcon}>
        <Ionicons 
          name={icon} 
          size={20} 
          color={destructive ? Colors.error : Colors.textSecondary} 
        />
      </View>
      <View style={styles.settingContent}>
        <Text style={[styles.settingTitle, destructive && styles.destructiveText]}>
          {title}
        </Text>
        {subtitle && (
          <Text style={styles.settingSubtitle}>{subtitle}</Text>
        )}
      </View>
      <Ionicons 
        name="chevron-forward" 
        size={20} 
        color={Colors.textSecondary} 
      />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.settingsContainer}>
          {renderSettingItem(
            'About OptiMeal',
            'Version and app information',
            'information-circle-outline',
            handleAbout
          )}
          
          {renderSettingItem(
            'Send Feedback',
            'Help us improve the app',
            'chatbubble-outline',
            handleFeedback
          )}
        </View>

        <View style={[styles.settingsContainer, { marginTop: 20 }]}>
          <Text style={styles.sectionHeader}>Developer Options</Text>
          
          {renderSettingItem(
            'Restart Onboarding',
            'Go back to the welcome screen',
            'refresh-outline',
            handleRestartOnboarding
          )}
          
          {renderSettingItem(
            'Clear All Data',
            'Reset preferences and meal plans',
            'trash-outline',
            handleClearData,
            true
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  settingsContainer: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  destructiveItem: {
    borderBottomWidth: 0,
  },
  settingIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  destructiveText: {
    color: Colors.error,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: Colors.background,
  },
});
