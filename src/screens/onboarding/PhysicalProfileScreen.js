import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
} from 'react-native';
import { useOnboarding } from '../../context/OnboardingContext';
import { Colors } from '../../constants/Colors';
import VerticalPicker from '../../components/VerticalPicker';

const ageData = Array.from({ length: 88 }, (_, i) => i + 13); // Ages 13-100

// Metric data
const heightDataCm = Array.from({ length: 151 }, (_, i) => i + 100); // 100-250cm
const weightDataKg = Array.from({ length: 161 }, (_, i) => i + 40); // 40-200kg

// Imperial data
const heightDataFt = Array.from({ length: 5 }, (_, i) => i + 3); // 3-7ft
const heightDataIn = Array.from({ length: 12 }, (_, i) => i); // 0-11in
const weightDataLbs = Array.from({ length: 351 }, (_, i) => i + 90); // 90-440lbs

// Conversion constants
const LBS_IN_KG = 2.20462;
const IN_IN_CM = 2.54;

export default function PhysicalProfileScreen() {
  const { onboardingData, updateOnboardingData } = useOnboarding();
  const [sex, setSex] = useState(onboardingData.sex || 'male');
  const [age, setAge] = useState(onboardingData.age || 30);
  const [height, setHeight] = useState(onboardingData.height || 175);
  const [weight, setWeight] = useState(onboardingData.weight || 75);
  const [unitSystem, setUnitSystem] = useState(onboardingData.unitSystem || 'metric');

  useEffect(() => {
    updateOnboardingData({ sex, age, height, weight, unitSystem });
  }, [sex, age, height, weight, unitSystem]);

  const handleUnitChange = (isImperial) => {
    const newUnitSystem = isImperial ? 'imperial' : 'metric';
    setUnitSystem(newUnitSystem);

    if (newUnitSystem === 'imperial') {
      // Convert from metric to imperial for display
      const weightInLbs = Math.round(weight * LBS_IN_KG);
      
      const totalInches = Math.round(height / IN_IN_CM);
      const feet = Math.floor(totalInches / 12);
      const inches = totalInches % 12;
      
      // Update state if needed (though it's derived for display)
    } else {
      // Convert from imperial back to metric for storage
      // This requires knowing the imperial values before conversion
    }
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
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <View style={styles.content}>
        <Text style={styles.title}>Tell us about yourself</Text>

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
                selectedValue={height}
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
              selectedValue={unitSystem === 'metric' ? weight : Math.round(weight * LBS_IN_KG)}
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
              style={{ transform: [{ scaleX: 1.75 }, { scaleY: 1.75 }] }}
            />
            <Text style={styles.unitSwitchLabel}>Imperial</Text>
          </View>
        </View>

      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 100,
  },
  content: {
    flex: 1,
    paddingTop: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 24,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    lineHeight: 24,
    marginBottom: 32,
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
    justifyContent: 'space-between',
    backgroundColor: '#F0F0F0',
    borderRadius: 12,
    padding: 4,
  },
  sexOption: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
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
