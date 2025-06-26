import { motion } from 'framer-motion';
import { FiShoppingCart, FiChevronLeft, FiChevronRight, FiTrash2, FiPlus, FiMinus } from 'react-icons/fi';

const CartPage = ({ 
  cart, 
  subtotal, 
  tax, 
  total, 
  updateCartItem, 
  removeFromCart, 
  onBack, 
  onCheckout 
}) => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md overflow-hidden">
        {/* Header */}
        <div className="bg-amber-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <FiShoppingCart className="text-2xl mr-3" />
              <h2 className="text-2xl font-bold">Your Order</h2>
            </div>
            <button 
              onClick={onBack}
              className="flex items-center text-white hover:text-amber-100"
            >
              <FiChevronLeft className="mr-1" />
              Back to Menu
            </button>
          </div>
        </div>
        
        {cart.length === 0 ? (
          <div className="text-center p-12">
            <div className="text-7xl mb-6">🛒</div>
            <h3 className="text-2xl font-medium text-gray-700 mb-2">Your cart is empty</h3>
            <p className="text-gray-500 mb-6">Looks like you haven't added anything to your cart yet</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onBack}
              className="px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition font-medium"
            >
              Browse Menu
            </motion.button>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {/* Cart Items */}
            {cart.map(item => (
              <motion.div 
                key={item._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-6 flex flex-col md:flex-row gap-6"
              >
                {/* Item Image */}
                <div className="flex-shrink-0 w-24 h-24 md:w-32 md:h-32 bg-gray-200 rounded-lg overflow-hidden">
                  {item.imageUrl ? (
                    <img 
                      src={item.imageUrl} 
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-amber-50 flex items-center justify-center">
                      <span className="text-gray-400 text-xs">No image</span>
                    </div>
                  )}
                </div>
                
                {/* Item Details */}
                <div className="flex-grow">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">{item.name}</h3>
                      <p className="text-amber-600 font-medium">${item.price.toFixed(2)}</p>
                    </div>
                    <button 
                      onClick={() => removeFromCart(item._id)}
                      className="p-2 text-red-500 hover:text-red-600 transition"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                  
                  {/* Quantity Controls */}
                  <div className="mt-4 flex items-center">
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => updateCartItem(item._id, item.quantity - 1)}
                      className="p-2 bg-gray-100 rounded-full text-gray-600 hover:bg-gray-200 transition"
                    >
                      <FiMinus />
                    </motion.button>
                    
                    <span className="mx-4 w-8 text-center font-medium">{item.quantity}</span>
                    
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => updateCartItem(item._id, item.quantity + 1)}
                      className="p-2 bg-gray-100 rounded-full text-gray-600 hover:bg-gray-200 transition"
                    >
                      <FiPlus />
                    </motion.button>
                    
                    <span className="ml-auto font-bold">
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
            
            {/* Order Summary */}
            <div className="p-6 bg-gray-50">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Order Summary</h3>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">${subtotal.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax (10%)</span>
                  <span className="font-medium">${tax.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between pt-3 border-t border-gray-200">
                  <span className="text-lg font-bold text-gray-800">Total</span>
                  <span className="text-xl font-bold text-amber-600">
                    ${total.toFixed(2)}
                  </span>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onBack}
                  className="px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition flex-1"
                >
                  Continue Shopping
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onCheckout}
                  className="px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-medium transition flex-1"
                >
                  Proceed to Checkout
                </motion.button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;