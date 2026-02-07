import { CurrencyCode, getCurrencyConfig } from "@/types";

/**
 * Format a number as currency with the appropriate symbol.
 * Uses en-US locale for consistent 1,234.50 formatting, only swapping the symbol.
 */
export function formatCurrency(amount: number, currency: CurrencyCode): string {
  const { symbol } = getCurrencyConfig(currency);
  return `${symbol}${amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
}

/**
 * Get just the currency symbol for input field prefixes.
 */
export function getCurrencySymbol(currency: CurrencyCode): string {
  return getCurrencyConfig(currency).symbol;
}
