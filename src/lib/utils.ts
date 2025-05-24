import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format a number as currency with the specified currency code
 * @param value - The numeric value to format
 * @param currencyCode - The ISO currency code (e.g., 'USD', 'RWF')
 * @param options - Additional formatting options
 * @returns Formatted currency string
 */
export function formatCurrency(
  value: number, 
  currencyCode: string = 'RWF', 
  options: Partial<Intl.NumberFormatOptions> = {}
): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    ...options
  }).format(value);
}
