import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getCoursInscrits } from '../services/api';
import { Course } from '../types/types';
import { useNavigate } from 'react-router-dom';

// Ajout d'un type local pour inclure annee et classe
type CourseWithInscription = Course & {
  annee?: string;
  classe?: string;
};

const MesCours = () => {
  const { user } = useAuth();
  const [cours, setCours] = useState<CourseWithInscription[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCours = async () => {
      if (!user?.id_etudiant) {
        setLoading(false);
        return;
      }
      setLoading(true);
      const data: Array<{
        id_cours: number;
        titre_cours: string;
        description: string;
        duree?: number;
        level?: string;
        category?: string;
        image?: string;
        prix?: number;
        is_free?: boolean;
        video_url?: string;
        instructor?: string;
        is_published?: boolean;
        annee?: string;
        classe?: string;
      }> = await getCoursInscrits(user.id_etudiant);

      const mapped = data.map((c) => ({
        id: c.id_cours,
        title: c.titre_cours,
        description: c.description,
        duration: c.duree ? `${c.duree} heures` : '',
        level: c.level,
        category: c.category,
        image: c.image && c.image.trim() !== '' ? `http://192.168.1.111:3000/${c.image.replace(/^public\//, '')}` : '/default.jpg',
        price: c.prix,
        isFree: !!c.is_free,
        videoUrl: c.video_url && c.video_url.trim() !== '' ? `http://192.168.1.111:3000/${c.video_url.replace(/^public\//, '')}` : undefined,
        instructor: c.instructor,
        isPublished: !!c.is_published,
        annee: c.annee,
        classe: c.classe,
      }));
      setCours(mapped);
      setLoading(false);
    };
    fetchCours();
  }, [user]);

  if (loading) return <div>Chargement...</div>;

  if (!user?.id_etudiant)
    return <div className="text-center text-gray-500">Aucun cours suivi trouvé.</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-6 text-center">Mes cours inscrits</h2>
      {cours.length === 0 ? (
        <div className="text-gray-500 text-center">Aucun cours suivi trouvé.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {cours.map((c) => (
            <div
              key={c.id}
              className="bg-white rounded-lg shadow-md p-4 flex flex-col"
            >
              <img
                src={c.image}
                alt={c.title}
                className="w-full h-40 object-cover rounded mb-4"
              />
              <h3 className="text-lg font-semibold mb-2">{c.title}</h3>
              <p className="text-gray-600 mb-2 line-clamp-2">{c.description}</p>
              <p className="text-xs text-gray-500 mb-2">
                Année: {c.annee ?? '-'} | Classe: {c.classe ?? '-'}
              </p>
              <div className="flex-1"></div>
              <button
                className="mt-4 px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark transition"
                onClick={() => navigate(`/courses/${c.id}`)}
              >
                Continuer
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MesCours;