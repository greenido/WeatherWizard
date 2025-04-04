import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import axios from "axios";
import { WeatherData, WeatherSearchResult } from "./types";
import { ParsedQs } from 'qs';

const WEATHER_API_KEY = process.env.WEATHER_API_KEY;
const WEATHER_API_BASE_URL = "https://api.weatherapi.com/v1";

// Helper function to safely convert query parameter to string
const getQueryParamAsString = (param: string | string[] | ParsedQs | ParsedQs[] | undefined): string => {
  if (typeof param === 'string') return param;
  if (Array.isArray(param)) return param[0] || '';
  if (param && typeof param === 'object') return String(param);
  return '';
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Weather forecast endpoint
  app.get('/api/weather/forecast', async (req, res) => {
    try {
      const { lat, lon, days = 3 } = req.query;
      
      if (!lat || !lon) {
        return res.status(400).json({ message: "Latitude and longitude are required" });
      }
      
      // Ensure days is a number between 1 and 10
      const forecastDays = Math.min(Math.max(Number(days) || 3, 1), 10);
      
      const { data } = await axios.get<WeatherData>(`${WEATHER_API_BASE_URL}/forecast.json`, {
        params: {
          key: WEATHER_API_KEY,
          q: `${getQueryParamAsString(lat)},${getQueryParamAsString(lon)}`,
          days: forecastDays,
          aqi: "yes",
          alerts: "no"
        }
      });
      
      console.log("Weather API response - Forecast sample:", {
        current_temp: data.current.temp_c,
        dates: data.forecast.forecastday.map(day => ({
          date: day.date,
          max_temp: day.day.maxtemp_c,
          min_temp: day.day.mintemp_c
        }))
      });
      
      res.json(data);
    } catch (error: any) {
      console.error("Weather API error:", error.response?.data || error.message);
      res.status(500).json({ 
        message: "Failed to fetch weather data",
        error: error.response?.data?.error?.message || error.message
      });
    }
  });
  
  // Location search endpoint
  app.get('/api/weather/search', async (req, res) => {
    try {
      const { query } = req.query;
      
      if (!query || typeof query !== 'string') {
        return res.status(400).json({ message: "Search query is required" });
      }
      
      const { data } = await axios.get<WeatherSearchResult[]>(`${WEATHER_API_BASE_URL}/search.json`, {
        params: {
          key: WEATHER_API_KEY,
          q: query
        }
      });
      
      res.json(data);
    } catch (error: any) {
      console.error("Weather API search error:", error.response?.data || error.message);
      res.status(500).json({ 
        message: "Failed to search locations",
        error: error.response?.data?.error?.message || error.message
      });
    }
  });
  
  // Get location name from coordinates
  app.get('/api/weather/location', async (req, res) => {
    try {
      const { lat, lon } = req.query;
      
      if (!lat || !lon) {
        return res.status(400).json({ message: "Latitude and longitude are required" });
      }
      
      const { data } = await axios.get<WeatherData>(`${WEATHER_API_BASE_URL}/forecast.json`, {
        params: {
          key: WEATHER_API_KEY,
          q: `${lat},${lon}`,
          days: 1,
          aqi: "no",
          alerts: "no"
        }
      });
      
      res.json({
        name: data.location.name,
        country: data.location.country,
        region: data.location.region,
        lat: data.location.lat,
        lon: data.location.lon
      });
    } catch (error: any) {
      console.error("Weather API location error:", error.response?.data || error.message);
      res.status(500).json({ 
        message: "Failed to get location information",
        error: error.response?.data?.error?.message || error.message
      });
    }
  });

  const httpServer = createServer(app);
  
  return httpServer;
}
