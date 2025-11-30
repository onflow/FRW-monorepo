/**
 * Image assets for the UI package
 * These are exported so they can be used by consuming packages
 */

// Onboarding images
export const onboardingImages = {
  fullBackgroundLight: require('./onboarding/full_bg_light.png'),
  getStartedBackground: require('./onboarding/get_started_background.png'),
  getStartedBackgroundLight: require('./onboarding/get_started_background_light.png'),
  pushNotifications: require('./onboarding/push-notifications.png'),
  cardBackground: require('./onboarding/card_bg.png'),
};

// Re-export for easier access
export const {
  fullBackgroundLight,
  getStartedBackground,
  getStartedBackgroundLight,
  pushNotifications,
  cardBackground,
} = onboardingImages;
