import { configureFCL, CadenceService } from '@onflow/frw-cadence';
import { describe, it, expect, beforeEach } from 'vitest';

import { accounts } from './utils/accounts';

const mainAccount = accounts.main;

const cadenceService = new CadenceService();

describe('Test query scripts', () => {
  beforeEach(() => {
    configureFCL('mainnet');
  });

  it('Test query coa', async () => {
    const coaAddr = await cadenceService.getAddr(mainAccount.address);
    expect(`0x${coaAddr}`).toBe(mainAccount.evmAddr);
  });
});
