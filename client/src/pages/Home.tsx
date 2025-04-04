import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import SearchLocationModal from "@/components/SearchLocationModal";
import WeatherContent from "@/components/WeatherContent";
import ThemeToggle from "@/components/ThemeToggle";
import TemperatureUnitToggle from "@/components/TemperatureUnitToggle";
import { useWeather } from "@/hooks/useWeather";
import { getSavedLocations, saveLocations, setFavoriteLocation, getFavoriteLocation, removeLocation } from "@/lib/localStorage";
import { Location } from "@/types/weather";

export default function Home() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [extendedForecast, setExtendedForecast] = useState(false);
  const [isCelsius, setIsCelsius] = useState(() => {
    // Load temperature unit preference from localStorage
    const savedUnit = localStorage.getItem('temperatureUnit');
    return savedUnit ? savedUnit === 'celsius' : true; // Default to Celsius if no preference
  });
  const { toast } = useToast();
  
  // Get coordinates directly from currentLocation
  const coords = {
    lat: currentLocation?.lat,
    lon: currentLocation?.lon
  };

  const { data: weatherData, isLoading, error } = useWeather(
    coords.lat,
    coords.lon,
    extendedForecast
  );

  // Get the current hour
  const currentHour = new Date().getHours();
  
  // Process forecast data
  const filteredForecast = weatherData?.forecast?.forecastday
    ? weatherData.forecast.forecastday
        .slice(0, extendedForecast ? 10 : 4)
        .map(day => ({
          ...day,
          dayName: new Date(day.date).toLocaleDateString('en-US', { weekday: 'long' }),
          hours: day.date === weatherData.forecast.forecastday[0].date 
            ? day.hour.filter(hour => {
                const hourDate = new Date(hour.time);
                const now = new Date();
                return hourDate > now;
              })
            : day.hour
        }))
    : [];

  // Get current hour's weather from the API data
  const currentHourWeather = weatherData?.forecast?.forecastday?.[0]?.hour?.find(
    hour => {
      const hourDate = new Date(hour.time);
      const now = new Date();
      return hourDate.getHours() === now.getHours() && 
             hourDate.getDate() === now.getDate() &&
             hourDate.getMonth() === now.getMonth();
    }
  );

  // Temperature conversion functions
  const convertTemp = (tempC: number) => {
    if (!tempC) return 0;
    return isCelsius ? Math.round(tempC) : Math.round((tempC * 9/5) + 32);
  };

  const getTempUnit = () => {
    return isCelsius ? "°C" : "°F";
  };

  const handleTempUnitToggle = () => {
    const newUnit = !isCelsius;
    setIsCelsius(newUnit);
    // Save temperature unit preference to localStorage
    localStorage.setItem('temperatureUnit', newUnit ? 'celsius' : 'fahrenheit');
  };

  // Load saved locations on mount
  useEffect(() => {
    const savedLocations = getSavedLocations();
    
    if (savedLocations.length > 0) {
      setLocations(savedLocations);
      const defaultLocation = savedLocations.find((loc) => loc.isDefault) || savedLocations[0];
      // Only update if location is different to prevent unnecessary re-renders
      if (!currentLocation || 
          currentLocation.lat !== defaultLocation.lat || 
          currentLocation.lon !== defaultLocation.lon) {
        setCurrentLocation(defaultLocation);
      }
    } else {
      // Request geolocation if no saved locations
      requestGeolocation();
    }
  }, []);

  const requestGeolocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          
          // Fetch location name from coordinates
          fetch(`/api/weather/location?lat=${latitude}&lon=${longitude}`)
            .then((res) => res.json())
            .then((data) => {
              const newLocation: Location = {
                name: data.name,
                lat: latitude,
                lon: longitude,
                isDefault: true,
              };
              
              setLocations([newLocation]);
              setCurrentLocation(newLocation);
              saveLocations([newLocation]);
            })
            .catch(() => {
              toast({
                title: "Error",
                description: "Failed to get your location name. Please try again or add a location manually.",
                variant: "destructive",
              });
            });
        },
        (error) => {
          console.error("Geolocation error:", error);
          toast({
            title: "Location unavailable",
            description: "Please allow location access or add a location manually.",
            variant: "destructive",
          });
          setIsSearchOpen(true);
        }
      );
    } else {
      toast({
        title: "Geolocation not supported",
        description: "Your browser doesn't support geolocation. Please add a location manually.",
        variant: "destructive",
      });
      setIsSearchOpen(true);
    }
  };

  const handleLocationChange = (locationId: string) => {
    const location = locations.find((loc) => `${loc.lat}-${loc.lon}` === locationId);
    if (location) {
      setCurrentLocation(location);
    }
  };

  const handleAddLocation = () => {
    setIsSearchOpen(true);
  };

  const handleSelectLocation = (location: Location) => {
    const existingLocation = locations.find(
      (loc) => loc.lat === location.lat && loc.lon === location.lon
    );

    if (!existingLocation) {
      const newLocations = [...locations, location];
      setLocations(newLocations);
      setCurrentLocation(location);
      saveLocations(newLocations);
      toast({
        title: "Location added",
        description: `${location.name} has been added to your locations.`,
      });
    } else {
      setCurrentLocation(existingLocation);
      toast({
        title: "Location exists",
        description: `${location.name} is already in your locations.`,
      });
    }
    
    setIsSearchOpen(false);
  };
  
  // Function to handle location removal
  const handleRemoveLocation = (location: Location) => {
    if (location) {
      // Check if we're removing the default location
      const isDefault = location.isDefault;
      
      // Remove the location from storage
      const updatedLocations = removeLocation(location);
      
      // Update state with the new locations
      setLocations(updatedLocations);
      
      // If we removed the current location, select a new one
      if (currentLocation && currentLocation.lat === location.lat && currentLocation.lon === location.lon) {
        const newCurrentLocation = updatedLocations.length > 0 ? updatedLocations[0] : null;
        
        // If we removed the default location and have other locations, set a new default
        if (isDefault && newCurrentLocation) {
          newCurrentLocation.isDefault = true;
          setFavoriteLocation(newCurrentLocation);
        }
        
        setCurrentLocation(newCurrentLocation);
      }
      
      toast({
        title: "Location removed",
        description: `${location.name} has been removed from your locations.`,
      });
      
      // If no locations left, prompt to add a location
      if (updatedLocations.length === 0) {
        toast({
          title: "No locations",
          description: "Please add a location to see weather data.",
        });
        setIsSearchOpen(true);
      }
    }
  };
  
  // Function to update locations list after a favorite is set
  const updateLocationsAfterFavorite = () => {
    const savedLocations = getSavedLocations();
    setLocations(savedLocations);
    // Update current location if it's the one that was set as favorite
    if (currentLocation) {
      const updatedCurrentLocation = savedLocations.find(
        loc => loc.lat === currentLocation.lat && loc.lon === currentLocation.lon
      );
      if (updatedCurrentLocation) {
        setCurrentLocation(updatedCurrentLocation);
      }
    }
  };

  const formatLastUpdated = () => {
    if (weatherData?.current?.last_updated) {
      const date = new Date(weatherData.current.last_updated);
      return date.toLocaleString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
      });
    }
    return "N/A";
  };

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-4 py-4 sm:py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold dark:text-white">Forecast ☀️ Fusion</h1>
          <div className="flex gap-2">
            <ThemeToggle />
            <button
              onClick={handleTempUnitToggle}
              className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 transition-colors"
              title={`Switch to ${isCelsius ? 'Fahrenheit' : 'Celsius'}`}
            >
              {isCelsius ? '°C' : '°F'}
            </button>
          </div>
        </div>
        
        <div className="flex w-full sm:w-auto flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
          {/* Location selector */}
          <div className="flex items-center gap-2 w-full">
            {/* Location dropdown */}
            <div className="relative flex-1 sm:w-64 md:w-72">
              <select
                className="appearance-none bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-lg py-2 px-3 sm:px-4 pr-8 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full text-sm sm:text-base dark:text-gray-200"
                value={currentLocation ? `${currentLocation.lat}-${currentLocation.lon}` : ""}
                onChange={(e) => handleLocationChange(e.target.value)}
              >
                {locations.map((location) => (
                  <option
                    key={`${location.lat}-${location.lon}`}
                    value={`${location.lat}-${location.lon}`}
                  >
                    {location.name} {location.isDefault ? "★" : ""}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            
            {/* Favorite button */}
            <button
              onClick={() => {
                if (currentLocation) {
                  setFavoriteLocation(currentLocation);
                  toast({
                    title: "Favorite location set",
                    description: `${currentLocation.name} has been set as your default location.`,
                  });
                  updateLocationsAfterFavorite();
                }
              }}
              disabled={!currentLocation}
              className={`p-2 rounded-lg ${
                currentLocation?.isDefault
                  ? "bg-yellow-100 dark:bg-yellow-900 text-yellow-600 dark:text-yellow-300"
                  : "bg-gray-100 hover:bg-yellow-50 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300"
              } transition-colors`}
              title="Set as default location"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill={currentLocation?.isDefault ? "currentColor" : "none"}
                stroke="currentColor"
                className="w-5 h-5"
                strokeWidth={currentLocation?.isDefault ? "0" : "2"}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
                />
              </svg>
            </button>
            
            {/* Remove location button */}
            <button
              onClick={() => {
                if (currentLocation && locations.length > 1) {
                  handleRemoveLocation(currentLocation);
                } else if (currentLocation) {
                  toast({
                    title: "Cannot remove location",
                    description: "You need to have at least one location. Add a new location before removing this one.",
                    variant: "destructive",
                  });
                }
              }}
              disabled={!currentLocation}
              className="p-2 rounded-lg bg-gray-100 hover:bg-red-50 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-600 hover:text-red-500 dark:text-gray-300 dark:hover:text-red-400 transition-colors"
              title="Remove location"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                className="w-5 h-5"
              >
                <path d="M3 6h18"></path>
                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                <line x1="10" y1="11" x2="10" y2="17"></line>
                <line x1="14" y1="11" x2="14" y2="17"></line>
              </svg>
            </button>
            
            {/* Add location button */}
            <button
              className="bg-blue-500 hover:bg-blue-600 text-white font-medium p-2 rounded-lg transition-colors duration-200 flex items-center justify-center"
              onClick={handleAddLocation}
              aria-label="Add location"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Search Modal */}
      <SearchLocationModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelect={handleSelectLocation}
      />

      {/* Weather Content */}
      {isLoading ? (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-8 flex justify-center items-center min-h-[400px]">
          <div className="text-center dark:text-gray-200">
            <div className="inline-block animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mb-4"></div>
            <p>Loading weather data...</p>
          </div>
        </div>
      ) : error ? (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-8 flex justify-center items-center min-h-[400px]">
          <div className="text-center text-red-500 dark:text-red-400">
            <p className="font-bold text-lg mb-2">Failed to load weather data</p>
            <p>Please try again later or select a different location.</p>
          </div>
        </div>
      ) : weatherData ? (
        <div className="space-y-6">
          {/* Current Weather */}
          {currentHourWeather && (
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4 dark:text-white">Current Weather</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-4">
                  <img
                    src={currentHourWeather.condition.icon}
                    alt={currentHourWeather.condition.text}
                    className="w-16 h-16"
                  />
                  <div>
                    <p className="text-3xl font-bold dark:text-white">
                      {convertTemp(currentHourWeather.temp_c)}{getTempUnit()}
                    </p>
                    <p className="text-gray-600 dark:text-gray-300">
                      {currentHourWeather.condition.text}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Feels Like</p>
                    <p className="text-lg font-medium dark:text-white">
                      {convertTemp(currentHourWeather.feelslike_c)}{getTempUnit()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Humidity</p>
                    <p className="text-lg font-medium dark:text-white">
                      {currentHourWeather.humidity}%
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Wind</p>
                    <p className="text-lg font-medium dark:text-white">
                      {currentHourWeather.wind_kph} km/h
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Precipitation</p>
                    <p className="text-lg font-medium dark:text-white">
                      {currentHourWeather.precip_mm} mm
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Forecast */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4 dark:text-white">
              {extendedForecast ? "7-Day Forecast" : "4-Day Forecast"}
            </h2>
            <div className="space-y-6">
              {filteredForecast.map((day) => {
                // Calculate background color based on wind speed
                const windSpeed = day.day.maxwind_kph;
                const bgColor = windSpeed > 30 
                  ? "bg-red-100 dark:bg-red-900" 
                  : windSpeed > 20 
                    ? "bg-orange-100 dark:bg-orange-900" 
                    : "bg-gray-50 dark:bg-slate-700";
                
                return (
                  <div key={day.date} className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className={`text-lg font-semibold dark:text-white ${
                        (isCelsius && day.day.maxtemp_c > 35) || (!isCelsius && day.day.maxtemp_f > 95) 
                          ? 'bg-red-500 text-white px-2 py-1 rounded' 
                          : ''
                      }`}>
                        {(() => {
                          const date = new Date(day.date);
                          // Add timezone offset to get correct local date
                          date.setMinutes(date.getMinutes() + date.getTimezoneOffset());
                          return date.toLocaleDateString('en-US', {
                            weekday: 'long',
                            month: 'short', 
                            day: 'numeric'
                          });
                        })()}
                      </h3>
                      <div className="flex items-center space-x-2">
                        <img
                          src={day.day.condition.icon}
                          alt={day.day.condition.text}
                          className="w-8 h-8"
                        />
                        <div>
                          <p className="text-lg font-bold dark:text-white">
                            {convertTemp(day.day.maxtemp_c)}{getTempUnit()}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            {convertTemp(day.day.mintemp_c)}{getTempUnit()}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                      {day.hours.map((hour) => (
                        <div
                          key={hour.time}
                          className={`${bgColor} rounded-lg p-3`}
                        >
                          <p className="text-sm font-medium dark:text-white">
                            {new Date(hour.time).toLocaleTimeString('en-US', {
                              hour: 'numeric',
                              hour12: true
                            })}
                          </p>
                          <div className="flex items-center space-x-2 mt-2">
                            <img
                              src={hour.condition.icon}
                              alt={hour.condition.text}
                              className="w-8 h-8"
                            />
                            <p className="text-lg font-bold dark:text-white">
                              {convertTemp(hour.temp_c)}{getTempUnit()}
                            </p>
                          </div>
                          <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                            {hour.condition.text}
                          </p>
                          <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                            Wind: {hour.wind_kph} km/h
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Forecast Summary */}
            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-4 dark:text-white">10-Day Forecast Summary</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {weatherData?.forecast?.forecastday.map((day) => (
                  <div
                    key={day.date}
                    className="bg-gray-50 dark:bg-slate-700 rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h4 className="font-medium dark:text-white">
                          {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                        </h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {new Date(day.date).toLocaleDateString('en-US', { 
                            month: 'short',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                      <img
                        src={day.day.condition.icon}
                        alt={day.day.condition.text}
                        className="w-10 h-10"
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500 dark:text-gray-400">High / Low</span>
                        <div className="text-right">
                          <span className="text-sm font-medium dark:text-white">
                            {convertTemp(day.day.maxtemp_c)}{getTempUnit()}
                          </span>
                          <span className="text-sm text-gray-500 dark:text-gray-400 mx-1">/</span>
                          <span className="text-sm font-medium dark:text-white">
                            {convertTemp(day.day.mintemp_c)}{getTempUnit()}
                          </span>
                        </div>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500 dark:text-gray-400">Conditions</span>
                        <span className="text-sm font-medium dark:text-white text-right">
                          {day.day.condition.text}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500 dark:text-gray-400">Wind</span>
                        <span className="text-sm font-medium dark:text-white">
                          {day.day.maxwind_kph} km/h
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500 dark:text-gray-400">Precip</span>
                        <span className="text-sm font-medium dark:text-white">
                          {day.day.totalprecip_mm} mm
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500 dark:text-gray-400">Humidity</span>
                        <span className="text-sm font-medium dark:text-white">
                          {day.day.avghumidity}%
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-8 flex justify-center items-center min-h-[400px]">
          <p className="dark:text-gray-300">Select a location to see weather forecast</p>
        </div>
      )}

      {/* Forecast toggle */}
      <div className="mt-6 flex justify-center">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-2 inline-flex items-center">
          <div className="text-sm text-gray-500 dark:text-gray-400 mr-3 font-medium hidden sm:block">Forecast range:</div>
          <button
            onClick={() => setExtendedForecast(false)}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              !extendedForecast
                ? "bg-blue-500 text-white shadow-sm"
                : "bg-transparent text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700"
            }`}
          >
            <span className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
              </svg>
              Standard (4 days)
            </span>
          </button>
          <button
            onClick={() => setExtendedForecast(true)}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              extendedForecast
                ? "bg-indigo-500 text-white shadow-sm"
                : "bg-transparent text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700"
            }`}
          >
            <span className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
              Extended (7 days)
            </span>
          </button>
        </div>
      </div>
      
      {/* Footer */}
      <div className="mt-4 text-sm text-gray-500 dark:text-gray-400 text-center">
        <p>Data from WeatherAPI • Last updated: {formatLastUpdated()}</p>
      </div>
    </div>
  );
}
