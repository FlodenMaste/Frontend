import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { getFormateurCoursPlanifies, getEtudiantsInscritsClasse, getRapportsDeposesFormateur } from "../services/api";
import { FaFilePdf } from "react-icons/fa";

interface CoursePlanifie {
  id_planification: number;
  id_ec: number;
  titre: string;
  classe: string;
  annee: string;
  num_semestre: string;
  nb_etudiants?: number;
}

interface Etudiant {
  id_etudiant: number;
  nom: string;
  prenom: string;
  email: string;
  classe: string;
  annee: string;
}

interface RapportDepot {
  id_rapport: number;
  fichier: string;
  date_depot: string;
  fichier_url: string;
  nom_etudiant: string;
  prenom_etudiant: string;
  email_etudiant: string;
  titre_ec: string;
}

const RAPPORT_BASE_URL = "http://192.168.1.111:3000/rapports/";

const FormateurDashboard = () => {
  const { user } = useAuth();
  const [coursPlanifies, setCoursPlanifies] = useState<CoursePlanifie[]>([]);
  const [etudiantsParClasse, setEtudiantsParClasse] = useState<Record<number, Etudiant[]>>({});
  const [rapports, setRapports] = useState<RapportDepot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      if (user?.id_formateur) {
        const cours = await getFormateurCoursPlanifies(user.id_formateur);
        setCoursPlanifies(Array.isArray(cours) ? cours : []);
        const etudiantsObj: Record<number, Etudiant[]> = {};
        for (const c of cours) {
          try {
            const etudiants = await getEtudiantsInscritsClasse(c.classe, c.annee);
            etudiantsObj[c.id_planification] = Array.isArray(etudiants) ? etudiants : [];
          } catch {
            etudiantsObj[c.id_planification] = [];
          }
        }
        setEtudiantsParClasse(etudiantsObj);
        const rapportsData = await getRapportsDeposesFormateur(user.id_formateur);
        setRapports(Array.isArray(rapportsData) ? rapportsData : []);
      }
      setLoading(false);
    };
    fetchData();
  }, [user]);

  if (!user || user.role !== "formateur") {
    return <div>Accès réservé aux formateurs.</div>;
  }

  // Fusionne toutes les lignes étudiants/cours
  const rows: Array<{
    cours: string;
    classe: string;
    annee: string;
    semestre: string;
    nom: string;
    prenom: string;
    email: string;
    nbEtudiantsClasse: number;
  }> = [];

  coursPlanifies.forEach((c) => {
    const etudiants = etudiantsParClasse[c.id_planification] ?? [];
    const nbEtudiantsClasse = etudiants.length;
    etudiants.forEach(e => {
      rows.push({
        cours: c.titre,
        classe: c.classe,
        annee: c.annee,
        semestre: c.num_semestre,
        nom: e.nom,
        prenom: e.prenom,
        email: e.email,
        nbEtudiantsClasse,
      });
    });
  });

  return (
    <div className="container mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold mb-6">Tableau de bord Formateur</h1>
      <p className="mb-8 text-gray-700">Bienvenue {user.nom} {user.prenom}</p>

      {/* Tableau unique : une ligne par étudiant */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4 text-blue-700 text-center">Informations</h2>
        {loading ? (
          <div>Chargement...</div>
        ) : rows.length === 0 ? (
          <div className="text-gray-500">Aucun étudiant inscrit.</div>
        ) : (
          <table className="min-w-full border-collapse rounded-lg overflow-hidden shadow">
            <thead>
              <tr className="bg-primary text-white">
                <th className="px-4 py-2 text-center">Cours</th>
                <th className="px-4 py-2 text-center">Classe</th>
                <th className="px-4 py-2 text-center">Année</th>
                <th className="px-4 py-2 text-center">Semestre</th>
                <th className="px-4 py-2 text-center">Nom</th>
                <th className="px-4 py-2 text-center">Prénom</th>
                <th className="px-4 py-2 text-center">Email</th>
                <th className="px-4 py-2 text-center">Total étudiants</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, idx) => (
                <tr key={row.email + row.cours + idx} className="border-b hover:bg-blue-50 transition">
                  <td className="px-4 py-2 text-center font-semibold">{row.cours}</td>
                  <td className="px-4 py-2 text-center">{row.classe}</td>
                  <td className="px-4 py-2 text-center">{row.annee}</td>
                  <td className="px-4 py-2 text-center">{row.semestre}</td>
                  <td className="px-4 py-2 text-center">{row.nom}</td>
                  <td className="px-4 py-2 text-center">{row.prenom}</td>
                  <td className="px-4 py-2 text-center">{row.email}</td>
                  <td className="px-4 py-2 text-center font-bold">{row.nbEtudiantsClasse}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {/* Bloc 2 : Rapports déposés du cours */}
      <section>
        <h2 className="text-2xl font-bold mb-4 text-blue-700 text-center">
          Rapports déposés sur vos cours
        </h2>
        <div className="mb-2 text-gray-700 font-medium">
          Total rapports déposés : <span className="font-bold">{rapports.length}</span>
        </div>
        {loading ? (
          <div>Chargement...</div>
        ) : rapports.length === 0 ? (
          <div className="text-gray-500">Aucun rapport déposé.</div>
        ) : (
          <div className="bg-white rounded-lg shadow p-6 flex flex-col gap-4">
            {rapports.map((r) => (
              <div key={r.id_rapport} className="flex items-center gap-6 border-b pb-4">
                <a
                  href={r.fichier_url || RAPPORT_BASE_URL + encodeURIComponent(r.fichier)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline flex items-center gap-2"
                >
                  <FaFilePdf className="text-red-600" /> {r.fichier}
                </a>
                <span className="text-gray-700">
                  {r.date_depot && new Date(r.date_depot).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default FormateurDashboard;