import { vi, describe, it, expect } from 'vitest';

import { retryOperation } from './retryOperation';

describe('retryOperation', () => {
  // Remove beforeEach(vi.useFakeTimers());

  it('should return result on successful first attempt', async () => {
    const operation = vi.fn().mockResolvedValue('success');
    const result = await retryOperation(operation, 3, 1000);
    expect(result).toBe('success');
    expect(operation).toHaveBeenCalledTimes(1);
  });

  it('should retry and succeed on second attempt', async () => {
    const operation = vi
      .fn()
      .mockRejectedValueOnce(new Error('fail'))
      .mockResolvedValueOnce('success');

    const result = await retryOperation(operation, 3, 1000);
    expect(result).toBe('success');
    expect(operation).toHaveBeenCalledTimes(2);
  }, 20000);

  it('should throw error after max attempts', async () => {
    const operation = vi.fn().mockRejectedValue(new Error('fail'));

    await expect(retryOperation(operation, 2, 1000)).rejects.toThrow('fail');
    expect(operation).toHaveBeenCalledTimes(2);
  }, 20000);

  // Remove afterEach(vi.useRealTimers());
});
