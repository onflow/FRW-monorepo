import { Image } from 'react-native';

/**
 * Utility for injecting dynamic images into Lottie animations
 * This addresses the limitations of lottie-react-native with runtime asset replacement
 */

interface LottieAsset {
  id: string;
  w: number;
  h: number;
  u: string;
  p: string;
  e: number;
  t?: string;
}

interface LottieAnimationData {
  assets: LottieAsset[];
  [key: string]: any;
}

/**
 * Converts an image URL to base64 data URI
 * This is the most reliable method for runtime image injection in React Native Lottie
 */
export const imageToBase64DataUri = async (imageUri: string): Promise<string | null> => {
  try {
    const response = await fetch(imageUri);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const blob = await response.blob();

    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onloadend = () => {
        const base64 = reader.result as string;
        resolve(base64);
      };

      reader.onerror = () => {
        reject(new Error('Failed to convert image to base64'));
      };

      reader.readAsDataURL(blob);
    });
  } catch (error) {
    return null;
  }
};

/**
 * Preloads an image to ensure it's available before converting to base64
 */
export const preloadImage = (uri: string): Promise<boolean> => {
  return new Promise(resolve => {
    Image.prefetch(uri)
      .then(() => {
        resolve(true);
      })
      .catch(() => {
        resolve(false);
      });
  });
};

/**
 * Injects a base64 image into a Lottie animation's asset
 * This is the most reliable method for React Native
 */
export const injectImageIntoLottieAsset = async (
  animationData: LottieAnimationData,
  assetId: string,
  imageUri: string
): Promise<LottieAnimationData> => {
  try {
    // Clone the animation data
    const clonedData = JSON.parse(JSON.stringify(animationData));

    // Find the target asset
    const asset = clonedData.assets?.find((a: LottieAsset) => a.id === assetId);
    if (!asset) {
      return clonedData;
    }

    // Try base64 embedding (most reliable)
    const base64DataUri = await imageToBase64DataUri(imageUri);
    if (base64DataUri) {
      // Update asset for base64 embedding
      asset.p = base64DataUri;
      asset.u = ''; // Clear path prefix
      asset.e = 1; // Mark as embedded
      asset.t = 'base64'; // Custom flag for our tracking

      return clonedData;
    }

    // Method 2: Direct URL replacement (may not work in all cases)
    asset.p = imageUri;
    asset.u = '';
    asset.e = 1;

    return clonedData;
  } catch (error) {
    return animationData; // Return original on error
  }
};

/**
 * Enhanced injection with multiple fallback methods
 */
export const injectImageWithFallbacks = async (
  animationData: LottieAnimationData,
  assetId: string,
  imageUri: string
): Promise<{
  animationData: LottieAnimationData;
  method: 'base64' | 'url' | 'failed';
  success: boolean;
}> => {
  try {
    const clonedData = JSON.parse(JSON.stringify(animationData));
    const asset = clonedData.assets?.find((a: LottieAsset) => a.id === assetId);

    if (!asset) {
      return { animationData: clonedData, method: 'failed', success: false };
    }

    // Step 1: Preload the image
    const preloaded = await preloadImage(imageUri);
    if (!preloaded) {
      // Continue anyway
    }

    // Step 2: Try base64 embedding
    const base64DataUri = await imageToBase64DataUri(imageUri);

    if (base64DataUri) {
      asset.p = base64DataUri;
      asset.u = '';
      asset.e = 1;

      return { animationData: clonedData, method: 'base64', success: true };
    }

    // Step 3: Fallback to direct URL
    asset.p = imageUri;
    asset.u = '';
    asset.e = 1;

    return { animationData: clonedData, method: 'url', success: true };
  } catch (error) {
    return { animationData, method: 'failed', success: false };
  }
};

/**
 * Validates that an image URI is accessible
 */
export const validateImageUri = async (uri: string): Promise<boolean> => {
  try {
    const response = await fetch(uri, { method: 'HEAD' });
    return response.ok;
  } catch {
    return false;
  }
};
