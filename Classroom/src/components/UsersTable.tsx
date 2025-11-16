import { User } from '../types/types';
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { adminService } from '../services/api';

export interface UsersTableProps {
  users: User[];
  onUpdate: () => void;
  onShowCourses?: (user: User) => void;
}

// Clé unique par type + id
const getUserKey = (user: User) => {
  if (user.role === 'etudiant' && user.id_etudiant != null) return `etudiant-${user.id_etudiant}`;
  if (user.role === 'formateur' && user.id_formateur != null) return `formateur-${user.id_formateur}`;
  if (user.role === 'admin' && user.id_administrateur != null) return `admin-${user.id_administrateur}`;
  if (user.id_etudiant != null) return `etudiant-${user.id_etudiant}`;
  if (user.id_formateur != null) return `formateur-${user.id_formateur}`;
  if (user.id_administrateur != null) return `admin-${user.id_administrateur}`;
  // fallback: utilise l'email ou l'index du tableau
  return `unknown-${user.email || Math.random()}`;
};

import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

const UsersTable = ({ users, onUpdate }: UsersTableProps) => {
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editedUser, setEditedUser] = useState<Partial<User>>({});
  const { user: currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleEdit = (user: User, idx: number) => {
    const key = getUserKey(user) + '-' + idx;
    setEditingKey(key);
    setEditedUser({
      nom: user.nom,
      prenom: user.prenom,
      email: user.email,
      role: user.role || ''
    });
  };

  const handleSave = async (user: User) => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await adminService.updateUser({
        ...editedUser,
        id_etudiant: user.id_etudiant,
        id_formateur: user.id_formateur,
        id_administrateur: user.id_administrateur,
        role: user.role,
        matricule: user.matricule
      });
      onUpdate();
      setEditingKey(null);
      setSuccess('Utilisateur mis à jour avec succès !');
      setTimeout(() => setSuccess(null), 1800);
    } catch (error) {
      setError('Erreur lors de la mise à jour');
      setTimeout(() => setError(null), 1800);
      console.error('Error updating user:', error);
    }
    setLoading(false);
  };

  const handleDelete = async (user: User) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      setLoading(true);
      setError(null);
      setSuccess(null);
      try {
        await adminService.deleteUser(user);
        onUpdate();
        setSuccess('Utilisateur supprimé avec succès !');
        setTimeout(() => setSuccess(null), 1800);
      } catch (error) {
        setError('Erreur lors de la suppression');
        setTimeout(() => setError(null), 1800);
        console.error('Error deleting user:', error);
      }
      setLoading(false);
    }
  };

  const handleToggleStatus = async (user: User) => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await adminService.toggleUserStatus(user);
      onUpdate();
      setSuccess('Statut modifié avec succès !');
      setTimeout(() => setSuccess(null), 1800);
    } catch {
      setError('Erreur lors du changement de statut');
      setTimeout(() => setError(null), 1800);
    }
    setLoading(false);
  };

  useEffect(() => {
    // Pour debug
    // console.log('User keys:', users.map(getUserKey));
    // console.log('Users:', users);
  }, [users]);

  return (
    <div className="overflow-x-auto">
      {/* Toasts dynamiques */}
      {error && (
        <div className="mb-4 flex items-center gap-2 bg-red-100 border-l-4 border-red-500 p-4 rounded shadow animate-fade-in animate-fade-out">
          <XCircle className="text-red-500 w-6 h-6" />
          <span className="text-red-700 font-medium">{error}</span>
        </div>
      )}
      {success && (
        <div className="mb-4 flex items-center gap-2 bg-green-100 border-l-4 border-green-500 p-4 rounded shadow animate-fade-in animate-fade-out">
          <CheckCircle className="text-green-500 w-6 h-6" />
          <span className="text-green-700 font-medium">{success}</span>
        </div>
      )}
      {loading && (
        <div className="mb-4 flex items-center gap-2 justify-center">
          <Loader2 className="animate-spin w-6 h-6 text-primary" />
          <span className="text-primary font-medium">Traitement...</span>
        </div>
      )}
      <table className="min-w-full border-collapse rounded-lg overflow-hidden shadow-lg">
        <thead>
          <tr className="bg-primary text-white">
            <th className="py-3 px-4 text-center">Nom</th>
            <th className="py-3 px-4 text-center">Prénom</th>
            <th className="py-3 px-4 text-center">Email</th>
            <th className="py-3 px-4 text-center">Rôle</th>
            <th className="py-3 px-4 text-center">Statut</th>
            <th className="py-3 px-4 text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user, idx) => {
            const key = getUserKey(user) + '-' + idx;
            return (
              <tr key={key} className="border-b hover:bg-blue-50 transition">
                <td className="py-2 px-4 text-center font-semibold">
                  {editingKey === key ? (
                    <input
                      type="text"
                      value={editedUser.nom || ''}
                      onChange={(e) => setEditedUser({...editedUser, nom: e.target.value})}
                      className="border rounded px-2 py-1"
                    />
                  ) : (
                    user.nom
                  )}
                </td>
                <td className="py-2 px-4 text-center">
                  {editingKey === key ? (
                    <input
                      type="text"
                      value={editedUser.prenom || ''}
                      onChange={(e) => setEditedUser({...editedUser, prenom: e.target.value})}
                      className="border rounded px-2 py-1"
                    />
                  ) : (
                    user.prenom
                  )}
                </td>
                <td className="py-2 px-4 text-center">
                  {editingKey === key ? (
                    <input
                      type="email"
                      value={editedUser.email || ''}
                      onChange={(e) => setEditedUser({...editedUser, email: e.target.value})}
                      className="border rounded px-2 py-1"
                    />
                  ) : (
                    user.email
                  )}
                </td>
                <td className="py-2 px-4 text-center">
                  {editingKey === key ? (
                    <select
                      value={editedUser.role || user.role}
                      onChange={(e) => setEditedUser({...editedUser, role: e.target.value as User['role']})}
                      className="border rounded px-2 py-1"
                    >
                      <option value="etudiant">Étudiant</option>
                      <option value="formateur">Formateur</option>
                      <option value="admin">Admin</option>
                    </select>
                  ) : (
                    <span className={`px-2 py-1 rounded-full text-xs font-bold
                      ${user.role === 'admin' ? 'bg-purple-100 text-red-700' :
                        user.role === 'formateur' ? 'bg-blue-100 text-blue-700' :
                        'bg-green-100 text-green-700'}`}>
                      {user.role}
                    </span>
                  )}
                </td>
                <td className="py-2 px-4 text-center">
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${user.statut === 'actif' ? 'bg-green-200 text-green-700' : 'bg-red-200 text-gray-700'}`}>
                    {user.statut === 'actif' ? 'Actif' : 'Inactif'}
                  </span>
                </td>
                <td className="py-2 px-4 text-center">
                  <div className="flex justify-center items-center gap-2">
                    {editingKey === key ? (
                      <>
                        <button 
                          onClick={() => handleSave(user)}
                          className="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded transition"
                          disabled={loading}
                        >
                          {loading ? <Loader2 className="animate-spin w-4 h-4 inline" /> : 'Enregistrer'}
                        </button>
                        <button 
                          onClick={() => setEditingKey(null)}
                          className="bg-gray-500 hover:bg-gray-600 text-white px-2 py-1 rounded transition"
                          disabled={loading}
                        >
                          Annuler
                        </button>
                      </>
                    ) : (
                      <>
                        <button 
                          onClick={() => handleEdit(user, idx)}
                          className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded transition"
                          disabled={loading}
                        >
                          Modifier
                        </button>
                        {currentUser?.role === 'admin' && (
                          <button 
                            onClick={() => handleDelete(user)}
                            className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded transition"
                            disabled={loading}
                          >
                            Supprimer
                          </button>
                        )}
                        <button
                          type="button"
                          role="switch"
                          aria-checked={user.statut === 'actif'}
                          onClick={() => handleToggleStatus(user)}
                          className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors focus:outline-none ${user.statut === 'actif' ? 'bg-green-500' : 'bg-gray-300'}`}
                          disabled={loading}
                        >
                          <span
                            className={`inline-block h-6 w-6 transform rounded-full bg-white shadow transition-transform ${user.statut === 'actif' ? 'translate-x-7' : 'translate-x-1'}`}
                          >
                            {user.statut === 'actif' ? (
                              <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            ) : (
                              <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            )}
                          </span>
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    <style>{`
      .animate-fade-in { animation: fadeIn .5s cubic-bezier(.4,0,.2,1); }
      .animate-fade-out { animation: fadeOut 1.2s 0.6s forwards; }
      @keyframes fadeIn { from { opacity:0; transform: translateY(20px);} to { opacity:1; transform: none; } }
      @keyframes fadeOut { to { opacity:0; transform: translateY(-10px);} }
    `}</style>
    </div>
  );
};

export default UsersTable;