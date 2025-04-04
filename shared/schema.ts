import { pgTable, text, serial, numeric, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const weatherLocations = pgTable("weather_locations", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  latitude: numeric("latitude").notNull(),
  longitude: numeric("longitude").notNull(),
  isDefault: boolean("is_default").default(false),
});

export const insertWeatherLocationSchema = createInsertSchema(weatherLocations).pick({
  name: true,
  latitude: true,
  longitude: true,
  isDefault: true,
});

export type InsertWeatherLocation = z.infer<typeof insertWeatherLocationSchema>;
export type WeatherLocation = typeof weatherLocations.$inferSelect;

// Keep the user schema for compatibility
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
