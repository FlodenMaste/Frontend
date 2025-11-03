import { useCart } from "../contexts/CartContext";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { adminService } from "../services/api";

const CartPage = () => {
  const { cart, removeFromCart, clearCart } = useCart();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleBuyAll = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      if (!user?.id_etudiant) throw new Error("Non connecté.");
      const inscriptions = await adminService.getInscriptions();

      for (const course of cart) {
        // Vérifie inscription à l'année et au cours
        const inscription = inscriptions.find(
          (i: any) =>
            i.id_etudiant === user.id_etudiant &&
            i.InscriptionCours?.some((c: any) => c.id_cours === course.id)
        );
        if (!inscription) continue; // skip si pas inscrit

        // Vérifie paiement existant
        const paiements = await adminService.getPaiements();
        const paiementExist = paiements.find(
          (p: any) =>
            p.id_inscription === inscription.id_inscription &&
            (p.statut_paiement === "en_attente" || p.statut_paiement === "effectuer")
        );
        if (paiementExist) continue; // déjà payé

        // Crée le paiement
        await adminService.createPaiement({
          id_inscription: inscription.id_inscription,
          montant: Number(course.price),
          date_paiement: new Date().toISOString().slice(0, 10),
          methode_paiement: "carte_credit",
        });
      }
      setSuccess("Paiements initiés pour tous les cours du panier !");
      clearCart();
    } catch (e: any) {
      setError(e.message || "Erreur lors du paiement groupé.");
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0)
    return (
      <div className="container mx-auto px-6 py-12 text-center">
        <h2 className="text-xl font-bold mb-4">Votre panier est vide.</h2>
        <button
          className="bg-primary text-white px-6 py-2 rounded-md"
          onClick={() => navigate("/courses")}
        >
          Parcourir les cours
        </button>
      </div>
    );

  return (
    <div className="container mx-auto px-6 py-12">
      <h2 className="text-2xl font-bold mb-6">Votre panier</h2>
      <ul className="mb-6">
        {cart.map((course) => (
          <li
            key={course.id}
            className="flex justify-between items-center border-b py-3"
          >
            <span>
              {course.title} - <span className="font-bold">{course.price} FCFA</span>
            </span>
            <button
              className="text-red-500"
              onClick={() => removeFromCart(course.id)}
            >
              Retirer
            </button>
          </li>
        ))}
      </ul>
      <div className="mb-6 font-bold">
        Total :{" "}
        {cart.reduce((sum, c) => sum + Number(c.price), 0).toLocaleString()} FCFA
      </div>
      <button
        className="bg-primary text-white px-6 py-3 rounded-md font-medium"
        onClick={handleBuyAll}
        disabled={loading}
      >
        {loading ? "Paiement en cours..." : "Payer tous les cours"}
      </button>
      {success && <div className="mt-4 text-green-600">{success}</div>}
      {error && <div className="mt-4 text-red-600">{error}</div>}
    </div>
  );
};

export default CartPage;