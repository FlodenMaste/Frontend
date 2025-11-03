import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();


  return (
    <div className="min-h-screen">
      {/* Parti accueil milieu */}
      <section className="bg-primary text-white py-12 md:py-20 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto text-center">
          <h1 className="text-3xl md:text-4xl lg:text-6xl font-bold mb-4 md:mb-6">
            Apprenez les compétences de demain
          </h1>
          <p className="text-lg md:text-xl mb-6 md:mb-8 max-w-2xl mx-auto">
            Accédez à des cours en ligne de qualité pour booster votre carrière.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button 
              onClick={() => navigate('/courses')}
              className="bg-accent text-gray-900 px-6 py-2 md:px-8 md:py-3 rounded-md font-semibold hover:bg-opacity-90 transition"
            >
              Explorer les cours
            </button>
          </div>
        </div>
      </section>

      {/* Section des cours les plus connus et utiliser */}
      <section className="py-8 md:py-16 container mx-auto px-4 sm:px-6">
        <h2 className="text-2xl md:text-3xl font-bold mb-8 md:mb-12 text-center">Nos parcours populaires</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { title: 'Méthodologie du Pentesting', description: 'Découvrez les rouages des Pentesteur et de Hackers', category: 'Cybersécurité' },
            { title: 'Réagir face à une cyber-attaque', description: 'Soyez toujours informé et soyez prêt à intervenir', category: 'Cybersécurité' },
            { title: 'Data Analyst', description: 'Analysez les données des systèmes informations', category: 'Cybersécurité' },
          ].map((path, index) => (
            <div key={index} className="bg-white p-4 md:p-6 rounded-lg shadow-md hover:shadow-lg transition">
              <h3 className="text-lg md:text-xl font-semibold mb-2 md:mb-3">{path.title}</h3>
              <p className="text-gray-600 mb-3 md:mb-4">{path.description}</p>
              <button 
                onClick={() => navigate('/courses')}
                className="text-primary font-medium hover:underline text-sm md:text-base"
              >
                Découvrir ce parcours
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;