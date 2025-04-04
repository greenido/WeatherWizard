import React from 'react';
import { WeatherData } from "@/types/weather";

interface PrecipitationChartProps {
  weatherData: WeatherData;
  currentDayHours: number[];
  fixedHoursToShow: number[];
  days: Array<any>; // Using any for simplicity since we're working with transformed data
  gridCols: string;
  isCurrentTimeColumn: (dayIndex: number, hour: number, hours: number[]) => boolean;
  currentHour: number;
}

export default function PrecipitationChart({
  weatherData,
  currentDayHours,
  fixedHoursToShow,
  days,
  gridCols,
  isCurrentTimeColumn,
  currentHour
}: PrecipitationChartProps) {
  // Helper function to get color based on precipitation probability
  const getPrecipColor = (chance: number) => {
    if (chance <= 0) return 'bg-gray-50 dark:bg-gray-800 text-gray-400 dark:text-gray-500';
    if (chance < 20) return 'bg-blue-50 dark:bg-blue-900/20 text-blue-500 dark:text-blue-400';
    if (chance < 40) return 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300';
    if (chance < 60) return 'bg-blue-200 dark:bg-blue-800/50 text-blue-700 dark:text-blue-200';
    if (chance < 80) return 'bg-blue-300 dark:bg-blue-700 text-blue-800 dark:text-blue-100';
    return 'bg-blue-400 dark:bg-blue-600 text-blue-900 dark:text-white font-bold';
  };

  // Helper function to get the appropriate icon for precipitation
  const getPrecipIcon = (chance: number, willRain: number, willSnow: number) => {
    if (chance <= 0) return null;
    
    // If there's a high chance of snow
    if (willSnow > 0) {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 inline-block" viewBox="0 0 24 24" fill="currentColor">
          <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zm3.3 14.71L11 12.41V7h2v3.59l3.71 3.71-1.42 1.41z"/>
          <path d="M12 6l-2.25-1.25-.75 1.25.75 1.25L12 6zM13.5 6l2.25-1.25.75 1.25-.75 1.25L13.5 6zM16.5 9l-1.25 2.25 1.25.75 1.25-.75L16.5 9zM14.25 12.5l-1.25 2.25-1.25-.75-1.25.75 1.25 2.25 1.25-.75 1.25.75 1.25-2.25-1.25-.75z"/>
        </svg>
      );
    }
    
    // If there's a high chance of rain
    if (willRain > 0) {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 inline-block" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2c-5.33 4.55-8 8.48-8 11.8 0 4.98 3.8 8.2 8 8.2s8-3.22 8-8.2c0-3.32-2.67-7.25-8-11.8zm0 18c-3.35 0-6-2.57-6-6.2 0-2.34 1.95-5.44 6-9.14 4.05 3.7 6 6.79 6 9.14 0 3.63-2.65 6.2-6 6.2z"/>
          <path d="M7.83 14c.37 0 .67.26.74.62.41 2.22 2.28 2.98 3.64 2.87.43-.02.79.32.79.75 0 .4-.32.73-.72.75-2.13.13-4.62-1.09-5.19-4.12-.08-.45.28-.87.74-.87z"/>
        </svg>
      );
    }
    
    // For low to moderate chances
    return (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 inline-block" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM19 18H6c-2.21 0-4-1.79-4-4s1.79-4 4-4h.71C7.37 7.69 9.48 6 12 6c3.04 0 5.5 2.46 5.5 5.5v.5H19c1.66 0 3 1.34 3 3s-1.34 3-3 3z"/>
      </svg>
    );
  };

  return (
    <div className={`grid ${gridCols} border-b dark:border-slate-600`}>
      <div className="col-span-1 py-3 px-2 bg-gray-50 dark:bg-slate-700 font-medium text-sm text-gray-600 dark:text-gray-300 flex items-center justify-center border-r dark:border-slate-600 sticky left-0 z-10">
        <span className="flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
          </svg>
          Precip. %
        </span>
      </div>
      {days.map((day, dayIndex) => {
        const hoursSet = dayIndex === 0 ? currentDayHours : fixedHoursToShow;
        
        return hoursSet.map((hour) => {
          const hourData = day.hour.find((h: any) => new Date(h.time).getHours() === hour);
          if (!hourData) return null;

          const chance = hourData.chance_of_rain > hourData.chance_of_snow 
            ? hourData.chance_of_rain 
            : hourData.chance_of_snow;
          
          const colorClass = getPrecipColor(chance);
          const isCurrentHour = isCurrentTimeColumn(dayIndex, hour, hoursSet);
          
          return (
            <div 
              key={hourData.time} 
              className={`col-span-1 py-2 px-1 text-center border-r dark:border-slate-600 
                ${colorClass} 
                ${isCurrentHour ? 'ring-2 ring-inset ring-blue-500 dark:ring-blue-400' : ''}`}
            >
              <div className="flex flex-col items-center justify-center h-full">
                <div className="mb-1">
                  {getPrecipIcon(chance, hourData.will_it_rain, hourData.will_it_snow)}
                </div>
                <span className="text-xs font-medium">
                  {chance > 0 ? `${chance}%` : '-'}
                </span>
                {hourData.precip_mm > 0 && (
                  <span className="text-[9px] opacity-80 mt-0.5">
                    {hourData.precip_mm.toFixed(1)}mm
                  </span>
                )}
              </div>
            </div>
          );
        });
      })}
    </div>
  );
}