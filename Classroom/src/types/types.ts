export type User = {
  id_formateur?: number;
  id_administrateur?: number;
  id_etudiant?: number;
  id?: number;
  nom: string;
  prenom: string;
  email: string;
  role: string;
  statut?: 'actif' | 'inactif';
  created_at?: Date;
  last_login?: string | null; 
  purchasedCourses?: number[];
  firstName?: string;
  lastName?: string;
  profileImage?: string;
  annee?: string;
  classe?: string;
  matricule?: string;
};

export type Stats = {
  etudiants: number;
  formateurs: number;
  admins: number;
  courses: number;
  ec: number;
  inscriptions: number; 
  connectedUsers: User[]; 
  recentUsers: User[];   
  totalUsers: number;
  totalEtudiants: number;
  totalFormateurs: number;
  totalAdmins: number;
  ues: number;
  classes: number;
  annees: number;
};

export type Staats = Stats;

export type Participant = {
  id: string;
  name: string;
  stream: MediaStream | null;
  isMuted: boolean;
  isVideoOff: boolean;
  isScreenSharing: boolean;
  role: 'etudiant' | 'formateur' | 'admin';
};

export type ChatMessage = {
  id: string;
  sender: string;
  message: string;
  timestamp: Date;
};

export type Course = {
  id: number;
  title: string;
  description: string;
  duration: string;
  students?: number;
  level?: string;
  category: string;
  image: string;
  price?: number; 
  isFree: boolean;
  videoUrl?: string;
  instructor?: string;
  createdAt?: Date;
  isPublished?: boolean; 
  lessons?: {
    id: number;
    title: string;
    duration: string;
    videoUrl?: string;
    isFree: boolean;
  }[];
  syllabus?: Array<{
    id: number;
    title: string;
    description: string;
  }>;
  hasLiveSession?: boolean;
  hasCertificate?: boolean;
  id_cours?: number;
  titre_cours?: string;
};

export type Lesson = {
  id: number;
  title: string;
  duration: string;
  videoUrl?: string;
  isFree: boolean;
};

export type AuthContextType = {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (
    nom: string,
    prenom: string,
    email: string,
    password: string,
    role: string
  ) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  loading: boolean;
  purchaseCourse: (courseId: number) => void;
};

export type UsersResponse = {
  users: User[];
  total: number;
  page: number;
  totalPages: number;
};

export type Annee = {
  id_annee: number;
  annee: string;
  date_debut: string;
  date_fin: string;
  statut: string;
  nom?: string;
};

export type Classe = {
  id_classe: number;
  niveau: string;
};

export type PaiementType = {
  id_paiement: number;
  id_inscription: number;
  montant: number;
  date_paiement: string;
  methode_paiement: 'carte_credit' | 'paypal';
  statut_paiement: 'en_attente' | 'effectuer' | 'annuler';
};

export type Etudiant = {
  id_etudiant?: number;
  matricule: string;
  nom: string;
  prenom: string;
  email: string;
  mot_de_passe?: string;
  created_at?: string;
  updated_at?: string;
  last_login?: string | null;
};

export type Inscription = {
  id_inscription?: number;
  id_etudiant: number;
  nom: string;
  prenom: string;
  email: string;
  id_annee: number;
  type: 'Inscription' | 'Réinscription';
  id_formation: number;
  id_classe: number;
  option?: string | null;
  mention?: string | null;
  created_at?: string;
  updated_at?: string;
  formation_domaine?: string;
  classe_niveau?: string;
  formation_option?: string;
  formation_mention?: string;
};

export type Semestre = {
  id_semestres: number;
  num_semestre: string;
};

export type UE = {
  id_ue: number;
  code_ue: string;
  credit: number;
  intitule: string;
  id_semestres: number;
  id_annee: number;
  id_classe: number;
};

export type EC = {
  id_ec: number;
  code_ec: string;
  intitule: string;
  id_ue: number;
  id_annee: number;
  id_classe: number;
  id_semestres: number;
  duree: number;
  image: string;
  is_published: boolean;
  description: string;
  is_free: boolean;
};

export type Formation = {
  id_formation: number;
  domaine: string;
  option?: string | null;
  mention?: string | null;
  id_classe?: number | null;
};

export type SemestresResponse = Semestre[];
export type UEResponse = UE[];
export type ECResponse = EC[];
export type CoursesResponse = Course[];
export type StatsResponse = Stats;
export type CourseFormData = Omit<Course, 'id' | 'lessons' | 'hasLiveSession'>;
export type UserFormData = Omit<User, 'id' | 'purchasedCourses' | 'createdAt' | 'lastLogin'> & {
  password: string;
};

export type Rapport = {
  id_rapport: number;
  titre: string;
  nom_ec: string;
  date_limite: string;
};

export type RapportDepot = {
  id_rapport: number;
  id_ec: number;
  fichier: string;
  date_depot: string;
  fichier_url: string;
};