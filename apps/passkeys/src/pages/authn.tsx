import { PasskeyAuthContainer } from '@onflow/frw-ui';
import { logger } from '@onflow/frw-utils';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { FlowService } from '../services/flow-service';
import { PasskeyService } from '../services/passkey-service';
import { listCredentialRecords } from '../services/passkey-storage';
import { notifyViewReady, requestClose, sendApprove, sendDecline } from '../utils/fcl-messaging';

type AuthnReadyPayload = {
  config?: {
    app?: {
      name?: string;
      icon?: string;
      url?: string;
    };
    client?: {
      hostname?: string;
      network?: string;
    };
  };
  app?: {
    title?: string;
    icon?: string;
    url?: string;
    href?: string;
    name?: string;
  };
  body?: Record<string, unknown>;
  params?: {
    app?: {
      icon?: string;
      name?: string;
      url?: string;
    };
  };
};

type CredentialItem = {
  credentialId: string;
  address?: string;
  keyInfo?: {
    keyIndex?: number;
  } | null;
};

const networkPreference =
  typeof process !== 'undefined' && process.env.NEXT_PUBLIC_FLOW_NETWORK === 'mainnet'
    ? 'mainnet'
    : 'testnet';

const buildServices = (address: string, keyId: number) => {
  if (typeof window === 'undefined') {
    return [];
  }

  const origin = window.location.origin;
  const providerIcon = `${origin}/favicon.ico`;

  return [
    {
      f_type: 'Service',
      f_vsn: '1.0.0',
      type: 'authn',
      method: 'POP/RPC',
      uid: 'frw-passkeys#authn',
      endpoint: `${origin}/authn`,
      id: address,
      identity: {
        f_type: 'Identity',
        f_vsn: '1.0.0',
        address,
        keyId,
      },
      provider: {
        f_type: 'ServiceProvider',
        address: '0x0',
        name: 'FRW Passkey Wallet',
        icon: providerIcon,
      },
    },
    {
      f_type: 'Service',
      f_vsn: '1.0.0',
      type: 'authz',
      method: 'POP/RPC',
      uid: 'frw-passkeys#authz',
      endpoint: `${origin}/authz`,
      id: address,
      identity: {
        f_type: 'Identity',
        f_vsn: '1.0.0',
        address,
        keyId,
      },
    },
  ];
};

export default function AuthnPage() {
  const [credentials, setCredentials] = useState<CredentialItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [appName, setAppName] = useState<string>('Flow dApp');
  const [appUrl, setAppUrl] = useState<string | undefined>();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleMessage = (event: MessageEvent) => {
      const { data } = event;
      if (!data || typeof data !== 'object') {
        return;
      }

      if ((data as { type?: string }).type === 'FCL:VIEW:CLOSE') {
        window.close();
        return;
      }

      if ((data as { type?: string }).type === 'FCL:VIEW:READY:RESPONSE') {
        const payload = (data as { body?: AuthnReadyPayload }).body ?? (data as AuthnReadyPayload);

        const resolvedName =
          payload?.app?.name ||
          payload?.app?.title ||
          payload?.config?.app?.name ||
          payload?.config?.app?.url ||
          payload?.params?.app?.name ||
          payload?.params?.app?.url ||
          payload?.config?.client?.hostname ||
          'Flow dApp';
        const resolvedUrl =
          payload?.app?.url ||
          payload?.app?.href ||
          payload?.config?.app?.url ||
          payload?.params?.app?.url;

        setAppName(resolvedName);
        setAppUrl(resolvedUrl);
      }
    };

    window.addEventListener('message', handleMessage);
    notifyViewReady();

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const records = listCredentialRecords();
      const storedInfo = PasskeyService.listStoredKeyInfo();
      logger.info('Stored info', { storedInfo });
      const merged = records.map<CredentialItem>((record) => ({
        credentialId: record.credentialId,
        address: record.flowAddress,
        keyInfo: storedInfo.find((info) => info.credentialId === record.credentialId) ?? null,
      }));

      logger.info('Merged', { merged });
      if (merged.length > 0) {
        setCredentials(merged);
        setSelectedId(merged[0]?.credentialId ?? null);
      }
    } catch (loadError) {
      logger.error('Failed to load passkey credentials', loadError);
      setError('Unable to load stored passkeys. Please try again.');
    }
  }, []);

  const selectedCredential = useMemo(
    () => credentials.find((item) => item.credentialId === selectedId),
    [credentials, selectedId]
  );

  const handleDecline = useCallback(() => {
    sendDecline('User declined');
    requestClose();
  }, []);

  const performApprove = useCallback(
    async (credentialId?: string) => {
      setError(null);
      setIsProcessing(true);

      try {
        const assertion = await PasskeyService.authenticate({
          credentialId,
          userVerification: 'required',
        });

        const keyInfo = await PasskeyService.getKeyInfoFromAssertion(assertion);
        const address = await FlowService.ensureAddressForCredential(
          keyInfo,
          assertion.id,
          networkPreference
        );

        setCredentials((prev) => {
          const next = [...prev];
          const existingIndex = next.findIndex((item) => item.credentialId === assertion.id);
          const updated: CredentialItem = {
            credentialId: assertion.id,
            address,
            keyInfo,
          };
          if (existingIndex >= 0) {
            next[existingIndex] = { ...next[existingIndex], ...updated };
          } else {
            next.push(updated);
          }
          return next;
        });
        setSelectedId(assertion.id);

        const services = buildServices(address, keyInfo.keyIndex ?? 0);

        const response = {
          f_type: 'AuthnResponse',
          f_vsn: '1.0.0',
          addr: address,
          network: networkPreference,
          services,
        };

        sendApprove(response);
        requestClose();
      } catch (approvalError) {
        logger.error('Authn approval failed', approvalError);
        const message =
          approvalError instanceof Error ? approvalError.message : 'Failed to approve request.';
        setError(message);
      } finally {
        setIsProcessing(false);
      }
    },
    [networkPreference]
  );

  const handleApprove = useCallback(async () => {
    if (!selectedCredential) {
      setError('Please select a passkey credential to continue.');
      return;
    }

    await performApprove(selectedCredential.credentialId);
  }, [performApprove, selectedCredential]);

  const handleUseOtherCredential = useCallback(async () => {
    await performApprove();
  }, [performApprove]);

  return (
    <PasskeyAuthContainer
      appName={appName}
      appUrl={appUrl}
      credentials={credentials}
      selectedCredentialId={selectedId}
      isProcessing={isProcessing}
      error={error}
      onSelectCredential={setSelectedId}
      onApprove={handleApprove}
      onDecline={handleDecline}
      onUseOtherCredential={handleUseOtherCredential}
    />
  );
}
