import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaClock, FaUsers, FaCalendarAlt, FaCheck, FaTimes } from 'react-icons/fa';

const BookTable = () => {
  const navigate = useNavigate();
  const [bookingData, setBookingData] = useState({
    date: '',
    time: '',
    guests: 2,
    name: '',
    email: '',
    phone: '',
    specialRequests: ''
  });

  const [availableSlots, setAvailableSlots] = useState([]);
  const [bookedSlots, setBookedSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');

  // Time slots configuration
  const timeSlots = [
    { time: '11:00', label: '11:00 AM', period: 'lunch' },
    { time: '11:30', label: '11:30 AM', period: 'lunch' },
    { time: '12:00', label: '12:00 PM', period: 'lunch' },
    { time: '12:30', label: '12:30 PM', period: 'lunch' },
    { time: '13:00', label: '1:00 PM', period: 'lunch' },
    { time: '13:30', label: '1:30 PM', period: 'lunch' },
    { time: '14:00', label: '2:00 PM', period: 'lunch' },
    { time: '14:30', label: '2:30 PM', period: 'lunch' },
    { time: '18:00', label: '6:00 PM', period: 'dinner' },
    { time: '18:30', label: '6:30 PM', period: 'dinner' },
    { time: '19:00', label: '7:00 PM', period: 'dinner' },
    { time: '19:30', label: '7:30 PM', period: 'dinner' },
    { time: '20:00', label: '8:00 PM', period: 'dinner' },
    { time: '20:30', label: '8:30 PM', period: 'dinner' },
    { time: '21:00', label: '9:00 PM', period: 'dinner' },
    { time: '21:30', label: '9:30 PM', period: 'dinner' }
  ];

  // Get minimum date (today)
  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  // Get maximum date (30 days from now)
  const getMaxDate = () => {
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 30);
    return maxDate.toISOString().split('T')[0];
  };

  // Fetch booked slots for selected date
  const fetchBookedSlots = async (date) => {
    if (!date) return;
    
    try {
      setLoading(true);
      const response = await fetch(`/api/reservations/booked-slots?date=${date}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setBookedSlots(data.bookedSlots || []);
      } else {
        setBookedSlots([]);
      }
    } catch (error) {
      console.error('Error fetching booked slots:', error);
      setBookedSlots([]);
    } finally {
      setLoading(false);
    }
  };

  // Check if a slot is available
  const isSlotAvailable = (time) => {
    return !bookedSlots.some(slot => slot.time === time);
  };

  // Handle date change
  const handleDateChange = (e) => {
    const date = e.target.value;
    setSelectedDate(date);
    setBookingData(prev => ({ ...prev, date, time: '' }));
    fetchBookedSlots(date);
  };

  // Handle time slot selection
  const handleTimeSlotSelect = (time) => {
    if (isSlotAvailable(time)) {
      setBookingData(prev => ({ ...prev, time }));
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBookingData(prev => ({ ...prev, [name]: value }));
  };

  // Handle form submission
  const handleSubmitBooking = async (e) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user'));
      
      if (!token || !user) {
        navigate('/login', { state: { from: '/book-table' } });
        return;
      }

      setLoading(true);

      const response = await fetch('/api/reservations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...bookingData,
          user: user._id
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
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50">
      <div className="container mx-auto px-4 py-24">
        <Link to="/" className="absolute top-4 left-4 text-amber-700 hover:text-amber-900 flex items-center">
          ← Back to Home
        </Link>
        
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-6xl mx-auto"
        >
          {/* Header */}
          <div className="text-center mb-12">
            <motion.h1 
              initial={{ y: -20 }}
              animate={{ y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-5xl font-bold text-gray-800 mb-4 font-serif"
            >
              Reserve Your Table
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="text-xl text-gray-600 max-w-2xl mx-auto"
            >
              Book your perfect dining experience with us. Select your preferred date and time slot.
            </motion.p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Date and Time Selection */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="bg-white rounded-2xl shadow-xl p-8"
            >
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <FaCalendarAlt className="mr-3 text-amber-600" />
                Select Date & Time
              </h2>

              {/* Date Selection */}
              <div className="mb-8">
                <label className="block text-gray-700 font-semibold mb-3">Choose Date</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={handleDateChange}
                  min={getMinDate()}
                  max={getMaxDate()}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all"
                  required
                />
              </div>

              {/* Time Slots */}
              {selectedDate && (
                <div>
                  <label className="block text-gray-700 font-semibold mb-4">Available Time Slots</label>
                  {loading ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {/* Lunch Slots */}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center">
                          <FaClock className="mr-2 text-orange-500" />
                          Lunch (11:00 AM - 3:00 PM)
                        </h3>
                        <div className="grid grid-cols-2 gap-3">
                          {timeSlots.filter(slot => slot.period === 'lunch').map((slot) => {
                            const available = isSlotAvailable(slot.time);
                            const selected = bookingData.time === slot.time;
                            
                            return (
                              <motion.button
                                key={slot.time}
                                whileHover={available ? { scale: 1.05 } : {}}
                                whileTap={available ? { scale: 0.95 } : {}}
                                onClick={() => handleTimeSlotSelect(slot.time)}
                                disabled={!available}
                                className={`
                                  p-3 rounded-xl border-2 transition-all font-medium flex items-center justify-center
                                  ${selected 
                                    ? 'bg-amber-500 text-white border-amber-500 shadow-lg' 
                                    : available 
                                      ? 'bg-white text-gray-700 border-gray-200 hover:border-amber-300 hover:bg-amber-50' 
                                      : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                                  }
                                `}
                              >
                                {available ? (
                                  <FaCheck className="mr-2 text-green-500" />
                                ) : (
                                  <FaTimes className="mr-2 text-red-500" />
                                )}
                                {slot.label}
                              </motion.button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Dinner Slots */}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center">
                          <FaClock className="mr-2 text-purple-500" />
                          Dinner (6:00 PM - 10:00 PM)
                        </h3>
                        <div className="grid grid-cols-2 gap-3">
                          {timeSlots.filter(slot => slot.period === 'dinner').map((slot) => {
                            const available = isSlotAvailable(slot.time);
                            const selected = bookingData.time === slot.time;
                            
                            return (
                              <motion.button
                                key={slot.time}
                                whileHover={available ? { scale: 1.05 } : {}}
                                whileTap={available ? { scale: 0.95 } : {}}
                                onClick={() => handleTimeSlotSelect(slot.time)}
                                disabled={!available}
                                className={`
                                  p-3 rounded-xl border-2 transition-all font-medium flex items-center justify-center
                                  ${selected 
                                    ? 'bg-amber-500 text-white border-amber-500 shadow-lg' 
                                    : available 
                                      ? 'bg-white text-gray-700 border-gray-200 hover:border-amber-300 hover:bg-amber-50' 
                                      : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                                  }
                                `}
                              >
                                {available ? (
                                  <FaCheck className="mr-2 text-green-500" />
                                ) : (
                                  <FaTimes className="mr-2 text-red-500" />
                                )}
                                {slot.label}
                              </motion.button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </motion.div>

            {/* Booking Form */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="bg-white rounded-2xl shadow-xl p-8"
            >
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <FaUsers className="mr-3 text-amber-600" />
                Booking Details
              </h2>

              <form onSubmit={handleSubmitBooking} className="space-y-6">
                {/* Number of Guests */}
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Number of Guests</label>
                  <select
                    name="guests"
                    value={bookingData.guests}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all"
                    required
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                      <option key={num} value={num}>
                        {num} {num === 1 ? 'Guest' : 'Guests'}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Personal Information */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">Full Name</label>
                    <input
                      type="text"
                      name="name"
                      value={bookingData.name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">Phone Number</label>
                    <input
                      type="tel"
                      name="phone"
                      value={bookingData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={bookingData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all"
                    required
                  />
                </div>

                {/* Special Requests */}
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Special Requests (Optional)</label>
                  <textarea
                    name="specialRequests"
                    value={bookingData.specialRequests}
                    onChange={handleInputChange}
                    rows="3"
                    placeholder="Any dietary restrictions, special occasions, or other requests..."
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all resize-none"
                  />
                </div>

                {/* Booking Summary */}
                {bookingData.date && bookingData.time && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-amber-50 border-2 border-amber-200 rounded-xl p-4"
                  >
                    <h3 className="font-semibold text-amber-800 mb-2">Booking Summary</h3>
                    <div className="text-amber-700 space-y-1">
                      <p><strong>Date:</strong> {new Date(bookingData.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                      <p><strong>Time:</strong> {timeSlots.find(slot => slot.time === bookingData.time)?.label}</p>
                      <p><strong>Guests:</strong> {bookingData.guests} {bookingData.guests === 1 ? 'person' : 'people'}</p>
                    </div>
                  </motion.div>
                )}

                {/* Submit Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={!bookingData.date || !bookingData.time || loading}
                  className={`
                    w-full py-4 rounded-xl font-bold text-lg transition-all shadow-lg
                    ${bookingData.date && bookingData.time && !loading
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600 hover:shadow-xl'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }
                  `}
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-2"></div>
                      Processing...
                    </div>
                  ) : (
                    'Confirm Reservation'
                  )}
                </motion.button>
              </form>
            </motion.div>
          </div>
        </motion.section>
      </div>
    </div>
  );
};

export default BookTable;
