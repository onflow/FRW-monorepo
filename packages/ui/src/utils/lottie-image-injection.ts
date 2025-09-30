/**
 * Lottie Image Injection Utilities
 *
 * Provides functionality to dynamically replace images in Lottie animations
 * with support for base64 placeholders and graceful fallbacks.
 */

import { convertedSVGURL } from '@onflow/frw-utils';
import { Platform } from 'react-native';

// Flow token placeholder image (79x78 PNG)
const BASE64_PLACEHOLDER =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAE8AAABOCAMAAABWtrsRAAAAt1BMVEUAAAAA74cA74wA74sA74wA74oA748A74wA748A74wA74oA74sA74wA74sA74sA74oA74sA74wA74sA740A8YwA74AA740A74wA74oA74sA74sA74wA74sA748A74kA74wA74vf/fH////v/vgQ8JIg8ZmA98Vg9bdA86i/++JQ9K/P/Omf+dN/98UQ8JOv+tsw8qGQ+Mxw9r6Q+M1f9bZQ9LDP/OqP+Mzv/vdw9r2g+dSg+dNv9r3WGYRbAAAAIHRSTlMAIN9An2AgvxDvMO9Qv3+QcJCAf58QYM+voM+vjzCAb8IkYtAAAAJ6SURBVHhe7ZbZdtowEIbxAhhjltKGJE3ajuSdNWv393+u5hxXGpmRiGRu/V356jsz+pkZBhfQ09PjrVfhzeyNcJXEF7qiIJyAih8Ou9tG9yhDJuGomy0EEx2M0Rx0ZNAwj9x0X3zQUNW1fEinEr+BhnzHOa9AMLfXfQRKtk/5G1twF4Z6W0OpxNK5ur8pF7ADCu+76fKaKxTg1HJAdYyrpAdAgndnwjfokFdApiPnLHZtW/0AKjeu3ZZtWwWIRcd0LNQsWAWE2TndkIahBPEEiF2BY+L7JXXPGSB2BY6A8EfodtDw4FDgBzA/X+Opak4SWTikgb4cAPIjbgRk6tAu9ltCthdfJ8TGdCmPwrfdp7gR2iztnw8qme4j2QiCT8ZfCyX7yd845uILNwLy2eCbgoZCDlmBBdoFAjqyY2NTC/wBbfTHLtIfIVGMLLDO4QRP6/O0Z0N9LYYbppOvYs2kCUrcMMRn0e8LjkZDXoAWzyqPjVyisvkatJjG13Q3qsbWfFF8g++O3A0ssGTiizKzmbecK7xs1VJtF1ZCFrM4QijfASUx+CLt4ksrdW2ldvHShSCHa9OetdzhgCwBETqGe9XwgEOjL5pS33fis2mXJnyy7BjeJZttSkeYtRLdc8HBojzklh4Ozoqi5ti+RXmIN8XDoaW0LI9GzDiF/ly+Dt5hfLbAAuxOEeLJLfOb6hi08Um3lFg8YbYlupz8M7BgiKeN6MhkOAnhSQ3lOXPTIbF8w7z833RanBY3CVBgE4pUVmW5QRmJwo4VnGdxhQLXEinjYODO0L/MRgluJ0Q2uUNbB5LFNSDXi+RqcDFxsF6uluskvsjV09PzD2kKSefMxPXYAAAAAElFTkSuQmCC';

export interface InjectionResult {
  success: boolean;
  method: 'base64' | 'url' | 'failed';
  animationData: any;
}

/**
 * Converts a remote image URL to base64
 */
async function imageUrlToBase64(url: string): Promise<string | null> {
  try {
    const response = await fetch(convertedSVGURL(url));
    if (!response.ok) {
      console.warn('[LottieInjection] Failed to fetch image:', response.status);
      return null;
    }

    const blob = await response.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.warn('[LottieInjection] Error converting image to base64:', error);
    return null;
  }
}

/**
 * Recursively finds and replaces images in Lottie animation data
 */
function injectImageIntoLottie(
  animationData: any,
  targetImageId: string,
  imageSource: string
): any {
  if (!animationData || typeof animationData !== 'object') {
    return animationData;
  }

  console.log(`[LottieInjection] 🔍 Looking for image with ID: "${targetImageId}"`);
  console.log(`[LottieInjection] 🎯 Will replace with: ${imageSource.substring(0, 100)}...`);

  // Deep clone to avoid mutating original data
  const clonedData = JSON.parse(JSON.stringify(animationData));
  let foundAndReplaced = false;

  function processNode(node: any, path: string = ''): void {
    if (!node || typeof node !== 'object') {
      return;
    }

    // Handle arrays
    if (Array.isArray(node)) {
      node.forEach((item, index) => processNode(item, `${path}[${index}]`));
      return;
    }

    // Check for image assets - log what we find
    if (node.id) {
      console.log(`[LottieInjection] 🔎 Found node with id: "${node.id}" at path: ${path}`);
      if (node.id === targetImageId) {
        console.log(`[LottieInjection] 🎯 MATCH! Found target image "${targetImageId}"`);
        console.log(`[LottieInjection] 📋 Current node structure:`, {
          id: node.id,
          p: node.p,
          u: node.u,
          src: node.src,
          w: node.w,
          h: node.h,
        });

        if (node.p) {
          // Standard Lottie image asset
          const oldValue = node.p;
          node.p = imageSource;
          node.u = ''; // Clear base path
          foundAndReplaced = true;
          console.log(
            `[LottieInjection] ✅ Replaced node.p from "${oldValue}" to "${imageSource.substring(0, 50)}..."`
          );
        } else if (node.src) {
          // Alternative image format
          const oldValue = node.src;
          node.src = imageSource;
          foundAndReplaced = true;
          console.log(
            `[LottieInjection] ✅ Replaced node.src from "${oldValue}" to "${imageSource.substring(0, 50)}..."`
          );
        } else {
          console.log(
            `[LottieInjection] ⚠️ Found target image but no 'p' or 'src' property to replace!`
          );
        }
      }
    }

    // Check if this is an asset with refId (layers that reference images)
    if (node.refId) {
      console.log(`[LottieInjection] 🔗 Found layer with refId: "${node.refId}" at path: ${path}`);
    }

    // Recursively process all properties
    Object.keys(node).forEach((key) => {
      if (key !== 'p' && key !== 'src') {
        // Don't re-process what we just set
        processNode(node[key], `${path}.${key}`);
      }
    });
  }

  processNode(clonedData, 'root');

  if (foundAndReplaced) {
    console.log(`[LottieInjection] 🎉 Successfully found and replaced image "${targetImageId}"`);
  } else {
    console.log(`[LottieInjection] ❌ Could not find image "${targetImageId}" in animation data`);

    // Debug: Let's log the assets structure
    if (clonedData.assets) {
      console.log(
        `[LottieInjection] 📋 Available assets:`,
        clonedData.assets.map((asset: any) => ({
          id: asset.id,
          p: asset.p,
          u: asset.u,
          w: asset.w,
          h: asset.h,
        }))
      );
    } else {
      console.log(`[LottieInjection] ❌ No assets array found in animation data`);
    }
  }

  return clonedData;
}

/**
 * Attempts to inject an image into Lottie animation with multiple fallback strategies
 */
export async function injectImageWithFallbacks(
  animationData: any,
  targetImageId: string,
  imageUrl: string
): Promise<InjectionResult> {
  if (!animationData || !targetImageId) {
    console.warn('[LottieInjection] Invalid parameters provided');
    return {
      success: false,
      method: 'failed',
      animationData,
    };
  }

  console.log(
    `[LottieInjection] Starting injection for ${targetImageId} with imageUrl:`,
    imageUrl || 'PLACEHOLDER'
  );

  // If empty imageUrl provided, use base64 placeholder immediately
  if (!imageUrl || imageUrl.trim() === '') {
    console.log('[LottieInjection] 📍 Using base64 placeholder for empty imageUrl');
    try {
      const placeholderData = injectImageIntoLottie(
        animationData,
        targetImageId,
        BASE64_PLACEHOLDER
      );
      return {
        success: true,
        method: 'base64',
        animationData: placeholderData,
      };
    } catch (error) {
      console.error('[LottieInjection] Placeholder injection failed:', error);
      return {
        success: false,
        method: 'failed',
        animationData,
      };
    }
  }

  // Strategy 1: Try to convert URL to base64 (most reliable for React Native)
  if (Platform.OS === 'ios' || Platform.OS === 'android') {
    try {
      const base64Image = await imageUrlToBase64(imageUrl);
      if (base64Image) {
        const injectedData = injectImageIntoLottie(animationData, targetImageId, base64Image);
        console.log('[LottieInjection] ✅ Successfully injected via base64');
        return {
          success: true,
          method: 'base64',
          animationData: injectedData,
        };
      }
    } catch (error) {
      console.warn('[LottieInjection] Base64 conversion failed:', error);
    }
  }

  // Strategy 2: Try direct URL injection (works better on web/extension)
  try {
    const injectedData = injectImageIntoLottie(animationData, targetImageId, imageUrl);
    console.log('[LottieInjection] ✅ Successfully injected via URL');
    return {
      success: true,
      method: 'url',
      animationData: injectedData,
    };
  } catch (error) {
    console.warn('[LottieInjection] URL injection failed:', error);
  }

  // Strategy 3: Use base64 placeholder as final fallback
  try {
    const placeholderData = injectImageIntoLottie(animationData, targetImageId, BASE64_PLACEHOLDER);
    console.log('[LottieInjection] ⚠️ Using placeholder fallback');
    return {
      success: false, // Still mark as failed since we didn't get the real image
      method: 'failed',
      animationData: placeholderData,
    };
  } catch (error) {
    console.error('[LottieInjection] All injection strategies failed:', error);
    return {
      success: false,
      method: 'failed',
      animationData,
    };
  }
}

/**
 * Preloads an image and returns whether it loaded successfully
 */
export function preloadImage(url: string): Promise<boolean> {
  return new Promise((resolve) => {
    if (Platform.OS === 'web') {
      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = url;
    } else {
      // For React Native, we'll just try to fetch the URL
      fetch(url, { method: 'HEAD' })
        .then((response) => resolve(response.ok))
        .catch(() => resolve(false));
    }
  });
}
