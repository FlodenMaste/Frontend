import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Courses from './pages/Courses';
import CourseDetail from './pages/CourseDetail';
import Connexion from './pages/Connexion';
import Inscription from './pages/Inscription';
import VirtualClassroom from './pages/VirtualClassroom';
import ProtectedRoute from './components/ProtectedRoute';
import Paiement from './pages/Paiement';
import CreateUser from './pages/admin/CreateUser';
import CreateCourse from './pages/admin/CreateCourse';
import AdminDashboard from './pages/AdminDashboard';
import Certificat from './pages/Certificat';
import Profil from './pages/Profil';
import ChangeMotDePasse from './pages/ChangeMotDePasse';
import AdminAnnees from './pages/AdminAnnees';
import CartPage from './pages/CartPage';
import MesCours from './pages/MesCours';
import ECListe from './components/ECListe';
import FormateurCourses from './pages/FormateurCourses';
import FormateurDashboard from './pages/FormateurDashboard';

const App = () => {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-grow">
              <Routes>
                {/* Route d'accueil */}
                <Route path="/" element={<Home />} />

                {/* Routes de paiement */}
                <Route
                  path="/courses/:id/paiement"
                  element={
                    <ProtectedRoute>
                      <Paiement />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/courses/:id/live"
                  element={
                    <ProtectedRoute>
                      <VirtualClassroom />
                    </ProtectedRoute>
                  }
                />

                {/* Routes détails de cours */}
                <Route path="/courses/:id" element={<CourseDetail />} />
                <Route path="/courses" element={<Courses />} />

                {/* Route panier */}
                <Route
                  path="/cart"
                  element={
                    <ProtectedRoute>
                      <CartPage />
                    </ProtectedRoute>
                  }
                />

                {/* Routes d'authentification */}
                <Route path="/connexion" element={<Connexion />} />
                <Route path="/inscription" element={<Inscription />} />

                {/* Tableau de bord */}
                {/* Routes Admin */}
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute requiredRole="admin">
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />
                
                <Route
                  path="/admin/users/new"
                  element={
                    <ProtectedRoute requiredRole="admin">
                      <CreateUser />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/courses/new"
                  element={
                    <ProtectedRoute requiredRole="admin">
                      <CreateCourse />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/admin/annees"
                  element={
                    <ProtectedRoute requiredRole="admin">
                      <AdminAnnees />
                    </ProtectedRoute>
                  }
                />

                <Route path="/courses/:id" element={<CourseDetail />} />

                {/* Route pour VirtualClassroom */}
                <Route
                  path="/VirtualClassroom/:id"
                  element={
                    <ProtectedRoute>
                      <VirtualClassroom />
                    </ProtectedRoute>
                  }
                />

                <Route path="/mes-cours" element={<MesCours />} />

                {/* Route pour le certificat */}
                <Route
                  path="/certificat"
                  element={
                    <ProtectedRoute>
                      <Certificat />
                    </ProtectedRoute>
                  }
                />

                {/* Route pour le profil */}
                <Route
                  path="/profil"
                  element={
                    <ProtectedRoute>
                      <Profil />
                    </ProtectedRoute>
                  }
                />

                {/* Route pour la page de profil */}
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <Profil />
                    </ProtectedRoute>
                  }
                />

                <Route path="/ec" element={<ECListe />} />
                <Route path="/admin/ec" element={<ECListe />} />


                {/* Route pour changer le mot de passe */}
                <Route
                  path="/changer_mot_de_passe"
                  element={
                    <ProtectedRoute>
                      <ChangeMotDePasse />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/formateur/cours"
                  element={
                    <ProtectedRoute requiredRole="formateur">
                      <FormateurCourses />
                    </ProtectedRoute>
                  }
                />

                {/* Route pour le dashboard formateur */}
                <Route
                  path="/formateur/dashboard"
                  element={
                    <ProtectedRoute requiredRole="formateur">
                      <FormateurDashboard />
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </main>

            <footer className="bg-gray-800 text-white py-8">
              <div className="container mx-auto px-6 text-center">
                <p className="mb-2">
                  EC2LT, Année Académique 2025 . Développer par Clevy Banzoulou
                </p>
                <div className="flex flex-col md:flex-row justify-center items-center gap-4 text-base">
                  <div className="flex items-center gap-2">
                    {/* Email logo */}
                    <span>
                      <svg className="w-5 h-5 inline-block" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M2.25 6.75A2.25 2.25 0 014.5 4.5h15a2.25 2.25 0 012.25 2.25v10.5a2.25 2.25 0 01-2.25 2.25h-15A2.25 2.25 0 012.25 17.25V6.75zm1.5 0v.511l8.25 5.511 8.25-5.511V6.75a.75.75 0 00-.75-.75h-15a.75.75 0 00-.75.75zm16.5 1.489l-8.25 5.511-8.25-5.511v8.511a.75.75 0 00.75.75h15a.75.75 0 00.75-.75V8.239z" />
                      </svg>
                    </span>
                    <span>Email :</span>
                    <a href="mailto:ecole@ec2lt.sn" className="text-white hover:text-blue-300">
                      ecole@ec2lt.sn
                    </a>
                  </div>
                  <div className="flex items-center gap-2">
                    {/* Téléphone logo */}
                    <span>
                      <svg className="w-5 h-5 inline-block" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M22 16.92V19a2 2 0 01-2.18 2A19.86 19.86 0 013 5.18 2 2 0 015 3h2.09a2 2 0 012 1.72c.13 1.06.37 2.09.72 3.08a2 2 0 01-.45 2.11l-1.27 1.27a16 16 0 006.58 6.58l1.27-1.27a2 2 0 012.11-.45c.99.35 2.02.59 3.08.72a2 2 0 011.72 2z" />
                      </svg>
                    </span>
                    <span>Téléphone :</span>
                    <a href="tel:+221 33 868 18 85 || 77 466 71 63" className="text-white hover:text-blue-300">
                      +221 33 868 18 85 || 77 466 71 63
                    </a>
                  </div>
                </div>
              </div>
            </footer>
          </div>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
};

export default App;