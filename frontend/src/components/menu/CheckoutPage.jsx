import { motion } from 'framer-motion';

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
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md overflow-hidden p-6">
        {loading && (
          <div className="mb-4 p-3 bg-blue-100 text-blue-700 rounded-lg">
            Processing your order...
          </div>
        )}
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-800">Checkout</h2>
          <button 
            onClick={onBack}
            className="text-amber-600 hover:text-amber-700 font-medium"
          >
            Back to Cart
          </button>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Delivery Information</h3>
            
            <form onSubmit={onSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name*</label>
                  <input
                    type="text"
                    name="name"
                    value={deliveryInfo.name}
                    onChange={onChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-amber-500 focus:border-amber-500"
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-amber-500 focus:border-amber-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address*</label>
                  <textarea
                    name="address"
                    value={deliveryInfo.address}
                    onChange={onChange}
                    required
                    rows="3"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-amber-500 focus:border-amber-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City*</label>
                  <input
                    type="text"
                    name="city"
                    value={deliveryInfo.city}
                    onChange={onChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-amber-500 focus:border-amber-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Notes (Optional)</label>
                  <textarea
                    name="notes"
                    value={deliveryInfo.notes}
                    onChange={onChange}
                    rows="2"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-amber-500 focus:border-amber-500"
                  />
                </div>
              </div>
              
              <div className="mt-6 flex justify-between">
                <motion.button
                  type="button"
                  onClick={onBack}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-6 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition"
                >
                  Back to Cart
                </motion.button>
                
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-6 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-medium transition"
                  disabled={loading}
                >
                  {loading ? 'Processing...' : 'Place Order'}
                </motion.button>
              </div>
            </form>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Order Summary</h3>
            
            <div className="border border-gray-200 rounded-lg p-4">
              {cart.map(item => (
                <div key={item._id} className="flex justify-between py-2 border-b border-gray-100">
                  <span>
                    {item.name} × {item.quantity}
                  </span>
                  <span>${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
              
              <div className="mt-4 space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span>Tax (10%):</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between font-bold text-lg mt-2 pt-2 border-t border-gray-200">
                  <span>Total:</span>
                  <span className="text-amber-600">
                    ${total.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-amber-50 rounded-lg">
              <h4 className="font-medium text-amber-800 mb-2">Delivery Information</h4>
              <p className="text-sm text-gray-600">
                Your order will be delivered within 30-45 minutes. Please ensure your address is correct.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;