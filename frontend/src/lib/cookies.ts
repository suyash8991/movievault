/**
 * Cookie Management Utilities
 *
 * Provides functions to manage cookies for authentication tokens.
 * These cookies are used by Next.js middleware for server-side route protection.
 */

/**
 * Set a cookie with the given name, value, and options
 */
export function setCookie(name: string, value: string, days: number = 7) {
  if (typeof window === 'undefined') return; // Only run on client

  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);

  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
}

/**
 * Get a cookie value by name
 */
export function getCookie(name: string): string | null {
  if (typeof window === 'undefined') return null; // Only run on client

  const nameEQ = `${name}=`;
  const cookies = document.cookie.split(';');

  for (let cookie of cookies) {
    cookie = cookie.trim();
    if (cookie.indexOf(nameEQ) === 0) {
      return cookie.substring(nameEQ.length);
    }
  }

  return null;
}

/**
 * Delete a cookie by name
 */
export function deleteCookie(name: string) {
  if (typeof window === 'undefined') return; // Only run on client

  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
}

/**
 * Set authentication tokens in cookies
 */
export function setAuthCookies(accessToken: string, refreshToken: string) {
  // Access token expires in 15 minutes (same as JWT)
  setCookie('accessToken', accessToken, 0.01); // ~15 minutes in days

  // Refresh token expires in 7 days (same as JWT)
  setCookie('refreshToken', refreshToken, 7);
}

/**
 * Clear all authentication cookies
 */
export function clearAuthCookies() {
  deleteCookie('accessToken');
  deleteCookie('refreshToken');
}
