import { FaFilePdf, FaClipboardList, FaTrash, FaPlus } from "react-icons/fa";
import ReactModal from "react-modal";
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { adminService } from '../services/api';

interface Support {
  id_support: number;
  titre: string;
  fichier: string;
}

interface TpTd {
  id_tp_td: number;
  titre: string;
  fichier: string;
}

interface RapportDepot {
  id_rapport: number;
  fichier: string;
  date_depot: string;
  fichier_url: string;
}

interface Course {
  id: number;
  title: string;
  description: string;
}

const PDF_BASE_URL = "http://192.168.1.111:3000/cours_pdfs/";
const RAPPORT_BASE_URL = "http://192.168.1.111:3000/rapports/";

const CourseDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [course, setCourse] = useState<Course | null>(null);
  const [supports, setSupports] = useState<Support[]>([]);
  const [tpTd, setTpTd] = useState<TpTd[]>([]);
  const [supportsLu, setSupportsLu] = useState<Record<number, boolean>>({});
  const [depots, setDepots] = useState<RapportDepot[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [rapportError, setRapportError] = useState('');
  const [rapportLoading, setRapportLoading] = useState(false);

  // PDF modal states
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [pdfTitle, setPdfTitle] = useState('');
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfError, setPdfError] = useState('');
  const [pdfLoading, setPdfLoading] = useState(false);

  // TP/TD modal states
  const [showTpTdModal, setShowTpTdModal] = useState(false);
  const [tpTdTitle, setTpTdTitle] = useState('');
  const [tpTdFile, setTpTdFile] = useState<File | null>(null);
  const [tpTdError, setTpTdError] = useState('');
  const [tpTdLoading, setTpTdLoading] = useState(false);

  useEffect(() => {
    adminService.getCourses().then((cs: Course[]) => setCourse(cs.find((c) => String(c.id) === String(id)) || null));
    fetch(`http://192.168.1.111:3000/api/ec/${id}/supports`)
      .then((r) => r.json())
      .then(setSupports);

    fetch(`http://192.168.1.111:3000/api/ec/${id}/tp_td`)
      .then((r) => r.json())
      .then(setTpTd);

    // Récupère tous les rapports déposés pour ce EC
    fetch(`http://192.168.1.111:3000/api/rapport_etudiant/ec/${id}`)
      .then((r) => r.json())
      .then((data) => setDepots(Array.isArray(data) ? data : []));
  }, [id, user]);

  const handleMarkAsRead = (supportId: number) => {
    setSupportsLu(lu => ({ ...lu, [supportId]: true }));
    // Appel API pour enregistrer l'évolution possible ici
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  // Dépôt d'un rapport étudiant (ajout)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRapportError('');
    if (!selectedFile || !user?.id_etudiant) {
      setRapportError('Fichier ou utilisateur manquant');
      return;
    }
    setRapportLoading(true);
    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('id_ec', String(id));
    try {
      const res = await fetch(`http://192.168.1.111:3000/api/rapport_etudiant`, {
        method: 'POST',
        body: formData,
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (!res.ok) throw new Error('Erreur lors du dépôt');
      setSelectedFile(null);
      // Refresh la liste des rapports déposés
      fetch(`http://192.168.1.111:3000/api/rapport_etudiant/ec/${id}`)
        .then((r) => r.json())
        .then((data) => setDepots(Array.isArray(data) ? data : []));
    } catch (err) {
      setRapportError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setRapportLoading(false);
    }
  };

  // Suppression d'un rapport (admin ou formateur)
  const handleDeleteRapport = async (id_rapport: number) => {
    if (!window.confirm('Supprimer ce rapport ?')) return;
    try {
      const token = localStorage.getItem('token');
      await fetch(`http://192.168.1.111:3000/api/rapport_etudiant/${id_rapport}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      // Refresh la liste
      fetch(`http://192.168.1.111:3000/api/rapport_etudiant/ec/${id}`)
        .then((r) => r.json())
        .then((data) => setDepots(Array.isArray(data) ? data : []));
    } catch {
      alert('Erreur lors de la suppression');
    }
  };

  // Ajout d'un support PDF
  const handlePdfUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pdfTitle || !pdfFile) {
      setPdfError('Titre et fichier requis');
      return;
    }
    setPdfError('');
    setPdfLoading(true);
    const formData = new FormData();
    formData.append('file', pdfFile);
    formData.append('titre', pdfTitle);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://192.168.1.111:3000/api/ec/${id}/supports`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (!res.ok) throw new Error('Erreur upload PDF');
      setPdfTitle('');
      setPdfFile(null);
      setShowPdfModal(false);
      // Refresh supports
      fetch(`http://192.168.1.111:3000/api/ec/${id}/supports`)
        .then((r) => r.json())
        .then(setSupports);
    } catch {
      setPdfError('Erreur lors de l\'upload du PDF');
    } finally {
      setPdfLoading(false);
    }
  };

  // Suppression d'un support PDF
  const handleDeleteSupport = async (supportId: number) => {
    if (!window.confirm('Supprimer ce support PDF ?')) return;
    try {
      const token = localStorage.getItem('token');
      await fetch(`http://192.168.1.111:3000/api/supports/${supportId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      // Refresh supports
      fetch(`http://192.168.1.111:3000/api/ec/${id}/supports`)
        .then((r) => r.json())
        .then(setSupports);
    } catch {
      alert('Erreur lors de la suppression');
    }
  };

  // Ajout TP/TD
  const handleTpTdSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tpTdTitle || !tpTdFile) {
      setTpTdError('Titre et fichier requis');
      return;
    }
    setTpTdError('');
    setTpTdLoading(true);
    const formData = new FormData();
    formData.append('file', tpTdFile);
    formData.append('titre', tpTdTitle);
    try {
      const token = localStorage.getItem('token');
      const url = `http://192.168.1.111:3000/api/ec/${id}/tp_td`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (!res.ok) throw new Error('Erreur upload TP/TD');
      setTpTdTitle('');
      setTpTdFile(null);
      setShowTpTdModal(false);
      // Refresh TP/TD
      fetch(`http://192.168.1.111:3000/api/ec/${id}/tp_td`)
        .then((r) => r.json())
        .then(setTpTd);
    } catch {
      setTpTdError('Erreur lors de l\'upload du TP/TD');
    } finally {
      setTpTdLoading(false);
    }
  };

  // Suppression TP/TD
  const handleDeleteTpTd = async (tpTdId: number) => {
    if (!window.confirm('Supprimer ce TP/TD ?')) return;
    try {
      const token = localStorage.getItem('token');
      await fetch(`http://192.168.1.111:3000/api/tp_td/${tpTdId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      // Refresh TP/TD
      fetch(`http://192.168.1.111:3000/api/ec/${id}/tp_td`)
        .then((r) => r.json())
        .then(setTpTd);
    } catch {
      alert('Erreur lors de la suppression');
    }
  };

  return (
    <div className="container mx-auto px-6 py-12">
      <h1 className="text-2xl font-bold mb-6">{course?.title}</h1>
      <p className="mb-6">{course?.description}</p>

      {/* Bloc Supports de cours */}
      <section className="mb-8">
        <div className="shadow-lg rounded-lg border p-6 bg-white flex flex-col min-h-[350px]">
          <h2 className="text-2xl font-bold text-center text-blue-700 mb-4 flex items-center justify-center gap-2">
            Supports de cours
            {(user?.role === 'admin' || user?.role === 'formateur') && (
              <button
                className="ml-2 text-primary bg-white border rounded-full p-2 hover:bg-gray-100"
                title="Ajouter un support PDF"
                onClick={() => setShowPdfModal(true)}
              >
                <FaPlus />
              </button>
            )}
          </h2>

          {/* Modal ajout PDF */}
          <ReactModal
            isOpen={showPdfModal}
            onRequestClose={() => { setShowPdfModal(false); setPdfTitle(''); setPdfFile(null); setPdfError(''); }}
            ariaHideApp={false}
            className="bg-white p-6 rounded shadow-lg max-w-md mx-auto mt-24"
            overlayClassName="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center"
          >
            <form className="flex flex-col gap-4" onSubmit={handlePdfUpload}>
              <h3 className="text-xl font-bold mb-2">Ajouter un support PDF</h3>
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
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-white rounded hover:bg-opacity-90"
                  disabled={pdfLoading}
                >
                  {pdfLoading ? 'Ajout...' : 'Ajouter'}
                </button>
                <button
                  type="button"
                  className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                  onClick={() => { setShowPdfModal(false); setPdfTitle(''); setPdfFile(null); setPdfError(''); }}
                >
                  Annuler
                </button>
              </div>
              {pdfError && <span className="text-red-600">{pdfError}</span>}
            </form>
          </ReactModal>
          <ul>
            {supports.length === 0 ? (
              <div className="text-center text-gray-500">Aucun support disponible pour ce cours.</div>
            ) : (
              supports.map(s => (
                <li key={s.id_support} className="mb-8 flex flex-col">
                  <div className="flex items-center gap-2">
                    <FaFilePdf className="text-red-600 text-2xl" />
                    <a
                      href={PDF_BASE_URL + encodeURIComponent(s.fichier)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline text-lg"
                    >
                      {s.titre}
                    </a>
                    {/* Bouton suppression PDF (admin/formateur) */}
                    {(user?.role === 'admin' || user?.role === 'formateur') && (
                      <button
                        className="ml-2 text-red-600 hover:text-red-800"
                        title="Supprimer"
                        onClick={() => handleDeleteSupport(s.id_support)}
                      >
                        <FaTrash />
                      </button>
                    )}
                  </div>
                  {!supportsLu[s.id_support] ? (
                    <button
                      className="mt-2 px-4 py-1 border border-blue-600 text-blue-700 rounded w-fit"
                      onClick={() => handleMarkAsRead(s.id_support)}
                    >
                      Marquer comme lu
                    </button>
                  ) : (
                    <span className="mt-2 px-4 py-1 border border-green-600 text-green-700 rounded w-fit flex items-center">
                      <span className="mr-2">✔</span> Lu
                    </span>
                  )}
                </li>
              ))
            )}
          </ul>

          {/* === BOUTON CLASSE VIRTUELLE EN BAS === */}
          <div className="flex justify-center mt-auto">
            <a
              href={`https://visioconf.ec2lt.sn/rooms/test`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-primary text-white px-4 py-2 rounded hover:bg-opacity-90 flex items-center gap-2"
            >
              <span role="img" aria-label="Classe virtuelle"></span>
              Classe virtuelle
            </a>
          </div>
          {/* === FIN AJOUT === */}
        </div>
      </section>

      {/* Bloc TP/TD */}
      <section className="mb-8">
        <div className="shadow-lg rounded-lg border p-6 bg-white">
          <h2 className="text-2xl font-bold text-center text-blue-700 mb-4 flex items-center justify-center gap-2">
            TP/TD
            {(user?.role === 'admin' || user?.role === 'formateur') && (
              <button
                className="ml-2 text-primary bg-white border rounded-full p-2 hover:bg-gray-100"
                title="Ajouter un TP/TD"
                onClick={() => setShowTpTdModal(true)}
              >
                <FaPlus />
              </button>
            )}
          </h2>
          <ul>
            {tpTd.length === 0 ? (
              <div className="text-center text-gray-500">Aucun TP/TD disponible pour ce cours.</div>
            ) : (
              tpTd.map(tp => (
                <li key={tp.id_tp_td} className="mb-8 flex flex-col">
                  <div className="flex items-center gap-2">
                    <FaClipboardList className="text-blue-600 text-2xl" />
                    <a
                      href={PDF_BASE_URL + encodeURIComponent(tp.fichier)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline text-lg"
                    >
                      {tp.titre}
                    </a>
                    {(user?.role === 'admin' || user?.role === 'formateur') && (
                      <button
                        className="ml-2 text-red-600 hover:text-red-800"
                        title="Supprimer"
                        onClick={() => handleDeleteTpTd(tp.id_tp_td)}
                      >
                        <FaTrash />
                      </button>
                    )}
                  </div>
                </li>
              ))
            )}
          </ul>
          {/* Modal ajout TP/TD */}
          <ReactModal
            isOpen={showTpTdModal}
            onRequestClose={() => { setShowTpTdModal(false); setTpTdTitle(''); setTpTdFile(null); setTpTdError(''); }}
            ariaHideApp={false}
            className="bg-white p-6 rounded shadow-lg max-w-md mx-auto mt-24"
            overlayClassName="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center"
          >
            <form className="flex flex-col gap-4" onSubmit={handleTpTdSave}>
              <h3 className="text-xl font-bold mb-2">Ajouter un TP/TD</h3>
              <input
                type="text"
                placeholder="Titre du TP/TD"
                value={tpTdTitle}
                onChange={e => setTpTdTitle(e.target.value)}
                className="border border-gray-300 rounded-md px-2 py-1"
                required
              />
              <input
                type="file"
                accept="application/pdf"
                onChange={e => setTpTdFile(e.target.files?.[0] || null)}
                className="border border-gray-300 rounded-md px-2 py-1"
                required
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-white rounded hover:bg-opacity-90"
                  disabled={tpTdLoading}
                >
                  {tpTdLoading ? 'Ajout...' : 'Ajouter'}
                </button>
                <button
                  type="button"
                  className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                  onClick={() => { setShowTpTdModal(false); setTpTdTitle(''); setTpTdFile(null); setTpTdError(''); }}
                >
                  Annuler
                </button>
              </div>
              {tpTdError && <span className="text-red-600">{tpTdError}</span>}
            </form>
          </ReactModal>
        </div>
      </section>

      {/* Bloc Rapport à rendre */}
      <section>
        <div className="shadow-lg rounded-lg border p-6 bg-white flex flex-col min-h-[250px]">
          <h2 className="text-2xl font-bold text-center text-blue-700 mb-4">Rapport à rendre</h2>
          {/* === AJOUT DU BOUTON LABORATOIRE VIRTUEL EN BAS === */}
          <div className="flex justify-center mt-auto">
            <a
              href={`https://192.168.1.74/`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-primary text-white px-4 py-2 rounded hover:bg-opacity-90 flex items-center gap-2"
            >
              <span role="img" aria-label="Laboratoire virtuel"></span>
              Laboratoire virtuel
            </a>
          </div>
          {/* === FIN AJOUT === */}

          {/* Liste des rapports déposés */}
          <div className="mb-4">
            {depots.length === 0 ? (
              <div className="text-center text-gray-500 mt-4">Aucun rapport déposé pour ce cours.</div>
            ) : (
              <ul>
                {depots.map((depot) => (
                  <li key={depot.id_rapport} className="mb-4 flex items-center gap-2">
                    <FaFilePdf className="text-red-600 text-2xl" />
                    <a
                      href={RAPPORT_BASE_URL + encodeURIComponent(depot.fichier)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline text-lg"
                    >
                      {depot.fichier}
                    </a>
                    <span className="ml-4 text-gray-500">
                      {depot.date_depot && new Date(depot.date_depot).toLocaleString()}
                    </span>
                    {/* Suppression possible pour admin ou formateur uniquement */}
                    {(user?.role === 'admin' || user?.role === 'formateur') && (
                      <button
                        className="ml-2 text-red-600 hover:text-red-800"
                        title="Supprimer"
                        onClick={() => handleDeleteRapport(depot.id_rapport)}
                      >
                        <FaTrash />
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Formulaire dépôt rapport */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <input type="file" onChange={handleFileChange} accept=".pdf,.doc,.docx" required />
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded w-fit" disabled={rapportLoading}>
              {rapportLoading ? 'Dépôt...' : 'Déposer un rapport'}
            </button>
            {rapportError && <span className="text-red-600">{rapportError}</span>}
          </form>
        </div>
      </section>
    </div>
  );
};

export default CourseDetail;