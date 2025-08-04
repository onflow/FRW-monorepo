import { describe, it, expect, beforeEach } from 'vitest';

import { configureFCL, cadenceService } from '../src';
import { accounts } from '../src/utils/accounts';

const mainAccount = accounts.main;

describe('Test query scripts', () => {
  beforeEach(() => {
    configureFCL('mainnet');
  });

  it('Test query coa', async () => {
    const coaAddr = await cadenceService.getAddr(mainAccount.address);
    expect(`0x${coaAddr}`).toBe(mainAccount.evmAddr);
  });
});
