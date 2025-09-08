import { Buffer } from 'buffer';
import { Image, Platform } from 'react-native';

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
 * Uses Buffer API for reliable cross-platform base64 encoding
 */
export const imageToBase64DataUri = async (imageUri: string): Promise<string | null> => {
  try {
    console.log('[ImageInjection] Converting image to base64 on', Platform.OS, ':', imageUri);

    // Fetch image and convert to base64 using Buffer (reliable on all platforms)
    try {
      const response = await fetch(imageUri, {
        method: 'GET',
        // Add headers that might help with CORS and caching
        headers: {
          Accept: 'image/*',
          'Cache-Control': 'no-cache',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      // Use Buffer for reliable base64 encoding (works on all React Native platforms)
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const base64 = buffer.toString('base64');

      // Detect content type from URL or default to PNG
      let mimeType = 'image/png';
      if (imageUri.includes('.jpg') || imageUri.includes('.jpeg')) {
        mimeType = 'image/jpeg';
      } else if (imageUri.includes('.gif')) {
        mimeType = 'image/gif';
      } else if (imageUri.includes('.webp')) {
        mimeType = 'image/webp';
      }

      const dataUri = `data:${mimeType};base64,${base64}`;
      console.log('[ImageInjection] Successfully converted to base64, length:', dataUri.length);
      return dataUri;
    } catch (bufferError) {
      console.log('[ImageInjection] Buffer method failed, trying blob fallback:', bufferError);

      // Fallback to blob method (might not work on all iOS versions)
      const response = await fetch(imageUri);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const blob = await response.blob();

      return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onloadend = () => {
          const base64 = reader.result as string;
          console.log('[ImageInjection] Blob method successful, length:', base64?.length || 0);
          resolve(base64);
        };

        reader.onerror = () => {
          console.log('[ImageInjection] FileReader failed');
          reject(new Error('Failed to convert image to base64'));
        };

        reader.readAsDataURL(blob);
      });
    }
  } catch (error) {
    console.log('[ImageInjection] All base64 conversion methods failed:', error);
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
 * iOS-optimized version with better error handling and logging
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
    console.log(`[ImageInjection] Starting injection on ${Platform.OS} for asset:`, assetId);

    const clonedData = JSON.parse(JSON.stringify(animationData));
    const asset = clonedData.assets?.find((a: LottieAsset) => a.id === assetId);

    if (!asset) {
      console.log('[ImageInjection] Asset not found:', assetId);
      return { animationData: clonedData, method: 'failed', success: false };
    }

    console.log('[ImageInjection] Found asset:', {
      id: asset.id,
      width: asset.w,
      height: asset.h,
      originalPath: asset.p,
      originalUrl: asset.u,
    });

    // Step 1: Preload the image
    console.log('[ImageInjection] Preloading image...');
    const preloaded = await preloadImage(imageUri);
    console.log('[ImageInjection] Preload result:', preloaded);

    // Step 2: Try base64 embedding (most reliable for iOS)
    console.log('[ImageInjection] Attempting base64 conversion...');
    const base64DataUri = await imageToBase64DataUri(imageUri);

    if (base64DataUri) {
      asset.p = base64DataUri;
      asset.u = '';
      asset.e = 1;

      console.log('[ImageInjection] ✅ Base64 injection successful');
      return { animationData: clonedData, method: 'base64', success: true };
    }

    // Step 3: Fallback to direct URL (less reliable but worth trying)
    console.log('[ImageInjection] Base64 failed, trying direct URL method...');

    // For iOS, we might need to ensure the URL is properly formatted
    let processedUri = imageUri;
    if (Platform.OS === 'ios') {
      // Remove any query parameters that might interfere
      processedUri = imageUri.split('?')[0];
    }

    asset.p = processedUri;
    asset.u = '';
    asset.e = 1;

    console.log('[ImageInjection] ⚠️ Using direct URL method (may not work reliably)');
    return { animationData: clonedData, method: 'url', success: true };
  } catch (error) {
    console.log('[ImageInjection] ❌ All injection methods failed:', error);
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
