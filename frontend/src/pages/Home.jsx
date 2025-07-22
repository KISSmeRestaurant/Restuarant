import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { FiClock, FiMapPin, FiPhone, FiMail } from 'react-icons/fi';
import axios from 'axios';
import Footer from '../components/common/Footer';
import { useNavigate } from 'react-router-dom';
import { getPublicFeedback } from '../services/feedback';

const Home = () => {
  const navigate = useNavigate();
  const [recentFoods, setRecentFoods] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [bookingData, setBookingData] = useState({
    date: '',
    time: '',
    guests: 2,
    name: '',
    email: '',
    phone: ''
  });

  useEffect(() => {
    const fetchRecentFoods = async (retryCount = 0) => {
      try {
        // Use relative URL for development proxy, full URL for production
        const apiUrl = import.meta.env.DEV 
          ? '/api/foods/recent' 
          : 'https://restuarant-sh57.onrender.com/api/foods/recent';
        
        const response = await axios.get(apiUrl, {
          timeout: 10000, // 10 second timeout
        });
        setRecentFoods(response.data);
      } catch (error) {
        console.error('Error fetching recent foods:', error);
        
        // Handle rate limiting with exponential backoff
        if (error.response?.status === 429 && retryCount < 3) {
          const retryAfter = error.response.headers['retry-after'] || Math.pow(2, retryCount);
          console.log(`Rate limited. Retrying after ${retryAfter} seconds...`);
          
          setTimeout(() => {
            fetchRecentFoods(retryCount + 1);
          }, retryAfter * 1000);
        } else if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
          console.log('Local server not available, using fallback data or empty state');
          // You could set some fallback data here if needed
          setRecentFoods([]);
        } else {
          // For other errors, just log and continue with empty state
          setRecentFoods([]);
        }
      }
    };

    fetchRecentFoods();

    // Fetch public feedback
    const fetchFeedback = async () => {
      try {
        const response = await getPublicFeedback(6);
        setFeedback(response.data || []);
      } catch (error) {
        console.error('Error fetching feedback:', error);
        // Keep static testimonials as fallback
        setFeedback([]);
      }
    };

    fetchFeedback();
  }, []);

  const galleryImages = [
    '/src/assets/gallery/food1.jpg',
    '/src/assets/gallery/food2.jpg',
    '/src/assets/gallery/food3.jpg',
    '/src/assets/gallery/food4.jpg',
    '/src/assets/gallery/food5.jpg',
    '/src/assets/gallery/food6.jpg',
    '/src/assets/gallery/food7.jpg',
    '/src/assets/gallery/food8.jpg',
  ];

  const handleBookingChange = (e) => {
    const { name, value } = e.target;
    setBookingData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmitBooking = (e) => {
    e.preventDefault();
    alert(`Booking submitted for ${bookingData.date} at ${bookingData.time}`);
  };

  return (
    <div className="-white">
      {/* Hero Section with Parallax Effect */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="relative h-screen flex items-center justify-center overflow-hidden"
      >
        {/* Background elements */}
        <motion.div
          className="absolute inset-0 bg-[url('/src/assets/restaurant-hero.jpg')] bg-cover bg-center"
          initial={{ scale: 1.2 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        ></motion.div>
        <div className="absolute inset-0 bg-black/40"></div>

        <div className="container mx-auto px-4 relative z-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 font-serif">
              Savour the Moment
            </h1>
            <p className="text-xl md:text-2xl text-white mb-8 max-w-2xl mx-auto">
              Where every bite tells a story and every moment becomes a memory
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/menu')}
              className="bg-amber-600 hover:bg-amber-700 text-white font-semibold px-8 py-3 rounded-lg text-lg transition"
            >
              Order Foods
            </motion.button>
          </motion.div>
        </div>

        <motion.div
          className="absolute bottom-10 left-1/2 transform -translate-x-1/2 z-20"
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </motion.div>
      </motion.section>

      {/* About Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <motion.div
              className="md:w-1/2"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-4xl font-bold text-gray-800 mb-6 font-serif">Our Story</h2>
              <p className="text-lg text-gray-600 mb-6">
                Founded in 2010, our restaurant has been serving authentic dishes crafted with passion and the finest local ingredients.
                What started as a small family bistro has grown into an award-winning dining destination.
              </p>
              <p className="text-lg text-gray-600 mb-8">
                Our chef brings 20 years of international experience to create a menu that blends traditional flavors with modern techniques.
              </p>
            </motion.div>

            <motion.div
              className="md:w-1/2 relative"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <div className="grid grid-cols-2 gap-4">
                <motion.div
                  className="h-64 bg-[url('/src/assets/About/chef1.jpg')] bg-cover bg-center rounded-lg shadow-lg"
                  whileHover={{ scale: 1.03 }}
                ></motion.div>
                <motion.div
                  className="h-64 bg-[url('/src/assets/About/ingredients.jpg')] bg-cover bg-center rounded-lg shadow-lg mt-8"
                  whileHover={{ scale: 1.03 }}
                ></motion.div>
                <motion.div
                  className="h-64 bg-[url('/src/assets/About/restaurant-interior.jpg')] bg-cover bg-center rounded-lg shadow-lg"
                  whileHover={{ scale: 1.03 }}
                ></motion.div>
                <motion.div
                  className="h-64 bg-[url('/src/assets/About/dish-presentation.jpg')] bg-cover bg-center rounded-lg shadow-lg mt-8"
                  whileHover={{ scale: 1.03 }}
                ></motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Recently Added Menu Items Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-800 mb-4 font-serif">Our Specialties</h2>
            <div className="w-20 h-1 bg-amber-600 mx-auto mb-6"></div>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Discover our signature dishes crafted with passion
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {recentFoods.map((item, index) => (
              <motion.div
                key={item._id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -10 }}
                className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition cursor-pointer overflow-hidden relative"
              >
                <div className="h-48 bg-gray-200 rounded-lg mb-4 overflow-hidden">
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-r from-amber-100 to-amber-50 flex items-center justify-center">
                      <span className="text-gray-400">No image</span>
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-semibold text-gray-800">{item.name}</h3>
                  <span className="text-amber-600 font-bold">${item.price.toFixed(2)}</span>
                </div>

                <p className="text-gray-600 mb-4">{item.description}</p>

                <div className="flex justify-between items-center">
                  <span className={`px-2 py-1 text-xs rounded-full ${item.foodType === 'veg' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                    {item.foodType === 'veg' ? 'Vegetarian' : 'Non-Vegetarian'}
                  </span>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-amber-100 text-amber-700 px-4 py-2 rounded-lg hover:bg-amber-200 transition font-medium"
                    onClick={() => navigate('/menu')}
                  >
                    View Details
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-800 mb-4 font-serif">Gallery</h2>
            <div className="w-20 h-1 bg-amber-600 mx-auto mb-6"></div>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              A visual journey through our culinary creations
            </p>
          </motion.div>

          <div className="columns-1 md:columns-2 lg:columns-3 gap-4 space-y-4">
            {galleryImages.map((img, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="break-inside-avoid relative group overflow-hidden rounded-xl shadow-lg"
              >
                <motion.img
                  src={img}
                  alt="Restaurant gallery"
                  className="w-full h-auto object-cover transition duration-500 group-hover:scale-105"
                  whileHover={{ scale: 1.05 }}
                />
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    className="bg-white/90 text-amber-600 p-3 rounded-full"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-800 mb-4 font-serif">What Our Guests Say</h2>
            <div className="w-20 h-1 bg-amber-600 mx-auto mb-6"></div>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Don't just take our word for it - hear from our valued guests
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/feedback')}
              className="mt-6 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-6 py-3 rounded-full hover:from-amber-600 hover:to-orange-600 transition font-semibold shadow-lg"
            >
              Write Your Review
            </motion.button>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {(feedback.length > 0 ? feedback : [
              {
                customerName: 'Emily & James',
                message: 'The perfect anniversary dinner! Every dish was a masterpiece and the service was impeccable.',
                rating: 5,
                createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()
              },
              {
                customerName: 'Michael R.',
                message: 'Best steak I\'ve ever had. The ambiance and wine pairing made it an unforgettable experience.',
                rating: 5,
                createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
              },
              {
                customerName: 'Sarah K.',
                message: 'We come here every Friday. The pasta is divine and the cocktails are creative perfection!',
                rating: 5,
                createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
              }
            ]).slice(0, 6).map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                whileHover={{ y: -10 }}
                className="bg-white p-8 rounded-xl shadow-md hover:shadow-xl transition relative"
              >
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className={`w-5 h-5 ${i < testimonial.rating ? 'text-amber-400' : 'text-gray-300'}`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-gray-600 italic mb-6">"{testimonial.message || testimonial.comment}"</p>
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 mr-4 overflow-hidden flex items-center justify-center">
                    <span className="text-white font-bold text-lg">
                      {(testimonial.customerName || testimonial.name)?.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-800">{testimonial.customerName || testimonial.name}</h4>
                    <p className="text-sm text-gray-500">
                      {testimonial.createdAt 
                        ? new Date(testimonial.createdAt).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric',
                            year: 'numeric'
                          })
                        : testimonial.date
                      }
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default Home;