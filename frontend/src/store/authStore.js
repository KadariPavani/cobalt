import { create } from 'zustand';

const SESSION_HINT_KEY = 'cobalt:session';

const readHint = () => {
  try {
    return localStorage.getItem(SESSION_HINT_KEY) === '1';
  } catch {
    return false;
  }
};

const writeHint = (value) => {
  try {
    if (value) localStorage.setItem(SESSION_HINT_KEY, '1');
    else localStorage.removeItem(SESSION_HINT_KEY);
  } catch {
    /* localStorage unavailable — fine */
  }
};

// Access token kept in memory only. Refresh token lives in httpOnly cookie.
// `hasSessionHint` is a non-sensitive flag in localStorage that tells us
// whether to attempt a refresh on boot (avoids a noisy 401 for new visitors).
export const useAuthStore = create((set) => ({
  user: null,
  accessToken: null,
  isReady: false,
  hasSessionHint: readHint(),

  setAuth: ({ user, accessToken }) => {
    writeHint(true);
    set({ user, accessToken, isReady: true, hasSessionHint: true });
  },

  setUser: (user) => set({ user }),
  markReady: () => set({ isReady: true }),

  clear: () => {
    writeHint(false);
    set({ user: null, accessToken: null, isReady: true, hasSessionHint: false });
  },
}));
