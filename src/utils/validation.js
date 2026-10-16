// Deliberately permissive - this only needs to catch obviously malformed
// addresses (no @, no domain) client-side before submission; it isn't a
// substitute for verifying the address actually works.
export function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((value || '').trim());
}
