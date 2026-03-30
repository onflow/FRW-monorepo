import { describe, it, expect, vi, beforeEach } from 'vitest';

// Use vi.hoisted so mock functions are available in the hoisted vi.mock factory
const {
  mockConnect,
  mockPair,
  mockRequest,
  mockRespond,
  mockDisconnect,
  mockOn,
  mockSessionGetAll,
} = vi.hoisted(() => ({
  mockConnect: vi.fn(),
  mockPair: vi.fn(),
  mockRequest: vi.fn(),
  mockRespond: vi.fn(),
  mockDisconnect: vi.fn(),
  mockOn: vi.fn(),
  mockSessionGetAll: vi.fn().mockReturnValue([]),
}));

vi.mock('@walletconnect/sign-client', () => ({
  default: {
    init: vi.fn().mockResolvedValue({
      connect: mockConnect,
      pair: mockPair,
      request: mockRequest,
      respond: mockRespond,
      disconnect: mockDisconnect,
      on: mockOn,
      session: { getAll: mockSessionGetAll },
    }),
  },
}));

import { createDeviceSyncSession } from '../../../src/backup/device/wallet-connect-sync';
import {
  SyncRole,
  BackupErrorCode,
  KeyWeight,
  type DeviceSyncEvents,
} from '../../../src/backup/types';

function makeMockEvents(): DeviceSyncEvents {
  return {
    onPaired: vi.fn(),
    onPayloadReceived: vi.fn(),
    onError: vi.fn(),
    onDisconnected: vi.fn(),
  };
}

describe('createDeviceSyncSession', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('sender creates session with URI', async () => {
    mockConnect.mockResolvedValue({
      uri: 'wc:test-uri',
      approval: () => new Promise(() => {}),
    });

    const events = makeMockEvents();
    const session = await createDeviceSyncSession({
      role: SyncRole.Sender,
      events,
      pairingTimeout: 60000,
    });

    expect(session.uri).toBe('wc:test-uri');
    expect(mockConnect).toHaveBeenCalled();
  });

  it('receiver registers session_request listener', async () => {
    const events = makeMockEvents();
    await createDeviceSyncSession({
      role: SyncRole.Receiver,
      events,
    });

    expect(mockOn).toHaveBeenCalledWith('session_request', expect.any(Function));
    expect(mockOn).toHaveBeenCalledWith('session_delete', expect.any(Function));
  });

  it('sendBackup() throws if no active session', async () => {
    mockConnect.mockResolvedValue({
      uri: 'wc:test',
      approval: () => new Promise(() => {}),
    });

    const events = makeMockEvents();
    const session = await createDeviceSyncSession({
      role: SyncRole.Sender,
      events,
    });

    await expect(
      session.sendBackup({
        data: 'encrypted',
        username: 'alice',
        uid: null,
        keyWeight: KeyWeight.Full,
        deviceInfo: { id: 'dev1', name: 'iPhone', platform: 'ios' },
      })
    ).rejects.toThrow('No active session');
  });

  it('disconnect() calls client.disconnect and fires onDisconnected', async () => {
    mockConnect.mockResolvedValue({
      uri: 'wc:test',
      approval: () => new Promise(() => {}),
    });

    const events = makeMockEvents();
    const session = await createDeviceSyncSession({
      role: SyncRole.Sender,
      events,
    });

    await session.disconnect();
    expect(events.onDisconnected).toHaveBeenCalled();
  });

  it('pairing timeout triggers onError', async () => {
    vi.useFakeTimers();

    mockConnect.mockResolvedValue({
      uri: 'wc:test',
      approval: () => new Promise(() => {}),
    });

    const events = makeMockEvents();
    await createDeviceSyncSession({
      role: SyncRole.Sender,
      events,
      pairingTimeout: 5000,
    });

    vi.advanceTimersByTime(5000);

    expect(events.onError).toHaveBeenCalledWith(
      expect.objectContaining({ code: BackupErrorCode.PairingTimeout })
    );

    vi.useRealTimers();
  });
});
