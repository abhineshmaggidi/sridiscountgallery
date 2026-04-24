// Input sanitization and validation utilities

export function sanitizeString(input: string, maxLength: number = 1000): string {
  if (typeof input !== 'string') return '';

  // Remove null bytes and other dangerous characters
  let sanitized = input.replace(/[\x00-\x1F\x7F-\x9F]/g, '');

  // Trim whitespace
  sanitized = sanitized.trim();

  // Limit length
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }

  return sanitized;
}

export function sanitizeEmail(email: string): string {
  const sanitized = sanitizeString(email, 254); // RFC 5321 limit
  return sanitized.toLowerCase();
}

export function sanitizePhone(phone: string): string {
  // Remove all non-digit characters except + at the beginning
  const sanitized = phone.replace(/[^\d+]/g, '');
  return sanitizeString(sanitized, 15); // International phone number limit
}

export function sanitizeName(name: string): string {
  // Allow letters, spaces, hyphens, apostrophes
  const sanitized = name.replace(/[^a-zA-Z\s\-']/g, '');
  return sanitizeString(sanitized, 100);
}

export function sanitizeAddress(address: string): string {
  // Allow common address characters
  const sanitized = address.replace(/[<>\"'&]/g, '');
  return sanitizeString(sanitized, 500);
}

export function validateAmount(amount: number): boolean {
  return typeof amount === 'number' &&
         amount > 0 &&
         amount <= 1000000 && // Max 10 lakhs
         Number.isFinite(amount) &&
         amount === Math.round(amount * 100) / 100; // Max 2 decimal places
}

export function validateReceipt(receipt: string): boolean {
  return typeof receipt === 'string' &&
         receipt.length > 0 &&
         receipt.length <= 100 &&
         /^[a-zA-Z0-9\-_]+$/.test(receipt);
}

export function sanitizePincode(pincode: string): string {
  // Only allow digits
  const sanitized = pincode.replace(/\D/g, '');
  return sanitizeString(sanitized, 6);
}

export function generateSecureId(prefix: string = ''): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 15);
  return `${prefix}${timestamp}${random}`.toUpperCase();
}