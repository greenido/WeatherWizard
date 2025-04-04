import { Location } from "@/types/weather";

const STORAGE_KEY = "weatherLocations";
const FAVORITE_LOCATION_KEY = "favoriteWeatherLocation";

export function getSavedLocations(): Location[] {
  try {
    const storedData = localStorage.getItem(STORAGE_KEY);
    if (storedData) {
      return JSON.parse(storedData);
    }
  } catch (error) {
    console.error("Error reading locations from localStorage:", error);
  }
  return [];
}

export function saveLocations(locations: Location[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(locations));
  } catch (error) {
    console.error("Error saving locations to localStorage:", error);
  }
}

export function clearLocations(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error("Error clearing locations from localStorage:", error);
  }
}

export function removeLocation(location: Location): Location[] {
  try {
    const locations = getSavedLocations();
    
    // Filter out the location to remove
    const updatedLocations = locations.filter(
      loc => !(loc.lat === location.lat && loc.lon === location.lon)
    );
    
    // Save the updated locations
    saveLocations(updatedLocations);
    
    return updatedLocations;
  } catch (error) {
    console.error("Error removing location:", error);
    return getSavedLocations(); // Return current locations if removal failed
  }
}

export function setFavoriteLocation(location: Location): void {
  try {
    // Get current locations
    const locations = getSavedLocations();
    
    // Update all locations to set isDefault to false
    const updatedLocations = locations.map(loc => ({
      ...loc,
      isDefault: loc.lat === location.lat && loc.lon === location.lon
    }));
    
    // Save updated locations
    saveLocations(updatedLocations);
  } catch (error) {
    console.error("Error setting favorite location:", error);
  }
}

export function getFavoriteLocation(): Location | null {
  try {
    const locations = getSavedLocations();
    return locations.find(location => location.isDefault) || null;
  } catch (error) {
    console.error("Error getting favorite location:", error);
    return null;
  }
}
