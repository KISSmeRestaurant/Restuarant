import { motion } from 'framer-motion';
import { FiShoppingCart, FiChevronLeft, FiChevronRight, FiTrash2 } from 'react-icons/fi';

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
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md overflow-hidden p-6">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center">
            <FiShoppingCart className="mr-2 text-amber-600" />
            Your Order
          </h2>
          <button 
            onClick={onBack}
            className="text-amber-600 hover:text-amber-700 font-medium"
          >
            Back to Menu
          </button>
        </div>
        
        {cart.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-5xl mb-4">🛒</div>
            <p className="text-gray-500">Your cart is empty</p>
            <button
              onClick={onBack}
              className="mt-4 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition"
            >
              Browse Menu
            </button>
          </div>
        ) : (
          <>
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
                        onClick={() => updateCartItem(item._id, item.quantity - 1)}
                        className="p-1 text-gray-500 hover:text-amber-600"
                      >
                        <FiChevronLeft />
                      </button>
                      
                      <span className="mx-2 w-8 text-center">{item.quantity}</span>
                      
                      <button 
                        onClick={() => updateCartItem(item._id, item.quantity + 1)}
                        className="p-1 text-gray-500 hover:text-amber-600"
                      >
                        <FiChevronRight />
                      </button>
                      
                      <button 
                        onClick={() => removeFromCart(item._id)}
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
                <span className="font-semibold">${subtotal.toFixed(2)}</span>
              </div>
              
              <div className="flex justify-between items-center mb-4">
                <span className="font-medium text-gray-700">Tax (10%):</span>
                <span className="font-semibold">${tax.toFixed(2)}</span>
              </div>
              
              <div className="flex justify-between items-center mb-6">
                <span className="font-medium text-gray-700">Total:</span>
                <span className="text-xl font-bold text-amber-600">
                  ${total.toFixed(2)}
                </span>
              </div>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onCheckout}
                className="w-full bg-amber-600 hover:bg-amber-700 text-white py-3 rounded-lg font-medium transition"
              >
                Proceed to Checkout
              </motion.button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CartPage;