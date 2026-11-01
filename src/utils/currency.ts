/**
 * Financial Precision Helper: Paise-Based Arithmetic (1 Rupee = 100 Paise)
 * Prevents floating-point rounding errors in all manufacturing and payroll calculations.
 */

export function toPaise(rupees: number | string): number {
  if (typeof rupees === 'string') {
    const cleaned = rupees.replace(/[^0-9.-]+/g, '');
    const parsed = parseFloat(cleaned);
    if (isNaN(parsed)) return 0;
    return Math.round(parsed * 100);
  }
  if (isNaN(rupees)) return 0;
  return Math.round(rupees * 100);
}

export function toRupees(paise: number): number {
  if (!paise || isNaN(paise)) return 0;
  return paise / 100;
}

/**
 * Formats a paise amount into Indian Rupees with comma separation:
 * e.g., 12500050 paise => ₹1,25,000.50
 */
export function formatCurrency(paise: number, options: { showDecimals?: boolean; compact?: boolean } = {}): string {
  const { showDecimals = true, compact = false } = options;
  if (paise === undefined || paise === null || isNaN(paise)) return '₹0.00';

  const rupees = paise / 100;

  if (compact && Math.abs(rupees) >= 100000) {
    if (Math.abs(rupees) >= 10000000) {
      return `₹${(rupees / 10000000).toFixed(2)} Cr`;
    }
    return `₹${(rupees / 100000).toFixed(2)} Lakh`;
  }

  // Use en-IN locale for Indian numbering format
  const formatted = new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: showDecimals ? 2 : 0,
    maximumFractionDigits: showDecimals ? 2 : 0,
  }).format(rupees);

  return `₹${formatted}`;
}

export function formatNumber(num: number): string {
  if (num === undefined || num === null || isNaN(num)) return '0';
  return new Intl.NumberFormat('en-IN').format(num);
}

export function formatPercent(num: number, decimals: number = 1): string {
  if (num === undefined || num === null || isNaN(num)) return '0.0%';
  return `${num.toFixed(decimals)}%`;
}

// Convenient alias for paise formatting
export const formatPaise = formatCurrency;


