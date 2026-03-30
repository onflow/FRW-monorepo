import SignClient from '@walletconnect/sign-client';

import {
  BackupError,
  BackupErrorCode,
  SyncRole,
  type DeviceSyncOptions,
  type DeviceSyncPayload,
  type DeviceSyncSession,
} from '../types';

const BACKUP_METHOD = 'frw_backupSync';
const BACKUP_CHAIN = 'flow:mainnet';

export async function createDeviceSyncSession(
  options: DeviceSyncOptions
): Promise<DeviceSyncSession> {
  const client = await SignClient.init({
    projectId: options.walletConnectProjectId,
    metadata: {
      name: 'Flow Reference Wallet',
      description: 'Backup sync',
      url: 'https://frw.flow.com',
      icons: [],
    },
  });

  let topic: string | null = null;
  let pairingUri: string | null = null;

  // Set up timeout for pairing
  const pairingTimeout = options.pairingTimeout ?? 120000;
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  const startPairingTimeout = (): void => {
    timeoutId = setTimeout(() => {
      options.events.onError(new BackupError(BackupErrorCode.PairingTimeout, 'Pairing timed out'));
    }, pairingTimeout);
  };

  const clearPairingTimeout = (): void => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  };

  if (options.role === SyncRole.Sender) {
    // Sender creates the pairing proposal
    const { uri, approval } = await client.connect({
      requiredNamespaces: {
        flow: {
          methods: [BACKUP_METHOD],
          chains: [BACKUP_CHAIN],
          events: ['backupReceived'],
        },
      },
    });

    pairingUri = uri ?? null;
    startPairingTimeout();

    // Wait for approval in background
    approval()
      .then((session) => {
        clearPairingTimeout();
        topic = session.topic;
        options.events.onPaired(session.peer.metadata?.name ?? session.topic);
      })
      .catch((err) => {
        clearPairingTimeout();
        options.events.onError(new BackupError(BackupErrorCode.Unknown, 'Pairing failed', err));
      });
  }

  if (options.role === SyncRole.Receiver) {
    // Receiver listens for incoming requests
    client.on('session_request', async (event) => {
      if (event.params.request.method === BACKUP_METHOD) {
        clearPairingTimeout();
        const payload = event.params.request.params as DeviceSyncPayload;
        options.events.onPayloadReceived(payload);

        // Acknowledge
        await client.respond({
          topic: event.topic,
          response: {
            id: event.id,
            jsonrpc: '2.0',
            result: { success: true },
          },
        });
      }
    });

    client.on('session_delete', () => {
      options.events.onDisconnected();
    });
  }

  const session: DeviceSyncSession = {
    get uri() {
      return pairingUri;
    },

    async pair(uri: string): Promise<void> {
      startPairingTimeout();
      const { topic: approvedTopic } = await client.pair({ uri });
      clearPairingTimeout();
      topic = approvedTopic;
      // For receiver, the approval creates the session
      // Find the session by pairing topic
      const sessions = client.session.getAll();
      const matched = sessions.find((s) => s.pairingTopic === approvedTopic);
      if (matched) {
        topic = matched.topic;
        options.events.onPaired(matched.peer.metadata?.name ?? matched.topic);
      }
    },

    async sendBackup(payload: DeviceSyncPayload): Promise<void> {
      if (!topic) {
        throw new BackupError(BackupErrorCode.Unknown, 'No active session');
      }
      await client.request({
        topic,
        chainId: BACKUP_CHAIN,
        request: {
          method: BACKUP_METHOD,
          params: payload,
        },
      });
    },

    async disconnect(): Promise<void> {
      clearPairingTimeout();
      if (topic) {
        try {
          await client.disconnect({
            topic,
            reason: { code: 6000, message: 'Sync complete' },
          });
        } catch {
          // Ignore disconnect errors
        }
      }
      options.events.onDisconnected();
    },
  };

  return session;
}
