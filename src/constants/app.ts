// General application constants

export const APP_CONFIG = {
  NAME: 'ConstructPro',
  VERSION: '1.0.0',
  DESCRIPTION: 'Professional Construction Project Management Platform',
  COMPANY: 'Vovelet-Tech',
  SUPPORT_EMAIL: 'support@constructpro.com',
  WEBSITE: 'https://constructpro.com',
} as const;

export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system',
} as const;

export const LANGUAGES = {
  EN: 'en',
  TR: 'tr',
  ES: 'es',
  FR: 'fr',
  DE: 'de',
} as const;

export const DATE_FORMATS = {
  SHORT: 'MM/dd/yyyy',
  LONG: 'MMMM dd, yyyy',
  WITH_TIME: 'MM/dd/yyyy HH:mm',
  ISO: 'yyyy-MM-dd',
  TIME_ONLY: 'HH:mm',
} as const;

export const FILE_LIMITS = {
  MAX_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_TYPES: [
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ],
} as const;

export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
} as const;

export const LOCAL_STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_PREFERENCES: 'user_preferences',
  THEME: 'theme',
  LANGUAGE: 'language',
} as const;

export const SESSION_STORAGE_KEYS = {
  CURRENT_PROJECT: 'current_project',
  FORM_DATA: 'form_data',
  NAVIGATION_STATE: 'navigation_state',
} as const;

export const BREAKPOINTS = {
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
  '2XL': 1536,
} as const;

export const ANIMATION_DURATIONS = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
} as const;