import React, { createContext, useState, useContext } from 'react';

const OnboardingContext = createContext();

export const OnboardingProvider = ({ children }) => {
  const [onboardingData, setOnboardingData] = useState({
    goal: null,
    sex: null,
    age: null,
    height: null,
    weight: null,
    activityLevel: null,
    unitSystem: 'metric',
    dietaryPreferences: [],
    allergies: [],
  });

  const updateOnboardingData = (data) => {
    setOnboardingData((prevData) => ({
      ...prevData,
      ...data,
    }));
  };

  return (
    <OnboardingContext.Provider value={{ onboardingData, updateOnboardingData }}>
      {children}
    </OnboardingContext.Provider>
  );
};

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  
  // Add error handling to prevent undefined context issues
  if (!context) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  
  return context;
};