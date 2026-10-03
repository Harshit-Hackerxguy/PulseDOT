import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { authService } from '../services/authService';
import type { LoginPayload, SignupPayload, SignupResponse, User } from '../types';
import { isJwtExpired } from '../utils/format';

interface AuthState {
  token: string | null;
  user: User | null;

  /** POST /auth/login → stores `{ token, user }` on success. Throws ApiError on failure. */
  login: (payload: LoginPayload) => Promise<User>;
  /** POST /auth/signup → does NOT log the user in (they are redirected to /login). */
  signup: (payload: SignupPayload) => Promise<SignupResponse>;
  logout: () => void;
  /** True when a token exists and (if it is a JWT) has not expired. */
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,

      login: async (payload) => {
        const { token, user } = await authService.login(payload);
        if (!token) throw new Error('Login succeeded but no token was returned by the server.');
        set({ token, user });
        return user;
      },

      signup: (payload) => authService.signup(payload),

      logout: () => set({ token: null, user: null }),

      isAuthenticated: () => {
        const { token } = get();
        return Boolean(token) && !isJwtExpired(token as string);
      },
    }),
    {
      name: 'pulse-auth',
      storage: createJSONStorage(() => localStorage),
      // Only the session is persisted — never any user database.
      partialize: (state) => ({ token: state.token, user: state.user }),
    },
  ),
);
