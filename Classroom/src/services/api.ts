import axios from 'axios';
import type { Etudiant, Inscription, User, SemestresResponse, UEResponse, ECResponse} from '../types/types';

const API_URL = 'http://192.168.1.111:3000/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authService = {
  register: async (userData: {
    nom: string;
    prenom: string;
    email: string;
    password: string;
    role: string;
  }) => {
    try {
      let response;
      if (userData.role === 'etudiant') {
        response = await api.post('/register', {
          nom: userData.nom,
          prenom: userData.prenom,
          email: userData.email,
          password: userData.password,
        });
      } else if (userData.role === 'formateur') {
        response = await api.post('/formateurs', {
          nom: userData.nom,
          prenom: userData.prenom,
          email: userData.email,
          mot_de_passe: userData.password,
        });
      } else if (userData.role === 'admin') {
        response = await api.post('/administrateurs', {
          nom: userData.nom,
          prenom: userData.prenom,
          email: userData.email,
          mot_de_passe: userData.password,
        });
      } else {
        throw new Error("Rôle non supporté");
      }
      return response.data;
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'response' in error && error.response && typeof error.response === 'object' && 'data' in error.response) {
        throw (error as { response: { data: unknown } }).response.data;
      }
      throw { error: "Erreur lors de l'inscription" };
    }
  },

  login: async (credentials: { email: string; password: string }) => {
    try {
      const response = await api.post('/login', {
        email: credentials.email,
        mot_de_passe: credentials.password
      });
      return response.data;
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'response' in error && error.response && typeof error.response === 'object' && 'data' in error.response) {
        throw (error as { response: { data: unknown } }).response.data;
      }
      throw { error: 'Erreur lors de la connexion' };
    }
  },

  changePassword: async (currentPassword: string, newPassword: string) => {
    return api.post('/change-password', {
      current_password: currentPassword,
      new_password: newPassword,
      new_password_confirmation: newPassword,
    });
  },
};

export const getEtudiants = async (): Promise<Etudiant[]> => {
  const { data } = await api.get('/etudiants');
  return data;
};

export type Formation = {
  id_formation: number;
  domaine: string;
  option?: string | null;
  mention?: string | null;
  id_classe?: number | null;
};

// Types stricts pour les entités
export type Annee = {
  id_annee: number;
  annee: string;
  date_debut: string;
  date_fin: string;
  statut: 'Ouvert' | 'Cloturée';
  created_at: string;
  updated_at: string;
};

export type EC = {
  id_ec: number;
  intitule: string;
  description: string;
  duree: number;
  image: string;
  video_url?: string;
  level?: string;
  category?: string;
  is_free: boolean;
  is_published: boolean;
  instructor?: string;
};

export type Classe = {
  id_classe: number;
  niveau: string;
};
// Fonctions API pour sélection dynamique
export const getAnnees = async (): Promise<Annee[]> => {
  // Utilise l'instance api pour garantir l'URL correcte
  const { data } = await api.get('/annees');
  return data;
};

export const getECs = async () => {
  const res = await axios.get(`${API_URL}/ec`);
  return res.data;
};

export const createEC = async (data: EC) => {
  const res = await axios.post(`${API_URL}/ec`, data);
  return res.data;
};

export const updateEC = async (id: number, data: EC) => {
  const res = await axios.put(`${API_URL}/ec/${id}`, data);
  return res.data;
};

export const deleteEC = async (id: number) => {
  const res = await axios.delete(`${API_URL}/ec/${id}`);
  return res.data;
};

export const getClasses = async (): Promise<Classe[]> => {
  const { data } = await api.get('/classes');
  return data;
};

type ApiEC = {
  id_ec: number;
  intitule: string;
  description: string;
  duree: number;
  image: string;
  video_url?: string;
  level?: string;
  category?: string;
  is_free: boolean;
  is_published: boolean;
  instructor?: string;
};

export type UserWithRole = {
  role: string;
  id_etudiant?: number;
  id_formateur?: number;
  id_administrateur?: number;
  nom?: string;
  prenom?: string;
  email?: string;
  password?: string;
  matricule?: string;
};

// Crée un étudiant et son inscription (nécessite id_annee)
export async function createEtudiant(data: { matricule: string; nom: string; prenom: string; email: string; mot_de_passe: string; id_annee: number; id_formation: number; id_classe: number; option?: string; mention?: string }) {
  const res = await api.post('/etudiants', data);
  if (!res.status || res.status >= 400) throw new Error('Erreur création étudiant');
  return res.data;
}

export async function createInscription(data: Inscription) {
  const res = await api.post('/inscriptions', data);
  if (!res.status || res.status >= 400) throw new Error('Erreur création inscription');
  return res.data;
}

export const adminService = {
  createInscription: async (data: Inscription) => {
    return api.post('/inscriptions', data).then(res => res.data);
  },
  getInscriptions: async () => {
    return api.get('/inscriptions').then(res => res.data);
  },

  updateInscription: async (id: number, data: Partial<Inscription>) => {
    return api.put(`/inscriptions/${id}`, data).then(res => res.data);
  },

  deleteInscription: async (id: number) => {
    return api.delete(`/inscriptions/${id}`).then(res => res.data);
  },

  inscriptionAnneeEtCours: async (data: Inscription & { id_cours?: number }) => {
    const token = localStorage.getItem('token');
    const response = await fetch('http://192.168.1.111:3000/api/inscription-unifiee', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error("Erreur lors de l'inscription au cours");
    return await response.json();
  },
  getEtudiants: async (): Promise<Etudiant[]> => (await api.get('/etudiants')).data,
  getFormateurs: async (): Promise<User[]> => (await api.get('/formateurs')).data,
  getAdministrateurs: async (): Promise<User[]> => (await api.get('/administrateurs')).data,
  toggleUserStatus: async (user: User) => {
    let id, type;
    if (user.id_etudiant) {
      id = user.id_etudiant;
      type = 'etudiants';
    } else if (user.id_formateur) {
      id = user.id_formateur;
      type = 'formateurs';
    } else if (user.id_administrateur) {
      id = user.id_administrateur;
      type = 'administrateurs';
    } else {
      throw new Error('Type d’utilisateur inconnu');
    }
    const newStatus = user.statut === 'actif' ? 'inactif' : 'actif';
    return api.patch(`/${type}/${id}/statut`, { statut: newStatus });
  },
  updateUser: async (user: UserWithRole) => {
    if (user.role === 'etudiant') return api.put(`/etudiants/${user.id_etudiant}`, user);
    if (user.role === 'formateur') return api.put(`/formateurs/${user.id_formateur}`, user);
    if (user.role === 'admin') return api.put(`/administrateurs/${user.id_administrateur}`, user);
  },
  deleteUser: async (user: UserWithRole) => {
    if (user.role === 'etudiant') return api.delete(`/etudiants/${user.id_etudiant}`);
    if (user.role === 'formateur') return api.delete(`/formateurs/${user.id_formateur}`);
    if (user.role === 'admin') return api.delete(`/administrateurs/${user.id_administrateur}`);
  },
  createUser: async (user: UserWithRole) => {
    if (user.role === 'etudiant') {
      return api.post('/etudiants', {
        nom: user.nom,
        prenom: user.prenom,
        email: user.email,
        mot_de_passe: user.password,
      });
    }
    if (user.role === 'formateur') {
      return api.post('/formateurs', {
        nom: user.nom,
        prenom: user.prenom,
        email: user.email,
        mot_de_passe: user.password,
      });
    }
    if (user.role === 'admin') {
      return api.post('/administrateurs', {
        nom: user.nom,
        prenom: user.prenom,
        email: user.email,
        mot_de_passe: user.password,
      });
    }
    throw new Error('Rôle utilisateur inconnu');
  },

  createCourse: async (course: { [key: string]: unknown }) => api.post('/ec', course),

  getAdvancedStats: async () => (await api.get('/stats')).data,
  getUsers: async () => {
    const [etudiants, formateurs, admins] = await Promise.all([
      api.get('/etudiants'),
      api.get('/formateurs'),
      api.get('/administrateurs'),
    ]);
    return {
      users: [
        ...((etudiants.data as Etudiant[]).map((u) => ({ ...u, role: 'etudiant' }))),
        ...((formateurs.data as User[]).map((u) => ({ ...u, role: 'formateur' }))),
        ...((admins.data as User[]).map((u) => ({ ...u, role: 'admin' }))),
      ],
    };
  },

  // Paiement
  createPaiement: async (data: { id_inscription: number; montant: number; methode_paiement: string; date_paiement: string }) => {
    console.log("Payload envoyé :", data);
    if (
      !data.id_inscription ||
      typeof data.montant !== 'number' ||
      data.montant <= 0 ||
      !data.date_paiement ||
      !data.methode_paiement
    ) {
      throw new Error('Données de paiement invalides');
    }
    return api.post('/paiements', data).then(res => res.data);
  },
  getPaiements: async () => {
    return api.get('/paiements').then(res => res.data);
  },
  confirmerPaiement: async (id_paiement: number) =>
    api.post(`/paiements/${id_paiement}/confirmer`).then(res => res.data),

  annulerPaiement: async (id_paiement: number) =>
    api.post(`/paiements/${id_paiement}/annuler`).then(res => res.data),

  createAnnees: async (data: { date_debut: string; date_fin: string; statut: string }) => {
    return api.post('/annees', data).then(res => res.data);
  },
  
  deleteAnnees: async (id_annee: number) => {
    return api.delete(`/annees/${id_annee}`);
  },

  getCourses: async () => (await api.get('/ec')).data.map((c: ApiEC) => ({
    id: c.id_ec,
    title: c.intitule,
    description: c.description,
    duration: c.duree + (c.duree ? ' heures' : ''),
    level: c.level,
    category: c.category,
    image: c.image && c.image.trim() !== '' ? `http://192.168.1.111:3000/${c.image}` : '/default.jpg',
    isFree: true,
    videoUrl: c.video_url && c.video_url.trim() !== '' ? `http://192.168.1.111:3000/${c.video_url}` : undefined,
    instructor: c.instructor,
    isPublished: !!c.is_published,
  })),
  updateCourse: async (course: { [key: string]: unknown }) => api.put(`/ec/${course.id_ec}`, course),
  deleteCourse: async (id: number) => api.delete(`/ec/${id}`),

  getAnnees: getAnnees,
};

export const getCoursInscrits = async (id_etudiant: number) => {
  const res = await api.get(`/etudiants/${id_etudiant}/ec`);
  return res.data;
};

export const etudiantService = {
  getCoursesByEtudiantAndAnnee: async (id_etudiant: number, id_annee: number) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/etudiants/${id_etudiant}/annees/${id_annee}/ec`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    if (!response.ok) throw new Error('Erreur lors de la récupération des EC');
    return await response.json();
  },

  getAnnees: getAnnees,

  inscrireAuCours: async (id_inscription: number, id_ec: number) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/inscription_ec`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        id_inscription,
        id_ec,
        date_inscription: new Date().toISOString().slice(0, 10),
      }),
    });
    if (!response.ok) throw new Error('Erreur lors de l\'inscription à l\'EC');
    return await response.json();
  }
};

// Semestres, UEs, ECs
export async function fetchSemestres(): Promise<SemestresResponse> {
  const res = await fetch(`${API_URL}/semestres`);
  return await res.json();
}

export async function fetchUE(): Promise<UEResponse> {
  const res = await fetch(`${API_URL}/ue`);
  return await res.json();
}

export async function fetchEC(): Promise<ECResponse> {
  const res = await fetch('http://192.168.1.111:3000/api/ec');
  return await res.json();
}

export const getFormations = async (): Promise<Formation[]> => {
  const { data } = await api.get('/formations');
  return data;
};

// Types pour PlanificationCours et le payload API
export interface PlanificationCours {
  id_planification: number;
  id_ec: number;
  id_classe: number;
  id_annee: number;
  id_semestres: number;
  heure_totale: number;
  heure_restante: number;
}

// Type pour le payload envoyé à l'API
export type PlanificationPayload = {
  id_ec: number;
  id_classe: number;
  id_annee: number;
  id_semestres: number;
  heure_totale: number;
  heure_restante: number;
};

// PlanificationCours API
export const getPlanifications = async (): Promise<PlanificationCours[]> => {
  const { data } = await api.get('/planification_cours');
  return data;
};
export const createPlanification = async (data: PlanificationPayload): Promise<PlanificationCours> => {
  const res = await api.post('/planification_cours', data);
  return res.data;
};
export const updatePlanification = async (id: number, data: PlanificationPayload): Promise<PlanificationCours> => {
  const res = await api.put(`/planification_cours/${id}`, data);
  return res.data;
};
export const deletePlanification = async (id: number): Promise<{ success: boolean }> => {
  const res = await api.delete(`/planification_cours/${id}`);
  return res.data;
};

// InscriptionFormateur
export interface InscriptionFormateur {
  id: number; // id_inscription_formateur
  formateur_id: number; // id_formateur
  planification_id: number; // id_planification
  annee_id: number; // id_annee
  date: string; // date_inscription
  type: string;
}

export const getInscriptionsFormateur = async (): Promise<InscriptionFormateur[]> => {
  const { data } = await api.get('/inscription_formateur');
  return data;
};
export const createInscriptionFormateur = async (data: Partial<InscriptionFormateur>): Promise<InscriptionFormateur> => {
  const res = await api.post('/inscription_formateur', data);
  return res.data;
};
export const updateInscriptionFormateur = async (id: number, data: Partial<InscriptionFormateur>): Promise<InscriptionFormateur> => {
  const res = await api.put(`/inscription_formateur/${id}`, data);
  return res.data;
};
export const deleteInscriptionFormateur = async (id: number): Promise<{ success: boolean }> => {
  const res = await api.delete(`/inscription_formateur/${id}`);
  return res.data;
};

export const rapportService = {
  async getAllRapports() {
    const res = await fetch('/api/rapports');
    if (!res.ok) throw new Error('Erreur récupération rapports');
    return await res.json();
  },
  async getDepotsByRapport(id_rapport: number) {
    const res = await fetch(`/api/rapports/${id_rapport}/depots`);
    if (!res.ok) throw new Error('Erreur récupération dépôts');
    return await res.json();
  },
  async getRapportsEtudiant(id_etudiant: number) {
    const res = await fetch(`/api/etudiants/${id_etudiant}/rapports`);
    if (!res.ok) throw new Error('Erreur récupération rapports étudiant');
    return await res.json();
  },
  async deposerRapport(id_rapport: number, file: File) {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`/api/rapports/${id_rapport}/depot`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) throw new Error('Erreur dépôt rapport');
    return await res.json();
  }
};

export const getFormateurCoursPlanifies = async (id_formateur: number) => {
  const token = localStorage.getItem('token');
  const res = await fetch(
    `http://192.168.1.111:3000/api/formateurs/${id_formateur}/cours-planifies`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }
  );
  if (!res.ok) throw new Error("Erreur lors de la récupération des cours planifiés");
  return await res.json();
};

// Récupère les étudiants inscrits à une classe et année (pour le dashboard formateur)
export const getEtudiantsInscritsClasse = async (classe: string, annee: string) => {
  // On suppose que la classe est le niveau (ex: "L1") et annee est le libellé (ex: "2024-2025")
  const res = await fetch(`http://192.168.1.111:3000/api/inscriptions?classe=${encodeURIComponent(classe)}&annee=${encodeURIComponent(annee)}`);
  if (!res.ok) return [];
  const data = await res.json();
  // On adapte le format pour le tableau
  return Array.isArray(data)
    ? data.map((i: any) => ({
        id_etudiant: i.id_etudiant,
        nom: i.nom,
        prenom: i.prenom,
        email: i.email,
        classe: i.classe_niveau || classe,
        annee: i.annee || annee,
      }))
    : [];
};

// Récupère les rapports déposés pour les EC du formateur
export const getRapportsDeposesFormateur = async (id_formateur: number) => {
  const res = await fetch(`http://192.168.1.111:3000/api/formateurs/${id_formateur}/rapports-deposes`);
  if (!res.ok) return [];
  return await res.json();
};