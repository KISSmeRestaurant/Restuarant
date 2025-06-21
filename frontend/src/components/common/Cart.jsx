import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiShoppingCart, FiChevronLeft, FiChevronRight, FiTrash2 } from 'react-icons/fi';
import Checkout from './Checkout'; // or the correct path to your Checkout component

const CartPage = () => {
  const [cart, setCart] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCheckout, setShowCheckout] = useState(false);
  const navigate = useNavigate();

  // Load cart from localStorage on component mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
    setIsLoading(false);
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem('cart', JSON.stringify(cart));
    }
  }, [cart, isLoading]);

  const updateQuantity = (id, newQuantity) => {
    if (newQuantity < 1) return;
    setCart(cart.map(item => 
      item._id === id ? { ...item, quantity: newQuantity } : item
    ));
  };

  const removeItem = (id) => {
    setCart(cart.filter(item => item._id !== id));
  };

  const handleProceedToCheckout = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
      navigate('/login', { state: { from: '/cart' } });
    } else {
      setShowCheckout(true);
    }
  };

  const handleOrderSuccess = (orderData) => {
    // Clear cart after successful order
    setCart([]);
    navigate('/orders', { state: { orderSuccess: true, orderId: orderData._id } });
  };

  const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  if (showCheckout) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Checkout 
          cart={cart} 
          onBack={() => setShowCheckout(false)}
          onOrderSuccess={handleOrderSuccess}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Your Cart</h1>
      
      {isLoading ? (
        <div className="text-center py-12">
          <p>Loading your cart...</p>
        </div>
      ) : cart.length === 0 ? (
        <div className="text-center py-12">
          <FiShoppingCart className="mx-auto text-5xl text-gray-400 mb-4" />
          <h2 className="text-xl font-medium text-gray-600 mb-2">Your cart is empty</h2>
          <p className="text-gray-500 mb-6">Looks like you haven't added any items yet</p>
          <button 
            onClick={() => navigate('/menu')}
            className="px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition"
          >
            Browse Menu
          </button>
        </div>
      ) : (
        <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md overflow-hidden p-6">
          <div className="divide-y divide-gray-200">
            {cart.map(item => (
              <motion.div 
                key={item._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="py-4 flex flex-col md:flex-row gap-4"
              >
                <div className="flex-shrink-0">
                  <div className="h-24 w-24 bg-gray-200 rounded-lg overflow-hidden">
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full w-full bg-amber-50 flex items-center justify-center">
                        <span className="text-gray-400 text-xs">No image</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex-grow">
                  <h3 className="font-semibold text-gray-800">{item.name}</h3>
                  <p className="text-sm text-gray-600 mb-2">${item.price.toFixed(2)}</p>
                  
                  <div className="flex items-center mt-2">
                    <button 
                      onClick={() => updateQuantity(item._id, item.quantity - 1)}
                      className="p-1 text-gray-500 hover:text-amber-600"
                    >
                      <FiChevronLeft />
                    </button>
                    
                    <span className="mx-2 w-8 text-center">{item.quantity}</span>
                    
                    <button 
                      onClick={() => updateQuantity(item._id, item.quantity + 1)}
                      className="p-1 text-gray-500 hover:text-amber-600"
                    >
                      <FiChevronRight />
                    </button>
                    
                    <button 
                      onClick={() => removeItem(item._id)}
                      className="ml-4 p-1 text-red-500 hover:text-red-600"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </div>
                
                <div className="md:text-right">
                  <p className="font-medium text-gray-800">
                    ${(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
          
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <span className="font-medium text-gray-700">Subtotal:</span>
              <span className="font-semibold">${totalAmount.toFixed(2)}</span>
            </div>
            
            <div className="flex justify-between items-center mb-4">
              <span className="font-medium text-gray-700">Tax (10%):</span>
              <span className="font-semibold">${(totalAmount * 0.1).toFixed(2)}</span>
            </div>
            
            <div className="flex justify-between items-center mb-6">
              <span className="font-medium text-gray-700">Total:</span>
              <span className="text-xl font-bold text-amber-600">
                ${(totalAmount * 1.1).toFixed(2)}
              </span>
            </div>
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleProceedToCheckout}
              className="w-full bg-amber-600 hover:bg-amber-700 text-white py-3 rounded-lg font-medium transition"
            >
              Proceed to Checkout
            </motion.button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;