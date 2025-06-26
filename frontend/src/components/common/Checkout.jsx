// components/Checkout.jsx
import { useState } from 'react';
import axios from 'axios';
import { motion } from "framer-motion"; // Add this line

const Checkout = ({ cart, onBack, onOrderSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    city: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const handleChange = (e) => {
  const { name, value } = e.target;
  setDeliveryInfo(prev => ({ ...prev, [name]: value }));
};

  const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError('');
  
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Authentication required');
    }

    const orderData = {
      items: cart.map(item => ({
        food: item._id,
        quantity: item.quantity,
        price: item.price
      })),
      deliveryInfo: formData
    };

    const response = await axios.post('https://restuarant-sh57.onrender.com/api/orders', orderData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    // Clear cart after successful order
    localStorage.removeItem('cart');
    onOrderSuccess(response.data);
  } catch (err) {
    console.error('Order submission error:', err);
    setError(err.response?.data?.message || err.message || 'Failed to place order');
  } finally {
    setLoading(false);
  }
};
  return (
    <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md overflow-hidden p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Checkout</h2>
      
      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Delivery Information</h3>
          
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-amber-500 focus:border-amber-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-amber-500 focus:border-amber-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  required
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-amber-500 focus:border-amber-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-amber-500 focus:border-amber-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Notes (Optional)</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
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
              >
                Place Order
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
                <span>${totalAmount.toFixed(2)}</span>
              </div>
              
              <div className="flex justify-between">
                <span>Tax (10%):</span>
                <span>${(totalAmount * 0.1).toFixed(2)}</span>
              </div>
              
              <div className="flex justify-between font-bold text-lg mt-2 pt-2 border-t border-gray-200">
                <span>Total:</span>
                <span className="text-amber-600">
                  ${(totalAmount * 1.1).toFixed(2)}
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
  );
};

export default Checkout;