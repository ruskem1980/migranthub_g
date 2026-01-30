import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Make a phone call
 * Opens tel: link in browser or uses Capacitor CallNumber plugin on mobile
 */
export function makePhoneCall(number: string): void {
  // Clean the number - remove everything except digits, plus sign, and hyphens
  const cleanNumber = number.replace(/[^\d+\-]/g, '').replace(/\s/g, '');

  // Open tel: link
  window.location.href = `tel:${cleanNumber}`;
}

/**
 * Format phone number for display
 */
export function formatPhoneNumber(number: string): string {
  // Return as-is for now, can be enhanced later
  return number;
}
