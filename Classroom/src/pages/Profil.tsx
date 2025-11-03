import { useAuth } from '../contexts/AuthContext';
import { useState } from 'react';

const Profil = () => {
  const { user } = useAuth();
  const [photo, setPhoto] = useState<string>('/default-avatar.png');
  const [uploading, setUploading] = useState(false);

  // Affiche la photo par défaut
  const displayedPhoto = photo;

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const file = e.target.files[0];
    setUploading(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPhoto(reader.result as string);
      setUploading(false);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-lg">
      <h1 className="text-3xl font-bold mb-6 text-center">Mon Profil</h1>
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col items-center mb-6">
          <img
            src={displayedPhoto}
            alt="Photo de profil"
            className="w-24 h-24 rounded-full object-cover border mb-2"
          />
          <label className="cursor-pointer text-primary hover:underline mb-2">
            {uploading ? "Chargement..." : "Changer la photo"}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePhotoChange}
              disabled={uploading}
            />
          </label>
        </div>
        <div className="mb-4">
          <span className="font-semibold">Nom :</span> {user?.nom}
        </div>
        <div className="mb-4">
          <span className="font-semibold">Email :</span> {user?.email}
        </div>
        <div className="mb-4">
          <span className="font-semibold">Rôle :</span> {user?.role}
        </div>
        {user?.role === 'etudiant' && (
          <>
            <div className="mb-4">
              <span className="font-semibold">Année d'inscription :</span>{" "}
              {user?.annee || "N/A"}
            </div>
            <div className="mb-4">
              <span className="font-semibold">Classe :</span>{" "}
              {user?.classe || "N/A"}
            </div>
          </>
        )}
        <div className="mb-4">
          <span className="font-semibold">Date d'inscription :</span>{" "}
          {user?.created_at ? new Date(user.created_at).toLocaleDateString() : "N/A"}
        </div>
        <div className="mb-4">
          <span className="font-semibold">Dernière connexion :</span>{" "}
          {user?.last_login ? new Date(user.last_login).toLocaleString() : "N/A"}
        </div>
      </div>
    </div>
  );
};

export default Profil;