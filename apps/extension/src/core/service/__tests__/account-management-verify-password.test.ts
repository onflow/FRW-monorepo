import { beforeEach, describe, expect, it, vi } from 'vitest';

// Keep every named export of the real keyring module (other services import them at module load),
// but substitute the default instance so we control boot state and verification.
vi.mock('@/core/service/keyring', async (importOriginal) => {
  // importOriginal is untyped; the real module shape is only needed for the spread below.
  const actual = (await importOriginal()) as Record<string, unknown>;
  return {
    ...actual,
    default: {
      isBooted: vi.fn(),
      verifyPassword: vi.fn(),
    },
  };
});

import { AccountManagement } from '@/core/service/account-management';
import keyringService from '@/core/service/keyring';

const mockedKeyring = vi.mocked(keyringService);

describe('verifyPasswordIfBooted', () => {
  let service: AccountManagement;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new AccountManagement();
  });

  it('does nothing when the wallet is not booted (fresh install)', async () => {
    mockedKeyring.isBooted.mockResolvedValue(false);

    await expect(service.verifyPasswordIfBooted('brand-new-password')).resolves.toBeUndefined();
    expect(mockedKeyring.verifyPassword).not.toHaveBeenCalled();
  });

  it('passes when booted and the password matches the existing vault', async () => {
    mockedKeyring.isBooted.mockResolvedValue(true);
    mockedKeyring.verifyPassword.mockResolvedValue(undefined);

    await expect(service.verifyPasswordIfBooted('existing-password')).resolves.toBeUndefined();
    expect(mockedKeyring.verifyPassword).toHaveBeenCalledWith('existing-password');
  });

  it('rethrows a contextual error instead of raw "Incorrect password" when the vault rejects the password (#1428)', async () => {
    mockedKeyring.isBooted.mockResolvedValue(true);
    mockedKeyring.verifyPassword.mockRejectedValue(new Error('Incorrect password'));

    const error = await service.verifyPasswordIfBooted('brand-new-password').catch((e) => e);

    expect(error).toBeInstanceOf(Error);
    // A user creating a new account must not be told their (new) password is "incorrect";
    // they must be told an existing wallet is in the way and how to get out.
    expect(error.message).toContain('existing wallet');
    expect(error.message).not.toContain('Incorrect password');
  });
});
