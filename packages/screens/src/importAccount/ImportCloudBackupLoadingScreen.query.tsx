import { bridge, logger } from '@onflow/frw-context';
import { Dropbox, GoogleDrive, Icloud, MigrateIllustrate, UploadCloud } from '@onflow/frw-icons';
import { NativeScreenName } from '@onflow/frw-types';
import { Text, View, XStack, YStack, useTheme } from '@onflow/frw-ui';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Animated, Easing, StyleSheet } from 'react-native';

export type ImportCloudBackupProvider = 'googleDrive' | 'iCloud' | 'dropbox' | 'custom';

export interface ImportCloudBackupLoadingParams {
  provider?: ImportCloudBackupProvider;
  providerName?: string;
  nativeScreen?: NativeScreenName;
}

interface ImportCloudBackupLoadingScreenProps {
  route?: {
    params?: ImportCloudBackupLoadingParams;
  };
}

const DEFAULT_PROVIDER: ImportCloudBackupProvider = 'googleDrive';
const MIN_PROGRESS = 72;
const MAX_PROGRESS = 86;

const DEFAULT_NATIVE_SCREEN_BY_PROVIDER: Record<
  Exclude<ImportCloudBackupProvider, 'custom'>,
  NativeScreenName
> = {
  googleDrive: NativeScreenName.GOOGLE_DRIVE_RESTORE,
  iCloud: NativeScreenName.ICLOUD_RESTORE,
  dropbox: NativeScreenName.MULTI_RESTORE,
};

function renderProviderIcon(
  provider: ImportCloudBackupProvider,
  primaryColor: string
): React.ReactElement {
  switch (provider) {
    case 'googleDrive':
      return <GoogleDrive width={30} height={27} />;
    case 'iCloud':
      return <Icloud size={30} />;
    case 'dropbox':
      return <Dropbox size={30} />;
    case 'custom':
    default:
      return <UploadCloud size={28} color={primaryColor} />;
  }
}

export function ImportCloudBackupLoadingScreen({
  route,
}: ImportCloudBackupLoadingScreenProps = {}): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();
  const [progress, setProgress] = useState(80);
  const glowValue = useRef(new Animated.Value(0)).current;

  const provider = route?.params?.provider ?? DEFAULT_PROVIDER;
  const providerName = route?.params?.providerName?.trim();
  const nativeScreen = useMemo(() => {
    if (route?.params?.nativeScreen) {
      return route.params.nativeScreen;
    }
    if (provider === 'custom') {
      return undefined;
    }
    return DEFAULT_NATIVE_SCREEN_BY_PROVIDER[provider];
  }, [provider, route?.params?.nativeScreen]);

  const providerLabel = useMemo(() => {
    if (providerName) {
      return providerName;
    }
    if (provider === 'custom') {
      return t('onboarding.importCloudMultiBackup.loading.defaultProvider');
    }
    return t(`onboarding.importCloudMultiBackup.providers.${provider}`);
  }, [provider, providerName, t]);

  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        const next = prev + 0.8;
        if (next > MAX_PROGRESS) {
          return MIN_PROGRESS;
        }
        return next;
      });
    }, 140);

    return () => clearInterval(progressInterval);
  }, []);

  useEffect(() => {
    const glowAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(glowValue, {
          toValue: 1,
          duration: 1200,
          easing: Easing.inOut(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(glowValue, {
          toValue: 0,
          duration: 1200,
          easing: Easing.inOut(Easing.cubic),
          useNativeDriver: true,
        }),
      ])
    );

    glowAnimation.start();
    return () => glowAnimation.stop();
  }, [glowValue]);

  useEffect(() => {
    if (!nativeScreen) {
      return;
    }

    const timer = setTimeout(() => {
      logger.info('[ImportCloudBackupLoadingScreen] Launching native restore screen', {
        provider,
        nativeScreen,
      });
      bridge.launchNativeScreen?.(nativeScreen);
    }, 700);

    return () => clearTimeout(timer);
  }, [nativeScreen, provider]);

  const glowTranslateX = glowValue.interpolate({
    inputRange: [0, 1],
    outputRange: [28, 246],
  });

  const statusText = t('onboarding.importCloudMultiBackup.loading.status', {
    provider: providerLabel.toLocaleLowerCase(),
  });

  return (
    <YStack flex={1} bg="$background" px="$4.5" pt={120} pb={60} justify="space-between">
      <View pointerEvents="none" style={styles.backgroundGlow} />

      <YStack gap={74} items="center">
        <YStack gap={20} items="center">
          <XStack gap="$2" items="center">
            <View width={30} height={30} items="center" justify="center">
              {renderProviderIcon(provider, theme.primary.val)}
            </View>
            <Text fontSize={16} lineHeight={19} fontWeight="600" color="$textSecondary">
              {providerLabel}
            </Text>
          </XStack>

          <Text fontSize={30} lineHeight={36} fontWeight="700" color="$text" text="center">
            {t('onboarding.importCloudMultiBackup.loading.title')}
          </Text>
        </YStack>

        <View width={176} height={210} items="center" justify="flex-end" overflow="hidden">
          <MigrateIllustrate width={176} height={252} style={styles.illustration} />
        </View>
      </YStack>

      <YStack gap="$4" width="100%" maxW={339} self="center">
        <Text fontSize={16} lineHeight={19} fontWeight="600" color="$primary" text="center">
          {statusText}
        </Text>

        <View
          width="100%"
          height={12}
          rounded={6}
          bg="rgba(255,255,255,0.18)"
          overflow="hidden"
          position="relative"
        >
          <View
            position="absolute"
            l={0}
            t={0}
            b={0}
            width={`${progress}%`}
            bg="$primary"
            rounded={6}
          />
          <Animated.View
            pointerEvents="none"
            style={[styles.progressGlow, { transform: [{ translateX: glowTranslateX }] }]}
          />
        </View>
      </YStack>
    </YStack>
  );
}

const styles = StyleSheet.create({
  backgroundGlow: {
    position: 'absolute',
    width: 467,
    height: 467,
    borderRadius: 999,
    top: 130,
    left: '50%',
    marginLeft: -233.5,
    backgroundColor: '#00EF8B',
    opacity: 0.12,
  },
  illustration: {
    marginTop: -42,
  },
  progressGlow: {
    position: 'absolute',
    top: -8,
    left: -56,
    width: 76,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#D5FFE8',
    opacity: 0.9,
    shadowColor: '#D5FFE8',
    shadowOpacity: 0.85,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 0 },
  },
});
