import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { fetchEC, updateEC, deleteEC, fetchUE, getAnnees, getClasses, fetchSemestres } from '../services/api';
import type { EC, UE, Annee, Classe, Semestre } from '../types/types';

const ECListe = () => {
  const [ecs, setEcs] = useState<EC[]>([]);
  const [ues, setUEs] = useState<UE[]>([]);
  const [annees, setAnnees] = useState<Annee[]>([]);
  const [classes, setClasses] = useState<Classe[]>([]);
  const [semestres, setSemestres] = useState<Semestre[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editedEC, setEditedEC] = useState<Partial<EC>>({});

  useEffect(() => {
    async function fetchAll() {
      setLoading(true);
      const [ecsData, uesData, anneesData, classesData, semestresData] = await Promise.all([
        fetchEC(),
        fetchUE(),
        getAnnees(),
        getClasses(),
        fetchSemestres()
      ]);
      setEcs(ecsData);
      setUEs(uesData);
      setAnnees(anneesData);
      setClasses(classesData);
      setSemestres(Array.isArray(semestresData) ? semestresData : []);
      setLoading(false);
    }
    fetchAll();
  }, []);

  const handleEdit = (ec: EC) => {
    setEditingId(ec.id_ec);
    setEditedEC({ ...ec });
  };

  const handleSave = async (id_ec: number) => {
    setActionLoading(true);
    setError(null);
    setSuccess(null);
    try {
      // Ajoute description et is_free si absents
      const ecToSave: EC = {
        ...editedEC,
        description: editedEC.description ?? '',
        is_free: editedEC.is_free ?? false,
      } as EC;
      await updateEC(id_ec, ecToSave);
      const updated = await fetchEC();
      setEcs(updated);
      setEditingId(null);
      setSuccess('EC modifié avec succès !');
      setTimeout(() => setSuccess(null), 1800);
    } catch {
      setError('Erreur lors de la modification');
      setTimeout(() => setError(null), 1800);
    }
    setActionLoading(false);
  };

  const handleDelete = async (id_ec: number) => {
    if (window.confirm('Voulez-vous vraiment supprimer ce cours ?')) {
      setActionLoading(true);
      setError(null);
      setSuccess(null);
      try {
        await deleteEC(id_ec);
        setEcs(ecs.filter(e => e.id_ec !== id_ec));
        setSuccess('EC supprimé avec succès !');
        setTimeout(() => setSuccess(null), 1800);
      } catch {
        setError('Erreur lors de la suppression');
        setTimeout(() => setError(null), 1800);
      }
      setActionLoading(false);
    }
  };

  if (loading) return <div className="flex items-center gap-2 justify-center py-8"><Loader2 className="animate-spin w-6 h-6 text-primary" /> <span>Chargement...</span></div>;

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
      {actionLoading && (
        <div className="mb-4 flex items-center gap-2 justify-center">
          <Loader2 className="animate-spin w-6 h-6 text-primary" />
          <span className="text-primary font-medium">Traitement...</span>
        </div>
      )}
      <h2 className="text-2xl font-bold mb-6 text-center">Liste des EC</h2>
      <table className="min-w-full border-collapse rounded-lg overflow-hidden shadow-lg">
        <thead>
          <tr className="bg-primary text-white">
            <th className="py-3 px-4 text-center">Code EC</th>
            <th className="py-3 px-4 text-center">Intitulé</th>
            <th className="py-3 px-4 text-center">UE</th>
            <th className="py-3 px-4 text-center">Année</th>
            <th className="py-3 px-4 text-center">Classe</th>
            <th className="py-3 px-4 text-center">Semestre</th>
            <th className="py-3 px-4 text-center">Durée</th>
            <th className="py-3 px-4 text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {ecs.map(ec => (
            <tr key={ec.id_ec} className="border-b hover:bg-blue-50 transition">
              <td className="py-2 px-4 text-center font-bold">
                {editingId === ec.id_ec ? (
                  <input
                    type="text"
                    value={editedEC.code_ec || ''}
                    onChange={e => setEditedEC({ ...editedEC, code_ec: e.target.value })}
                    className="border rounded px-2 py-1"
                  />
                ) : ec.code_ec}
              </td>
              <td className="py-2 px-4 text-center">
                {editingId === ec.id_ec ? (
                  <input
                    type="text"
                    value={editedEC.intitule || ''}
                    onChange={e => setEditedEC({ ...editedEC, intitule: e.target.value })}
                    className="border rounded px-2 py-1"
                  />
                ) : ec.intitule}
              </td>
              <td className="py-2 px-4 text-center">
                {editingId === ec.id_ec ? (
                  <select
                    value={editedEC.id_ue ?? ''}
                    onChange={e => setEditedEC({ ...editedEC, id_ue: Number(e.target.value) })}
                    className="border rounded px-2 py-1"
                  >
                    <option value="">UE</option>
                    {ues.map(ue => (
                      <option key={ue.id_ue} value={ue.id_ue}>
                        {ue.code_ue} - {ue.intitule}
                      </option>
                    ))}
                  </select>
                ) : (
                  (() => {
                    const ue = ues.find(u => u.id_ue === ec.id_ue);
                    return ue ? `${ue.code_ue} - ${ue.intitule}` : <span className="text-gray-400 italic">Non renseigné</span>;
                  })()
                )}
              </td>
              <td className="py-2 px-4 text-center">
                {editingId === ec.id_ec ? (
                  <select
                    value={editedEC.id_annee ?? ''}
                    onChange={e => setEditedEC({ ...editedEC, id_annee: Number(e.target.value) })}
                    className="border rounded px-2 py-1"
                  >
                    <option value="">Année</option>
                    {annees.map(a => (
                      <option key={a.id_annee} value={a.id_annee}>
                        {a.annee}
                      </option>
                    ))}
                  </select>
                ) : (
                  (() => {
                    const annee = annees.find(a => a.id_annee === ec.id_annee);
                    return annee ? annee.annee : <span className="text-gray-400 italic">Non renseigné</span>;
                  })()
                )}
              </td>
              <td className="py-2 px-4 text-center">
                {editingId === ec.id_ec ? (
                  <select
                    value={editedEC.id_classe ?? ''}
                    onChange={e => setEditedEC({ ...editedEC, id_classe: Number(e.target.value) })}
                    className="border rounded px-2 py-1"
                  >
                    <option value="">Classe</option>
                    {classes.map(c => (
                      <option key={c.id_classe} value={c.id_classe}>
                        {c.niveau}
                      </option>
                    ))}
                  </select>
                ) : (
                  (() => {
                    const classe = classes.find(c => c.id_classe === ec.id_classe);
                    return classe ? classe.niveau : <span className="text-gray-400 italic">Non renseigné</span>;
                  })()
                )}
              </td>
              <td className="py-2 px-4 text-center">
                {editingId === ec.id_ec ? (
                  <select
                    value={editedEC.id_semestres ?? ''}
                    onChange={e => setEditedEC({ ...editedEC, id_semestres: Number(e.target.value) })}
                    className="border rounded px-2 py-1"
                  >
                    <option value="">Semestre</option>
                    {semestres.map(s => (
                      <option key={s.id_semestres} value={s.id_semestres}>
                        {s.num_semestre}
                      </option>
                    ))}
                  </select>
                ) : (
                  (() => {
                    const semestre = semestres.find(s => s.id_semestres === ec.id_semestres);
                    return semestre ? semestre.num_semestre : <span className="text-gray-400 italic">Non renseigné</span>;
                  })()
                )}
              </td>
              <td className="py-2 px-4 text-center">
                {editingId === ec.id_ec ? (
                  <input
                    type="number"
                    value={editedEC.duree ?? ''}
                    onChange={e => setEditedEC({ ...editedEC, duree: Number(e.target.value) })}
                    className="border rounded px-2 py-1"
                  />
                ) : ec.duree}
              </td>
              <td className="py-2 px-4 text-center">
                <div className="flex justify-center items-center gap-2">
                  {editingId === ec.id_ec ? (
                    <>
                      <button
                        className="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded transition"
                        onClick={() => handleSave(ec.id_ec)}
                        disabled={actionLoading}
                      >
                        {actionLoading ? <Loader2 className="animate-spin w-4 h-4 inline" /> : 'Enregistrer'}
                      </button>
                      <button
                        className="bg-gray-500 hover:bg-gray-600 text-white px-2 py-1 rounded transition"
                        onClick={() => setEditingId(null)}
                        disabled={actionLoading}
                      >
                        Annuler
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded transition"
                        onClick={() => handleEdit(ec)}
                        disabled={actionLoading}
                      >
                        Modifier
                      </button>
                      <button
                        className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded transition"
                        onClick={() => handleDelete(ec.id_ec)}
                        disabled={actionLoading}
                      >
                        Supprimer
                      </button>
                    </>
                  )}
                </div>
              </td>
            </tr>
          ))}
          {ecs.length === 0 && (
            <tr>
              <td colSpan={8} className="text-center py-4 text-gray-400">
                Aucun EC trouvé.
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
  );
};

export default ECListe;