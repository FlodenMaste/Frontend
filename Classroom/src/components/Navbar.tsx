import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Bell, User, LogOut, Lock, Search, X } from 'lucide-react';
import axios from 'axios';

interface Notification {
  id: number;
  message: string;
}

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!user?.id_etudiant) return;
      try {
        const res = await axios.get(`http://192.168.1.111:3000/api/notifications/${user.id_etudiant}`);
        setNotifications(res.data);
      } catch {
        setNotifications([]);
      }
    };
    fetchNotifications();
  }, [user]);

  const markNotificationAsRead = async (id: number) => {
    try {
      await axios.post(`http://192.168.1.111:3000/api/notifications/${id}/read`);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch (err) {
      console.error('Erreur lors de la mise à jour de la notification', err);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/courses?search=${encodeURIComponent(searchQuery)}`);
      setIsSearchExpanded(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav className="bg-white shadow-md py-4 px-6">
      <div className="container mx-auto flex flex-wrap justify-between items-center">
        <div className="flex items-center justify-between w-full md:w-auto">
          <Link to="/" className="text-2xl font-bold text-blue-600 hover:text-blue-700 transition">
            EC2LT
          </Link>
          <button
            className="md:hidden text-gray-500 hover:text-gray-600 focus:outline-none"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Barre de recherche */}
        <div className={`${isSearchExpanded ? 'order-first w-full md:w-auto md:order-none' : ''} flex items-center`}>
          <form onSubmit={handleSearch} className="relative w-full">
            {isSearchExpanded && (
              <button
                type="button"
                onClick={() => setIsSearchExpanded(false)}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"
              >
                <X className="h-5 w-5" />
              </button>
            )}
            <input
              type="text"
              placeholder="Rechercher un cours..."
              className={`${isSearchExpanded ? 'pl-10 pr-4 py-2 w-full' : 'w-8 h-8 opacity-0'} transition-all duration-300 border rounded-full focus:outline-none focus:ring-2 focus:ring-primary`}
              onFocus={() => setIsSearchExpanded(true)}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button
              type={isSearchExpanded ? "submit" : "button"}
              className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${isSearchExpanded ? 'text-primary' : 'text-gray-500 left-1/2 -translate-x-1/2'}`}
              onClick={() => !isSearchExpanded && setIsSearchExpanded(true)}
            >
              <Search className="h-5 w-5" />
            </button>
          </form>
        </div>

        {/* Liens de navigation */}
        <div className={`${isMenuOpen ? 'block' : 'hidden'} w-full md:flex md:items-center md:w-auto mt-4 md:mt-0`}>
          <div className="flex flex-col md:flex-row md:space-x-6 space-y-2 md:space-y-0">
            {(!user || user.role !== 'formateur') && (
              <Link to="/courses" className="hover:text-primary transition py-2">
                Cours
              </Link>
            )}
            {user?.role === 'formateur' && (
              <Link to="/formateur/cours" className="hover:text-primary transition py-2">
                Cours
              </Link>
            )}
          </div>

          {user?.role === 'formateur' && (
            <Link to="/formateur/dashboard" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition flex items-center">
              Dashboard
            </Link>
          )}

          <div className="flex flex-col md:flex-row md:space-x-4 space-y-2 md:space-y-0 mt-4 md:mt-0 md:ml-6">
            {isAuthenticated ? (
              <>
                {user?.role === 'admin' && (
                  <Link 
                    to="/admin"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition flex items-center"
                  >
                    Admin
                  </Link>
                )}
                
                <div className="relative" ref={notificationRef}>
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="p-2 rounded-full hover:bg-gray-100 relative"
                  >
                    <Bell className="h-5 w-5" />
                    {notifications.length > 0 && (
                      <span className="absolute top-0 right-0 h-4 w-4 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                        {notifications.length}
                      </span>
                    )}
                  </button>
                  {showNotifications && (
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg z-50">
                      <div className="p-4 border-b">
                        <h3 className="font-semibold">Notifications</h3>
                      </div>
                      <div className="max-h-64 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="p-4 text-gray-500 text-sm">Aucune notification</div>
                        ) : (
                          notifications.map(notification => (
                            <div
                              key={notification.id}
                              className="p-4 border-b hover:bg-gray-50 cursor-pointer"
                              onClick={() => markNotificationAsRead(notification.id)}
                            >
                              <p className="text-sm">{notification.message}</p>
                            </div>
                          ))
                        )}
                      </div>
                      <div className="p-2 text-center border-t">
                        <Link 
                          to="/notifications" 
                          className="text-sm text-primary hover:underline"
                        >
                          Voir toutes les notifications
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center space-x-2 hover:text-primary"
                  >
                    <div className="h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center">
                      {user?.nom?.charAt(0) || <User className="h-5 w-5" />}
                    </div>
                    <span className="hidden md:block">{user?.nom}</span>
                  </button>
                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg z-50">
                      <div className="p-2">
                        <Link
                          to="/profile"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded"
                        >
                          <User className="h-4 w-4 mr-2" />
                          Mon profil
                        </Link>
                        <Link
                          to="/changer_mot_de_passe"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded"
                        ><Lock className="h-4 w-4 mr-2" />
                        Changer mot de passe
                        </Link>
                      </div>
                      <div className="border-t p-2">
                        <button
                          onClick={logout}
                          className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded"
                        >
                          <LogOut className="h-4 w-4 mr-2" />
                          Déconnexion
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link 
                  to="/connexion" 
                  className="px-4 py-2 rounded-md hover:bg-secondary transition text-center w-full md:w-auto"
                >
                  Connexion
                </Link>
                <Link 
                  to="/inscription" 
                  className="px-4 py-2 bg-primary text-white rounded-md hover:bg-opacity-90 transition text-center w-full md:w-auto"
                >
                  Inscription
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;