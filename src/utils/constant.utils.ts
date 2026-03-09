import { Platform } from 'react-native';

export const AUTH0 = {
  CUSTOM_SCHEME: process.env.EXPO_PUBLIC_AUTH0_CUSTOM_SCHEME,
  DOMAIN: process.env.EXPO_PUBLIC_AUTH0_DOMAIN,
  CLIENT_ID: process.env.EXPO_PUBLIC_AUTH0_CLIENT_ID,
} as const;

export const FINNHUB = {
  TOKEN: process.env.EXPO_PUBLIC_FINNHUB_TOKEN,
  BASE_URL: 'https://finnhub.io/api/v1',
  WS_URL: 'wss://ws.finnhub.io',
} as const;

export const IS_IOS = Platform.OS === 'ios';