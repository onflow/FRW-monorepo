import React from 'react';
import { Image, YStack } from 'tamagui';

// Import the notification preview image
const notificationPreviewImage = require('../../assets/images/onboarding/push-notifications.png');

interface NotificationPreviewImageProps {
  width?: number;
  height?: number;
}

/**
 * NotificationPreviewImage - Preview image for notification permissions screen
 * Shows a visual representation of push notifications
 */
export function NotificationPreviewImage({
  width = 300,
  height = 200,
}: NotificationPreviewImageProps): React.ReactElement {
  return (
    <YStack items="center" justify="center">
      <Image source={notificationPreviewImage} width={width} height={height} objectFit="contain" />
    </YStack>
  );
}
