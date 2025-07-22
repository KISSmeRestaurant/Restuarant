import { motion } from 'framer-motion';
import { FiCheckCircle, FiAlertCircle, FiLoader } from 'react-icons/fi';

const CheckoutPage = ({ 
  deliveryInfo, 
  cart, 
  subtotal, 
  tax, 
  total, 
  onChange, 
  onSubmit, 
  onBack,
  loading,
  error
}) => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-5xl mx-auto">
        {/* Progress Steps */}
        <div className="flex justify-between items-center mb-8 relative">
          <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-200 -z-10"></div>
          
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 rounded-full bg-amber-600 text-white flex items-center justify-center mb-2">
              1
            </div>
            <span className="text-sm font-medium">Cart</span>
          </div>
          
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 rounded-full bg-amber-600 text-white flex items-center justify-center mb-2">
              2
            </div>
            <span className="text-sm font-medium">Details</span>
          </div>
          
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center mb-2">
              3
            </div>
            <span className="text-sm font-medium">Payment</span>
          </div>
          
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center mb-2">
              4
            </div>
            <span className="text-sm font-medium">Complete</span>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Delivery Information */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Delivery Information</h2>
            
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6"
              >
                <FiAlertCircle className="flex-shrink-0 mt-1 mr-3" />
                <div>
                  <p className="font-medium">{error}</p>
                </div>
              </motion.div>
            )}
            
            <form onSubmit={onSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name*</label>
                <input
                  type="text"
                  name="name"
                  value={deliveryInfo.name}
                  onChange={onChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-amber-500 focus:border-amber-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number*</label>
                <input
                  type="tel"
                  name="phone"
                  value={deliveryInfo.phone}
                  onChange={onChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-amber-500 focus:border-amber-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Address*</label>
                <textarea
                  name="address"
                  value={deliveryInfo.address}
                  onChange={onChange}
                  required
                  rows="3"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-amber-500 focus:border-amber-500"
                  placeholder="Street address, apartment/floor number"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City*</label>
                  <input
                    type="text"
                    name="city"
                    value={deliveryInfo.city}
                    onChange={onChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-amber-500 focus:border-amber-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Postal Code</label>
                  <input
                    type="text"
                    name="postalCode"
                    value={deliveryInfo.postalCode || ''}
                    onChange={onChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-amber-500 focus:border-amber-500"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Instructions</label>
                <textarea
                  name="notes"
                  value={deliveryInfo.notes}
                  onChange={onChange}
                  rows="2"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-amber-500 focus:border-amber-500"
                  placeholder="Gate code, landmarks, etc."
                />
              </div>
              
              <div className="pt-4">
                <div className="flex items-center mb-4">
                  <input
                    id="save-info"
                    name="saveInfo"
                    type="checkbox"
                    className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
                  />
                  <label htmlFor="save-info" className="ml-2 block text-sm text-gray-700">
                    Save this information for next time
                  </label>
                </div>
              </div>
            </form>
          </div>
          
          {/* Order Summary */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-2xl font-bold text-gray-800">Order Summary</h2>
            </div>
            
            <div className="p-6">
              <div className="space-y-4 mb-6">
                {cart.map(item => (
                  <div key={item._id} className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden mr-4">
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
                      <div>
                        <h4 className="font-medium text-gray-800">{item.name}</h4>
                        <p className="text-sm text-gray-500">${item.price.toFixed(2)} × {item.quantity}</p>
                      </div>
                    </div>
                    <span className="font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">${subtotal.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">VAT (20%)</span>
                  <span className="font-medium">${tax.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between pt-3 border-t border-gray-200">
                  <span className="text-lg font-bold text-gray-800">Total</span>
                  <span className="text-xl font-bold text-amber-600">
                    ${total.toFixed(2)}
                  </span>
                </div>
              </div>
              
              <div className="bg-amber-50 rounded-lg p-4 mb-6">
                <h4 className="font-medium text-amber-800 mb-2 flex items-center">
                  <FiCheckCircle className="mr-2" />
                  Delivery Estimate
                </h4>
                <p className="text-sm text-gray-600">
                  Your order will be delivered within 30-45 minutes. Please ensure your address is correct.
                </p>
              </div>
              
              <div className="flex flex-col gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onBack}
                  className="px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition"
                >
                  Back to Cart
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onSubmit}
                  disabled={loading}
                  className="px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-medium transition flex items-center justify-center"
                >
                  {loading ? (
                    <>
                      <FiLoader className="animate-spin mr-2" />
                      Processing Order...
                    </>
                  ) : (
                    'Place Order'
                  )}
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;