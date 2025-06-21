import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const Footer = () => {
  // Animation variants
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

  return (
    <footer className="bg-gradient-to-r from-amber-900 to-amber-700 text-white py-12">
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8 }}
        className="container mx-auto px-4"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <motion.div
            variants={itemVariants}
          >
            <h3 className="text-xl font-bold mb-4">KissMe Restaurant</h3>
            <p className="mb-2">123 Romance Avenue</p>
            <p className="mb-2">Downtown, Cityville</p>
            <p>Phone: (555) 123-4567</p>
          </motion.div>
          <motion.div
            variants={itemVariants}
            transition={{ delay: 0.2 }}
          >
            <h3 className="text-xl font-bold mb-4">Hours</h3>
            <p className="mb-2">Monday-Thursday: 5pm-10pm</p>
            <p className="mb-2">Friday-Saturday: 5pm-11pm</p>
            <p>Sunday: 4pm-9pm</p>
          </motion.div>
          <motion.div
            variants={itemVariants}
            transition={{ delay: 0.4 }}
          >
            <h3 className="text-xl font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <motion.li whileHover={{ x: 5 }}>
                <Link to="/" className="hover:text-amber-300 transition-all">Home</Link>
              </motion.li>
              <motion.li whileHover={{ x: 5 }}>
                <Link to="/about" className="hover:text-amber-300 transition-all">About</Link>
              </motion.li>
              <motion.li whileHover={{ x: 5 }}>
                <Link to="/menu" className="hover:text-amber-300 transition-all">Menu</Link>
              </motion.li>
              <motion.li whileHover={{ x: 5 }}>
                <Link to="/contact" className="hover:text-amber-300 transition-all">Contact</Link>
              </motion.li>
            </ul>
          </motion.div>
        </div>
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="border-t border-amber-800 pt-8 text-center"
        >
          <p>&copy; {new Date().getFullYear()} KissMe Restaurant. All rights reserved.</p>
          <motion.p 
            whileHover={{ scale: 1.05 }}
            className="mt-2 italic text-amber-300 inline-block"
          >
            "Food is love made visible." - Our Motto
          </motion.p>
        </motion.div>
      </motion.div>
    </footer>
  );
};

export default Footer;