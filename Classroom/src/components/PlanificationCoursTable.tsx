import React, { useEffect, useState } from "react";
import { getPlanifications, createPlanification, updatePlanification, deletePlanification, getECs, getClasses, getAnnees, fetchSemestres, PlanificationCours, PlanificationPayload } from "../services/api";
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

// Types stricts pour EC, Classe, Annee, Semestre
interface EC {
  id_ec: number;
  intitule: string;
}

interface Classe {
  id_classe: number;
  niveau: string;
}

interface Annee {
  id_annee: number;
  annee: string;
}

interface Semestre {
  id_semestres: number;
  num_semestre: string;
}

// Type pour le formulaire
type PlanificationForm = {
  ec_id?: number | string;
  classe_id?: number | string;
  annee_id?: number | string;
  semestre_id?: number | string;
  heures_totales?: number | string;
  heures_restantes?: number | string;
};

const PlanificationCoursTable: React.FC = () => {
  const [planifications, setPlanifications] = useState<PlanificationCours[]>([]);
  const [ecs, setEcs] = useState<EC[]>([]);
  const [classes, setClasses] = useState<Classe[]>([]);
  const [annees, setAnnees] = useState<Annee[]>([]);
  const [semestres, setSemestres] = useState<Semestre[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<PlanificationForm>({});
  const [form, setForm] = useState<PlanificationForm>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setPlanifications(await getPlanifications());
    setEcs(await getECs());
    setClasses(await getClasses());
    setAnnees(await getAnnees());
    const semestresRes = await fetchSemestres();
    setSemestres(Array.isArray(semestresRes) ? semestresRes : []);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Inline edit change
  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload: PlanificationPayload = {
      id_ec: Number(form.ec_id),
      id_classe: Number(form.classe_id),
      id_annee: Number(form.annee_id),
      id_semestres: Number(form.semestre_id),
      heure_totale: Number(form.heures_totales),
      heure_restante: Number(form.heures_restantes),
    };
    if (
      !payload.id_ec ||
      !payload.id_classe ||
      !payload.id_annee ||
      !payload.id_semestres ||
      isNaN(payload.heure_totale) ||
      isNaN(payload.heure_restante)
    ) {
      setError("Tous les champs sont obligatoires !");
      setTimeout(() => setError(null), 1800);
      return;
    }
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await createPlanification(payload);
      setForm({});
      fetchData();
      setSuccess("Planification ajoutée avec succès !");
      setTimeout(() => setSuccess(null), 1800);
    } catch {
      setError("Erreur lors de la planification.");
      setTimeout(() => setError(null), 1800);
    }
    setLoading(false);
  };

  // Passe la ligne en mode édition
  const handleEdit = (planif: PlanificationCours) => {
    setEditingId(planif.id_planification);
    setEditForm({
      ec_id: planif.id_ec,
      classe_id: planif.id_classe,
      annee_id: planif.id_annee,
      semestre_id: planif.id_semestres,
      heures_totales: planif.heure_totale,
      heures_restantes: planif.heure_restante,
    });
  };

  // Sauvegarde la modification
  const handleEditSave = async (id: number) => {
    const payload: PlanificationPayload = {
      id_ec: Number(editForm.ec_id),
      id_classe: Number(editForm.classe_id),
      id_annee: Number(editForm.annee_id),
      id_semestres: Number(editForm.semestre_id),
      heure_totale: Number(editForm.heures_totales),
      heure_restante: Number(editForm.heures_restantes),
    };
    if (
      !payload.id_ec ||
      !payload.id_classe ||
      !payload.id_annee ||
      !payload.id_semestres ||
      isNaN(payload.heure_totale) ||
      isNaN(payload.heure_restante)
    ) {
      setError("Tous les champs sont obligatoires !");
      setTimeout(() => setError(null), 1800);
      return;
    }
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await updatePlanification(id, payload);
      setEditingId(null);
      setEditForm({});
      fetchData();
      setSuccess("Planification modifiée avec succès !");
      setTimeout(() => setSuccess(null), 1800);
    } catch {
      setError("Erreur lors de la modification.");
      setTimeout(() => setError(null), 1800);
    }
    setLoading(false);
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditForm({});
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Voulez-vous vraiment supprimer cette planification ?")) {
      setLoading(true);
      setError(null);
      setSuccess(null);
      try {
        await deletePlanification(id);
        fetchData();
        setSuccess("Planification supprimée avec succès !");
        setTimeout(() => setSuccess(null), 1800);
      } catch {
        setError("Erreur lors de la suppression.");
        setTimeout(() => setError(null), 1800);
      }
      setLoading(false);
    }
  };

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
      {/* Formulaire d'ajout */}
      <form onSubmit={handleSubmit} className="flex flex-wrap gap-2 mb-4">
        <select
          name="ec_id"
          value={form.ec_id || ""}
          onChange={handleChange}
          required
          className="border px-3 py-2 rounded"
        >
          <option value="">EC</option>
          {ecs.map((ec) => (
            <option key={ec.id_ec} value={ec.id_ec}>
              {ec.intitule}
            </option>
          ))}
        </select>
        <select
          name="classe_id"
          value={form.classe_id || ""}
          onChange={handleChange}
          required
          className="border px-3 py-2 rounded"
        >
          <option value="">Classe</option>
          {classes.map((c) => (
            <option key={c.id_classe} value={c.id_classe}>
              {c.niveau}
            </option>
          ))}
        </select>
        <select
          name="annee_id"
          value={form.annee_id || ""}
          onChange={handleChange}
          required
          className="border px-3 py-2 rounded"
        >
          <option value="">Année</option>
          {annees.map((a) => (
            <option key={a.id_annee} value={a.id_annee}>
              {a.annee}
            </option>
          ))}
        </select>
        <select
          name="semestre_id"
          value={form.semestre_id || ""}
          onChange={handleChange}
          required
          className="border px-3 py-2 rounded"
        >
          <option value="">Semestre</option>
          {semestres.map((s) => (
            <option key={s.id_semestres} value={s.id_semestres}>
              {s.num_semestre}
            </option>
          ))}
        </select>
        <input
          type="number"
          name="heures_totales"
          placeholder="Heures totales"
          value={form.heures_totales || ""}
          onChange={handleChange}
          required
          className="border px-3 py-2 rounded"
        />
        <input
          type="number"
          name="heures_restantes"
          placeholder="Heures restantes"
          value={form.heures_restantes || ""}
          onChange={handleChange}
          required
          className="border px-3 py-2 rounded"
        />
        <button
          type="submit"
          className="bg-primary hover:bg-purple-700 text-white px-4 py-2 rounded transition"
          disabled={loading}
        >
          {loading ? <Loader2 className="animate-spin w-4 h-4 inline" /> : 'Ajouter'}
        </button>
      </form>
      <table className="min-w-full border-collapse rounded-lg overflow-hidden shadow-lg">
        <thead>
          <tr className="bg-primary text-white">
            <th className="py-3 px-4 text-center">EC</th>
            <th className="py-3 px-4 text-center">Classe</th>
            <th className="py-3 px-4 text-center">Année</th>
            <th className="py-3 px-4 text-center">Semestre</th>
            <th className="py-3 px-4 text-center">Heures totales</th>
            <th className="py-3 px-4 text-center">Heures restantes</th>
            <th className="py-3 px-4 text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {planifications.map((p) =>
            editingId === p.id_planification ? (
              <tr key={p.id_planification} className="border-b bg-yellow-50">
                <td className="py-2 px-4 text-center font-semibold">
                  <select
                    name="ec_id"
                    value={editForm.ec_id || ""}
                    onChange={handleEditChange}
                    required
                    className="border px-2 py-1 rounded"
                  >
                    <option value="">EC</option>
                    {ecs.map((ec) => (
                      <option key={ec.id_ec} value={ec.id_ec}>
                        {ec.intitule}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="py-2 px-4 text-center">
                  <select
                    name="classe_id"
                    value={editForm.classe_id || ""}
                    onChange={handleEditChange}
                    required
                    className="border px-2 py-1 rounded"
                  >
                    <option value="">Classe</option>
                    {classes.map((c) => (
                      <option key={c.id_classe} value={c.id_classe}>
                        {c.niveau}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="py-2 px-4 text-center">
                  <select
                    name="annee_id"
                    value={editForm.annee_id || ""}
                    onChange={handleEditChange}
                    required
                    className="border px-2 py-1 rounded"
                  >
                    <option value="">Année</option>
                    {annees.map((a) => (
                      <option key={a.id_annee} value={a.id_annee}>
                        {a.annee}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="py-2 px-4 text-center">
                  <select
                    name="semestre_id"
                    value={editForm.semestre_id || ""}
                    onChange={handleEditChange}
                    required
                    className="border px-2 py-1 rounded"
                  >
                    <option value="">Semestre</option>
                    {semestres.map((s) => (
                      <option key={s.id_semestres} value={s.id_semestres}>
                        {s.num_semestre}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="py-2 px-4 text-center">
                  <input
                    type="number"
                    name="heures_totales"
                    value={editForm.heures_totales || ""}
                    onChange={handleEditChange}
                    required
                    className="border px-2 py-1 rounded"
                  />
                </td>
                <td className="py-2 px-4 text-center">
                  <input
                    type="number"
                    name="heures_restantes"
                    value={editForm.heures_restantes || ""}
                    onChange={handleEditChange}
                    required
                    className="border px-2 py-1 rounded"
                  />
                </td>
                <td className="py-2 px-4 text-center">
                  <button
                    onClick={() => handleEditSave(p.id_planification)}
                    className="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded transition mr-2"
                    disabled={loading}
                  >
                    {loading ? <Loader2 className="animate-spin w-4 h-4 inline" /> : 'Enregistrer'}
                  </button>
                  <button
                    onClick={handleEditCancel}
                    className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-2 py-1 rounded transition"
                    disabled={loading}
                  >
                    Annuler
                  </button>
                </td>
              </tr>
            ) : (
              <tr key={p.id_planification} className="border-b hover:bg-blue-50 transition">
                <td className="py-2 px-4 text-center font-semibold">
                  {ecs.find((ec) => ec.id_ec === p.id_ec)?.intitule}
                </td>
                <td className="py-2 px-4 text-center">
                  {classes.find((c) => c.id_classe === p.id_classe)?.niveau}
                </td>
                <td className="py-2 px-4 text-center">
                  {annees.find((a) => a.id_annee === p.id_annee)?.annee}
                </td>
                <td className="py-2 px-4 text-center">
                  {semestres.find((s) => s.id_semestres === p.id_semestres)?.num_semestre}
                </td>
                <td className="py-2 px-4 text-center">{p.heure_totale}</td>
                <td className="py-2 px-4 text-center">{p.heure_restante}</td>
                <td className="py-2 px-4 text-center">
                  <div className="flex justify-center items-center gap-2">
                    <button
                      onClick={() => handleEdit(p)}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded transition"
                      disabled={loading}
                    >
                      Modifier
                    </button>
                    <button
                      onClick={() => handleDelete(p.id_planification)}
                      className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded transition"
                      disabled={loading}
                    >
                      Supprimer
                    </button>
                  </div>
                </td>
              </tr>
            )
          )}
          {planifications.length === 0 && (
            <tr>
              <td colSpan={7} className="text-center py-4 text-gray-400">
                Aucune planification trouvée.
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

export default PlanificationCoursTable;