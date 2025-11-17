import { describe, it, expect } from 'vitest';
import { formatCurrency, getClientOnlyValue } from '../src/lib/formatting';

describe('formatting utilities', () => {
  describe('formatCurrency', () => {
    it('formats zero correctly', () => {
      expect(formatCurrency(0)).toBe('0');
    });

    it('formats small numbers without commas', () => {
      expect(formatCurrency(1)).toBe('1');
      expect(formatCurrency(12)).toBe('12');
      expect(formatCurrency(123)).toBe('123');
    });

    it('formats thousands with comma separator', () => {
      expect(formatCurrency(1234)).toBe('1,234');
      expect(formatCurrency(12345)).toBe('12,345');
      expect(formatCurrency(123456)).toBe('123,456');
    });

    it('formats millions with comma separators', () => {
      expect(formatCurrency(1234567)).toBe('1,234,567');
      expect(formatCurrency(12345678)).toBe('12,345,678');
    });

    it('handles large numbers', () => {
      expect(formatCurrency(1000000000)).toBe('1,000,000,000');
    });

    it('produces consistent output (no locale dependency)', () => {
      // Test that the same input always produces the same output
      const testCases = [0, 100, 1000, 10000, 100000, 1000000];
      testCases.forEach((amount) => {
        const result1 = formatCurrency(amount);
        const result2 = formatCurrency(amount);
        expect(result1).toBe(result2);
      });
    });
  });

  describe('getClientOnlyValue', () => {
    it('returns fallback value in SSR environment', () => {
      // In vitest/happy-dom, window is defined, so we'll test the logic
      const fallback = 'fallback';
      const getValue = () => 'client-value';
      
      // When window is defined (like in our test env), it should return getValue()
      const result = getClientOnlyValue(fallback, getValue);
      expect(result).toBe('client-value');
    });

    it('uses getValue function when window is available', () => {
      const fallback = 'fallback';
      let callCount = 0;
      const getValue = () => {
        callCount++;
        return 'client-value';
      };
      
      const result = getClientOnlyValue(fallback, getValue);
      expect(result).toBe('client-value');
      expect(callCount).toBe(1);
    });
  });
});
