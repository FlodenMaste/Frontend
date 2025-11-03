import React, { useEffect, useState } from "react";
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import {getInscriptionsFormateur, createInscriptionFormateur, updateInscriptionFormateur, deleteInscriptionFormateur, getPlanifications, getAnnees, getECs, getClasses, fetchSemestres } from "../services/api";

// Définition locale du type qui correspond à ta base
interface InscriptionFormateur {
  id_inscription_formateur: number;
  id_formateur: number;
  id_planification: number;
  id_annee: number;
  date_inscription: string;
  type: string;
}

interface Annee {
  id_annee: number;
  annee: string;
}

interface Formateur {
  id_formateur: number;
  nom: string;
  prenom: string;
}

interface Semestre {
  id_semestres: number;
  num_semestre: string;
}

type Planification = {
  id: number;
  ec_id: number;
  classe_id: number;
  annee_id: number;
  semestre_id: number;
};

type InscriptionFormateurForm = {
  formateur_id?: number | string;
  planification_id?: number | string;
  annee_id?: number | string;
  date?: string;
  type?: string;
};

const getFormateurs = async () => {
  const res = await fetch("http://192.168.1.111:3000/api/formateurs");
  const json = await res.json();
  return Array.isArray(json) ? json : [];
};

function formatDate(dateStr: string | undefined) {
  if (!dateStr) return "";
  // Si la date est au format "dd/mm/yyyy"
  if (dateStr.includes("/")) {
    const [day, month, year] = dateStr.split("/");
    return `${year}-${month}-${day}`;
  }
  // Si la date est au format "yyyy-mm-dd" ou plus
  return dateStr.slice(0, 10);
}

const InscriptionFormateurTable: React.FC = () => {
  const [inscriptions, setInscriptions] = useState<InscriptionFormateur[]>([]);
  const [formateurs, setFormateurs] = useState<Formateur[]>([]);
  const [planifications, setPlanifications] = useState<Planification[]>([]);
  const [annees, setAnnees] = useState<Annee[]>([]);
  const [form, setForm] = useState<InscriptionFormateurForm>({});
  const [editingId, setEditingId] = useState<number | null>(null);
  const [ecs, setEcs] = useState<{ id_ec: number; intitule: string }[]>([]);
  const [classes, setClasses] = useState<{ id_classe: number; niveau: string }[]>([]);
  const [semestres, setSemestres] = useState<Semestre[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const insc = await getInscriptionsFormateur();
    const formateurs = await getFormateurs();
    const planifs = await getPlanifications();
    const annees = await getAnnees();
    const ecs = await getECs();
    const classes = await getClasses();
    const semestresRes = await fetchSemestres();

    setInscriptions(insc as unknown as InscriptionFormateur[]);
    setFormateurs(formateurs);
    setPlanifications(
      planifs.map((p) => ({
        id: p.id_planification,
        ec_id: p.id_ec,
        classe_id: p.id_classe,
        annee_id: p.id_annee,
        semestre_id: p.id_semestres,
      }))
    );
    setAnnees(annees);
    setEcs(ecs);
    setClasses(classes);
    setSemestres(Array.isArray(semestresRes) ? semestresRes : []);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const payload = {
      id_formateur: form.formateur_id ? Number(form.formateur_id) : undefined,
      id_planification: form.planification_id ? Number(form.planification_id) : undefined,
      id_annee: form.annee_id ? Number(form.annee_id) : undefined,
      date_inscription: formatDate(form.date),
      type: form.type,
    };
    if (!payload.id_formateur || !payload.id_planification || !payload.id_annee || !payload.date_inscription || !payload.type) {
      setError("Tous les champs sont obligatoires !");
      setTimeout(() => setError(null), 1800);
      return;
    }
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      if (editingId) {
        await updateInscriptionFormateur(editingId, payload);
        setSuccess("Inscription modifiée avec succès !");
      } else {
        await createInscriptionFormateur(payload);
        setSuccess("Inscription ajoutée avec succès !");
      }
      setForm({});
      setEditingId(null);
      fetchData();
      setTimeout(() => setSuccess(null), 1800);
    } catch {
      setError("Erreur lors de l'enregistrement.");
      setTimeout(() => setError(null), 1800);
    }
    setLoading(false);
  };

  const handleEdit = (inscription: InscriptionFormateur) => {
    setForm({
      formateur_id: inscription.id_formateur,
      planification_id: inscription.id_planification,
      annee_id: inscription.id_annee,
      date: inscription.date_inscription,
      type: inscription.type,
    });
    setEditingId(inscription.id_inscription_formateur);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Voulez-vous vraiment supprimer cette inscription ?")) {
      setLoading(true);
      setError(null);
      setSuccess(null);
      try {
        await deleteInscriptionFormateur(id);
        fetchData();
        setSuccess("Inscription supprimée avec succès !");
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
      {!editingId && (
        <form onSubmit={handleSubmit} className="flex flex-wrap gap-2 mb-4">
          <select
            name="formateur_id"
            value={form.formateur_id || ""}
            onChange={handleChange}
            required
            className="border px-3 py-2 rounded"
          >
            <option value="">Formateur</option>
            {formateurs.map((f) => (
              <option key={f.id_formateur} value={f.id_formateur}>
                {f.nom} {f.prenom}
              </option>
            ))}
          </select>
          <select
            name="planification_id"
            value={form.planification_id || ""}
            onChange={handleChange}
            required
            className="border px-3 py-2 rounded"
          >
            <option value="">Planification</option>
            {planifications.map((p) => (
              <option key={p.id} value={p.id}>
                {ecs.find(e => e.id_ec === p.ec_id)?.intitule || "EC inconnu"} - 
                {classes.find(c => c.id_classe === p.classe_id)?.niveau || "Classe inconnue"} - 
                {annees.find(a => a.id_annee === p.annee_id)?.annee || "Année inconnue"} - 
                {semestres.find(s => s.id_semestres === p.semestre_id)?.num_semestre || ""}
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
          <input
            type="date"
            name="date"
            value={
              form.date
                ? form.date.length > 10
                  ? form.date.slice(0, 10)
                  : form.date
                : ""
            }
            onChange={handleChange}
            required
            className="border px-3 py-2 rounded"
          />
          <input
            type="text"
            name="type"
            placeholder="Type"
            value={form.type || ""}
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
      )}

      {/* Tableau */}
      <table className="min-w-full border-collapse rounded-lg overflow-hidden shadow-lg">
        <thead>
          <tr className="bg-primary text-white">
            <th className="py-3 px-4 text-center">Formateur</th>
            <th className="py-3 px-4 text-center">Planification</th>
            <th className="py-3 px-4 text-center">Année</th>
            <th className="py-3 px-4 text-center">Date</th>
            <th className="py-3 px-4 text-center">Type</th>
            <th className="py-3 px-4 text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {inscriptions.map((i) =>
            editingId === i.id_inscription_formateur ? (
              <tr key={i.id_inscription_formateur} className="border-b bg-blue-50 transition">
                <td className="py-2 px-4 text-center font-semibold">
                  <select
                    name="formateur_id"
                    value={form.formateur_id || ""}
                    onChange={handleChange}
                    required
                    className="border px-2 py-1 rounded w-full"
                  >
                    <option value="">Formateur</option>
                    {formateurs.map((f) => (
                      <option key={f.id_formateur} value={f.id_formateur}>
                        {f.nom} {f.prenom}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="py-2 px-4 text-center">
                  <select
                    name="planification_id"
                    value={form.planification_id || ""}
                    onChange={handleChange}
                    required
                    className="border px-2 py-1 rounded w-full"
                  >
                    <option value="">Planification</option>
                    {planifications.map((p) => (
                      <option key={p.id} value={p.id}>
                        {ecs.find(e => e.id_ec === p.ec_id)?.intitule || "EC inconnu"} - 
                        {classes.find(c => c.id_classe === p.classe_id)?.niveau || "Classe inconnue"} - 
                        {annees.find(a => a.id_annee === p.annee_id)?.annee || "Année inconnue"} - 
                        {semestres.find(s => s.id_semestres === p.semestre_id)?.num_semestre || ""}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="py-2 px-4 text-center">
                  <select
                    name="annee_id"
                    value={form.annee_id || ""}
                    onChange={handleChange}
                    required
                    className="border px-2 py-1 rounded w-full"
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
                  <input
                    type="date"
                    name="date"
                    value={
                      form.date
                        ? form.date.length > 10
                          ? form.date.slice(0, 10)
                          : form.date
                        : ""
                    }
                    onChange={handleChange}
                    required
                    className="border px-2 py-1 rounded w-full"
                  />
                </td>
                <td className="py-2 px-4 text-center">
                  <input
                    type="text"
                    name="type"
                    value={form.type || ""}
                    onChange={handleChange}
                    required
                    className="border px-2 py-1 rounded w-full"
                  />
                </td>
                <td className="py-2 px-4 text-center">
                  <div className="flex justify-center items-center gap-2">
                    <button
                      type="button"
                      onClick={handleSubmit}
                      className="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded transition"
                      disabled={loading}
                    >
                      {loading ? <Loader2 className="animate-spin w-4 h-4 inline" /> : 'Enregistrer'}
                    </button>
                    <button
                      type="button"
                      onClick={() => { setForm({}); setEditingId(null); }}
                      className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-2 py-1 rounded transition"
                      disabled={loading}
                    >
                      Annuler
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              <tr key={i.id_inscription_formateur} className="border-b hover:bg-blue-50 transition">
                <td className="py-2 px-4 text-center font-semibold">
                  {formateurs.find((f) => f.id_formateur === Number(i.id_formateur))?.nom}{" "}
                  {formateurs.find((f) => f.id_formateur === Number(i.id_formateur))?.prenom}
                </td>
                <td className="py-2 px-4 text-center">
                  {
                    (() => {
                      const planif = planifications.find((p) => p.id === Number(i.id_planification));
                      const ec = ecs.find((e) => e.id_ec === planif?.ec_id);
                      const classe = classes.find((c) => c.id_classe === planif?.classe_id);
                      const annee = annees.find((a) => a.id_annee === planif?.annee_id);
                      const semestre = semestres.find((s) => s.id_semestres === planif?.semestre_id);
                      return planif && ec && classe && annee
                        ? `${ec.intitule} - ${classe.niveau} - ${annee.annee} - ${semestre?.num_semestre || ""}`
                        : "—";
                    })()
                  }
                </td>
                <td className="py-2 px-4 text-center">
                  {annees.find((a) => a.id_annee === Number(i.id_annee))?.annee}
                </td>
                <td className="py-2 px-4 text-center">
                  {i.date_inscription
                    ? new Date(i.date_inscription).toLocaleDateString("fr-FR")
                    : ""}
                </td>
                <td className="py-2 px-4 text-center">{i.type}</td>
                <td className="py-2 px-4 text-center">
                  <div className="flex justify-center items-center gap-2">
                    <button
                      onClick={() => handleEdit(i)}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded transition"
                      disabled={loading}
                    >
                      Modifier
                    </button>
                    <button
                      onClick={() => handleDelete(i.id_inscription_formateur)}
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
          {inscriptions.length === 0 && (
            <tr>
              <td colSpan={6} className="text-center py-4 text-gray-400">
                Aucune inscription trouvée.
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
}

export default InscriptionFormateurTable;