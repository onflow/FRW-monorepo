import { formatCurrencyStringForDisplay } from '@/lib/string';

describe('formatCurrencyStringForDisplay', () => {
  // Regular amount formatting
  it('formats positive integer', () => {
    expect(formatCurrencyStringForDisplay({ value: 123 })).toBe('123');
  });

  it('formats negative integer', () => {
    expect(formatCurrencyStringForDisplay({ value: -456 })).toBe('-456');
  });

  it('formats positive float', () => {
    expect(formatCurrencyStringForDisplay({ value: 12.3456 })).toBe('12.346');
  });

  it('formats negative float', () => {
    expect(formatCurrencyStringForDisplay({ value: -12.3456 })).toBe('-12.346');
  });

  // digits parameter
  it('respects digits parameter', () => {
    expect(formatCurrencyStringForDisplay({ value: 1.23456, digits: 2 })).toBe('1.23');
    expect(formatCurrencyStringForDisplay({ value: 1.239, digits: 1 })).toBe('1.2');
  });

  // roundingMode: halfUp
  it('rounds half up by default', () => {
    expect(formatCurrencyStringForDisplay({ value: 1.235, digits: 2 })).toBe('1.24');
  });

  // roundingMode: down
  it('rounds down when specified', () => {
    expect(formatCurrencyStringForDisplay({ value: 1.239, digits: 2, roundingMode: 'down' })).toBe(
      '1.23'
    );
    expect(formatCurrencyStringForDisplay({ value: -1.239, digits: 2, roundingMode: 'down' })).toBe(
      '-1.24'
    );
  });

  // considerCustomCurrency
  it('applies custom currency rate when specified', () => {
    expect(
      formatCurrencyStringForDisplay({
        value: 10,
        considerCustomCurrency: true,
        currentCurrencyRate: 2,
      })
    ).toBe('20');
  });

  // Very small value (positive)
  it('formats very small positive value with subscript', () => {
    expect(formatCurrencyStringForDisplay({ value: 0.0000001234 })).toBe('0.06₆1');
  });

  // Very small value (negative)
  it('formats very small negative value with subscript', () => {
    expect(formatCurrencyStringForDisplay({ value: -0.0000009876 })).toBe('-0.06₆1');
  });

  // Special handling for zero
  it('formats zero as "0"', () => {
    expect(formatCurrencyStringForDisplay({ value: 0 })).toBe('0');
  });

  // Boundary values
  it('formats value just below threshold as subscript', () => {
    expect(formatCurrencyStringForDisplay({ value: 0.00009999 })).toMatch(/^0\.04₄\d+$/);
  });

  it('formats value just above threshold as normal', () => {
    expect(formatCurrencyStringForDisplay({ value: 0.00010001 })).toBe('0.0001');
  });

  // Remove trailing zeros
  it('removes trailing zeros', () => {
    expect(formatCurrencyStringForDisplay({ value: 1.2, digits: 4 })).toBe('1.2');
    expect(formatCurrencyStringForDisplay({ value: 1.0, digits: 4 })).toBe('1');
  });

  // Large digits
  it('supports large digits', () => {
    expect(formatCurrencyStringForDisplay({ value: 1.23456789, digits: 6 })).toBe('1.234568');
  });

  // Exchange rate is 0
  it('handles custom currency rate 0', () => {
    expect(
      formatCurrencyStringForDisplay({
        value: 123,
        considerCustomCurrency: true,
        currentCurrencyRate: 0,
      })
    ).toBe('0');
  });

  // Negative very small value boundary
  it('formats negative value just below threshold as subscript', () => {
    expect(formatCurrencyStringForDisplay({ value: -0.00009999 })).toMatch(/^-0\.04₄\d+$/);
  });
});
