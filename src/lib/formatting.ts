/**
 * Formatting utilities for consistent server/client rendering.
 * Avoids hydration mismatches by using deterministic formatting.
 */

/**
 * Format a number as currency (JPY) with comma separators.
 * Avoids using `toLocaleString()` to prevent server/client hydration mismatches.
 * 
 * @param amount - The numeric amount to format
 * @returns Formatted string with comma separators (e.g., "1,234")
 * 
 * @example
 * formatCurrency(1234) // "1,234"
 * formatCurrency(1234567) // "1,234,567"
 * formatCurrency(0) // "0"
 */
export function formatCurrency(amount: number): string {
  return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/**
 * Safely get a client-only value with a fallback for SSR.
 * Use this for values that depend on browser APIs or client state.
 * 
 * @param fallback - The fallback value to use during SSR
 * @param getValue - A function that returns the client-only value
 * @returns The fallback during SSR, or the client value after hydration
 * 
 * @example
 * const currentMonth = getClientOnlyValue('', () => new Date().toISOString().slice(0, 7));
 */
export function getClientOnlyValue<T>(fallback: T, getValue: () => T): T {
  if (typeof window === 'undefined') {
    return fallback;
  }
  return getValue();
}
