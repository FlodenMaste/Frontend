import { createContext } from 'react';
import { User } from '../types/types';

export type AuthContextType = {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (
    nom: string,
    prenom: string,
    email: string,
    password: string,
    role: string
  ) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  clearError: () => void;
  changePassword: (currentPassword: string, newPassword: string) => Promise<boolean>;
  updateUser: (data: Partial<User>) => Promise<boolean>;
  purchaseCourse: (courseId: number, montant: number, methode_paiement: string) => Promise<void>;
};

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
