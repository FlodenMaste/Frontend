import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getFormateurCoursPlanifies } from '../services/api';

interface CoursePlanifie {
  id_planification: number;
  id_ec: number;
  titre: string;
  image?: string;
  duree?: number;
  heure_totale: number;
  heure_restante: number;
  type: string;
  date_inscription: string;
  annee: string;
  num_semestre: string;
  classe: string;
}

const FormateurCourses = () => {
  const [courses, setCourses] = useState<CoursePlanifie[]>([]);
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      if (user?.id_formateur) {
        try {
          const data = await getFormateurCoursPlanifies(user.id_formateur);
          setCourses(Array.isArray(data) ? data : []);
        } catch {
          setCourses([]);
        }
      }
      setLoading(false);
    };
    fetchCourses();
  }, [user]);

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-2 text-center">Cours</h1>
      {user?.nom && (
        <p className="mb-6 text-gray-700">Formateur : <span className="font-semibold">{user.nom}</span></p>
      )}
      {loading ? (
        <div>Chargement...</div>
      ) : courses.length === 0 ? (
        <p>Aucun cours planifié pour vous.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {courses.map(c => (
            <div key={c.id_planification} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 h-full flex flex-col border border-gray-100">
              <div className="relative pt-[56.25%] overflow-hidden">
                <img 
                  src={c.image && c.image.trim() !== '' ? `http://192.168.1.111:3000/${c.image}` : '/default.jpg'} 
                  alt={c.titre}
                  className="absolute top-0 left-0 w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                  loading="lazy"
                />
              </div>
              <div className="p-4 md:p-5 flex-grow flex flex-col">
                <h3 className="text-lg md:text-xl font-semibold mb-2 text-gray-800">{c.titre}</h3>
                <div className="flex justify-between items-center mt-auto pt-3 border-t border-gray-100 mb-2">
                  <div className="flex items-center text-sm text-gray-500">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {c.duree ? `${c.duree} heures` : ''}
                  </div>
                  <span className="text-xs text-gray-500">
                    {c.annee} &ndash; {c.classe} &ndash; Semestre {c.num_semestre}
                  </span>
                </div>
                <ul className="mb-2 text-sm text-gray-700 space-y-1">
                  <li>
                    <span className="font-medium">Heures totales :</span> {c.heure_totale}
                    <span className="mx-2">|</span>
                    <span className="font-medium">Heures restantes :</span> {c.heure_restante}
                  </li>
                  <li>
                    <span className="font-medium">Type :</span> {c.type}
                  </li>
                  <li>
                    <span className="font-medium">Date d'inscription :</span> {new Date(c.date_inscription).toLocaleDateString('fr-FR')}
                  </li>
                </ul>
                <div className="mt-4">
                  <a
                    href={`/courses/${c.id_ec}`}
                    className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                  >
                    Voir le cours
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FormateurCourses;