/**
 * Auth utilities — token storage & user management
 */

import Cookies from 'js-cookie';

const TOKEN_KEY = 'access_token';
const TOKEN_EXPIRY_DAYS = 7;

export const tokenStorage = {
  set: (token: string) => {
    Cookies.set(TOKEN_KEY, token, {
      expires: TOKEN_EXPIRY_DAYS,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });
  },

  get: (): string | undefined => Cookies.get(TOKEN_KEY),

  remove: () => Cookies.remove(TOKEN_KEY),

  isAuthenticated: (): boolean => !!Cookies.get(TOKEN_KEY),
};
