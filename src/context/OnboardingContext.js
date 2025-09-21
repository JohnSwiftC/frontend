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
  return useContext(OnboardingContext);
};
