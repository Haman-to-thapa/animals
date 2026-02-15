import { Platform } from 'react-native';

// Android emulator requires 10.0.2.2 to access localhost
// iOS simulator uses localhost
const DEV_API_URL = 'http://localhost:4001';

// Replace with your actual production URL
const PROD_API_URL = 'https://api.example.com';

export const API_BASE_URL = __DEV__ ? DEV_API_URL : PROD_API_URL;
