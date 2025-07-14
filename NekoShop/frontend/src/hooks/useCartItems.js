// frontend/src/hooks/useCartItems.js

import { useCart } from "../contexts/CartContext";

// Devuelve solo el array de items del carrito
export function useCartItems() {
  const { cartItems } = useCart();
  return cartItems;
}
