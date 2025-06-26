import { motion } from 'framer-motion';
import { useState } from 'react';
import { Link } from 'react-router-dom';

const BookTable = () => {
  const [bookingData, setBookingData] = useState({
    date: '',
    time: '',
    guests: 2,
    name: '',
    email: '',
    phone: ''
  });

  const handleBookingChange = (e) => {
    const { name, value } = e.target;
    setBookingData(prev => ({ ...prev, [name]: value }));
  };

 // In BookTable.js, modify the handleSubmitBooking function:
const handleSubmitBooking = async (e) => {
  e.preventDefault();
  
  try {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));
    
    if (!token || !user) {
      navigate('/login', { state: { from: '/book-table' } });
      return;
    }

    const response = await fetch('https://restuarant-sh57.onrender.com/api/reservations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        ...bookingData,
        user: user._id  // Include user ID from localStorage
      })
    });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to book table');
    }

    // Show success message and redirect
    alert('Table booked successfully!');
    navigate('/dashboard');
  } catch (error) {
    alert(error.message);
  }
};

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 to-teal-100">
      <div className="container mx-auto px-4 py-24">
        <Link to="/" className="absolute top-4 left-4 text-teal-700 hover:text-teal-900">
          ← Back to Home
        </Link>
        
        <motion.section 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto bg-teal-50 rounded-xl p-8 md:p-12 border border-teal-100 relative overflow-hidden shadow-lg"
        >
          <div className="absolute -right-20 -top-20 w-64 h-64 rounded-full bg-amber-200 opacity-20"></div>
          <div className="absolute -left-20 -bottom-20 w-64 h-64 rounded-full bg-teal-200 opacity-20"></div>
          
          <div className="relative z-10 text-center mb-12">
            <motion.h2 
              initial={{ y: -20 }}
              animate={{ y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-4xl font-bold text-teal-800 mb-4"
            >
              Book a Table
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="text-lg text-teal-700"
            >
              Reserve your table for an unforgettable dining experience
            </motion.p>
          </div>
          
          <form onSubmit={handleSubmitBooking} className="max-w-lg mx-auto">
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-teal-700 mb-2">Date</label>
                <input
                  type="date"
                  name="date"
                  value={bookingData.date}
                  onChange={handleBookingChange}
                  className="w-full px-4 py-3 rounded-lg border border-teal-200 focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  required
                />
              </div>
              <div>
                <label className="block text-teal-700 mb-2">Time</label>
                <input
                  type="time"
                  name="time"
                  value={bookingData.time}
                  onChange={handleBookingChange}
                  className="w-full px-4 py-3 rounded-lg border border-teal-200 focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  required
                />
              </div>
              <div>
                <label className="block text-teal-700 mb-2">Number of Guests</label>
                <select
                  name="guests"
                  value={bookingData.guests}
                  onChange={handleBookingChange}
                  className="w-full px-4 py-3 rounded-lg border border-teal-200 focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                    <option key={num} value={num}>{num} {num === 1 ? 'person' : 'people'}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-teal-700 mb-2">Your Name</label>
                <input
                  type="text"
                  name="name"
                  value={bookingData.name}
                  onChange={handleBookingChange}
                  className="w-full px-4 py-3 rounded-lg border border-teal-200 focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-teal-700 mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  value={bookingData.email}
                  onChange={handleBookingChange}
                  className="w-full px-4 py-3 rounded-lg border border-teal-200 focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-teal-700 mb-2">Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  value={bookingData.phone}
                  onChange={handleBookingChange}
                  className="w-full px-4 py-3 rounded-lg border border-teal-200 focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  required
                />
              </div>
            </div>
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="w-full bg-amber-600 text-white px-6 py-4 rounded-full hover:bg-amber-700 transition shadow-lg text-lg font-medium"
            >
              Confirm Booking
            </motion.button>
          </form>
        </motion.section>
      </div>
    </div>
  );
};

export default BookTable;