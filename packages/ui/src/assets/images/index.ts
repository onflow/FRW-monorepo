/**
 * Image assets for the UI package
 * These are exported so they can be used by consuming packages
 */

// Onboarding images
import cardBackgroundImage from './onboarding/card_bg.png';
import fullBackgroundLightImage from './onboarding/full_bg_light.png';
import getStartedBackgroundImage from './onboarding/get_started_background.png';
import getStartedBackgroundLightImage from './onboarding/get_started_background_light.png';
import pushNotificationsImage from './onboarding/push-notifications.png';

export const onboardingImages = {
  fullBackgroundLight: fullBackgroundLightImage,
  getStartedBackground: getStartedBackgroundImage,
  getStartedBackgroundLight: getStartedBackgroundLightImage,
  pushNotifications: pushNotificationsImage,
  cardBackground: cardBackgroundImage,
};

// Re-export for easier access
export const {
  fullBackgroundLight,
  getStartedBackground,
  getStartedBackgroundLight,
  pushNotifications,
  cardBackground,
} = onboardingImages;
