import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Returns a personalized greeting based on local time and weather conditions
 */
export function getPersonalizedGreeting(
  localtime: string,
  conditionText: string,
  conditionCode: number,
  temperature: number,
  userName?: string
): string {
  // Parse the local time
  const date = new Date(localtime);
  const hour = date.getHours();
  
  // Determine time of day
  let timeOfDay = "day";
  if (hour >= 5 && hour < 12) {
    timeOfDay = "morning";
  } else if (hour >= 12 && hour < 17) {
    timeOfDay = "afternoon";
  } else if (hour >= 17 && hour < 22) {
    timeOfDay = "evening";
  } else {
    timeOfDay = "night";
  }
  
  // Base greeting by time of day
  let greeting = "";
  switch (timeOfDay) {
    case "morning":
      greeting = "Good morning";
      break;
    case "afternoon":
      greeting = "Good afternoon";
      break;
    case "evening":
      greeting = "Good evening";
      break;
    case "night":
      greeting = "Good night";
      break;
    default:
      greeting = "Hello";
  }
  
  // Add user name if provided
  if (userName) {
    greeting += `, ${userName}`;
  }
  
  // Weather-specific messages
  let weatherMessage = "";
  
  // Determine if it's hot, cold, or moderate
  const isHot = temperature > 28;  // Above 28°C/82°F is hot
  const isCold = temperature < 10; // Below 10°C/50°F is cold
  
  // Simplified condition categorization
  const isRainy = /rain|drizzle|shower/i.test(conditionText);
  const isSnowy = /snow|blizzard|ice|sleet/i.test(conditionText);
  const isStormy = /thunder|storm|lightning/i.test(conditionText);
  const isCloudy = /cloud|overcast/i.test(conditionText) && !isRainy && !isSnowy && !isStormy;
  const isClear = /clear|sunny/i.test(conditionText);
  const isFoggy = /fog|mist|haze/i.test(conditionText);
  
  // Personalize by weather condition and temperature
  if (isStormy) {
    weatherMessage = "⚡ It's stormy outside. Stay safe!";
  } else if (isRainy) {
    weatherMessage = "🌧️ Don't forget your umbrella today!";
  } else if (isSnowy) {
    weatherMessage = "❄️ Bundle up, it's snowing!";
  } else if (isFoggy) {
    weatherMessage = "🌫️ It's foggy out there, drive carefully!";
  } else if (isClear) {
    if (isHot) {
      weatherMessage = "☀️ It's a sunny, hot day! Stay hydrated.";
    } else if (isCold) {
      weatherMessage = "☀️ It's clear but cold today. Bundle up!";
    } else {
      weatherMessage = "☀️ Enjoy the beautiful weather today!";
    }
  } else if (isCloudy) {
    weatherMessage = "☁️ It's cloudy, but no rain expected.";
  } else if (isHot) {
    weatherMessage = "🔥 It's quite hot today. Stay cool!";
  } else if (isCold) {
    weatherMessage = "❄️ It's chilly today. Dress warmly!";
  } else {
    weatherMessage = "🌈 Hope you have a great day!";
  }
  
  return `${greeting}! ${weatherMessage}`;
}

export function getHourString(hour: number): string {
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hourDisplay = hour % 12 === 0 ? 12 : hour % 12;
  return `${hourDisplay}<span class="text-xs">${ampm}</span>`;
}

export function getTemperatureColor(temp: number): string {
  if (temp >= 15) {
    return "bg-yellow-50 dark:bg-yellow-900 dark:text-yellow-100";
  } else {
    return "bg-blue-50 dark:bg-blue-900 dark:text-blue-100";
  }
}

// This function returns an SVG string for wind direction
export function getWindDirectionIcon(direction: string): string {
  const directionClass = getWindDirectionClass(direction);
  
  return `<svg 
    xmlns="http://www.w3.org/2000/svg" 
    class="h-4 w-4 mx-auto transform ${directionClass}" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    stroke-width="2" 
    stroke-linecap="round" 
    stroke-linejoin="round"
  >
    <path d="M12 19V5" />
    <path d="M5 12l7-7 7 7" />
  </svg>`;
}

export function getWindDirectionClass(direction: string): string {
  const directionMap: { [key: string]: string } = {
    'N': 'rotate-0',
    'NNE': 'rotate-[22.5deg]',
    'NE': 'rotate-45',
    'ENE': 'rotate-[67.5deg]',
    'E': 'rotate-90',
    'ESE': 'rotate-[112.5deg]',
    'SE': 'rotate-135',
    'SSE': 'rotate-[157.5deg]',
    'S': 'rotate-180',
    'SSW': 'rotate-[202.5deg]',
    'SW': 'rotate-225',
    'WSW': 'rotate-[247.5deg]',
    'W': 'rotate-270',
    'WNW': 'rotate-[292.5deg]',
    'NW': 'rotate-315',
    'NNW': 'rotate-[337.5deg]',
  };
  
  return directionMap[direction] || 'rotate-0';
}
