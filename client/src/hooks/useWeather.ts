import { useQuery } from "@tanstack/react-query";
import { WeatherData } from "@/types/weather";

// Cache duration constants
const CACHE_DURATION = 1000 * 60 * 60; // 1 hour
const STALE_TIME = 1000 * 60 * 60; // 1 hour
const GC_TIME = 1000 * 60 * 60 * 2; // 2 hours

// In-memory cache to prevent duplicate requests
const requestCache = new Map<string, Promise<WeatherData>>();

export function useWeather(lat?: number, lon?: number, isExtended: boolean = false) {
  // Request 8 days to ensure we have enough data for both modes
  const daysToRequest = 8;
  
  return useQuery<WeatherData>({
    queryKey: ['/api/weather/forecast', lat, lon, daysToRequest],
    queryFn: async () => {
      if (!lat || !lon) throw new Error("Location coordinates are required");
      
      const cacheKey = `${lat},${lon},${daysToRequest}`;
      
      // Check if we already have a pending request for this location
      if (requestCache.has(cacheKey)) {
        return requestCache.get(cacheKey)!;
      }
      
      // Create a new request
      const request = fetch(
        `/api/weather/forecast?lat=${lat}&lon=${lon}&days=${daysToRequest}`,
        {
          headers: {
            'Cache-Control': `public, max-age=${CACHE_DURATION / 1000}`, // Cache for 1 hour
          }
        }
      ).then(async (res) => {
        if (!res.ok) {
          throw new Error("Failed to fetch weather data");
        }
        return res.json();
      }).finally(() => {
        // Clean up the request from cache after it's done
        requestCache.delete(cacheKey);
      });
      
      // Store the request in cache
      requestCache.set(cacheKey, request);
      
      return request;
    },
    enabled: !!lat && !!lon, // Only enable the query when we have valid coordinates
    staleTime: STALE_TIME, // Consider data stale after 1 hour
    gcTime: GC_TIME, // Keep unused data in cache for 2 hours
    refetchOnMount: false, // Don't refetch every time component mounts
    refetchOnWindowFocus: false, // Don't refetch when window regains focus
    retry: 1, // Only retry failed requests once
    refetchInterval: false, // Disable automatic refetching
    refetchIntervalInBackground: false, // Don't refetch when tab is in background
    refetchOnReconnect: false, // Don't refetch when reconnecting
  });
}
