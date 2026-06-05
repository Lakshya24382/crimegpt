import { create } from 'zustand';

export const useAuthStore = create((set) => ({
  officer: JSON.parse(localStorage.getItem('officer') || 'null'),
  token: localStorage.getItem('token') || null,

  login: (token, officer) => {
    localStorage.setItem('token', token);
    localStorage.setItem('officer', JSON.stringify(officer));
    set({ token, officer });
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('officer');
    set({ token: null, officer: null });
  },
}));