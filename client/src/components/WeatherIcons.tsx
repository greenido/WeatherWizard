import React from "react";

// Simple mapping function to convert WeatherAPI condition codes to appropriate SVG icons
export function getWeatherIcon(conditionCode: number, isDay: number = 1) {
  // Map condition codes to appropriate SVG icons
  // Based on WeatherAPI condition codes: https://www.weatherapi.com/docs/conditions.json
  
  // Sunny / Clear
  if (conditionCode === 1000) {
    return isDay ? <SunnyIcon /> : <ClearNightIcon />;
  }
  
  // Partly cloudy
  if (conditionCode === 1003) {
    return isDay ? <PartlyCloudyDayIcon /> : <PartlyCloudyNightIcon />;
  }
  
  // Cloudy
  if (conditionCode === 1006 || conditionCode === 1009) {
    return <CloudyIcon />;
  }
  
  // Rain conditions (light to heavy)
  if ([1063, 1180, 1183, 1186, 1189, 1192, 1195, 1240, 1243, 1246].includes(conditionCode)) {
    return <RainIcon />;
  }
  
  // Thunderstorm
  if ([1087, 1273, 1276, 1279, 1282].includes(conditionCode)) {
    return <ThunderstormIcon />;
  }
  
  // Snow
  if ([1066, 1114, 1117, 1210, 1213, 1216, 1219, 1222, 1225, 1255, 1258].includes(conditionCode)) {
    return <SnowIcon />;
  }
  
  // Default to cloudy for any other codes
  return <CloudyIcon />;
}

function SunnyIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-9 h-9 mx-auto" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5" fill="#FFD700" stroke="#FF8C00"></circle>
      <line x1="12" y1="1" x2="12" y2="3" stroke="#FF8C00"></line>
      <line x1="12" y1="21" x2="12" y2="23" stroke="#FF8C00"></line>
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" stroke="#FF8C00"></line>
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" stroke="#FF8C00"></line>
      <line x1="1" y1="12" x2="3" y2="12" stroke="#FF8C00"></line>
      <line x1="21" y1="12" x2="23" y2="12" stroke="#FF8C00"></line>
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" stroke="#FF8C00"></line>
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" stroke="#FF8C00"></line>
    </svg>
  );
}

function ClearNightIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-9 h-9 mx-auto" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" fill="#5C6BC0" stroke="#3949AB"></path>
    </svg>
  );
}

function PartlyCloudyDayIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-9 h-9 mx-auto" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {/* Sun */}
      <circle cx="12" cy="9" r="3.5" fill="#FFD700" stroke="#FF8C00"></circle>
      <line x1="12" y1="3" x2="12" y2="5" stroke="#FF8C00"></line>
      <line x1="12" y1="13" x2="12" y2="15" stroke="#FF8C00"></line>
      <line x1="6" y1="9" x2="8" y2="9" stroke="#FF8C00"></line>
      <line x1="16" y1="9" x2="18" y2="9" stroke="#FF8C00"></line>
      <line x1="7.8" y1="4.8" x2="9.2" y2="6.2" stroke="#FF8C00"></line>
      <line x1="14.8" y1="11.8" x2="16.2" y2="13.2" stroke="#FF8C00"></line>
      <line x1="7.8" y1="13.2" x2="9.2" y2="11.8" stroke="#FF8C00"></line>
      <line x1="14.8" y1="6.2" x2="16.2" y2="4.8" stroke="#FF8C00"></line>
      
      {/* Cloud */}
      <path d="M17 18H8.5a4.5 4.5 0 1 1 0-9h.5c0-.5.071-1 .2-1.5a5.5 5.5 0 0 1 9.78 4.194A3.5 3.5 0 1 1 17 18z" fill="#E1F5FE" stroke="#4FC3F7"></path>
    </svg>
  );
}

function PartlyCloudyNightIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-9 h-9 mx-auto" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {/* Moon */}
      <path d="M12 3a6 6 0 0 0-6 9h.2c.8 0 1.5.2 2.2.5" fill="#5C6BC0" stroke="#3949AB"></path>
      <path d="M5 8a7 7 0 0 0 9.8 8.2" fill="#5C6BC0" stroke="#3949AB"></path>
      <path d="M19 5a4.5 4.5 0 0 0-5.8 5.1" fill="#5C6BC0" stroke="#3949AB"></path>
      
      {/* Cloud */}
      <path d="M17 18H8.5a4.5 4.5 0 1 1 0-9h.5c0-.5.071-1 .2-1.5a5.5 5.5 0 0 1 9.78 4.194A3.5 3.5 0 1 1 17 18z" fill="#E1F5FE" stroke="#4FC3F7"></path>
    </svg>
  );
}

function CloudyIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-9 h-9 mx-auto" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" fill="#E1F5FE" stroke="#4FC3F7"/>
    </svg>
  );
}

function RainIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-9 h-9 mx-auto" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" fill="#E1F5FE" stroke="#4FC3F7"/>
      <path d="M10 19v2" stroke="#0277BD" strokeWidth="2.5"/>
      <path d="M14 19v2" stroke="#0277BD" strokeWidth="2.5"/>
    </svg>
  );
}

function ThunderstormIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-9 h-9 mx-auto" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" fill="#E1F5FE" stroke="#4FC3F7"/>
      <path d="M12 12l-2 4h4l-2 4" fill="#FFEB3B" stroke="#FBC02D"/>
    </svg>
  );
}

function SnowIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-9 h-9 mx-auto" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" fill="#E1F5FE" stroke="#4FC3F7"/>
      <path d="M12 12v6" stroke="#E0E0E0" strokeWidth="2.5"/>
      <path d="M10 14h4" stroke="#E0E0E0" strokeWidth="2.5"/>
      <path d="M10 16h4" stroke="#E0E0E0" strokeWidth="2.5"/>
    </svg>
  );
}
