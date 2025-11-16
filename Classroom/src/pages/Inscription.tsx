import { useState } from 'react';
import { Link } from 'react-router-dom';

const Inscription = () => {
  const [showModal, setShowModal] = useState(true);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
            <h2 className="text-2xl font-bold mb-4 text-primary">Inscription</h2>
            <p className="mb-6 text-gray-700">
              Pour toute demande d'inscription, veuillez contacter l'administrateur.
            </p>
            <Link
              to="/"
              className="px-6 py-2 bg-primary text-white rounded hover:bg-opacity-90 transition"
              onClick={() => setShowModal(false)}
            >
              Retour à l'accueil
            </Link>
          </div>
        </div>
      )}
      {/* Optionnel : contenu de fond si besoin */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md opacity-30 pointer-events-none">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Créer un compte
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Déjà membre ?{' '}
          <Link
            to="/connexion"
            className="font-medium text-primary hover:text-primary-dark"
          >
            Connectez-vous ici
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Inscription;