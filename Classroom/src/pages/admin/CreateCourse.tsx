
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminService, getAnnees, fetchUE, getClasses, fetchSemestres } from '../../services/api';
import { Annee, UE, Semestre } from '../../types/types';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

type Classe = {
  id_classe: number;
  niveau: string;
};
type Support = {
  id_support: number;
  titre: string;
  fichier: string;
};
type CreateCourseResponse = {
  data: {
    id_ec: number;
    [key: string]: unknown;
  };
};

const CreateCourse = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    code_ec: '',
    intitule: '',
    id_ue: '',
    id_annee: '',
    id_classe: '',
    id_semestres: '',
    duree: '',
    image: '',
    is_published: true,
  });
  const [annees, setAnnees] = useState<Annee[]>([]);
  const [ues, setUEs] = useState<UE[]>([]);
  const [classes, setClasses] = useState<Classe[]>([]);
  const [semestres, setSemestres] = useState<Semestre[]>([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState<{[k:string]: boolean}>({});

  // Pour l'upload PDF
  const [pdfTitle, setPdfTitle] = useState('');
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [supports, setSupports] = useState<Support[]>([]);
  const [createdEcId, setCreatedEcId] = useState<number | null>(null);

  useEffect(() => {
    getAnnees().then(data => setAnnees(Array.isArray(data) ? data : []));
    fetchUE().then(data => setUEs(Array.isArray(data) ? data : []));
    getClasses().then(data => setClasses(Array.isArray(data) ? data : []));
    fetchSemestres().then(data => setSemestres(Array.isArray(data) ? data : []));
  }, []);

  // Récupère les supports PDF pour l'EC créé
  useEffect(() => {
    if (createdEcId) {
      fetch(`http://192.168.1.111:3000/api/ec/${createdEcId}/supports`)
        .then(res => res.json())
        .then(setSupports)
        .catch(() => setSupports([]));
    }
  }, [createdEcId]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox'
        ? (e.target as HTMLInputElement).checked
        : value
    }));
    setTouched(t => ({...t, [name]: true}));
  };

  // Validation instantanée
  const validate = () => {
    if (!formData.code_ec) return 'Code EC requis';
    if (!formData.intitule) return 'Intitulé requis';
    if (!formData.id_ue) return 'UE requise';
    if (!formData.id_annee) return 'Année requise';
    if (!formData.id_classe) return 'Classe requise';
    if (!formData.id_semestres) return 'Semestre requis';
    if (!formData.duree || Number(formData.duree) <= 0) return 'Durée requise';
    return '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setTouched({
      code_ec: true, intitule: true, id_ue: true, id_annee: true, id_classe: true, id_semestres: true, duree: true
    });
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setLoading(true);
    const payload = {
      code_ec: formData.code_ec,
      intitule: formData.intitule,
      id_ue: Number(formData.id_ue),
      id_annee: Number(formData.id_annee),
      id_classe: Number(formData.id_classe),
      id_semestres: Number(formData.id_semestres),
      duree: Number(formData.duree),
      is_published: formData.is_published ? 1 : 0,
      image: formData.image.trim() !== '' ? formData.image.replace(/^public\//, '') : '',
    };
    try {
      const response: CreateCourseResponse = await adminService.createCourse(payload);
      setCreatedEcId(response.data.id_ec || null);
      setSuccess('Cours créé avec succès !');
      setError('');
    } catch (err) {
      if (typeof err === 'object' && err !== null && 'response' in err) {
        const errorObj = err as { response?: { data?: { message?: string } } };
        setError(
          errorObj.response?.data?.message ||
          'Erreur lors de la création du cours'
        );
      } else {
        setError('Erreur lors de la création du cours');
      }
    } finally {
      setLoading(false);
    }
  };

  // Upload PDF support
  const handlePdfUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createdEcId || !pdfFile || !pdfTitle) {
      setError('Titre et fichier PDF requis');
      return;
    }
    setError('');
    const formDataPdf = new FormData();
    formDataPdf.append('file', pdfFile);
    formDataPdf.append('titre', pdfTitle);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://192.168.1.111:3000/api/ec/${createdEcId}/supports`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formDataPdf,
      });
      if (!res.ok) throw new Error('Erreur upload PDF');
      setPdfTitle('');
      setPdfFile(null);
      // Refresh supports
      fetch(`http://192.168.1.111:3000/api/ec/${createdEcId}/supports`)
        .then(r => r.json())
        .then(setSupports);
    } catch {
      setError('Erreur lors de l\'upload du PDF');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="max-w-3xl w-full bg-white rounded-2xl shadow-2xl overflow-hidden p-8 relative animate-fade-in">
        {/* Bouton retour */}
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="absolute left-4 top-4 flex items-center gap-1 text-primary hover:text-blue-700 font-medium transition"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Retour
        </button>
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Créer un nouveau EC (cours)</h2>
        </div>

        {/* Toasts dynamiques */}
        {error && (
          <div className="mb-4 flex items-center gap-2 bg-red-100 border-l-4 border-red-500 p-4 rounded shadow animate-fade-in">
            <XCircle className="text-red-500 w-6 h-6" />
            <span className="text-red-700 font-medium">{error}</span>
          </div>
        )}
        {success && (
          <div className="mb-4 flex items-center gap-2 bg-green-100 border-l-4 border-green-500 p-4 rounded shadow animate-fade-in">
            <CheckCircle className="text-green-500 w-6 h-6" />
            <span className="text-green-700 font-medium">{success}</span>
          </div>
        )}

        {!createdEcId ? (
          <form className="space-y-6" onSubmit={handleSubmit} autoComplete="off">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label htmlFor="code_ec" className="block text-sm font-medium text-gray-700">Code EC</label>
                <input
                  id="code_ec"
                  name="code_ec"
                  type="text"
                  required
                  value={formData.code_ec}
                  onChange={handleChange}
                  className={`mt-1 block w-full border ${touched.code_ec && !formData.code_ec ? 'border-red-400' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:ring-primary focus:border-primary transition`}
                />
                <label htmlFor="intitule" className="block text-sm font-medium text-gray-700 mt-4">Intitulé</label>
                <input
                  id="intitule"
                  name="intitule"
                  type="text"
                  required
                  value={formData.intitule}
                  onChange={handleChange}
                  className={`mt-1 block w-full border ${touched.intitule && !formData.intitule ? 'border-red-400' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:ring-primary focus:border-primary transition`}
                />
                <label htmlFor="duree" className="block text-sm font-medium text-gray-700 mt-4">Durée (heures)</label>
                <input
                  id="duree"
                  name="duree"
                  type="number"
                  required
                  value={formData.duree}
                  onChange={handleChange}
                  className={`mt-1 block w-full border ${touched.duree && (!formData.duree || Number(formData.duree) <= 0) ? 'border-red-400' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:ring-primary focus:border-primary transition`}
                  min="1"
                />
                <label htmlFor="image" className="block text-sm font-medium text-gray-700 mt-4">URL de l'image</label>
                <input
                  id="image"
                  name="image"
                  type="text"
                  value={formData.image}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-primary focus:border-primary transition"
                  placeholder="cours_images/nom_image.jpg"
                />
              </div>
              <div>
                <label htmlFor="id_ue" className="block text-sm font-medium text-gray-700">UE</label>
                <select
                  id="id_ue"
                  name="id_ue"
                  required
                  value={formData.id_ue}
                  onChange={handleChange}
                  className={`mt-1 block w-full border ${touched.id_ue && !formData.id_ue ? 'border-red-400' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:ring-primary focus:border-primary transition`}
                >
                  <option value="">Sélectionner une UE</option>
                  {ues.map((ue: UE) => (
                    <option key={ue.id_ue} value={ue.id_ue}>
                      {ue.code_ue} - {ue.intitule}
                    </option>
                  ))}
                </select>
                <label htmlFor="id_annee" className="block text-sm font-medium text-gray-700 mt-4">Année</label>
                <select
                  id="id_annee"
                  name="id_annee"
                  required
                  value={formData.id_annee}
                  onChange={handleChange}
                  className={`mt-1 block w-full border ${touched.id_annee && !formData.id_annee ? 'border-red-400' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:ring-primary focus:border-primary transition`}
                >
                  <option value="">Sélectionner une année</option>
                  {annees.map((a: Annee) => (
                    <option key={a.id_annee} value={a.id_annee}>
                      {new Date(a.date_debut).getFullYear()} - {new Date(a.date_fin).getFullYear()}
                    </option>
                  ))}
                </select>
                <label htmlFor="id_classe" className="block text-sm font-medium text-gray-700 mt-4">Classe</label>
                <select
                  id="id_classe"
                  name="id_classe"
                  required
                  value={formData.id_classe}
                  onChange={handleChange}
                  className={`mt-1 block w-full border ${touched.id_classe && !formData.id_classe ? 'border-red-400' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:ring-primary focus:border-primary transition`}
                >
                  <option value="">Sélectionner une classe</option>
                  {classes.map((c: Classe) => (
                    <option key={c.id_classe} value={c.id_classe}>
                      {c.niveau}
                    </option>
                  ))}
                </select>
                <label htmlFor="id_semestres" className="block text-sm font-medium text-gray-700 mt-4">Semestre</label>
                <select
                  id="id_semestres"
                  name="id_semestres"
                  required
                  value={formData.id_semestres}
                  onChange={handleChange}
                  className={`mt-1 block w-full border ${touched.id_semestres && !formData.id_semestres ? 'border-red-400' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:ring-primary focus:border-primary transition`}
                >
                  <option value="">Sélectionner un semestre</option>
                  {semestres.map((s: Semestre) => (
                    <option key={s.id_semestres} value={s.id_semestres}>
                      {s.num_semestre}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex justify-end space-x-4 mt-8">
              <button
                type="button"
                onClick={() => navigate('/admin')}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 transition"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={loading}
                className={`w-48 flex justify-center items-center gap-2 py-2 px-4 border border-transparent rounded-md shadow-lg text-base font-semibold text-white bg-gradient-to-r from-primary to-blue-500 hover:from-blue-600 hover:to-primary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all duration-300 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {loading && <Loader2 className="animate-spin w-5 h-5" />}
                {loading ? 'Création en cours...' : 'Créer le cours'}
              </button>
            </div>
          </form>
        ) : (
          <div className="animate-fade-in">
            <h3 className="text-lg font-semibold mb-2">Ajouter un support PDF au cours</h3>
            <form className="flex gap-2 mb-4" onSubmit={handlePdfUpload}>
              <input
                type="text"
                placeholder="Titre du PDF"
                value={pdfTitle}
                onChange={e => setPdfTitle(e.target.value)}
                className="border border-gray-300 rounded-md px-2 py-1"
                required
              />
              <input
                type="file"
                accept="application/pdf"
                onChange={e => setPdfFile(e.target.files?.[0] || null)}
                className="border border-gray-300 rounded-md px-2 py-1"
                required
              />
              <button
                type="submit"
                className="px-4 py-2 bg-primary text-white rounded hover:bg-opacity-90 transition"
              >
                Ajouter
              </button>
            </form>
            <div>
              <h4 className="font-semibold mb-2">Supports PDF ajoutés :</h4>
              <ul>
                {supports.map(s => (
                  <li key={s.id_support} className="mb-1">
                    <a
                      href={`/cours_pdfs/${s.fichier}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary underline"
                    >
                      {s.titre}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => navigate('/admin')}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 transition"
              >
                Terminer
              </button>
            </div>
          </div>
        )}
        <style>{`
          .animate-fade-in { animation: fadeIn .5s cubic-bezier(.4,0,.2,1); }
          @keyframes fadeIn { from { opacity:0; transform: translateY(20px);} to { opacity:1; transform: none; } }
        `}</style>
      </div>
    </div>
  );
};

export default CreateCourse;