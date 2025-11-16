import { useAuth } from '../contexts/AuthContext';
import { useState } from 'react';

const ChangeMotDePasse = () => {
    const { changePassword } = useAuth(); 
    const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (formData.newPassword !== formData.confirmPassword) {
      return setError('Les mots de passe ne correspondent pas');
    }
    
    if (formData.newPassword.length < 6) {
      return setError('Le mot de passe doit contenir au moins 6 caractères');
    }
    
    // Appel API pour changer le mot de passe
    try {
      setIsLoading(true);
      await changePassword(formData.currentPassword, formData.newPassword);
      setError('');
      setSuccess('Mot de passe changé avec succès');
      // Réinitialiser le formulaire
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (err) {
      setError('Erreur lors du changement de mot de passe');
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8 md:py-12">
      <h1 className="text-2xl md:text-3xl font-bold mb-6 text-center">Changer de mot de passe</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl mx-auto">
        {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>}
        {success && <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">{success}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Ancien mot de passe</label>
            <input
              type="password"
              value={formData.currentPassword}
              onChange={(e) => setFormData({...formData, currentPassword: e.target.value})}
              className="w-full px-3 py-2 border rounded-md"
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Nouveau mot de passe</label>
            <input
              type="password"
              value={formData.newPassword}
              onChange={(e) => setFormData({...formData, newPassword: e.target.value})}
              className="w-full px-3 py-2 border rounded-md"
              required
            />
          </div>
          
          <div className="mb-6">
            <label className="block text-gray-700 mb-2">Confirmer le nouveau mot de passe</label>
            <input
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
              className="w-full px-3 py-2 border rounded-md"
              required
            />
          </div>
          
          <button
            type="submit"
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-opacity-90"
            disabled={isLoading}
          >
            Changer mot de passe
            {isLoading ? 'Changement en cours...' : ''}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChangeMotDePasse;