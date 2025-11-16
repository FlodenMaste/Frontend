import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import CourseCard from '../components/CourseCard.tsx';
import { Course } from '../types/types';
import { Search, X } from 'lucide-react';
import { adminService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const Courses = () => {
  const [filter, setFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  // Redirige les formateurs vers leur page dédiée
  useEffect(() => {
    if (user?.role === 'formateur') {
      navigate('/formateur/cours', { replace: true });
    }
  }, [user, navigate]);

  // Récupère les paramètres de recherche de l'URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const searchParam = params.get('search');
    const categoryParam = params.get('category');
  
    if (searchParam) setSearchTerm(searchParam);
    if (categoryParam) setSelectedCategory(categoryParam);
  }, [location.search]);

  // Récupère les cours depuis l'API
  useEffect(() => {
    setLoading(true);
    adminService.getCourses()
      .then((data) => setCourses(data))
      .finally(() => setLoading(false));
  }, []);

  // Catégories dynamiques à partir des cours
  const categories = Array.from(new Set(courses.map((c) => c.category).filter(Boolean)));

  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      searchTerm === '' ||
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = !selectedCategory || course.category === selectedCategory;

    const matchesLevel = filter === 'all' || course.level === filter;

    return matchesSearch && matchesCategory && matchesLevel;
  });

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory(null);
    setFilter('all');
    navigate('/courses');
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8 md:py-12">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-2 text-center">Nos formations</h1>
        <p className="text-gray-600">
          {filteredCourses.length} résultat{filteredCourses.length !== 1 ? 's' : ''}
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Filtres */}
        <div className="md:w-1/4">
          <div className="bg-white p-4 rounded-lg shadow-md sticky top-4">
            <div className="mb-6">
              <h2 className="font-bold mb-3">Que voulez-vous apprendre aujourd'hui ?</h2>
              <div className="flex flex-wrap gap-2">
                {categories.map((category, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedCategory(selectedCategory === category ? null : category)}
                    className={`px-3 py-1 rounded-full text-sm ${
                      selectedCategory === category 
                        ? 'bg-primary text-white' 
                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {(searchTerm || selectedCategory || filter !== 'all') && (
              <button
                onClick={clearFilters}
                className="flex items-center text-sm text-gray-600 hover:text-primary"
              >
                <X className="h-4 w-4 mr-1" />
                Réinitialiser les filtres
              </button>
            )}
          </div>
        </div>

        {/* Liste des cours */}
        <div className="md:w-3/4">
          {selectedCategory && (
            <div className="mb-4 text-sm text-gray-600">
              Filtres actifs : 
              {selectedCategory && <span className="font-medium ml-1">{selectedCategory}</span>}
            </div>
          )}

          {loading ? (
            <div className="text-center py-12">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                <Search className="h-6 w-6 text-gray-500" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Chargement des cours...</h3>
            </div>
          ) : filteredCourses.length === 0 ? (
            <div className="text-center py-12">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                <Search className="h-6 w-6 text-gray-500" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun cours trouvé</h3>
              <p className="text-gray-500">Aucun cours ne correspond à vos critères de recherche.</p>
              <button
                onClick={clearFilters}
                className="mt-4 px-4 py-2 bg-primary text-white rounded-md hover:bg-opacity-90"
              >
                Voir tous les cours
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCourses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Courses;