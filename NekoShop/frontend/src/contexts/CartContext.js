import React, { createContext, useContext, useState, useEffect } from "react";

const CartContext = createContext();

// Hook para acceder al carrito
export function useCart() {
  return useContext(CartContext);
}

export function CartProvider({ children }) {
  // Carga inicial desde localStorage
  const [cartItems, setCartItems] = useState(() => {
    try {
      const stored = localStorage.getItem("cart");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Guarda cada cambio en localStorage
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cartItems));
  }, [cartItems]);

  function addToCart(item, quantity) {
    setCartItems(prev => {
      const exists = prev.find(p => p.id === item.id);
      if (exists) {
        return prev.map(p =>
          p.id === item.id ? { ...p, quantity: p.quantity + quantity } : p
        );
      } else {
        return [...prev, { ...item, quantity }];
      }
    });
  }

  function updateQuantity(id, newQuantity) {
    setCartItems(prev =>
      prev
        .map(p => (p.id === id ? { ...p, quantity: newQuantity } : p))
        .filter(p => p.quantity > 0)
    );
  }

  function removeFromCart(id) {
    setCartItems(prev => prev.filter(p => p.id !== id));
  }

  function clearCart() {
    setCartItems([]);
  }

  const value = {
    cartItems,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
