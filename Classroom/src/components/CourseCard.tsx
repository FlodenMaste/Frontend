import { Link, useNavigate } from 'react-router-dom';
import { Course } from '../types/types';
import { useAuth } from '../contexts/AuthContext';

const CourseCard = ({ course }: { course: Course }) => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const getLevelColor = () => {
    switch(course.level) {
      case 'Débutant': return 'bg-green-100 text-green-800';
      case 'Intermédiaire': return 'bg-blue-100 text-blue-800';
      case 'Avancé': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Pour debug
  console.log('Image:', course.image);
  console.log('Video:', course.videoUrl);

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 h-full flex flex-col border border-gray-100">
      <div className="relative pt-[56.25%] overflow-hidden">
        <img 
          src={course.image && course.image.trim() !== '' ? course.image : '/default.jpg'} 
          alt={course.title}
          className="absolute top-0 left-0 w-full h-full object-cover transition-transform duration-500 hover:scale-105"
          loading="lazy"
        />
        {course.videoUrl && (
          <div className="absolute bottom-2 right-2 bg-red-500 text-white px-2 py-1 rounded-md text-xs font-semibold flex items-center">
            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path d="M6.3 2.841A1.5 1.5 0 004 4.11v11.78a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
            </svg>
            Vidéo
          </div>
        )}
      </div>
      <div className="relative -mt-4 mx-4">
        <span className={`${getLevelColor()} px-3 py-1 rounded-full text-xs font-semibold inline-block shadow-sm`}>
          {course.level}
        </span>
      </div>
      <div className="p-4 md:p-5 flex-grow flex flex-col">
        <h3 className="text-lg md:text-xl font-semibold mb-2 text-gray-800">{course.title}</h3>
        <p className="text-gray-600 mb-4 text-sm md:text-base flex-grow">{course.description}</p>
        <div className="mb-2">
          {course.isFree ? (
            <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-semibold">
              Libre accès
            </span>
          ) : (
            <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-semibold">
              Payant
            </span>
          )}
        </div>
        <div className="flex justify-between items-center mt-auto pt-3 border-t border-gray-100">
          <div className="flex items-center text-sm text-gray-500">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {course.duration}
          </div>
          {isAuthenticated ? (
            <Link 
              to={`/courses/${course.id}`}
              className="text-primary font-medium hover:underline text-sm md:text-base flex items-center"
            >
              Voir le cours
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          ) : (
            <button
              type="button"
              className="text-gray-400 font-medium text-sm md:text-base flex items-center cursor-not-allowed"
              onClick={() => navigate('/connexion')}
              title="Connectez-vous pour accéder au cours"
            >
              <span className="mr-1">Connexion requise</span>
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default CourseCard;