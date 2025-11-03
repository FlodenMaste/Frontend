
import React, { useEffect, useState } from 'react';
import { adminService, Annee } from '../services/api';
import { Link } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

function formatDate(dateStr: string) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('fr-FR');
}

const AdminAnnees: React.FC = () => {
  const [form, setForm] = useState({ annee: '', date_debut: '', date_fin: '', statut: 'Ouvert' });
  const [annees, setAnnees] = useState<Annee[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [touched, setTouched] = useState<{[k:string]: boolean}>({});

  const fetchAnnees = async () => {
    try {
      const data = await adminService.getAnnees();
      setAnnees(Array.isArray(data) ? data : []);
    } catch {
      setAnnees([]);
    }
  };

  useEffect(() => {
    fetchAnnees();
  }, []);


  // Créer une nouvelle année avec toast visible
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    setTouched({ annee: true, date_debut: true, date_fin: true, statut: true });
    if (!form.annee) { setError('Année requise'); setLoading(false); return; }
    if (!form.date_debut) { setError('Date début requise'); setLoading(false); return; }
    if (!form.date_fin) { setError('Date fin requise'); setLoading(false); return; }
    try {
      await adminService.createAnnees(form);
      setForm({ annee: '', date_debut: '', date_fin: '', statut: 'Ouvert' });
      setSuccess('Année créée avec succès !');
      setTimeout(async () => {
        await fetchAnnees();
        setSuccess(null);
      }, 1800);
    } catch (err: unknown) {
      if (typeof err === 'object' && err && 'message' in err) {
        setError((err as { message?: string }).message || 'Erreur lors de la création');
      } else {
        setError('Erreur lors de la création');
      }
    }
    setLoading(false);
  };

  // Supprimer une année avec toast visible
  const handleDelete = async (id_annee: number) => {
    if (!window.confirm('Supprimer cette année ?')) return;
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await adminService.deleteAnnees(id_annee);
      setSuccess('Année supprimée avec succès !');
      setTimeout(async () => {
        await fetchAnnees();
        setSuccess(null);
      }, 1800);
    } catch (err: unknown) {
      if (typeof err === 'object' && err && 'message' in err) {
        setError((err as { message?: string }).message || 'Erreur lors de la suppression');
      } else {
        setError('Erreur lors de la suppression');
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-x-auto p-8 relative animate-fade-in">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-6 text-center">Gestion des années scolaires</h1>
        <Link
          to="/admin/dashboard"
          className="inline-block mb-6 px-4 py-2 bg-blue-200 text-black-800 rounded hover:bg-blue-300 transition"
        >
          ← Retour au tableau de bord Administrateur
        </Link>

        {/* Toasts dynamiques */}
        {error && (
          <div className="mb-4 flex items-center gap-2 bg-red-100 border-l-4 border-red-500 p-4 rounded shadow animate-fade-in">
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
            <span className="text-primary font-medium">Chargement...</span>
          </div>
        )}

        <form onSubmit={handleCreate} className="mb-8 flex gap-4 items-end flex-wrap">
          <div>
            <label>Année</label>
            <input
              type="text"
              required
              value={form.annee}
              onChange={e => { setForm(f => ({ ...f, annee: e.target.value })); setTouched(t => ({...t, annee: true})); }}
              className={`border px-2 py-1 rounded ${touched.annee && !form.annee ? 'border-red-400' : 'border-gray-300'}`}
              placeholder="ex: 2024-2025"
            />
          </div>
          <div>
            <label>Date début</label>
            <input
              type="date"
              required
              value={form.date_debut}
              onChange={e => { setForm(f => ({ ...f, date_debut: e.target.value })); setTouched(t => ({...t, date_debut: true})); }}
              className={`border px-2 py-1 rounded ${touched.date_debut && !form.date_debut ? 'border-red-400' : 'border-gray-300'}`}
            />
          </div>
          <div>
            <label>Date fin</label>
            <input
              type="date"
              required
              value={form.date_fin}
              onChange={e => { setForm(f => ({ ...f, date_fin: e.target.value })); setTouched(t => ({...t, date_fin: true})); }}
              className={`border px-2 py-1 rounded ${touched.date_fin && !form.date_fin ? 'border-red-400' : 'border-gray-300'}`}
            />
          </div>
          <div>
            <label>Statut</label>
            <select
              value={form.statut}
              onChange={e => { setForm(f => ({ ...f, statut: e.target.value })); setTouched(t => ({...t, statut: true})); }}
              className="border px-2 py-1 rounded"
            >
              <option value="Ouvert">Ouvert</option>
              <option value="Cloturée">Cloturée</option>
            </select>
          </div>
          <button type="submit" className="bg-primary text-white px-4 py-2 rounded shadow-lg transition-all duration-300" disabled={loading || !!success}>
            {loading ? <Loader2 className="animate-spin w-5 h-5 inline" /> : 'Créer'}
          </button>
        </form>

        <div className="overflow-x-auto">
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
                        onClick={() => handleDelete(annee.id_annee)}
                        title="Supprimer"
                        disabled={loading || !!success}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
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
        </div>
        <style>{`
          .animate-fade-in { animation: fadeIn .5s cubic-bezier(.4,0,.2,1); }
          .animate-fade-out { animation: fadeOut 1.2s 0.6s forwards; }
          @keyframes fadeIn { from { opacity:0; transform: translateY(20px);} to { opacity:1; transform: none; } }
          @keyframes fadeOut { to { opacity:0; transform: translateY(-10px);} }
        `}</style>
      </div>
    </div>
  );
};

export default AdminAnnees;