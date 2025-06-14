// API Keys and configuration for NoteBazaar

export const API_CONFIG = {
  // Backend API URL (update as needed)
  API_BASE_URL: process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:3000',

  // NoteBazaar branding
  APP_NAME: 'NoteBazaar',
  SUPPORT_EMAIL: 'support@notebazaar.org',
  SUPPORT_PHONE: '+977-XXXXXXXXXX',

  // (Removed old disaster/donation keys, e.g. SENDGRID, TWILIO, etc.)
  // (If you need to add new keys, e.g. for Stripe, add them here.)
  // STRIPE_PUBLISHABLE_KEY: process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY || '',
}; 