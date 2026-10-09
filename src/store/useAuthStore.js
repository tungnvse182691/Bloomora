import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import * as authService from '../services/auth.service';
import { setToken, clearToken } from '../services/api';

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,

      login: async (email, password) => {
        const { token, user } = await authService.login(email, password);
        setToken(token);
        set({ user });
        return user;
      },

      register: async (data) => {
        const { token, user } = await authService.register(data);
        setToken(token);
        set({ user });
        return user;
      },

      logout: () => {
        clearToken();
        set({ user: null });
      },

      fetchMe: async () => {
        const { user } = await authService.me();
        set({ user });
        return user;
      },
    }),
    {
      name: 'bloomora-auth',
      partialize: (s) => ({ user: s.user }),
    },
  ),
);
