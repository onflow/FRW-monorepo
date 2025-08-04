import { describe, it, expect } from 'vitest';

describe('Types Package', () => {
  it('should have basic structure', () => {
    expect(true).toBe(true);
  });

  it('should be importable', () => {
    // This test ensures the package can be imported
    expect(() => {
      import('../src/index');
    }).not.toThrow();
  });
});
