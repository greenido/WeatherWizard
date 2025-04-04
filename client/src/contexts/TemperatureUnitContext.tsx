import React, { createContext, useContext, useState, useEffect } from 'react';

type TemperatureUnit = 'celsius' | 'fahrenheit';

type TemperatureUnitContextType = {
  unit: TemperatureUnit;
  toggleUnit: () => void;
  convertToDisplayUnit: (celsius: number) => number;
  unitSymbol: string;
};

const TemperatureUnitContext = createContext<TemperatureUnitContextType | undefined>(undefined);

export const TemperatureUnitProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Get saved preference from localStorage or default to Celsius
  const [unit, setUnit] = useState<TemperatureUnit>(() => {
    const savedUnit = localStorage.getItem('temperatureUnit');
    return (savedUnit as TemperatureUnit) || 'celsius';
  });

  // Convert Celsius to Fahrenheit
  const celsiusToFahrenheit = (celsius: number): number => {
    return (celsius * 9/5) + 32;
  };

  // Convert to the display unit based on the current setting
  const convertToDisplayUnit = (celsius: number): number => {
    if (unit === 'celsius') {
      return celsius;
    } else {
      return celsiusToFahrenheit(celsius);
    }
  };

  // Get the unit symbol
  const unitSymbol = unit === 'celsius' ? '°C' : '°F';

  // Toggle between Celsius and Fahrenheit
  const toggleUnit = () => {
    setUnit(prevUnit => {
      const newUnit = prevUnit === 'celsius' ? 'fahrenheit' : 'celsius';
      localStorage.setItem('temperatureUnit', newUnit);
      return newUnit;
    });
  };

  // Context value
  const value = {
    unit,
    toggleUnit,
    convertToDisplayUnit,
    unitSymbol
  };

  return (
    <TemperatureUnitContext.Provider value={value}>
      {children}
    </TemperatureUnitContext.Provider>
  );
};

export const useTemperatureUnit = (): TemperatureUnitContextType => {
  const context = useContext(TemperatureUnitContext);
  if (context === undefined) {
    throw new Error('useTemperatureUnit must be used within a TemperatureUnitProvider');
  }
  return context;
};