import { bridge, logger } from '@onflow/frw-context';
import { BackupLoadingGlow, Dropbox, GoogleDrive, Icloud, UploadCloud } from '@onflow/frw-icons';
import { NativeScreenName } from '@onflow/frw-types';
import { BackupLoadingIcon, Text, View, XStack, YStack, useTheme } from '@onflow/frw-ui';
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ImportCloudBackupLoadingProgress } from './ImportCloudBackupLoadingProgress';

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
const MIN_PROGRESS = 0;
const MAX_PROGRESS = 98;

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
  const [glowProgress, setGlowProgress] = useState(0);

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
    let frameId: number;
    const cycleDuration = 2400;
    const startAt = Date.now();

    const tick = () => {
      const elapsed = (Date.now() - startAt) % cycleDuration;
      const half = cycleDuration / 2;
      const next = elapsed <= half ? elapsed / half : (cycleDuration - elapsed) / half;
      setGlowProgress(next);
      frameId = requestAnimationFrame(tick);
    };

    frameId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frameId);
    };
  }, []);

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

  const glowTranslateX = 28 + (246 - 28) * glowProgress;

  const statusText = t('onboarding.importCloudMultiBackup.loading.status', {
    provider: providerLabel.toLocaleLowerCase(),
  });

  return (
    <YStack
      flex={1}
      bg="$background"
      px="$4.5"
      pt={120}
      pb={60}
      justify="space-between"
      position="relative"
    >
      <View
        pointerEvents="none"
        position="absolute"
        t={0}
        l={0}
        r={0}
        b={0}
        items="center"
        justify="center"
      >
        <BackupLoadingGlow width="120%" height="100%" />
      </View>

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

        <View width={176} height={210} items="center" justify="center">
          <BackupLoadingIcon width={176} height={210} />
        </View>
      </YStack>

      <ImportCloudBackupLoadingProgress
        statusText={statusText}
        progress={progress}
        glowTranslateX={glowTranslateX}
      />
    </YStack>
  );
}
