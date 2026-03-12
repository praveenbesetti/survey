import React, { createContext, useContext, useReducer } from 'react';

// Note: Ensure your products data file is available at this path
// import { Product } from '../data/products'; 

const CartContext = createContext(undefined);

const initialState = {
  cart: []
};

function cartReducer(state, action) {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existingItem = state.cart.find(
        (item) => item.id === action.payload.id
      );
      if (existingItem) {
        return {
          ...state,
          cart: state.cart.map((item) =>
            item.id === action.payload.id ?
            {
              ...item,
              quantity: item.quantity + 1
            } :
            item
          )
        };
      }
      return {
        ...state,
        cart: [
          ...state.cart,
          {
            ...action.payload,
            quantity: 1
          }
        ]
      };
    }
    case 'REMOVE_ITEM':
      return {
        ...state,
        cart: state.cart.filter((item) => item.id !== action.payload)
      };
    case 'UPDATE_QUANTITY':
      if (action.payload.quantity <= 0) {
        return {
          ...state,
          cart: state.cart.filter((item) => item.id !== action.payload.id)
        };
      }
      return {
        ...state,
        cart: state.cart.map((item) =>
          item.id === action.payload.id ?
          {
            ...item,
            quantity: action.payload.quantity
          } :
          item
        )
      };
    case 'CLEAR_CART':
      return {
        ...state,
        cart: []
      };
    default:
      return state;
  }
}

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  const addToCart = (product) =>
    dispatch({
      type: 'ADD_ITEM',
      payload: product
    });

  const removeFromCart = (id) =>
    dispatch({
      type: 'REMOVE_ITEM',
      payload: id
    });

  const updateQuantity = (id, quantity) =>
    dispatch({
      type: 'UPDATE_QUANTITY',
      payload: { id, quantity }
    });

  const clearCart = () =>
    dispatch({
      type: 'CLEAR_CART'
    });

  const cartCount = state.cart.reduce((total, item) => total + item.quantity, 0);
  
  const cartTotal = state.cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  const deliveryCharge = cartTotal >= 199 || cartTotal === 0 ? 0 : 25;
  const gst = Math.round(cartTotal * 0.05);
  const grandTotal = cartTotal + deliveryCharge + gst;

  return (
    <CartContext.Provider
      value={{
        cart: state.cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartCount,
        cartTotal,
        deliveryCharge,
        gst,
        grandTotal
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}