import { createContext, useContext, useState, ReactNode } from "react";
import { Course } from "../types/types";

type CartContextType = {
  cart: Course[];
  addToCart: (course: Course) => void;
  removeFromCart: (courseId: number) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
};

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<Course[]>([]);

  const addToCart = (course: Course) => {
    setCart((prev) =>
      prev.some((c) => c.id === course.id) ? prev : [...prev, course]
    );
  };

  const removeFromCart = (courseId: number) => {
    setCart((prev) => prev.filter((c) => c.id !== courseId));
  };

  const clearCart = () => setCart([]);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};