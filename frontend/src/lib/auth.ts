/**
 * Auth utilities — token storage & user management
 */

import Cookies from 'js-cookie';

const TOKEN_KEY = 'access_token';
const TOKEN_EXPIRY_DAYS = 7;

export const tokenStorage = {
  set: (token: string) => {
    const isSecure = typeof window !== 'undefined' && window.location.protocol === 'https:';
    Cookies.set(TOKEN_KEY, token, {
      expires: TOKEN_EXPIRY_DAYS,
      path: '/',
      secure: isSecure,
      sameSite: 'lax',
    });
  },

  get: (): string | undefined => Cookies.get(TOKEN_KEY),

  remove: () => Cookies.remove(TOKEN_KEY, { path: '/' }),

  isAuthenticated: (): boolean => !!Cookies.get(TOKEN_KEY),
};
