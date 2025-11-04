import { sha256 } from '@noble/hashes/sha256';
import { sha3_256 } from '@noble/hashes/sha3';
import { logger } from '@onflow/frw-utils';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { PasskeySignContainer } from '../components/passkey-sign-container';
import { FlowService } from '../services/flow-service';
import { type KeyInfo, PasskeyService } from '../services/passkey-service';
import { listCredentialRecords } from '../services/passkey-storage';
import { notifyViewReady, requestClose, sendApprove, sendDecline } from '../utils/fcl-messaging';
import {
  bytesToHex,
  encodeMessageFromSignable,
  encodeTransactionPayload,
  hexToBytes,
  type FlowSignable,
} from '../utils/flow-encoding';
import { buildSignatureExtension, derSignatureToHex } from '../utils/webauthn-signature';

const hashMessageForChallenge = async (
  messageHex: string,
  hashAlgo: 'SHA2_256' | 'SHA3_256'
): Promise<Uint8Array> => {
  const messageBytes = hexToBytes(messageHex);
  if (hashAlgo === 'SHA3_256') {
    return sha3_256(messageBytes);
  }
  // const subtle = typeof globalThis !== 'undefined' ? globalThis.crypto?.subtle : undefined;
  // if (subtle?.digest) {
  //   const digest = await subtle.digest(
  //     'SHA-256',
  //     messageBytes.buffer.slice(
  //       messageBytes.byteOffset,
  //       messageBytes.byteOffset + messageBytes.byteLength
  //     )
  //   );
  //   return new Uint8Array(digest);
  // }
  return sha256(messageBytes);
};

const bytesToHexSafe = (data: Uint8Array | ArrayBuffer): string => {
  const view = data instanceof Uint8Array ? data : new Uint8Array(data);
  return bytesToHex(view);
};

const previewHex = (hex: string | undefined, visible = 32): string => {
  if (!hex) return 'undefined';
  const clean = hex.replace(/^0x/, '');
  if (clean.length <= visible) return `0x${clean}`;
  return `0x${clean.slice(0, visible)}…(${clean.length} hex chars)`;
};

type AuthzReadyPayload = {
  body?: FlowSignable;
  config?: {
    app?: {
      name?: string;
      title?: string;
      url?: string;
      href?: string;
      icon?: string;
    };
    client?: {
      hostname?: string;
      network?: string;
    };
  };
  params?: {
    app?: {
      name?: string;
      url?: string;
    };
  };
};

type CredentialItem = {
  credentialId: string;
  address?: string;
  keyInfo?: KeyInfo | null;
};

const networkPreference =
  typeof process !== 'undefined' && process.env.NEXT_PUBLIC_FLOW_NETWORK === 'mainnet'
    ? 'mainnet'
    : 'testnet';

export default function AuthzPage() {
  const [signable, setSignable] = useState<FlowSignable | null>(null);
  const [credentials, setCredentials] = useState<CredentialItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [appName, setAppName] = useState('Flow dApp');
  const [appUrl, setAppUrl] = useState<string | undefined>();
  const [messageRole, setMessageRole] = useState<'payload' | 'envelope' | null>(null);

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
        const payload = (data as { body?: FlowSignable }).body ?? (data as AuthzReadyPayload).body;
        if (payload) {
          setSignable(payload);
        }

        const readyPayload = (data as AuthzReadyPayload) ?? {};
        const resolvedName =
          readyPayload?.config?.app?.name ||
          readyPayload?.config?.app?.title ||
          readyPayload?.params?.app?.name ||
          readyPayload?.config?.client?.hostname ||
          'Flow dApp';
        const resolvedUrl =
          readyPayload?.config?.app?.url ||
          readyPayload?.config?.app?.href ||
          readyPayload?.params?.app?.url;

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
    setMessageRole(null);
  }, [signable]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const records = listCredentialRecords();
      const stored = PasskeyService.listStoredKeyInfo();
      const merged = records.map<CredentialItem>((record) => ({
        credentialId: record.credentialId,
        address: record.flowAddress,
        keyInfo: stored.find((info) => info.credentialId === record.credentialId) ?? null,
      }));

      if (merged.length > 0) {
        setCredentials(merged);
        setSelectedId(merged[0]?.credentialId ?? null);
      }
    } catch (loadError) {
      logger.error('Failed to load passkey credentials for authz', loadError);
      setError('Unable to load stored passkeys. Please try again.');
    }
  }, []);

  const selectedCredential = useMemo(
    () => credentials.find((item) => item.credentialId === selectedId),
    [credentials, selectedId]
  );

  const previewRole = useMemo(() => {
    if (!signable) return null;
    const candidateAddress =
      selectedCredential?.address ??
      signable.addr ??
      credentials.find((item) => item.address)?.address;
    if (!candidateAddress) return null;
    const messageHex = encodeMessageFromSignable(signable, candidateAddress);
    const payloadHex = encodeTransactionPayload(signable.voucher);
    return messageHex === payloadHex ? 'payload' : 'envelope';
  }, [credentials, selectedCredential, signable]);

  const roleForDisplay = messageRole ?? previewRole;

  const cadencePreview = useMemo(() => {
    if (!signable) {
      return '';
    }
    return signable.voucher?.cadence ?? '';
  }, [signable]);

  const handleDecline = useCallback(() => {
    logger.debug('Passkey authz: user declined transaction');
    sendDecline('User declined');
    requestClose();
  }, []);

  const performSigning = useCallback(
    async ({
      credentialId,
      storedKeyInfo,
      storedAddress,
    }: {
      credentialId?: string;
      storedKeyInfo?: KeyInfo | null;
      storedAddress?: string;
    }) => {
      if (!signable) {
        setError('No transaction payload provided.');
        return;
      }

      setError(null);
      setIsProcessing(true);
      setMessageRole(null);

      try {
        const keyInfoForChallenge =
          storedKeyInfo ?? (credentialId ? PasskeyService.getStoredKeyInfo(credentialId) : null);
        let signerAddress = signable.addr ?? storedAddress;

        logger.debug('Passkey authz: initial signer context', {
          credentialId: credentialId ?? null,
          hasStoredKeyInfo: !!keyInfoForChallenge,
          providedSigner: signable.addr ?? null,
          storedAddress,
        });

        if (!signerAddress && credentialId && keyInfoForChallenge) {
          signerAddress = await FlowService.ensureAddressForCredential(
            keyInfoForChallenge,
            credentialId,
            networkPreference
          );
          logger.debug('Passkey authz: fetched signer address from Flow', {
            credentialId,
            signerAddress,
          });
          setCredentials((prev) =>
            prev.map((item) =>
              item.credentialId === credentialId ? { ...item, address: signerAddress } : item
            )
          );
        }

        if (!signerAddress) {
          throw new Error('Unable to determine signer address for this request.');
        }

        logger.debug('Passkey authz: resolved signer address', {
          signerAddress,
          credentialId: credentialId ?? null,
        });

        // IMPORTANT: Always use SHA2_256 to match demo implementation
        const hashAlgo = 'SHA2_256';
        const messageHex = encodeMessageFromSignable(signable, signerAddress);
        const payloadHex = encodeTransactionPayload(signable.voucher);
        const role = messageHex === payloadHex ? 'payload' : 'envelope';
        setMessageRole(role);
        logger.debug('Passkey authz: computed encoded transaction message', {
          signerAddress,
          role,
          messageHexPreview: previewHex(messageHex),
          payloadHexPreview: previewHex(payloadHex),
        });
        const challenge = await hashMessageForChallenge(messageHex, hashAlgo);
        logger.debug('Passkey authz: derived WebAuthn challenge', {
          hashAlgo,
          challengeLength: challenge.length,
          challengePreview: previewHex(bytesToHexSafe(challenge)),
        });

        const assertion = await PasskeyService.authenticate({
          credentialId,
          challenge,
          userVerification: 'required',
        });

        logger.debug('Passkey authz: received WebAuthn assertion', {
          assertionId: assertion.id,
          hasSignature: !!assertion.response.signature,
          hasAuthenticatorData: !!assertion.response.authenticatorData,
          hasClientData: !!assertion.response.clientDataJSON,
        });

        const keyInfo = await PasskeyService.getKeyInfoFromAssertion(assertion);
        const resolvedAddress = await FlowService.ensureAddressForCredential(
          keyInfo,
          assertion.id,
          networkPreference
        );

        logger.debug('Passkey authz: resolved Flow address for credential', {
          assertionId: assertion.id,
          resolvedAddress,
          keyIndex: keyInfo.keyIndex,
        });

        setCredentials((prev) => {
          const next = [...prev];
          const existingIndex = next.findIndex((item) => item.credentialId === assertion.id);
          const updated: CredentialItem = {
            credentialId: assertion.id,
            address: resolvedAddress,
            keyInfo,
          };
          if (existingIndex >= 0) {
            next[existingIndex] = updated;
          } else {
            next.push(updated);
          }
          return next;
        });
        setSelectedId(assertion.id);

        const response = assertion.response as AuthenticatorAssertionResponse;
        if (!response.signature || !response.authenticatorData || !response.clientDataJSON) {
          throw new Error('Incomplete assertion response from passkey.');
        }

        const signatureHex = derSignatureToHex(response.signature);
        const extensionData = buildSignatureExtension(
          response.authenticatorData,
          response.clientDataJSON
        );

        logger.debug('Passkey authz: constructed CompositeSignature fields', {
          signaturePreview: previewHex(signatureHex),
          extensionPreview: previewHex(extensionData),
          authenticatorDataLength: response.authenticatorData.byteLength,
          clientDataLength: response.clientDataJSON.byteLength,
        });

        sendApprove({
          f_type: 'CompositeSignature',
          f_vsn: '1.0.0',
          addr: resolvedAddress,
          keyId: 0, // IMPORTANT: Always use keyId 0 to match demo implementation
          signature: signatureHex,
          extensionData,
        });
        logger.debug('Passkey authz: sent approval response', {
          addr: resolvedAddress,
          keyId: 0, // Always 0 to match demo implementation
        });
        // Keep popup open for debugging; uncomment requestClose() when done.
      } catch (approvalError) {
        logger.error('Authz signing failed', approvalError);
        const message =
          approvalError instanceof Error ? approvalError.message : 'Failed to sign transaction.';
        setError(message);
      } finally {
        setIsProcessing(false);
      }
    },
    [networkPreference, signable]
  );

  const handleApprove = useCallback(async () => {
    if (!selectedCredential) {
      setError('Please select a passkey credential to continue.');
      return;
    }

    await performSigning({
      credentialId: selectedCredential.credentialId,
      storedKeyInfo:
        selectedCredential.keyInfo ??
        PasskeyService.getStoredKeyInfo(selectedCredential.credentialId),
      storedAddress: selectedCredential.address,
    });
  }, [performSigning, selectedCredential]);

  const handleUseOtherCredential = useCallback(async () => {
    await performSigning({});
  }, [performSigning]);
  return (
    <PasskeySignContainer
      appName={appName}
      appUrl={appUrl}
      credentials={credentials}
      selectedCredentialId={selectedId}
      isProcessing={isProcessing}
      error={error}
      cadencePreview={cadencePreview}
      messageRole={roleForDisplay}
      onSelectCredential={setSelectedId}
      onApprove={handleApprove}
      onDecline={handleDecline}
      onUseOtherCredential={signable ? handleUseOtherCredential : undefined}
    />
  );
}
