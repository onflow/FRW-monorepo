import { type FirebaseOptions } from 'firebase/app';

export function getFirbaseConfig(): FirebaseOptions {
  const firebaseConfig = {
    apiKey: process.env.FB_API_KEY,
    authDomain: process.env.FB_AUTH_DOMAIN,
    databaseURL: process.env.FB_DATABASE_URL,
    projectId: process.env.FB_PROJECTID,
    storageBucket: process.env.FB_STORAGE_BUCKET,
    messagingSenderId: process.env.FB_MESSAGING_SENDER_ID,
    appId: process.env.FB_APP_ID,
    measurementId: process.env.FB_MEASUREMENT_ID,
  };

  // Only log Firebase config in development mode for debugging
  if (process.env.NODE_ENV === 'development') {
    if (firebaseConfig.apiKey) {
      console.log('[Firebase Config] API Key: loaded (length:', firebaseConfig.apiKey.length, ')');
      console.log('[Firebase Config] Project ID:', firebaseConfig.projectId || 'NOT SET');
      console.log('[Firebase Config] Auth Domain:', firebaseConfig.authDomain || 'NOT SET');
    } else {
      console.error('[Firebase Config] ❌ API Key is missing or undefined!');
      console.error('[Firebase Config] Build env:', process.env.BUILD_ENV);

      // Check if we have a placeholder value
      if (firebaseConfig.apiKey === 'PLACEHOLDER_VALUE') {
        console.error(
          '[Firebase Config] API Key is set to PLACEHOLDER_VALUE - environment variables not loaded correctly'
        );
      }
    }
  }

  return firebaseConfig;
}
