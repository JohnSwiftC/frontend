import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import VerticalPicker from '../../components/VerticalPicker';
import { storage } from '../../utils/AsyncStorage';

const ageData = Array.from({ length: 88 }, (_, i) => i + 13); // Ages 13-100
const heightDataCm = Array.from({ length: 151 }, (_, i) => i + 100); // 100-250cm
const weightDataKg = Array.from({ length: 161 }, (_, i) => i + 40); // 40-200kg
const heightDataFt = Array.from({ length: 5 }, (_, i) => i + 3); // 3-7ft
const heightDataIn = Array.from({ length: 12 }, (_, i) => i); // 0-11in
const weightDataLbs = Array.from({ length: 351 }, (_, i) => i + 90); // 90-440lbs

const LBS_IN_KG = 2.20462;
const IN_IN_CM = 2.54;

export default function PhysicalProfileDetailScreen({ navigation, route }) {
  const { currentValue, onSave } = route.params;
  
  const [sex, setSex] = useState(currentValue.sex || 'male');
  const [age, setAge] = useState(currentValue.age || 30);
  const [height, setHeight] = useState(currentValue.height || 175);
  const [weight, setWeight] = useState(currentValue.weight || 75);
  const [unitSystem, setUnitSystem] = useState(currentValue.unitSystem || 'metric');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const updatedProfile = {
        ...currentValue,
        sex,
        age,
        height,
        weight,
        unitSystem,
      };
      await storage.saveUserProfile(updatedProfile);
      if (onSave) onSave();
      navigation.goBack();
    } catch (error) {
      console.error('Error saving physical profile:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleUnitChange = (isImperial) => {
    setUnitSystem(isImperial ? 'imperial' : 'metric');
  };

  const renderSexSelector = () => {
    const options = [
      { id: 'male', label: 'Male' },
      { id: 'female', label: 'Female' },
      { id: 'other', label: 'Other' },
    ];
    return (
      <View style={styles.sexSelectorContainer}>
        {options.map(option => (
          <TouchableOpacity
            key={option.id}
            style={[styles.sexOption, sex === option.id && styles.sexOptionSelected]}
            onPress={() => setSex(option.id)}
            activeOpacity={0.7}
          >
            <Text style={[styles.sexOptionText, sex === option.id && styles.sexOptionTextSelected]}>
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={{ flex: 1, backgroundColor: Colors.surface }}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Ionicons name="chevron-back" size={24} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.title}>Physical Profile</Text>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={handleSave}
            disabled={isSaving}
            activeOpacity={0.7}
          >
            {isSaving ? (
              <ActivityIndicator size="small" color={Colors.text} />
            ) : (
              <Ionicons name="checkmark" size={22} color={Colors.text} />
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Sex</Text>
              {renderSexSelector()}
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Profile</Text>
              <View style={styles.profileInputsRow}>
                <VerticalPicker
                  data={ageData}
                  selectedValue={age}
                  onValueChange={setAge}
                  unit="years"
                />
                {unitSystem === 'metric' ? (
                  <VerticalPicker
                    data={heightDataCm}
                    selectedValue={Math.round(height)}
                    onValueChange={setHeight}
                    unit="cm"
                  />
                ) : (
                  <View style={styles.imperialHeightContainer}>
                    <VerticalPicker
                      data={heightDataFt}
                      selectedValue={Math.floor(Math.round(height / IN_IN_CM) / 12)}
                      onValueChange={(ft) => {
                        const inches = Math.round(height / IN_IN_CM) % 12;
                        setHeight(Math.round((ft * 12 + inches) * IN_IN_CM));
                      }}
                      unit="ft"
                    />
                    <VerticalPicker
                      data={heightDataIn}
                      selectedValue={Math.round(height / IN_IN_CM) % 12}
                      onValueChange={(inches) => {
                        const ft = Math.floor(Math.round(height / IN_IN_CM) / 12);
                        setHeight(Math.round((ft * 12 + inches) * IN_IN_CM));
                      }}
                      unit="in"
                    />
                  </View>
                )}
                <VerticalPicker
                  data={unitSystem === 'metric' ? weightDataKg : weightDataLbs}
                  selectedValue={unitSystem === 'metric' ? Math.round(weight) : Math.round(weight * LBS_IN_KG)}
                  onValueChange={(val) => {
                    setWeight(unitSystem === 'metric' ? val : Math.round(val / LBS_IN_KG));
                  }}
                  unit={unitSystem === 'metric' ? "kg" : "lbs"}
                />
              </View>
            </View>

            <View style={styles.section}>
              <View style={styles.unitSwitchContainer}>
                <Text style={styles.unitSwitchLabel}>Metric</Text>
                <Switch
                  value={unitSystem === 'imperial'}
                  onValueChange={handleUnitChange}
                  trackColor={{ false: '#E0E0E0', true: Colors.primary }}
                  thumbColor={Colors.white}
                  ios_backgroundColor="#E0E0E0"
                />
                <Text style={styles.unitSwitchLabel}>Imperial</Text>
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
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
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    textAlign: 'center',
    marginHorizontal: 16,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 16,
  },
  sexSelectorContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 4,
  },
  sexOption: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  sexOptionSelected: {
    backgroundColor: Colors.primary + '10',
    borderWidth: 1,
    borderColor: Colors.primary,
    elevation: 2,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sexOptionText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  sexOptionTextSelected: {
    color: Colors.primary,
  },
  profileInputsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  imperialHeightContainer: {
    flexDirection: 'row',
  },
  unitSwitchContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 20,
  },
  unitSwitchLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginHorizontal: 20,
  },
});
