import { Course } from '../types/types';
import { useState } from 'react';
import { adminService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';


const CoursesTable = ({ courses, onUpdate }: { courses: Course[], onUpdate: () => void }) => {
  const { user: currentUser } = useAuth();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editedCourse, setEditedCourse] = useState<Partial<Course>>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleEdit = (course: Course) => {
    setEditingId(course.id);
    setEditedCourse({
      title: course.title,
      description: course.description,
      duration: course.duration,
      level: course.level,
      price: course.price,
      isFree: course.isFree,
      isPublished: course.isPublished
    });
  };

  const handleSave = async (courseId: number) => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await adminService.updateCourse({
        id_cours: courseId,
        titre_cours: editedCourse.title ?? '',
        description: editedCourse.description ?? '',
        duree: parseInt(String(editedCourse.duration), 10) || 0,
        prix: editedCourse.price ?? 0,
        level: editedCourse.level ?? '',
        category: editedCourse.category ?? '',
        is_free: editedCourse.isFree ?? false,
        is_published: editedCourse.isPublished ?? false,
        instructor: editedCourse.instructor ?? '',
        image: editedCourse.image ?? '',
        video_url: editedCourse.videoUrl ?? '',
      });
      onUpdate();
      setEditingId(null);
      setSuccess('Cours mis à jour avec succès !');
      setTimeout(() => setSuccess(null), 1800);
    } catch (error) {
      setError('Erreur lors de la mise à jour');
      setTimeout(() => setError(null), 1800);
      console.error('Erreur lors de la mise à jour:', error);
    }
    setLoading(false);
  };

  const handleDelete = async (course: Course) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce cours ?')) {
      setLoading(true);
      setError(null);
      setSuccess(null);
      try {
        await adminService.deleteCourse(course.id);
        onUpdate();
        setSuccess('Cours supprimé avec succès !');
        setTimeout(() => setSuccess(null), 1800);
      } catch (error) {
        setError('Erreur lors de la suppression');
        setTimeout(() => setError(null), 1800);
        console.error('Erreur lors de la suppression:', error);
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
      <table className="min-w-full bg-white">
        <thead>
          <tr className="bg-gray-100 text-left">
            <th className="py-2 px-4">Titre</th>
            <th className="py-2 px-4">Description</th>
            <th className="py-2 px-4">Durée</th>
            <th className="py-2 px-4">Niveau</th>
            <th className="py-2 px-4">Prix</th>
            <th className="py-2 px-4">Statut</th>
            <th className="py-2 px-4">Actions</th>
          </tr>
        </thead>
        <tbody>
          {courses.map(course => (
            <tr key={course.id} className="border-b">
              <td className="py-2 px-4">
                {editingId === course.id ? (
                  <input
                    type="text"
                    value={editedCourse.title || ''}
                    onChange={(e) => setEditedCourse({...editedCourse, title: e.target.value})}
                    className="border rounded px-2 py-1"
                  />
                ) : (
                  course.title
                )}
              </td>
              <td className="py-2 px-4">
                {editingId === course.id ? (
                  <textarea
                    value={editedCourse.description || ''}
                    onChange={(e) => setEditedCourse({...editedCourse, description: e.target.value})}
                    className="border rounded px-2 py-1"
                  />
                ) : (
                  course.description
                    ? course.description.substring(0, 50) + (course.description.length > 50 ? '...' : '')
                    : ''
                )}
              </td>
              <td className="py-2 px-4">
                {editingId === course.id ? (
                  <input
                    type="text"
                    value={editedCourse.duration || ''}
                    onChange={(e) => setEditedCourse({...editedCourse, duration: e.target.value})}
                    className="border rounded px-2 py-1"
                  />
                ) : (
                  course.duration
                )}
              </td>
              <td className="py-2 px-4">
                {editingId === course.id ? (
                  <select
                    value={editedCourse.level || 'Débutant'}
                    onChange={(e) => setEditedCourse({...editedCourse, level: e.target.value as string})}
                    className="border rounded px-2 py-1"
                  >
                    <option value="Débutant">Débutant</option>
                    <option value="Intermédiaire">Intermédiaire</option>
                    <option value="Avancé">Avancé</option>
                  </select>
                ) : (
                  course.level
                )}
              </td>
              <td className="py-2 px-4">
                {editingId === course.id ? (
                  <input
                    type="number"
                    value={editedCourse.price || 0}
                    onChange={(e) => setEditedCourse({...editedCourse, price: parseFloat(e.target.value)})}
                    className="border rounded px-2 py-1"
                    disabled={editedCourse.isFree}
                  />
                ) : course.isFree ? (
                  'Gratuit'
                ) : (
                  `${course.price} FCFA`
                )}
              </td>
              <td className="py-2 px-4">
                {editingId === course.id ? (
                  <select
                    value={editedCourse.isPublished ? 'published' : 'draft'}
                    onChange={(e) => setEditedCourse({...editedCourse, isPublished: e.target.value === 'published'})}
                    className="border rounded px-2 py-1"
                  >
                    <option value="published">Publié</option>
                    <option value="draft">Brouillon</option>
                  </select>
                ) : course.isPublished ? (
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">Publié</span>
                ) : (
                  <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs">Hors ligne</span>
                )}
              </td>
              <td className="py-2 px-4 space-x-2">
                {editingId === course.id ? (
                  <>
                    <button 
                      onClick={() => handleSave(course.id)}
                      className="bg-green-500 text-white px-2 py-1 rounded"
                      disabled={loading}
                    >
                      {loading ? <Loader2 className="animate-spin w-4 h-4 inline" /> : 'Enregistrer'}
                    </button>
                    <button 
                      onClick={() => setEditingId(null)}
                      className="bg-gray-500 text-white px-2 py-1 rounded"
                      disabled={loading}
                    >
                      Annuler
                    </button>
                  </>
                ) : (
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleEdit(course)}
                      className="bg-blue-500 text-white px-2 py-1 rounded"
                      disabled={loading}
                    >
                      Modifier
                    </button>
                    {currentUser?.role === 'admin' && (
                      <button 
                        onClick={() => handleDelete(course)}
                        className="bg-red-500 text-white px-2 py-1 rounded"
                        disabled={loading}
                      >
                        Supprimer
                      </button>
                    )}
                  </div>
                )}
              </td>
            </tr>
          ))}
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

export default CoursesTable;