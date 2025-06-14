import { Platform } from 'react-native';

export const API_CONFIG = {
  development: {
    // Use 10.0.2.2 for Android emulator, localhost for iOS simulator
    baseUrl: Platform.select({
      android: 'http://10.0.2.2:3000',
      ios: 'http://localhost:3000',
      default: 'http://localhost:3000'
    }),
  },
  production: {
    baseUrl: 'https://nepaldisastermanagement-production.up.railway.app',
  },
};

// Get the current environment
const ENV = process.env.NODE_ENV || 'development';

// Export the current configuration
export const API_URL = API_CONFIG[ENV].baseUrl;

// Add a default export to satisfy expo-router
const config = {
  API_CONFIG,
  API_URL
};

export default config;