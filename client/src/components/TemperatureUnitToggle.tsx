import React from 'react';
import { useTemperatureUnit } from '@/contexts/TemperatureUnitContext';
import { Button } from '@/components/ui/button';

interface TemperatureUnitToggleProps {
  className?: string;
}

export default function TemperatureUnitToggle({ className = "" }: TemperatureUnitToggleProps) {
  const { unit, toggleUnit } = useTemperatureUnit();

  return (
    <Button 
      variant="outline" 
      size="sm" 
      onClick={toggleUnit}
      className={`${className} transition-colors duration-200`}
      aria-label={`Switch to ${unit === 'celsius' ? 'Fahrenheit' : 'Celsius'}`}
    >
      <span className="flex items-center text-xs font-medium">
        <span className={unit === 'celsius' ? 'opacity-100 font-bold' : 'opacity-70'}>°C</span>
        <span className="mx-1">/</span>
        <span className={unit === 'fahrenheit' ? 'opacity-100 font-bold' : 'opacity-70'}>°F</span>
      </span>
    </Button>
  );
}