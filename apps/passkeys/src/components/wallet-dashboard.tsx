import { logger } from '@onflow/frw-context';
import { YStack, XStack, H2, H3, Paragraph, Button, Input, Card, Separator } from '@onflow/frw-ui';
import { formatTokenAmount, truncateAddress } from '@onflow/frw-utils';
import { useState, useEffect, useMemo } from 'react';

import { FlowService, type FlowAccount } from '../services/flow-service';
import { type KeyInfo } from '../services/passkey-service';
import { getCredentialRecord, saveCredentialRecord } from '../services/passkey-storage';

interface WalletDashboardProps {
  keyInfo: KeyInfo;
  credentialId: string;
  onLogout: () => void;
  initialAddress?: string | null;
}

export function WalletDashboard({
  keyInfo,
  credentialId,
  onLogout,
  initialAddress,
}: WalletDashboardProps) {
  const [account, setAccount] = useState<FlowAccount | null>(null);
  const [balance, setBalance] = useState<string>('0');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');

  // Send Flow states
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [isSending, setIsSending] = useState(false);
  const formattedBalance = useMemo(() => formatTokenAmount(balance, 4), [balance]);

  useEffect(() => {
    initializeFlow(initialAddress ?? undefined);
  }, [initialAddress]);

  const initializeFlow = async (addressHint?: string) => {
    try {
      setIsLoading(true);
      await FlowService.initialize('testnet');

      // For demo purposes, we'll create a new account
      // In production, you'd typically store and retrieve the account address
      await createOrLoadAccount(addressHint);
    } catch (error) {
      logger.error('Failed to initialize Flow', error);
      setError('Failed to initialize Flow network');
    } finally {
      setIsLoading(false);
    }
  };

  const createOrLoadAccount = async (addressHint?: string) => {
    try {
      // Check if we have a stored account address
      const record = getCredentialRecord(credentialId);
      const storedAddress = addressHint ?? record?.flowAddress;

      if (storedAddress) {
        // Load existing account
        const accountInfo = await FlowService.getAccount(storedAddress);
        setAccount(accountInfo);

        const bal = await FlowService.getBalance(storedAddress);
        setBalance(bal);
        saveCredentialRecord({
          credentialId,
          flowAddress: storedAddress,
          publicKey: keyInfo.publicKey,
        });
      } else {
        // Create new account (this would typically require a service account to pay for creation)
        // For demo purposes, we'll simulate an account
        const simulatedAccount: FlowAccount = {
          address: addressHint ?? '0x' + Math.random().toString(16).substr(2, 16).padStart(16, '0'),
          balance: '100.0',
          keys: [
            {
              index: 0,
              publicKey: keyInfo.publicKey,
              signAlgo: keyInfo.signAlgoCode,
              hashAlgo: keyInfo.hashAlgoCode,
              weight: 1000,
              sequenceNumber: 0,
              revoked: false,
            },
          ],
        };

        setAccount(simulatedAccount);
        setBalance(simulatedAccount.balance);
        saveCredentialRecord({
          credentialId,
          flowAddress: simulatedAccount.address,
          publicKey: keyInfo.publicKey,
        });
      }
    } catch (error) {
      logger.error('Failed to create or load account', error);
      setError('Failed to load Flow account');
    }
  };

  const handleSendFlow = async () => {
    if (!account || !recipient || !amount) return;

    setIsSending(true);
    setError('');

    try {
      const txId = await FlowService.sendFlow(account.address, recipient, amount, keyInfo);

      // Refresh balance after successful transaction
      const newBalance = await FlowService.getBalance(account.address);
      setBalance(newBalance);

      // Clear form
      setRecipient('');
      setAmount('');

      alert(`Transaction successful! TX ID: ${txId}`);
    } catch (error) {
      logger.error('Send Flow failed', error);
      setError(error instanceof Error ? error.message : 'Transaction failed');
    } finally {
      setIsSending(false);
    }
  };

  if (isLoading) {
    return (
      <YStack padding="$4" gap="$4" alignItems="center">
        <H2>Loading...</H2>
        <Paragraph color="$gray11">Initializing your Flow wallet...</Paragraph>
      </YStack>
    );
  }

  if (error && !account) {
    return (
      <YStack padding="$4" gap="$4" alignItems="center">
        <H2 color="$red10">Error</H2>
        <Paragraph color="$gray11">{error}</Paragraph>
        <Button
          onPress={onLogout}
          icon={undefined}
          loading={false}
          loadingText={undefined}
          disabled={false}
        >
          Back to Login
        </Button>
      </YStack>
    );
  }

  return (
    <YStack padding="$4" gap="$4" maxWidth={600} width="100%">
      {/* Header */}
      <XStack justifyContent="space-between" alignItems="center">
        <H2>Flow Wallet</H2>
        <Button
          variant="outline"
          size="small"
          onPress={onLogout}
          icon={undefined}
          loading={false}
          loadingText={undefined}
          disabled={false}
        >
          Logout
        </Button>
      </XStack>

      {/* Account Info */}
      {account && (
        <Card padding="$4">
          <YStack gap="$3">
            <H3>Account Information</H3>
            <YStack gap="$2">
              <XStack justifyContent="space-between">
                <Paragraph fontWeight="600">Address:</Paragraph>
                <Paragraph fontFamily="$mono" fontSize="$2">
                  {truncateAddress(account.address, 10, 6)}
                </Paragraph>
              </XStack>
              <XStack justifyContent="space-between">
                <Paragraph fontWeight="600">Balance:</Paragraph>
                <Paragraph fontSize="$4" fontWeight="bold" color="$green10">
                  {formattedBalance} FLOW
                </Paragraph>
              </XStack>
              <XStack justifyContent="space-between">
                <Paragraph fontWeight="600">Keys:</Paragraph>
                <Paragraph>{account.keys.length} key(s)</Paragraph>
              </XStack>
            </YStack>
          </YStack>
        </Card>
      )}

      <Separator />

      {/* Send Flow */}
      <Card padding="$4">
        <YStack gap="$4">
          <H3>Send Flow</H3>

          {error && (
            <Paragraph color="$red10" fontSize="$2">
              {error}
            </Paragraph>
          )}

          <YStack gap="$3">
            <YStack gap="$2">
              <Paragraph fontWeight="600">Recipient Address</Paragraph>
              <Input
                placeholder="0x..."
                value={recipient}
                onChangeText={setRecipient}
                disabled={isSending}
                size="$4"
              />
            </YStack>

            <YStack gap="$2">
              <Paragraph fontWeight="600">Amount (FLOW)</Paragraph>
              <Input
                placeholder="0.0"
                value={amount}
                onChangeText={setAmount}
                disabled={isSending}
                size="$4"
                keyboardType="decimal-pad"
              />
            </YStack>

            <Button
              variant="success"
              size="medium"
              loading={isSending}
              loadingText="Sending..."
              disabled={!recipient || !amount || isSending}
              onPress={handleSendFlow}
              icon={undefined}
            >
              Send Flow
            </Button>
          </YStack>
        </YStack>
      </Card>

      {/* Key Information */}
      <Card padding="$4">
        <YStack gap="$3">
          <H3>Passkey Information</H3>
          <YStack gap="$2">
            <XStack justifyContent="space-between">
              <Paragraph fontWeight="600">Type:</Paragraph>
              <Paragraph>{keyInfo.type}</Paragraph>
            </XStack>
            <XStack justifyContent="space-between">
              <Paragraph fontWeight="600">Algorithm:</Paragraph>
              <Paragraph>
                {keyInfo.signAlgo} / {keyInfo.hashAlgo}
              </Paragraph>
            </XStack>
            <XStack justifyContent="space-between">
              <Paragraph fontWeight="600">Key Index:</Paragraph>
              <Paragraph>{keyInfo.keyIndex}</Paragraph>
            </XStack>
            <YStack gap="$1">
              <Paragraph fontWeight="600">Public Key:</Paragraph>
              <Paragraph fontFamily="$mono" fontSize="$1">
                {keyInfo.publicKey}
              </Paragraph>
            </YStack>
          </YStack>
        </YStack>
      </Card>
    </YStack>
  );
}
