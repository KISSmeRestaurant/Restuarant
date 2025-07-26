import { motion } from 'framer-motion';
import { FiShoppingCart, FiChevronLeft, FiChevronRight, FiTrash2, FiArrowLeft } from 'react-icons/fi';

const CartPage = ({ 
  cart = [], 
  subtotal = 0, 
  tax = 0, 
  deliveryFee = 0,
  total = 0, 
  updateCartItem, 
  removeFromCart, 
  onBack, 
  onCheckout 
}) => {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md overflow-hidden">
        {/* Header */}
        <div className="bg-amber-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button 
                onClick={onBack}
                className="mr-4 p-1 rounded-full hover:bg-amber-700 transition"
              >
                <FiArrowLeft className="w-5 h-5" />
              </button>
              <h2 className="text-2xl font-bold flex items-center">
                <FiShoppingCart className="mr-2" />
                Your Order
              </h2>
            </div>
              <span className="bg-white text-amber-600 px-3 py-1 rounded-full font-medium">
              {cart.reduce((sum, item) => sum + (item.quantity || 0), 0)} items
            </span>
          </div>
        </div>
        
        <div className="p-6">
          {cart.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-5xl mb-4">🛒</div>
              <h3 className="text-xl font-medium text-gray-700 mb-2">Your cart is empty</h3>
              <p className="text-gray-500 mb-6">Looks like you haven't added anything to your cart yet</p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onBack}
                className="px-6 py-3 bg-amber-600 text-white rounded-lg font-medium hover:bg-amber-700 transition"
              >
                Browse Menu
              </motion.button>
            </div>
          ) : (
            <>
              <div className="divide-y divide-gray-200">
                {cart.map(item => (
                  <motion.div 
                    key={item._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="py-4 flex flex-col md:flex-row gap-4"
                  >
                    <div className="flex-shrink-0">
                      <div className="h-24 w-24 bg-gray-200 rounded-lg overflow-hidden shadow-sm">
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
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-gray-800">{item.name}</h3>
                          <p className="text-sm text-gray-600">${item.price.toFixed(2)}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-gray-800">
                            ${(item.price * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center mt-4">
                        <div className="flex items-center bg-gray-100 rounded-lg">
                          <button 
                            onClick={() => updateCartItem(item._id, item.quantity - 1)}
                            className="p-2 text-gray-500 hover:text-amber-600"
                          >
                            <FiChevronLeft />
                          </button>
                          
                          <span className="mx-2 w-8 text-center font-medium">{item.quantity}</span>
                          
                          <button 
                            onClick={() => updateCartItem(item._id, item.quantity + 1)}
                            className="p-2 text-gray-500 hover:text-amber-600"
                          >
                            <FiChevronRight />
                          </button>
                        </div>
                        
                        <button 
                          onClick={() => removeFromCart(item._id)}
                          className="ml-4 p-2 text-red-500 hover:text-red-600 rounded-full hover:bg-red-50 transition"
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
              
              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-medium">${subtotal.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">VAT (20%):</span>
                    <span className="font-medium">${tax.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Delivery Fee:</span>
                    <span className="font-medium">${deliveryFee.toFixed(2)}</span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center py-3 border-t border-gray-200">
                  <span className="font-bold text-lg text-gray-800">Total:</span>
                  <span className="text-xl font-bold text-amber-600">
                    ${total.toFixed(2)}
                  </span>
                </div>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onCheckout}
                  className="w-full bg-amber-600 hover:bg-amber-700 text-white py-4 rounded-lg font-medium transition mt-6 shadow-md"
                >
                  Proceed to Checkout
                </motion.button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CartPage;