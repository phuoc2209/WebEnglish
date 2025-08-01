import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { setToken, removeToken } from '../services/token';

export const useUserStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      login: (user, token) => {
        setToken(token);
        set({ user, token });
      },
      logout: () => {
        removeToken();
        set({ user: null, token: null });
      },
      clearUser: () => set({ user: null }),
      updateUser: (updatedUser) => {
        const currentUser = get().user;
        if (currentUser) {
          set({ user: { ...currentUser, ...updatedUser } });
        }
      },
    }),
    {
      name: 'user-storage',
    }
  )
);