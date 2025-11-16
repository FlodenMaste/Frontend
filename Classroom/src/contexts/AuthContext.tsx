import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { authService } from '../services/api';
import { User } from '../types/types';
import axios from 'axios';

const API_URL = 'http://192.168.1.111:3000/api';

type AuthContextType = {
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

const AuthContext = createContext<AuthContextType | undefined>(undefined);
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const data = await authService.login({ email, password });
      if (!data?.token || !data?.user || !data?.role) throw new Error('Réponse API invalide');
      // Ajout récupération année et classe
      let annee = undefined;
      let classe = undefined;
      if (data.role === 'etudiant' && data.user?.id_etudiant) {
        // On suppose que l'API retourne l'inscription active de l'étudiant
        const res = await axios.get(`${API_URL}/etudiants/${data.user.id_etudiant}/inscription-active`);
        annee = res.data?.annee;
        classe = res.data?.classe;
      }
      const userWithRole = { ...data.user, role: data.role, annee, classe };
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(userWithRole));
      setUser(userWithRole);
      return true;
    } catch {
      setError('Échec de la connexion');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const register = async (
    nom: string,
    prenom: string,
    email: string,
    password: string,
    role: string
  ): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const data = await authService.register({ nom, prenom, email, password, role });
      if (!data?.token || !data?.user) throw new Error('Réponse API invalide');
      const userWithRole = { ...data.user, role: data.role || role };
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(userWithRole));
      setUser(userWithRole);
      return true;
    } catch {
      setError("Échec de l'inscription");
      return false;
    } finally {
      setLoading(false);
    }
/* eslint-disable react-refresh/only-export-components */
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const clearError = () => setError(null);

  const changePassword = async (currentPassword: string, newPassword: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      await authService.changePassword(currentPassword, newPassword);
      return true;
    } catch (error) {
      if (typeof error === 'object' && error !== null && 'response' in error) {
        setError((error as { response?: { data?: { message?: string } } }).response?.data?.message || 'Erreur lors du changement de mot de passe');
      } else {
        setError('Erreur lors du changement de mot de passe');
      }
      return false;
    } finally {
      setLoading(false);
    }
  };

  // La fonction updateUser pour la modification du profil
  const updateUser = async (data: Partial<User>): Promise<boolean> => {
    if (!user) return false;
    setLoading(true);
    setError(null);
    try {
      // On suppose que le backend accepte PUT /etudiants/:id ou /formateurs/:id ou /administrateurs/:id
      let endpoint = '';
      if (user.role === 'etudiant') endpoint = `/etudiants/${user.id_etudiant}`;
      else if (user.role === 'formateur') endpoint = `/formateurs/${user.id_formateur}`;
      else if (user.role === 'admin') endpoint = `/administrateurs/${user.id_administrateur}`;
      else throw new Error('Rôle inconnu');

      await axios.put(`${API_URL}${endpoint}`, data);
      const updatedUser = { ...user, ...data };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      return true;
    } catch (error) {
      if (typeof error === 'object' && error !== null && 'response' in error) {
        setError((error as { response?: { data?: { message?: string } } }).response?.data?.message || 'Erreur lors de la mise à jour du profil');
      } else {
        setError('Erreur lors de la mise à jour du profil');
      }
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour acheter un cours (inscription + paiement)
  const purchaseCourse = async (courseId: number, montant: number, methode_paiement: string) => {
    if (!user) return;
    // Créer ou récupérer l'inscription
    const inscriptionRes = await axios.post(`${API_URL}/inscription_cours`, {
      id_etudiant: user.id_etudiant,
      id_cours: courseId,
    });
    const id_inscription = inscriptionRes.data.id_inscription;

    // Créee paiement côté backend
    await axios.post(`${API_URL}/paiements`, {
      id_inscription,
      montant: montant,
      date_paiement: new Date().toISOString().slice(0, 10),
      methode_paiement: methode_paiement,
      statut_paiement: 'effectuer',
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        isAuthenticated: !!user,
        loading,
        error,
        clearError,
        changePassword,
        updateUser,
        purchaseCourse,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};