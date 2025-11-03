import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { adminService } from '../services/api';
import type { User, Annee, Stats, RapportDepot } from '../types/types';
import UsersTable from '../components/UsersTable';
import AdminInscriptions from './admin/AdminInscriptions';
import ECListe from '../components/ECListe';
import PlanificationCoursTable from '../components/PlanificationCoursTable';
import InscriptionFormateurTable from '../components/InscriptionFormateurTable';
import AdminStats from '../components/AdminStats';
import { FaTrash } from "react-icons/fa"; // l'icône de poubelle avec react-icons

const USERS_PER_PAGE = 5;

// Fonction utilitaire pour formater une date en "dd/mm/yyyy HH:MM:ss"
function formatDateTime(dateString?: string) {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  const pad = (n: number) => n.toString().padStart(2, '0');
  return (
    pad(date.getDate()) +
    '/' +
    pad(date.getMonth() + 1) +
    '/' +
    date.getFullYear() +
    ' ' +
    pad(date.getHours()) +
    ':' +
    pad(date.getMinutes()) +
    ':' +
    pad(date.getSeconds())
  );
}

// Fonction utilitaire pour formater une date en "dd/mm/yyyy"
function formatDate(dateString?: string) {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  const pad = (n: number) => n.toString().padStart(2, '0');
  return pad(date.getDate()) + '/' + pad(date.getMonth() + 1) + '/' + date.getFullYear();
}

const AdminDashboard = () => {
  const { user, register, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<
    'stats' | 'users' | 'ec' | 'planification' | 'inscriptions' | 'inscriptionsFormateur' | 'annees'
  >('stats');
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [roleFilter, setRoleFilter] = useState<'all' | 'etudiant' | 'formateur' | 'administrateur'>('all');

  // Gestion des années scolaires
  const [annees, setAnnees] = useState<Annee[]>([]);
  const [anneeForm, setAnneeForm] = useState({ annee: '', date_debut: '', date_fin: '', statut: 'Ouvert' });
  const [anneeError, setAnneeError] = useState<string | null>(null);
  const [anneeSuccess, setAnneeSuccess] = useState<string | null>(null);
  const [anneeLoading, setAnneeLoading] = useState(false);
  const [anneeTouched, setAnneeTouched] = useState<{[k:string]: boolean}>({});

  // Statistiques
  const [stats, setStats] = useState<Stats | null>(null);

  // Rapports déposés (pour le bloc unique)
  const [allDepots, setAllDepots] = useState<(RapportDepot & { nom_ec?: string })[]>([]);
  const [loadingDepots, setLoadingDepots] = useState(false);

  // Formulaire création admin/formateur
  const [showUserForm, setShowUserForm] = useState(false);
  const [userFormData, setUserFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: '',
  });
  const [userFormError, setUserFormError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Fetch all users (students, trainers, admins)
  const fetchUsers = async () => {
    try {
      const [etudiants, formateurs, admins] = await Promise.all([
        adminService.getEtudiants(),
        adminService.getFormateurs(),
        adminService.getAdministrateurs(),
      ]);
      const allUsers: User[] = [
        ...etudiants.map((u) => ({
          ...u,
          created_at: u.created_at ? new Date(u.created_at) : undefined,
          role: 'etudiant',
        })),
        ...formateurs.map((u) => ({
          ...u,
          created_at: u.created_at ? new Date(u.created_at) : undefined,
          role: 'formateur',
        })),
        ...admins.map((u) => ({
          ...u,
          created_at: u.created_at ? new Date(u.created_at) : undefined,
          role: 'admin',
        })),
      ];
      setUsers(allUsers);
    } catch {
      // Erreur ignorée
    }
  };

  const fetchAnnees = async () => {
    try {
      const response = await adminService.getAnnees();
      if (response) setAnnees(response);
    } catch {
      setAnnees([]);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await adminService.getAdvancedStats();
      setStats(response);
    } catch {
      // Erreur ignorée
    }
  };

  // Récupère tous les rapports déposés pour le bloc unique
  const fetchAllDepots = async () => {
    setLoadingDepots(true);
    try {
      const response = await fetch('http://192.168.1.111:3000/api/rapport_etudiant/depots');
      const data = await response.json();
      setAllDepots(data);
    } catch {
      setAllDepots([]);
    }
    setLoadingDepots(false);
  };

  useEffect(() => {
    if (activeTab === 'users') fetchUsers();
    if (activeTab === 'annees') fetchAnnees();
    if (activeTab === 'stats') {
      fetchStats();
      fetchAllDepots();
    }
    setPage(1); 
    setSearch('');
  }, [activeTab]);

  if (!user || user.role !== 'admin') {
    return <div>Accès refusé</div>;
  }

  // Filtrage des utilisateurs par rôle
  const filteredUsers = users.filter(u =>
    (roleFilter === 'all' || u.role?.toLowerCase() === roleFilter) &&
    (u.nom?.toLowerCase().includes(search.toLowerCase()) ||
     u.prenom?.toLowerCase().includes(search.toLowerCase()) ||
     u.email?.toLowerCase().includes(search.toLowerCase()))
  );

  // Pagination
  const totalPages = Math.ceil(filteredUsers.length / USERS_PER_PAGE);
  const paginatedUsers = filteredUsers.slice(
    (page - 1) * USERS_PER_PAGE,
    page * USERS_PER_PAGE
  );

  // Gestion des années scolaires
  // Création année avec toast visible
  const handleCreateAnnee = async (e: React.FormEvent) => {
    e.preventDefault();
    setAnneeLoading(true);
    setAnneeError(null);
    setAnneeSuccess(null);
    setAnneeTouched({ annee: true, date_debut: true, date_fin: true, statut: true });
    if (!anneeForm.annee) { setAnneeError('Année requise'); setAnneeLoading(false); return; }
    if (!anneeForm.date_debut) { setAnneeError('Date début requise'); setAnneeLoading(false); return; }
    if (!anneeForm.date_fin) { setAnneeError('Date fin requise'); setAnneeLoading(false); return; }
    try {
      await adminService.createAnnees(anneeForm);
      setAnneeForm({ annee: '', date_debut: '', date_fin: '', statut: 'Ouvert' });
      setAnneeSuccess('Année créée avec succès !');
      setTimeout(async () => {
        await fetchAnnees();
        setAnneeSuccess(null);
      }, 1800);
    } catch (err: unknown) {
      if (typeof err === 'object' && err && 'message' in err) {
        setAnneeError((err as { message?: string }).message || 'Erreur lors de la création');
      } else {
        setAnneeError('Erreur lors de la création');
      }
    }
    setAnneeLoading(false);
  };

  // Suppression année avec toast visible
  const handleDeleteAnnee = async (id_annee: number) => {
    if (!window.confirm('Supprimer cette année ?')) return;
    setAnneeLoading(true);
    setAnneeError(null);
    setAnneeSuccess(null);
    try {
      await adminService.deleteAnnees(id_annee);
      setAnneeSuccess('Année supprimée avec succès !');
      setTimeout(async () => {
        await fetchAnnees();
        setAnneeSuccess(null);
      }, 1800);
    } catch (err: unknown) {
      if (typeof err === 'object' && err && 'message' in err) {
        setAnneeError((err as { message?: string }).message || 'Erreur lors de la suppression');
      } else {
        setAnneeError('Erreur lors de la suppression');
      }
    }
    setAnneeLoading(false);
  };

  // Formulaire création admin/formateur
  const handleUserFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setUserFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleUserFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUserFormError('');
    if (userFormData.password !== userFormData.confirmPassword) {
      return setUserFormError('Les mots de passe ne correspondent pas');
    }
    if (userFormData.password.length < 6) {
      return setUserFormError('Le mot de passe doit contenir au moins 6 caractères');
    }
    const success = await register(
      userFormData.nom,
      userFormData.prenom,
      userFormData.email,
      userFormData.password,
      userFormData.role
    );
    if (success) {
      setShowUserForm(false);
      setUserFormData({
        nom: '',
        prenom: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'formateur',
      });
      fetchUsers();
    } else {
      setUserFormError("Erreur lors de la création du compte");
    }
  };

  // Ajoute la fonction de suppression rapport
  const handleDeleteRapport = async (id_rapport: number) => {
    if (!window.confirm('Supprimer ce rapport ?')) return;
    try {
      const token = localStorage.getItem('token');
      await fetch(`http://192.168.1.111:3000/api/rapport_etudiant/${id_rapport}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      // Refresh la liste des rapports
      fetchAllDepots();
    } catch {
      alert('Erreur lors de la suppression');
    }
  };

  return (
    <div className="container mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold mb-6">Tableau de bord Administrateur</h1>
      <div className="flex mb-6 flex-wrap gap-2">
        <button
          className={`px-4 py-2 ${activeTab === 'stats' ? 'bg-primary text-white' : 'bg-gray-200'}`}
          onClick={() => setActiveTab('stats')}
        >
          Statistiques
        </button>
        <button
          className={`px-4 py-2 ${activeTab === 'users' ? 'bg-primary text-white' : 'bg-gray-200'}`}
          onClick={() => setActiveTab('users')}
        >
          Utilisateurs
        </button>
        <button
          className={`px-4 py-2 ${activeTab === 'ec' ? 'bg-primary text-white' : 'bg-gray-200'}`}
          onClick={() => setActiveTab('ec')}
        >
          EC (cours)
        </button>
        <button
          className={`px-4 py-2 ${activeTab === 'planification' ? 'bg-primary text-white' : 'bg-gray-200'}`}
          onClick={() => setActiveTab('planification')}
        >
          Planification Cours
        </button>
        <button
          className={`px-4 py-2 ${activeTab === 'inscriptionsFormateur' ? 'bg-primary text-white' : 'bg-gray-200'}`}
          onClick={() => setActiveTab('inscriptionsFormateur')}
        >
          Inscriptions Formateur
        </button>
        <button
          className={`px-4 py-2 ${activeTab === 'inscriptions' ? 'bg-primary text-white' : 'bg-gray-200'}`}
          onClick={() => setActiveTab('inscriptions')}
        >
          Inscriptions Étudiants
        </button>
        <button
          className={`px-4 py-2 ${activeTab === 'annees' ? 'bg-primary text-white' : 'bg-gray-200'}`}
          onClick={() => setActiveTab('annees')}
        >
          Années scolaires
        </button>
      </div>

      {activeTab === 'stats' && (
        <>
          <AdminStats stats={stats ?? {
            totalUsers: 0,
            totalEtudiants: 0,
            totalFormateurs: 0,
            totalAdmins: 0,
            etudiants: 0,
            formateurs: 0,
            admins: 0,
            courses: 0,
            ec: 0,
            inscriptions: 0,
            ues: 0,
            classes: 0,
            annees: 0,
            connectedUsers: [],
            recentUsers: []
          }} />
          {/* Bloc Rapports à rendre */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8 mt-8">
            <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center justify-center min-w-[220px] w-full">
              <span className="text-2xl font-bold text-primary">{allDepots.length}</span>
              <span className="text-gray-600 mt-2">Rapports déposés</span>
              {loadingDepots ? (
                <div className="mt-4 text-gray-500">Chargement...</div>
              ) : allDepots.length === 0 ? (
                <div className="mt-4 text-gray-500">Aucun rapport déposé.</div>
              ) : (
                <div className="mt-4 w-full max-h-48 overflow-y-auto">
                  <ul className="text-sm">
                    {allDepots.map((depot) => (
                      <li key={depot.id_rapport} className="mb-2 flex flex-col md:flex-row md:items-center gap-2">
                        <a
                          href={depot.fichier_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 underline truncate max-w-[120px]"
                          title={depot.fichier}
                        >
                          {depot.fichier}
                        </a>
                        <span className="text-gray-500">{depot.nom_ec || ''}</span>
                        <span className="text-gray-400 text-xs">{formatDateTime(depot.date_depot)}</span>
                        {/* Bouton suppression pour l'admin */}
                        <button
                          className="ml-2 text-red-600 hover:text-red-800"
                          title="Supprimer"
                          onClick={() => handleDeleteRapport(depot.id_rapport)}
                        >
                          <FaTrash />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {activeTab === 'users' && (
        <>
          <div className="flex justify-between mb-4">
            <button
              className="bg-primary text-white px-4 py-2 rounded"
              onClick={() => setShowUserForm(true)}
            >
              + Ajouter un utilisateur
            </button>
            <input
              type="text"
              placeholder="Rechercher..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              className="border px-3 py-2 rounded ml-4"
              style={{ minWidth: 200 }}
            />
            <select
              value={roleFilter}
              onChange={e => setRoleFilter(e.target.value as typeof roleFilter)}
              className="border px-3 py-2 rounded ml-4"
            >
              <option value="all">Tous les rôles</option>
              <option value="etudiant">Étudiant</option>
              <option value="formateur">Formateur</option>
              <option value="admin">Administrateur</option>
            </select>
          </div>
          <UsersTable users={paginatedUsers} onUpdate={fetchUsers} />
          <div className="flex justify-center items-center mt-4 gap-2">
            <button
              className="px-3 py-1 rounded bg-gray-200"
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
            >
              Précédent
            </button>
            <span>
              Page {page} / {totalPages}
            </span>
            <button
              className="px-3 py-1 rounded bg-gray-200"
              disabled={page === totalPages || totalPages === 0}
              onClick={() => setPage(page + 1)}
            >
              Suivant
            </button>
          </div>
          {/* Modal/Formulaire création admin/formateur */}
          {showUserForm && (
            <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
              <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md relative">
                <button
                  className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                  onClick={() => setShowUserForm(false)}
                >
                  &times;
                </button>
                <h2 className="text-2xl font-bold mb-4">Créer un compte</h2>
                {userFormError && (
                  <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4 text-red-700">
                    {userFormError}
                  </div>
                )}
                <form className="space-y-4" onSubmit={handleUserFormSubmit}>
                  <div>
                    <label htmlFor="nom" className="block text-sm font-medium text-gray-700">
                      Nom
                    </label>
                    <input
                      id="nom"
                      name="nom"
                      type="text"
                      required
                      value={userFormData.nom}
                      onChange={handleUserFormChange}
                      className="block w-full px-3 py-2 border rounded"
                    />
                  </div>
                  <div>
                    <label htmlFor="prenom" className="block text-sm font-medium text-gray-700">
                      Prénom
                    </label>
                    <input
                      id="prenom"
                      name="prenom"
                      type="text"
                      required
                      value={userFormData.prenom}
                      onChange={handleUserFormChange}
                      className="block w-full px-3 py-2 border rounded"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                      Adresse email
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={userFormData.email}
                      onChange={handleUserFormChange}
                      className="block w-full px-3 py-2 border rounded"
                    />
                  </div>
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                      Mot de passe
                    </label>
                    <div className="relative mt-1">
                      <input
                        id="password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={userFormData.password}
                        onChange={handleUserFormChange}
                        placeholder="Mot de passe (6+ caractères)"
                        className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 pr-10 focus:ring-primary focus:border-primary transition"
                      />
                      <button
                        type="button"
                        tabIndex={-1}
                        onClick={() => setShowPassword((v) => !v)}
                        className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 hover:text-primary focus:outline-none"
                        aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                      >
                        {showPassword ? (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-.274.832-.64 1.627-1.09 2.357M15.54 15.54A8.963 8.963 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.014 9.014 0 012.042-3.357" />
                          </svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.014 9.014 0 012.042-3.357m1.664-2.512A9.956 9.956 0 0112 5c4.478 0 8.268 2.943 9.542 7a8.978 8.978 0 01-4.304 5.294M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3l18 18" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                      Confirmer le mot de passe
                    </label>
                    <div className="relative mt-1">
                      <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        required
                        value={userFormData.confirmPassword}
                        onChange={handleUserFormChange}
                        placeholder="Confirmer le mot de passe"
                        className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 pr-10 focus:ring-primary focus:border-primary transition"
                      />
                      <button
                        type="button"
                        tabIndex={-1}
                        onClick={() => setShowConfirmPassword((v) => !v)}
                        className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 hover:text-primary focus:outline-none"
                        aria-label={showConfirmPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                      >
                        {showConfirmPassword ? (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-.274.832-.64 1.627-1.09 2.357M15.54 15.54A8.963 8.963 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.014 9.014 0 012.042-3.357" />
                          </svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.014 9.014 0 012.042-3.357m1.664-2.512A9.956 9.956 0 0112 5c4.478 0 8.268 2.943 9.542 7a8.978 8.978 0 01-4.304 5.294M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3l18 18" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                      Rôle
                    </label>
                    <select
                      id="role"
                      name="role"
                      required
                      value={userFormData.role}
                      onChange={handleUserFormChange}
                      className="block w-full px-3 py-2 border rounded"
                    >
                      <option value="" disabled>Sélectionner un rôle</option>
                      <option value="formateur">Formateur</option>
                      <option value="admin">Administrateur</option>
                    </select>
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className={`w-full py-2 px-4 rounded bg-primary text-white font-bold ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                  >
                    {loading ? "Création en cours..." : "Créer le compte"}
                  </button>
                </form>
              </div>
            </div>
          )}
        </>
      )}

      {activeTab === 'ec' && (
        <>
          <div className="flex justify-end mb-4">
            <Link to="/admin/courses/new" className="bg-primary text-white px-4 py-2 rounded">
              + Ajouter un cours
            </Link>
          </div>
          <ECListe />
        </>
      )}
      {activeTab === 'planification' && (
        <PlanificationCoursTable />
      )}
      {activeTab === 'inscriptionsFormateur' && (
        <InscriptionFormateurTable />
      )}
      {activeTab === 'inscriptions' && (
        <>
          <div className="flex justify-end mb-4">
            <Link to="/admin/users/new" className="bg-primary text-white px-4 py-2 rounded">
              + Inscrire un étudiant
            </Link>
          </div>
          <AdminInscriptions />
        </>
      )}
      {activeTab === 'annees' && (
        <div>
          {/* Toasts dynamiques pour années scolaires */}
          {anneeError && (
            <div className="mb-4 flex items-center gap-2 bg-red-100 border-l-4 border-red-500 p-4 rounded shadow animate-fade-in">
              <span className="text-red-700 font-medium">{anneeError}</span>
            </div>
          )}
          {anneeSuccess && (
            <div className="mb-4 flex items-center gap-2 bg-green-100 border-l-4 border-green-500 p-4 rounded shadow animate-fade-in animate-fade-out">
              <span className="text-green-700 font-medium">{anneeSuccess}</span>
            </div>
          )}
          {anneeLoading && (
            <div className="mb-4 flex items-center gap-2 justify-center">
              <span className="text-primary font-medium">Chargement...</span>
            </div>
          )}
          <div className="flex justify-between mb-4 flex-wrap gap-4">
            {/* Champ de saisie Année à gauche */}
            <form onSubmit={handleCreateAnnee} className="flex gap-4 items-end flex-wrap w-full">
              <div className="flex-1 min-w-[180px]">
                <label>Année</label>
                <input
                  type="text"
                  required
                  value={anneeForm.annee}
                  onChange={e => { setAnneeForm(f => ({ ...f, annee: e.target.value })); setAnneeTouched(t => ({...t, annee: true})); }}
                  className={`border px-2 py-1 rounded w-full ${anneeTouched.annee && !anneeForm.annee ? 'border-red-400' : 'border-gray-300'}`}
                  placeholder="ex: 2024-2025"
                />
              </div>
              <div>
                <label>Date début</label>
                <input
                  type="date"
                  required
                  value={anneeForm.date_debut}
                  onChange={e => { setAnneeForm(f => ({ ...f, date_debut: e.target.value })); setAnneeTouched(t => ({...t, date_debut: true})); }}
                  className={`border px-2 py-1 rounded ${anneeTouched.date_debut && !anneeForm.date_debut ? 'border-red-400' : 'border-gray-300'}`}
                />
              </div>
              <div>
                <label>Date fin</label>
                <input
                  type="date"
                  required
                  value={anneeForm.date_fin}
                  onChange={e => { setAnneeForm(f => ({ ...f, date_fin: e.target.value })); setAnneeTouched(t => ({...t, date_fin: true})); }}
                  className={`border px-2 py-1 rounded ${anneeTouched.date_fin && !anneeForm.date_fin ? 'border-red-400' : 'border-gray-300'}`}
                />
              </div>
              <div>
                <label>Statut</label>
                <select
                  value={anneeForm.statut}
                  onChange={e => { setAnneeForm(f => ({ ...f, statut: e.target.value })); setAnneeTouched(t => ({...t, statut: true})); }}
                  className="border px-2 py-1 rounded"
                >
                  <option value="Ouvert">Ouvert</option>
                  <option value="Cloturée">Cloturée</option>
                </select>
              </div>
              <button type="submit" className="bg-primary text-white px-4 py-2 rounded" disabled={anneeLoading || !!anneeSuccess}>
                {anneeLoading ? 'Création...' : 'Créer'}
              </button>
            </form>
          </div>
          <table className="w-full border-collapse rounded-lg overflow-hidden shadow-lg bg-white">
            <thead>
              <tr className="bg-primary text-white">
                <th className="px-4 py-2 text-center">ID</th>
                <th className="px-4 py-2 text-center">Année</th>
                <th className="px-4 py-2 text-center">Début</th>
                <th className="px-4 py-2 text-center">Fin</th>
                <th className="px-4 py-2 text-center">Statut</th>
                <th className="px-4 py-2 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(annees) && annees.length > 0 ? (
                annees.map(annee => (
                  <tr key={annee.id_annee} className="hover:bg-blue-50 transition animate-fade-in">
                    <td className="border-t px-4 py-2 font-semibold text-center">{annee.id_annee}</td>
                    <td className="border-t px-4 py-2 text-center">{annee.annee}</td>
                    <td className="border-t px-4 py-2 text-center">{formatDate(annee.date_debut)}</td>
                    <td className="border-t px-4 py-2 text-center">{formatDate(annee.date_fin)}</td>
                    <td className="border-t px-4 py-2 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold
                        ${annee.statut === 'Ouvert' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {annee.statut}
                      </span>
                    </td>
                    <td className="border-t px-4 py-2 text-center">
                      <button
                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded flex items-center gap-1 transition mx-auto"
                        onClick={() => handleDeleteAnnee(annee.id_annee)}
                        title="Supprimer"
                        disabled={anneeLoading || !!anneeSuccess}
                      >
                        Supprimer
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center py-4 text-gray-500">
                    Aucune année trouvée.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <style>{`
            .animate-fade-in { animation: fadeIn .5s cubic-bezier(.4,0,.2,1); }
            .animate-fade-out { animation: fadeOut 1.2s 0.6s forwards; }
            @keyframes fadeIn { from { opacity:0; transform: translateY(20px);} to { opacity:1; transform: none; } }
            @keyframes fadeOut { to { opacity:0; transform: translateY(-10px);} }
          `}</style>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;