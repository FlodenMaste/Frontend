import { useEffect, useState } from 'react';
import { adminService, getAnnees, getFormations, getClasses, getEtudiants } from '../../services/api';
import type { Inscription, Annee, Etudiant, Formation } from '../../types/types';

// Types locaux pour Formation et Classe si non exportés dans types.ts
type Classe = {
  id_classe: number;
  niveau: string;
};

const AdminInscriptions = () => {
  const [inscriptions, setInscriptions] = useState<Inscription[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [edited, setEdited] = useState<Partial<Inscription>>({});
  const [annees, setAnnees] = useState<Annee[]>([]);
  const [formations, setFormations] = useState<Formation[]>([]);
  const [classes, setClasses] = useState<Classe[]>([]);
  const [etudiants, setEtudiants] = useState<Etudiant[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    adminService.getInscriptions().then(setInscriptions);
    getAnnees().then(setAnnees);
    getFormations().then(setFormations);
    getClasses().then(setClasses);
    getEtudiants().then(setEtudiants);
  }, []);

  const handleEdit = (insc: Inscription) => {
    setEditingId(insc.id_inscription!);
    setEdited({ ...insc });
  };

  const handleSave = async () => {
    if (!editingId) return;
    try {
      const safeEdited = {
        ...edited,
        option: edited.option === '' ? null : edited.option,
        mention: edited.mention === '' ? null : edited.mention
      };
      await adminService.updateInscription(editingId, safeEdited);
      setEditingId(null);
      setEdited({});
      setInscriptions(await adminService.getInscriptions());
    } catch {
      setError('Erreur lors de la mise à jour');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Supprimer cette inscription ?')) return;
    await adminService.deleteInscription(id);
    setInscriptions(await adminService.getInscriptions());
  };

  return (
    <div className="overflow-x-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Gestion des inscriptions</h2>
      {error && <div className="bg-red-100 text-red-700 p-2 mb-2">{error}</div>}
      <table className="min-w-full border-collapse rounded-lg overflow-hidden shadow-lg">
        <thead>
          <tr className="bg-primary text-white">
            <th className="py-3 px-4 text-center">Étudiant</th>
            <th className="py-3 px-4 text-center">Année</th>
            <th className="py-3 px-4 text-center">Formation</th>
            <th className="py-3 px-4 text-center">Classe</th>
            <th className="py-3 px-4 text-center">Option</th>
            <th className="py-3 px-4 text-center">Mention</th>
            <th className="py-3 px-4 text-center">Type</th>
            <th className="py-3 px-4 text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {inscriptions.map(insc => (
            <tr key={insc.id_inscription} className="border-b hover:bg-blue-50 transition">
              <td className="py-2 px-4 text-center">
                {editingId === insc.id_inscription ? (
                  <select
                    value={edited.id_etudiant}
                    onChange={e => setEdited({ ...edited, id_etudiant: Number(e.target.value) })}
                    className="border rounded px-2 py-1"
                  >
                    {etudiants.map(e => (
                      <option key={e.id_etudiant} value={e.id_etudiant}>
                        {e.nom} {e.prenom}
                      </option>
                    ))}
                  </select>
                ) : (
                  etudiants.find(e => e.id_etudiant === insc.id_etudiant)
                    ? `${etudiants.find(e => e.id_etudiant === insc.id_etudiant)!.nom} ${etudiants.find(e => e.id_etudiant === insc.id_etudiant)!.prenom}`
                    : <span className="text-gray-400 italic">Non renseigné</span>
                )}
              </td>
              <td className="py-2 px-4 text-center">
                {editingId === insc.id_inscription ? (
                  <select
                    value={edited.id_annee}
                    onChange={e => setEdited({ ...edited, id_annee: Number(e.target.value) })}
                    className="border rounded px-2 py-1"
                  >
                    {annees.map(a => {
                      const debut = a.date_debut ? new Date(a.date_debut).toLocaleDateString('fr-FR') : '';
                      const fin = a.date_fin ? new Date(a.date_fin).toLocaleDateString('fr-FR') : '';
                      return (
                        <option key={a.id_annee} value={a.id_annee}>
                          {debut} - {fin}{a.statut ? ' [' + a.statut + ']' : ''}
                        </option>
                      );
                    })}
                  </select>
                ) : (
                  (() => {
                    const anneeObj = annees.find(a => a.id_annee === insc.id_annee);
                    if (!anneeObj) return <span className="text-gray-400 italic">Non renseigné</span>;
                    const debut = anneeObj.date_debut ? new Date(anneeObj.date_debut).toLocaleDateString('fr-FR') : '';
                    const fin = anneeObj.date_fin ? new Date(anneeObj.date_fin).toLocaleDateString('fr-FR') : '';
                    return `${debut} - ${fin}${anneeObj.statut ? ' [' + anneeObj.statut + ']' : ''}`;
                  })()
                )}
              </td>
              <td className="py-2 px-4 text-center">
                {editingId === insc.id_inscription ? (
                  <select
                    value={edited.id_formation}
                    onChange={e => setEdited({ ...edited, id_formation: Number(e.target.value) })}
                    className="border rounded px-2 py-1 w-full min-w-[200px] max-w-[300px]"
                  >
                    {formations.map(f => (
                      <option key={f.id_formation} value={f.id_formation}>
                        {f.domaine}
                      </option>
                    ))}
                  </select>
                ) : (
                  insc.formation_domaine || <span className="text-gray-400 italic">Non renseigné</span>
                )}
              </td>
              <td className="py-2 px-4 text-center">
                {editingId === insc.id_inscription ? (
                  <select
                    value={edited.id_classe}
                    onChange={e => setEdited({ ...edited, id_classe: Number(e.target.value) })}
                    className="border rounded px-2 py-1"
                  >
                    {classes.map(c => (
                      <option key={c.id_classe} value={c.id_classe}>{c.niveau}</option>
                    ))}
                  </select>
                ) : (
                  insc.classe_niveau || <span className="text-gray-400 italic">Non renseigné</span>
                )}
              </td>
              <td className="py-2 px-4 text-center">
                {editingId === insc.id_inscription ? (
                  <select
                    value={edited.option ?? ''}
                    onChange={e => setEdited({ ...edited, option: e.target.value })}
                    className="border rounded px-2 py-1"
                  >
                    <option value="">Option</option>
                    <option value="Cybersécurité">Cybersécurité</option>
                    <option value="DevOPS">DevOPS</option>
                  </select>
                ) : (
                  insc.option || <span className="text-gray-400 italic">Non renseigné</span>
                )}
              </td>
              <td className="py-2 px-4 text-center">
                {editingId === insc.id_inscription ? (
                  <select
                    value={edited.mention ?? ''}
                    onChange={e => setEdited({ ...edited, mention: e.target.value })}
                    className="border rounded px-2 py-1"
                  >
                    <option value="">Mention</option>
                    <option value="TR">TR</option>
                  </select>
                ) : (
                  insc.mention || <span className="text-gray-400 italic">Non renseigné</span>
                )}
              </td>
              <td className="py-2 px-4 text-center">
                {editingId === insc.id_inscription ? (
                  <select
                    value={edited.type}
                    onChange={e => setEdited({ ...edited, type: e.target.value as 'Inscription' | 'Réinscription' })}
                    className="border rounded px-2 py-1"
                  >
                    <option value="Inscription">Inscription</option>
                    <option value="Réinscription">Réinscription</option>
                  </select>
                ) : (
                  insc.type
                )}
              </td>
              <td className="py-2 px-4 text-center">
                <div className="flex justify-center items-center gap-2">
                  {editingId === insc.id_inscription ? (
                    <>
                      <button
                        onClick={handleSave}
                        className="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded transition"
                      >
                        Enregistrer
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="bg-gray-500 hover:bg-gray-600 text-white px-2 py-1 rounded transition"
                      >
                        Annuler
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => handleEdit(insc)}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded transition"
                      >
                        Modifier
                      </button>
                      <button
                        onClick={() => handleDelete(insc.id_inscription!)}
                        className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded transition"
                      >
                        Supprimer
                      </button>
                    </>
                  )}
                </div>
              </td>
            </tr>
          ))}
          {inscriptions.length === 0 && (
            <tr>
              <td colSpan={8} className="text-center py-4 text-gray-400">
                Aucune inscription trouvée.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default AdminInscriptions;