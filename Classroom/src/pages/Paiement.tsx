import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { adminService } from '../services/api';
import { Course, PaiementType } from '../types/types';
import { useCart } from '../contexts/CartContext';

const Paiement = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'carte_credit' | 'paypal'>('carte_credit');
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paiement, setPaiement] = useState<PaiementType | null>(null);
  const [inscriptionId, setInscriptionId] = useState<number | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { addToCart } = useCart();

  // Récupère le paiement existant (en_attente ou effectué)
  const fetchPaiement = async (inscId: number) => {
    const paiements = await adminService.getPaiements();
    return paiements.find(
      (p: PaiementType) =>
        p.id_inscription === inscId &&
        (p.statut_paiement === 'en_attente' || p.statut_paiement === 'effectuer')
    ) as PaiementType | undefined;
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      setPaiement(null);
      try {
        // Récupère le cours
        let foundCourse: Course | null = null;
        if (location.state?.course) {
          foundCourse = location.state.course;
        } else {
          // Simuler un appel API pour les cours
          const mockCourses: Course[] = [
            {
              id: 1,
              title: 'Normes, standards et Audits de sécurité',
              description: "Apprenez à sécurisé, combinée et à une analyser les risques approfondie, permet de mettre en place des pratiques et des mesures de sécurité solides, tout en garantissant la conformité aux meilleures pratiques de l'industrie et aux exigences réglementaires.",
              duration: '20 heures',
              price: 0,
              image: 'cours_images/audits.jpg',
              level: 'Débutant',
              category: 'Cybersécurité',
              isFree: true,
              instructor: 'Ahamadi NASRY',
            },

           {
              id: 2,
              title: 'Réagir face à une cyber-attaque',
              description: "En informatique, on parle de digital forensic, c’est-à-dire l’analyse d’un ordinateur pour comprendre les évènements passés et en extraire des conclusions.",
              duration: '20 heures',
              price: 0,
              image: 'cours_images/reagir.jpg',
              level: 'Débutant',
              category: 'Cybersécurité',
              isFree: true,
              instructor: 'Mbaye SAMB',
            },
      {
              id: 3,
              title: "Supervision avancée d'un Système d'information",
              description: "La supervision des systèmes d'information est un élément crucial dans la gestion efficace de tout environnement informatique. Elle consiste à surveiller en temps réel les composants d'un système d'information, tels que les réseaux, les serveurs, les applications et les bases de données, afin d'assurer leur bon fonctionnement, leur performance optimale et leur sécurité.",
              duration: '20 heures',
              price: 50000,
              image: 'cours_images/supervision.jpg',
              level: 'Intermédiaire',
              category: 'Cybersécurité',
              isFree: false,
              instructor: 'Ismaila FALL',
            },
            {
              id: 4,
              title: 'Data Analyst',
              description: 'Découvrez pas à pas le monde de la Data Science : préparez, analysez et modélisez des données',
              duration: '30 heures',
              price: 150000,
              image: 'cours_images/data.jpg',
              level: 'Intermédiaire',
              category: 'Data',
              isFree: false,
              instructor: 'BA ba',
            },

           {
              id: 5,
              title: 'Analyste Cybersécurité SOC',
              description: 'Détectez les incidents de cybersécurité et agissez pour la protection de votre entreprise',
              duration: '40 heures',
              price: 180000,
              image: 'cours_images/soc.jpg',
              level: 'Avancé',
              category: 'Cybersécurité',
              isFree: false,
              instructor: 'BANZOULOU Clevy',
            },
          ];
          foundCourse = mockCourses.find((c) => c.id === Number(id)) || null;
        }
        if (!foundCourse) {
          setError('Cours non trouvé');
          setLoading(false);
          return;
        }
        setCourse(foundCourse);

        // Vérifie l'inscription
        if (user?.id_etudiant) {
          const inscriptions = await adminService.getInscriptions();
          const inscription = inscriptions.find(
            (i: any) =>
              i.id_etudiant === user.id_etudiant &&
              i.InscriptionCours?.some((c: any) => c.id_cours === Number(id))
          );
          if (!inscription) {
            setError("Vous devez d'abord être inscrit à ce cours.");
            setLoading(false);
            return;
          }
          setInscriptionId(inscription.id_inscription);

          // Vérifie paiement existant
          const paiementExist = await fetchPaiement(inscription.id_inscription);
          if (paiementExist) setPaiement(paiementExist);
        }
      } catch (err) {
        setError('Erreur lors du chargement du cours');
      } finally {
        setLoading(false);
      }
    };

    if (user && id) {
      fetchData();
    }
  }, [id, location, user]);

  // Création du paiement (en_attente)
  const handlePaiement = async () => {
    setPaymentLoading(true);
    setError(null);
    setSuccess(null);
    try {
      if (!inscriptionId || !course) {
        setError("Erreur d'inscription ou de cours.");
        setPaymentLoading(false);
        return;
      }
      // Vérifie si déjà un paiement en attente ou effectué
      const paiementExist = await fetchPaiement(inscriptionId);
      if (paiementExist) {
        setPaiement(paiementExist);
        setError("Un paiement est déjà en cours ou effectué.");
        setPaymentLoading(false);
        return;
      }

      if (course.price === 0) {
        setError("Ce cours est gratuit, aucun paiement n'est nécessaire.");
        setPaymentLoading(false);
        return;
      }

      // Correction ici : s'assurer que montant est bien un nombre
      const montantNumber = Number(course.price);

      // Crée le paiement en attente
      const paiementCree = await adminService.createPaiement({
        id_inscription: inscriptionId,
        montant: montantNumber,
        date_paiement: new Date().toISOString().slice(0, 10),
        methode_paiement: selectedPaymentMethod
      });
      setPaiement(paiementCree);
      setSuccess("Paiement initié. Veuillez confirmer ou annuler.");
    } catch (e: any) {
      setError(e.message || "Erreur lors du paiement.");
    } finally {
      setPaymentLoading(false);
    }
  };

  // Confirmation du paiement
  const handleConfirmer = async () => {
    if (!paiement) return;
    setPaymentLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await adminService.confirmerPaiement(paiement.id_paiement);
      setPaiement({ ...paiement, statut_paiement: 'effectuer' });
      setSuccess("Paiement confirmé avec succès !");
    } catch (e: any) {
      setError(e.message || "Erreur lors de la confirmation.");
    } finally {
      setPaymentLoading(false);
    }
  };

  // Annulation du paiement
  const handleAnnuler = async () => {
    if (!paiement) return;
    setPaymentLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await adminService.annulerPaiement(paiement.id_paiement);
      setPaiement({ ...paiement, statut_paiement: 'annuler' });
      setSuccess("Paiement annulé.");
    } catch (e: any) {
      setError(e.message || "Erreur lors de l'annulation.");
    } finally {
      setPaymentLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (course) {
      addToCart(course);
      setSuccess("Cours ajouté au panier !");
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-6 py-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4">Chargement...</p>
      </div>
    );
  }

  if (error && !success) {
    return (
      <div className="container mx-auto px-6 py-12 text-center text-red-500">
        {error}
      </div>
    );
  }

  if (!course) {
    return (
      <div className="container mx-auto px-6 py-12 text-center">
        Cours non trouvé
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8 md:py-12">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6 md:p-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-6">Finaliser votre achat</h1>

          <div className="mb-6 p-4 bg-gray-50 rounded-md">
            <h2 className="text-xl font-semibold mb-2">{course.title}</h2>
            <p className="text-gray-600 mb-4">{course.description}</p>
            <div className="flex justify-between items-center">
              <span className="text-lg font-medium">Total à payer :</span>
              {paiement?.statut_paiement === 'effectuer' ? (
                <span className="text-green-600 font-bold">Déjà payé</span>
              ) : paiement?.statut_paiement === 'annuler' ? (
                <span className="text-red-600 font-bold">Paiement annulé</span>
              ) : (
                <span className="text-2xl font-bold text-primary">{course.price} FCFA</span>
              )}
            </div>
            {paiement && (
              <div className="mt-2 text-sm">
                Statut du paiement : <span className="font-semibold">{paiement.statut_paiement}</span>
              </div>
            )}
          </div>

          {/* Méthode de paiement et bouton */}
          {!paiement && (
            <>
              <div className="mb-6">
                <h3 className="font-medium mb-3">Méthode de paiement</h3>
                <div className="space-y-3">
                  <label className="flex items-center p-3 border rounded-md hover:border-primary cursor-pointer">
                    <input
                      type="radio"
                      name="payment"
                      value="carte_credit"
                      checked={selectedPaymentMethod === 'carte_credit'}
                      onChange={() => setSelectedPaymentMethod('carte_credit')}
                      className="form-radio text-primary h-4 w-4"
                    />
                    <div className="ml-3">
                      <span className="block font-medium">Carte de crédit</span>
                      <span className="block text-sm text-gray-500">Visa, Mastercard, etc.</span>
                    </div>
                  </label>
                  <label className="flex items-center p-3 border rounded-md hover:border-primary cursor-pointer">
                    <input
                      type="radio"
                      name="payment"
                      value="paypal"
                      checked={selectedPaymentMethod === 'paypal'}
                      onChange={() => setSelectedPaymentMethod('paypal')}
                      className="form-radio text-primary h-4 w-4"
                    />
                    <div className="ml-3">
                      <span className="block font-medium">PayPal</span>
                      <span className="block text-sm text-gray-500">Paiement sécurisé via PayPal</span>
                    </div>
                  </label>
                </div>
              </div>

              <button
                onClick={handlePaiement}
                className="w-full bg-primary text-white py-3 rounded-md hover:bg-opacity-90 transition font-medium"
                disabled={paymentLoading}
              >
                {paymentLoading ? 'Paiement en cours...' : `Confirmer et payer ${course.price} FCFA`}
              </button>
              <button
                onClick={handleAddToCart}
                className="w-full mt-3 bg-gray-200 text-primary py-3 rounded-md hover:bg-gray-300 transition font-medium"
                disabled={paymentLoading}
              >
                Ajouter au panier
              </button>
              <div className="mt-4 text-center">
                <Link to="/cart" className="text-primary underline">
                  Voir mon panier
                </Link>
              </div>
              <p className="mt-4 text-sm text-gray-500 text-center">
                En cliquant sur ce bouton, vous initiez le paiement. Il devra être confirmé.
              </p>
            </>
          )}

          {/* Actions sur paiement en attente */}
          {paiement && paiement.statut_paiement === 'en_attente' && (
            <div className="flex flex-col gap-4 mt-6">
              <button
                onClick={handleConfirmer}
                className="w-full bg-green-600 text-white py-3 rounded-md hover:bg-green-700 transition font-medium"
                disabled={paymentLoading}
              >
                {paymentLoading ? 'Confirmation...' : 'Confirmer le paiement'}
              </button>
              <button
                onClick={handleAnnuler}
                className="w-full bg-red-500 text-white py-3 rounded-md hover:bg-red-600 transition font-medium"
                disabled={paymentLoading}
              >
                {paymentLoading ? 'Annulation...' : 'Annuler le paiement'}
              </button>
            </div>
          )}

          {/* Message de succès et bouton retour */}
          {success && (
            <div className="mt-4 text-green-600 text-center font-medium">
              {success}
              <div className="mt-6 flex justify-center">
                <button
                  onClick={() => navigate(`/courses/${id}`)}
                  className="bg-primary text-white px-6 py-2 rounded-md hover:bg-opacity-90 transition font-medium"
                >
                  Retour au cours
                </button>
              </div>
            </div>
          )}

          {/* Si déjà payé ou annulé, bouton retour */}
          {(paiement?.statut_paiement === 'effectuer' || paiement?.statut_paiement === 'annuler') && (
            <div className="mt-6 flex justify-center">
              <button
                onClick={() => navigate(`/courses/${id}`)}
                className="bg-primary text-white px-6 py-2 rounded-md hover:bg-opacity-90 transition font-medium"
              >
                Retour au cours
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Paiement;