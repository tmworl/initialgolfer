// src/services/supabase.js

import { createClient } from "@supabase/supabase-js";
import AsyncStorage from "@react-native-async-storage/async-storage";
import 'react-native-url-polyfill/auto'; // Required polyfill for React Native environments

// Project credentials
const SUPABASE_URL = "https://mxqhgktcdmymmwbsbfws.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im14cWhna3RjZG15bW13YnNiZndzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg1OTIxMTMsImV4cCI6MjA1NDE2ODExM30.7ElhxIdCyfvZEL038YKqoKXUo8P9FQ_TF1EbpiKdPzA";

/**
 * Custom AsyncStorage Adapter for Supabase
 * 
 * Creates a storage interface that follows the required pattern for Supabase
 * while leveraging AsyncStorage for persistence. This enables session data
 * to survive across app restarts.
 */
const createAsyncStorageAdapter = () => {
  return {
    getItem: async (key) => {
      try {
        const value = await AsyncStorage.getItem(key);
        return value;
      } catch (error) {
        // Robust error handling for storage corruption scenarios
        console.error("Storage read error:", error);
        return null;
      }
    },
    setItem: async (key, value) => {
      try {
        await AsyncStorage.setItem(key, value);
      } catch (error) {
        console.error("Storage write error:", error);
        // Storage failures should be non-fatal but logged
      }
    },
    removeItem: async (key) => {
      try {
        await AsyncStorage.removeItem(key);
      } catch (error) {
        console.error("Storage removal error:", error);
      }
    }
  };
};

/**
 * Enhanced Supabase client with persistence capabilities
 * 
 * This configuration enables:
 * 1. Session persistence across app restarts
 * 2. Automatic token refresh
 * 3. Clean URL handling for React Native environment
 */
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: createAsyncStorageAdapter(),
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false // Disable for React Native - we handle deep links separately
  }
});