import { configureFCL } from '@onflow/frw-cadence';
import { beforeAll, describe, expect, it } from 'vitest';

import { BloctoDetectorService } from '../src/key-rotation/blocto-detector';

beforeAll(() => {
  configureFCL('mainnet');
});

describe('BloctoDetectorService (integration)', () => {
  it('fetches account keys and returns a detection result', async () => {
    const service = new BloctoDetectorService();

    const result = await service.detectBloctoKey('0x4a21bdb48f1609ed');

    expect(typeof result.isBloctoKey).toBe('boolean');
    expect(Array.isArray(result.fullAccountKeys)).toBe(true);
    expect(result.fullAccountKeys.length).toBeGreaterThan(14);
    expect(Array.isArray(result.bloctoKeyIndexes)).toBe(true);
    expect(result.bloctoKeyIndexes.length).toBeGreaterThanOrEqual(4);
  });

  it('gracefully handles missing/invalid addresses', async () => {
    const service = new BloctoDetectorService();

    const result = await service.detectBloctoKey('0xb13b21a06b75536d');

    expect(result.isBloctoKey).toBe(false);
    expect(result.fullAccountKeys.length).toBe(1);
    expect(result.bloctoKeyIndexes.length).toBe(0);
  });
});
