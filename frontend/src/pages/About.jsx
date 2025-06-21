import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Footer from '../components/common/Footer';

const About = () => {
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 10
      }
    }
  };

  const fadeInVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-amber-50 py-20 overflow-hidden">
        {/* Animated background elements */}
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.1 }}
          transition={{ duration: 1.5, delay: 0.5 }}
          className="absolute -right-20 -top-20 w-64 h-64 rounded-full bg-amber-400"
        />
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.1 }}
          transition={{ duration: 1.5, delay: 0.7 }}
          className="absolute -left-20 -bottom-20 w-64 h-64 rounded-full bg-rose-400"
        />

        <div className="container mx-auto px-4 text-center relative">
          <motion.h1 
            initial={{ opacity: 0, y: -40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              type: "spring",
              stiffness: 100,
              damping: 10,
              duration: 0.8 
            }}
            className="text-4xl md:text-5xl font-bold text-rose-800 mb-4"
          >
            WELCOME TO KISSME RESTAURANT
          </motion.h1>
          
          <motion.div 
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="w-24 h-1 bg-amber-600 mx-auto mb-8 origin-left"
          ></motion.div>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="text-lg md:text-xl text-rose-700 max-w-3xl mx-auto"
          >
            A modern Italian restaurant with a focus on premium food tastes
          </motion.p>
          
          {/* Floating decorative elements */}
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1, duration: 0.8 }}
            className="absolute left-1/4 top-1/4 w-8 h-8 rounded-full bg-amber-400/20"
          />
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.8 }}
            className="absolute right-1/4 bottom-1/4 w-6 h-6 rounded-full bg-rose-400/20"
          />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid md:grid-cols-3 gap-8"
          >
            {/* Fresh Food */}
            <motion.div 
              variants={itemVariants}
              className="text-center p-6 hover:bg-amber-50 transition-all duration-300 rounded-lg group"
            >
              <motion.div 
                whileHover={{ scale: 1.1 }}
                className="bg-rose-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-amber-200 transition-all"
              >
                <svg className="w-10 h-10 text-rose-800 group-hover:text-amber-800 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </motion.div>
              <h3 className="text-xl font-bold text-rose-800 mb-2 group-hover:text-amber-700 transition-all">FRESH FOOD</h3>
              <p className="text-gray-600 group-hover:text-gray-800 transition-all">
                We use only the freshest ingredients sourced from local farms and Italian suppliers.
              </p>
            </motion.div>

            {/* Chef's Specials */}
            <motion.div 
              variants={itemVariants}
              className="text-center p-6 hover:bg-amber-50 transition-all duration-300 rounded-lg group"
            >
              <motion.div 
                whileHover={{ scale: 1.1 }}
                className="bg-rose-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-amber-200 transition-all"
              >
                <svg className="w-10 h-10 text-rose-800 group-hover:text-amber-800 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                </svg>
              </motion.div>
              <h3 className="text-xl font-bold text-rose-800 mb-2 group-hover:text-amber-700 transition-all">CHEF'S SPECIALS</h3>
              <p className="text-gray-600 group-hover:text-gray-800 transition-all">
                Our award-winning chef creates unique dishes that blend tradition with innovation.
              </p>
            </motion.div>

            {/* Good Wine */}
            <motion.div 
              variants={itemVariants}
              className="text-center p-6 hover:bg-amber-50 transition-all duration-300 rounded-lg group"
            >
              <motion.div 
                whileHover={{ scale: 1.1 }}
                className="bg-rose-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-amber-200 transition-all"
              >
                <svg className="w-10 h-10 text-rose-800 group-hover:text-amber-800 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </motion.div>
              <h3 className="text-xl font-bold text-rose-800 mb-2 group-hover:text-amber-700 transition-all">GOOD WINE</h3>
              <p className="text-gray-600 group-hover:text-gray-800 transition-all">
                An extensive selection of fine Italian wines to perfectly complement your meal.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* About Us Section */}
      <section className="py-16 bg-amber-50">
        <div className="container mx-auto px-4">
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 0.9 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0 }}
            className="flex flex-col md:flex-row items-center gap-8"
          >
            <motion.div 
              initial={{ x: -100, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ 
                type: "spring",
                stiffness: 60,
                damping: 10,
                duration: 0.8 
              }}
              className="md:w-1/2"
            >
              <img 
                src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=80" 
                alt="Restaurant interior"
                className="rounded-lg shadow-lg w-full h-auto hover:shadow-xl transition-all duration-300"
              />
            </motion.div>
            <motion.div 
              initial={{ x: 100, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ 
                type: "spring",
                stiffness: 60,
                damping: 10,
                duration: 0.8 
              }}
              className="md:w-1/2"
            >
              <h2 className="text-3xl font-bold text-rose-800 mb-6">ABOUT US</h2>
              <motion.p 
                variants={fadeInVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                transition={{ delay: 0.2, duration: 0.8 }}
                className="text-gray-700 mb-4"
              >
                Welcome to KissMe Restaurant, where we combine authentic Italian flavors with modern culinary techniques to create unforgettable dining experiences.
              </motion.p>
              <motion.p 
                variants={fadeInVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                transition={{ delay: 0.4, duration: 0.8 }}
                className="text-gray-700 mb-6"
              >
                We invite you to celebrate our restaurant's delicious recipes whether you're here for a romantic dinner, family gathering, or business lunch. Discover new tastes and enjoy our warm, inviting atmosphere.
              </motion.p>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link 
                  to="/menu"
                  className="inline-block bg-rose-700 text-white px-6 py-3 rounded-lg hover:bg-amber-600 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  View Our Menu
                </Link>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Testimonial Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 text-center">
          <motion.h2 
            initial={{ y: -20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="text-3xl font-bold text-rose-800 mb-12"
          >
            What Our Guests Say
          </motion.h2>
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.9, delay: 0.2 }}
            className="max-w-3xl mx-auto bg-amber-50 p-8 rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
          >
            <motion.blockquote 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-xl italic text-gray-700 mb-4"
            >
              "The perfect place for our anniversary dinner. The food was exquisite and the service impeccable!"
            </motion.blockquote>
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="font-bold text-rose-800"
            >
              - John & Emily
            </motion.p>
          </motion.div>
        </div>
      </section>

      <Footer />
      
    </div>
  );
};

export default About;