export interface ScreenAssets {
  sendStaticImage?: any;
}

// Export the static image - this will be overridden by React Native app if needed
let sendStaticImage: any;

try {
  // First try to load from the current package (for web/extension)
  sendStaticImage = require('./send_static.png');
} catch {
  // Fallback for React Native - app should override this
  sendStaticImage = null;
}

export { sendStaticImage };