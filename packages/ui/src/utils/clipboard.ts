/**
 * Cross-platform clipboard utility
 * Works for both React Native and Web environments
 */

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    // Check if we're in React Native environment
    if (typeof window === 'undefined' || !window.document) {
      // React Native environment - this should be handled by the calling component
      // We can't import React Native modules in a compiled package
      console.warn('copyToClipboard called in React Native environment - handle in component');
      return false;
    } else {
      // Web environment
      if (navigator.clipboard && navigator.clipboard.writeText) {
        // Modern browser with clipboard API
        await navigator.clipboard.writeText(text);
        return true;
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        textArea.style.pointerEvents = 'none';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        try {
          const successful = document.execCommand('copy');
          document.body.removeChild(textArea);
          return successful;
        } catch (error) {
          document.body.removeChild(textArea);
          console.error('Fallback copy failed:', error);
          return false;
        }
      }
    }
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
}
