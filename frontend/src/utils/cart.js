// utils/cart.js
export const addToCart = (item) => {
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  
  // Check if item already exists in cart
  const existingItemIndex = cart.findIndex(cartItem => cartItem._id === item._id);
  
  if (existingItemIndex >= 0) {
    // Update quantity if item exists
    cart[existingItemIndex].quantity += 1;
  } else {
    // Add new item to cart
    cart.push({ ...item, quantity: 1 });
  }
  
  localStorage.setItem('cart', JSON.stringify(cart));
  window.dispatchEvent(new Event('cart-updated'));
};

export const getCartItems = () => {
  return JSON.parse(localStorage.getItem('cart')) || [];
};

export const clearCart = () => {
  localStorage.removeItem('cart');
  window.dispatchEvent(new Event('cart-updated'));
};








