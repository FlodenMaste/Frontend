import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaFilePdf } from "react-icons/fa";

const RapportDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [rapport, setRapport] = useState<any>(null);
  const [depot, setDepot] = useState<any>(null);
  const [showDepot, setShowDepot] = useState(false);
  const [showFileSelector, setShowFileSelector] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    fetch(`http://192.168.1.111:3000/api/rapports/${id}`)
      .then(r => r.json())
      .then(setRapport);

    fetch(`/api/rapports/${id}/etudiants?etudiant=${localStorage.getItem('userId')}`)
      .then(r => r.json())
      .then(setDepot);
  }, [id]);

  const handleDepotClick = () => setShowDepot(true);

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setSelectedFile(e.dataTransfer.files[0]);
    setShowFileSelector(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedFile(e.target.files[0]);
    setShowFileSelector(true);
  };

  const handleSubmitFile = async () => {
    if (!selectedFile) return;
    const formData = new FormData();
    formData.append('file', selectedFile);
    await fetch(`/api/rapports/${id}/depot`, {
      method: 'POST',
      body: formData,
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    setShowDepot(false);
    setShowFileSelector(false);
    navigate('/'); // Redirige vers la page d'accueil
  };

  return (
    <div className="container mx-auto px-6 py-12">
      <h2 className="text-2xl font-bold mb-4">
        rapport à rendre sur {rapport?.titre}
      </h2>
      <div className="flex flex-col gap-2 mb-4">
        <span className="bg-teal-700 text-white px-2 py-1 rounded w-fit text-sm">
          Opened: {rapport?.date_ouverture && new Date(rapport.date_ouverture).toLocaleString()}
        </span>
        <span className="bg-teal-700 text-white px-2 py-1 rounded w-fit text-sm">
          Due: {rapport?.date_limite && new Date(rapport.date_limite).toLocaleString()}
        </span>
      </div>
      <button
        className="mt-2 px-4 py-1 border border-blue-600 text-blue-700 rounded w-fit"
        onClick={handleDepotClick}
      >
        Ajouter un travail
      </button>

      {showDepot && (
        <div className="mt-6 border p-4 rounded-lg bg-gray-50">
          <h3 className="font-semibold mb-2">Remises de fichiers</h3>
          <div
            className="border-dashed border-2 border-gray-400 p-6 text-center cursor-pointer"
            onDragOver={e => e.preventDefault()}
            onDrop={handleFileDrop}
            onClick={() => setShowFileSelector(true)}
          >
            {selectedFile ? (
              <div>
                <FaFilePdf className="text-red-600 text-4xl mx-auto mb-2" />
                <span>{selectedFile.name}</span>
                <button
                  className="block mt-4 px-4 py-2 bg-blue-600 text-white rounded"
                  onClick={handleSubmitFile}
                >
                  Déposer ce fichier
                </button>
              </div>
            ) : (
              <span>Vous pouvez glisser des fichiers ici pour les ajouter.</span>
            )}
          </div>
          {showFileSelector && (
            <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded shadow-lg">
                <h4 className="mb-2 font-semibold">Sélecteur de fichiers</h4>
                <input type="file" onChange={handleFileChange} />
                <button
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
                  onClick={handleSubmitFile}
                >
                  Déposer ce fichier
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Statut de remise */}
      <div className="mt-8">
        <h3 className="text-xl font-bold mb-2">Statut de remise</h3>
        <table className="w-full mb-4">
          <tbody>
            <tr>
              <td className="font-semibold bg-gray-100 p-2">Statut des travaux remis</td>
              <td className="bg-green-100 p-2">{depot?.fichier ? "Remis pour évaluation" : "Aucune tentative"}</td>
            </tr>
            <tr>
              <td className="font-semibold bg-gray-100 p-2">Statut de l'évaluation</td>
              <td className="bg-gray-50 p-2">Non évalué</td>
            </tr>
            <tr>
              <td className="font-semibold bg-gray-100 p-2">Dernière modification</td>
              <td className="bg-gray-50 p-2">{depot?.date_depot ? new Date(depot.date_depot).toLocaleString() : "-"}</td>
            </tr>
          </tbody>
        </table>
        {depot?.fichier && (
          <div>
            <h4 className="font-semibold mb-2">Remises de fichiers</h4>
            <a
              href={`/rapports/${depot.fichier}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-blue-700 underline"
            >
              <FaFilePdf className="text-red-600" />
              {depot.fichier}
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default RapportDetail;