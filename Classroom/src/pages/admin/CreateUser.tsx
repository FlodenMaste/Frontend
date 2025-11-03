import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { createEtudiant, getAnnees, getFormations, getClasses, Annee, Formation, Classe } from '../../services/api';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

// Utilitaire pour formater les dates au format français
function formatDate(dateStr: string) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('fr-FR');
}


const CreateUser = () => {
  const navigate = useNavigate();
  const [etudiant, setEtudiant] = useState({
    matricule: '',
    nom: '',
    prenom: '',
    email: '',
    mot_de_passe: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [inscription, setInscription] = useState({
    id_annee: '',
    type: 'Inscription',
    id_formation: '',
    id_classe: '',
    option: '',
    mention: ''
  });
  const [annees, setAnnees] = useState<Annee[]>([]);
  const [formations, setFormations] = useState<Formation[]>([]);
  const [classes, setClasses] = useState<Classe[]>([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState<{[k:string]: boolean}>({});

  useEffect(() => {
    getAnnees().then(data => setAnnees(Array.isArray(data) ? data : []));
    getFormations().then(data => setFormations(Array.isArray(data) ? data : []));
    getClasses().then(data => setClasses(Array.isArray(data) ? data : []));
  }, []);


  const handleEtudiantChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEtudiant({ ...etudiant, [e.target.name]: e.target.value });
    setTouched(t => ({...t, [e.target.name]: true}));
  };
  const handleInscriptionChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setInscription({ ...inscription, [e.target.name]: e.target.value });
    setTouched(t => ({...t, [e.target.name]: true}));
  };

  // Validation instantanée simple
  const validate = () => {
    if (!etudiant.matricule) return 'Matricule requis';
    if (!etudiant.nom) return 'Nom requis';
    if (!etudiant.prenom) return 'Prénom requis';
    if (!etudiant.email) return 'Email requis';
    if (!etudiant.mot_de_passe || etudiant.mot_de_passe.length < 6) return 'Mot de passe (6+ caractères) requis';
    if (!inscription.id_annee) return 'Année requise';
    if (!inscription.id_formation) return 'Formation requise';
    if (!inscription.id_classe) return 'Classe requise';
    if (!inscription.option) return 'Option requise';
    if (!inscription.mention) return 'Mention requise';
    return '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setTouched({
      matricule: true, nom: true, prenom: true, email: true, mot_de_passe: true,
      id_annee: true, id_formation: true, id_classe: true, option: true, mention: true
    });
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setLoading(true);
    try {
      await createEtudiant({
        matricule: etudiant.matricule,
        nom: etudiant.nom,
        prenom: etudiant.prenom,
        email: etudiant.email,
        mot_de_passe: etudiant.mot_de_passe,
        id_annee: Number(inscription.id_annee),
        id_formation: Number(inscription.id_formation),
        id_classe: Number(inscription.id_classe),
        option: inscription.option,
        mention: inscription.mention
      });
      setSuccess('Étudiant inscrit avec succès !');
      setTimeout(() => navigate('/admin?tab=inscriptions'), 1200);
    } catch (err) {
      if (err instanceof Error) setError(err.message);
      else setError('Erreur lors de l\'inscription');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-2xl overflow-hidden p-8 relative animate-fade-in">
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
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Inscription étudiant</h2>
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

        <form className="space-y-6" onSubmit={handleSubmit} autoComplete="off">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-primary mb-2">Étudiant</h3>
              <input name="matricule" value={etudiant.matricule} onChange={handleEtudiantChange} placeholder="Matricule" required className={`mt-1 block w-full border ${touched.matricule && !etudiant.matricule ? 'border-red-400' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:ring-primary focus:border-primary transition`} />
              <input name="nom" value={etudiant.nom} onChange={handleEtudiantChange} placeholder="Nom" required className={`mt-4 block w-full border ${touched.nom && !etudiant.nom ? 'border-red-400' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:ring-primary focus:border-primary transition`} />
              <input name="prenom" value={etudiant.prenom} onChange={handleEtudiantChange} placeholder="Prénom" required className={`mt-4 block w-full border ${touched.prenom && !etudiant.prenom ? 'border-red-400' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:ring-primary focus:border-primary transition`} />
              <input name="email" value={etudiant.email} onChange={handleEtudiantChange} placeholder="Email" required className={`mt-4 block w-full border ${touched.email && !etudiant.email ? 'border-red-400' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:ring-primary focus:border-primary transition`} />
              {/* Champ mot de passe avec œil */}
              <div className="relative mt-4">
                <input
                  name="mot_de_passe"
                  type={showPassword ? 'text' : 'password'}
                  value={etudiant.mot_de_passe}
                  onChange={handleEtudiantChange}
                  placeholder="Mot de passe (6+ caractères)"
                  required
                  className={`block w-full border ${touched.mot_de_passe && (!etudiant.mot_de_passe || etudiant.mot_de_passe.length < 6) ? 'border-red-400' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 pr-10 focus:ring-primary focus:border-primary transition`}
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 hover:text-primary focus:outline-none"
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
              <h3 className="text-lg font-semibold text-primary mb-2">Inscription</h3>
              <select name="id_annee" value={inscription.id_annee} onChange={handleInscriptionChange} required className={`mt-1 block w-full border ${touched.id_annee && !inscription.id_annee ? 'border-red-400' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:ring-primary focus:border-primary transition`}>
                <option value="">Année</option>
                {Array.isArray(annees) && annees.map(a => (
                  <option key={a.id_annee} value={a.id_annee}>
                    {a.annee} ({formatDate(a.date_debut)} - {formatDate(a.date_fin)}) [{a.statut}]
                  </option>
                ))}
              </select>
              <select name="type" value={inscription.type} onChange={handleInscriptionChange} required className="mt-4 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-primary focus:border-primary transition">
                <option value="Inscription">Inscription</option>
                <option value="Réinscription">Réinscription</option>
              </select>
              <select name="id_formation" value={inscription.id_formation} onChange={handleInscriptionChange} required className={`mt-4 block w-full border ${touched.id_formation && !inscription.id_formation ? 'border-red-400' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:ring-primary focus:border-primary transition`}>
                <option value="">Formation</option>
                {Array.isArray(formations) && formations.map(f => (
                  <option key={f.id_formation} value={f.id_formation}>
                    {f.domaine}
                  </option>
                ))}
              </select>
              <select name="id_classe" value={inscription.id_classe} onChange={handleInscriptionChange} required className={`mt-4 block w-full border ${touched.id_classe && !inscription.id_classe ? 'border-red-400' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:ring-primary focus:border-primary transition`}>
                <option value="">Classe</option>
                {Array.isArray(classes) && classes.map(c => (
                  <option key={c.id_classe} value={c.id_classe}>{c.niveau}</option>
                ))}
              </select>
              <select name="option" value={inscription.option} onChange={handleInscriptionChange} required className={`mt-4 block w-full border ${touched.option && !inscription.option ? 'border-red-400' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:ring-primary focus:border-primary transition`}>
                <option value="">Option</option>
                <option value="Cybersécurité">Cybersécurité</option>
                <option value="DevOPS">DevOPS</option>
              </select>
              <select name="mention" value={inscription.mention} onChange={handleInscriptionChange} required className={`mt-4 block w-full border ${touched.mention && !inscription.mention ? 'border-red-400' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:ring-primary focus:border-primary transition`}>
                <option value="">Mention</option>
                <option value="TR">TR</option>
              </select> 
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className={`w-full flex justify-center items-center gap-2 py-2 px-4 border border-transparent rounded-md shadow-lg text-base font-semibold text-white bg-gradient-to-r from-primary to-blue-500 hover:from-blue-600 hover:to-primary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all duration-300 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {loading && <Loader2 className="animate-spin w-5 h-5" />}
            {loading ? 'Création en cours...' : 'Créer l\'étudiant'}
          </button>
        </form>
      </div>
      <style>{`
        .animate-fade-in { animation: fadeIn .5s cubic-bezier(.4,0,.2,1); }
        @keyframes fadeIn { from { opacity:0; transform: translateY(20px);} to { opacity:1; transform: none; } }
      `}</style>
    </div>
  );
};

export default CreateUser;