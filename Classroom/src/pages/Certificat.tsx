import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Award, Download, Clock, CheckCircle, BookOpen, Search } from 'lucide-react';
import { jsPDF } from 'jspdf';

const Certificats = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  
  // Mock data - à remplacer par des appels API
  const certificats = [
    {
      id: '1',
      courseId: '1',
      courseName: 'React pour débutants',
      issueDate: '2024-05-15',
      status: 'issued',
    },
    {
      id: '2',
      courseId: '2',
      courseName: 'Cybersécurité avancée',
      issueDate: '2024-04-20',
      status: 'issued',
    },
    {
      id: '3',
      courseId: '4',
      courseName: 'Développement Web',
      issueDate: '',
      status: 'pending',
      progress: 65,
      completeBy: '2024-06-30',
    },
  ];

  const generateCertificate = (certificat: any) => {
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4',
    });
    
    doc.setFillColor(240, 247, 255);
    doc.rect(0, 0, 297, 210, 'F');
    
    doc.setDrawColor(30, 64, 175);
    doc.setLineWidth(2);
    doc.rect(10, 10, 277, 190);
    
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 64, 175);
    doc.setFontSize(36);
    doc.text('Certificat de Réussite', 148.5, 40, { align: 'center' });
    
    doc.setLineWidth(1);
    doc.line(74, 50, 223, 50);
    
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(60, 60, 60);
    doc.setFontSize(16);
    doc.text('Ce certificat atteste que', 148.5, 70, { align: 'center' });
    
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(24);
    doc.text(user?.nom || 'Étudiant', 148.5, 85, { align: 'center' });
    
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(60, 60, 60);
    doc.setFontSize(16);
    doc.text('a suivi avec succès le cours', 148.5, 105, { align: 'center' });
    
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(20);
    doc.text(certificat.courseName, 148.5, 120, { align: 'center' });
    
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(60, 60, 60);
    doc.setFontSize(14);
    const dateStr = certificat.issueDate
      ? new Date(certificat.issueDate).toLocaleDateString('fr-FR')
      : 'Date inconnue';
    doc.text(`Délivré le: ${dateStr}`, 148.5, 140, { align: 'center' });
    
    doc.setLineWidth(0.5);
    doc.line(90, 160, 200, 160);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);
    doc.text('ClassRoom - Certification Officielle', 148.5, 170, { align: 'center' });
    
    doc.save(`${certificat.courseName}-Certificat.pdf`);
  };

  const filteredCertificats = certificats.filter(cert => 
    cert.courseName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8 md:py-12">
      <h1 className="text-2xl md:text-3xl font-bold mb-6">Mes Certificats</h1>
      
      <div className="mb-6 max-w-md">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Rechercher un certificat..."
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredCertificats.map(certificat => (
          <div key={certificat.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition">
            <div className="relative">
              {certificat.status === 'issued' ? (
                <div className="absolute top-4 right-4 bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-semibold flex items-center">
                  <CheckCircle className="h-3 w-3 mr-1" /> Délivré
                </div>
              ) : (
                <div className="absolute top-4 right-4 bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-semibold flex items-center">
                  <Clock className="h-3 w-3 mr-1" /> En cours
                </div>
              )}
              <div className="flex items-center justify-center py-8 bg-blue-50">
                <Award className="h-16 w-16 text-primary" />
              </div>
            </div>
            
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-2">{certificat.courseName}</h3>
              
              {certificat.status === 'issued' ? (
                <>
                  <p className="text-sm text-gray-600 mb-4">
                    Délivré le: {certificat.issueDate
                      ? new Date(certificat.issueDate).toLocaleDateString('fr-FR')
                      : 'Date inconnue'}
                  </p>
                  
                  <button
                    onClick={() => generateCertificate(certificat)}
                    className="w-full flex items-center justify-center px-4 py-2 bg-primary text-white rounded-md hover:bg-opacity-90"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Télécharger
                  </button>
                </>
              ) : (
                <>
                  <p className="text-sm text-gray-600 mb-2">
                    À compléter avant: {certificat.completeBy
                      ? new Date(certificat.completeBy).toLocaleDateString('fr-FR')
                      : 'Date inconnue'}
                  </p>
                  
                  <div className="mb-4">
                    <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full"
                        style={{ width: `${certificat.progress}%` }}
                      ></div>
                    </div>
                    <p className="mt-1 text-xs text-gray-500 text-right">
                      {certificat.progress}% complété
                    </p>
                  </div>
                  
                  <Link
                    to={`/courses/${certificat.courseId}`}
                    className="w-full flex items-center justify-center px-4 py-2 border border-primary text-primary rounded-md hover:bg-blue-50"
                  >
                    <BookOpen className="h-4 w-4 mr-2" />
                    Continuer le cours
                  </Link>
                </>
              )}
            </div>
          </div>
        ))}
        
        {filteredCertificats.length === 0 && (
          <div className="col-span-3 text-center py-12">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
              <Award className="h-6 w-6 text-gray-500" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? "Aucun certificat trouvé" : "Vous n'avez pas encore de certificats"}
            </h3>
            <p className="text-gray-500">
              {searchTerm
                ? "Aucun certificat ne correspond à votre recherche."
                : "Complétez des cours pour obtenir des certificats."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Certificats;