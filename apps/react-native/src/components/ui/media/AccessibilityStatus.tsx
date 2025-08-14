import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { Text } from '../typography/text';

interface AccessibilityStatusProps {
  isAccessible?: boolean;
  className?: string;
}

export function AccessibilityStatus({ isAccessible = true, className }: AccessibilityStatusProps) {
  const { t } = useTranslation();

  if (isAccessible) {
    return null;
  }

  return (
    <View className={`bg-red-500/10 rounded-xl px-2 py-1 ${className || ''}`}>
      <Text className="text-red-500 text-xs">{t('send.inaccessible')}</Text>
    </View>
  );
}
