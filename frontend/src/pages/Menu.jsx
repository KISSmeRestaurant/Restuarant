import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import MenuPage from '../components/menu/MenuPage';
import CartPage from '../components/menu/CartPage';
import CheckoutPage from '../components/menu/CheckoutPage';
import ConfirmationPage from '../components/menu/ConfirmationPage';

const Menu = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [foodItems, setFoodItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [cart, setCart] = useState([]);
  const [checkoutStep, setCheckoutStep] = useState('menu');
  const [orderDetails, setOrderDetails] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [deliveryInfo, setDeliveryInfo] = useState({
    name: '',
    phone: '',
    address: '',
    city: '',
    notes: '',
    deliveryOption: 'delivery' // Added delivery option
  });

  const isLoggedIn = !!localStorage.getItem('token');

  // Fetch menu data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [categoriesRes, foodRes] = await Promise.all([
          axios.get('http://localhost:5000/api/categories'),
          axios.get('http://localhost:5000/api/foods')
        ]);
        setCategories(categoriesRes.data);
        setFoodItems(foodRes.data.map(item => ({
          ...item,
          foodType: item.foodType || 'non-veg' // Default to non-veg if not specified
        })));
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load menu. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);

  // Save cart to localStorage
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  // Handle auth changes
  useEffect(() => {
    const handleAuthChange = () => {
      const token = localStorage.getItem('token');
      if (!token && showLoginModal) {
        setShowLoginModal(false);
        navigate('/login');
      }
    };

    window.addEventListener('auth-change', handleAuthChange);
    window.addEventListener('storage', handleAuthChange);

    return () => {
      window.removeEventListener('auth-change', handleAuthChange);
      window.removeEventListener('storage', handleAuthChange);
    };
  }, [navigate, showLoginModal]);

  const filteredItems = activeCategory === 'all' 
    ? foodItems 
    : foodItems.filter(item => {
        const categoryObj = categories.find(cat => cat._id === item.category || cat.name === item.category);
        return categoryObj ? true : false;
      });

  // Cart functions
  const handleAddToCart = (item) => {
    if (!isLoggedIn) {
      setShowLoginModal(true);
      return;
    }
    setCart(prev => {
      const existingItem = prev.find(cartItem => cartItem._id === item._id);
      if (existingItem) {
        return prev.map(cartItem => 
          cartItem._id === item._id 
            ? { ...cartItem, quantity: cartItem.quantity + 1 } 
            : cartItem
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const updateCartItem = (id, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(id);
      return;
    }
    setCart(cart.map(item => 
      item._id === id ? { ...item, quantity: newQuantity } : item
    ));
  };

  const removeFromCart = (id) => {
    setCart(cart.filter(item => item._id !== id));
  };

  // Checkout functions
  const handleDeliveryInfoChange = (e) => {
    const { name, value } = e.target;
    setDeliveryInfo(prev => ({ ...prev, [name]: value }));
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('User not authenticated');
      }

      const orderData = {
        items: cart.map(item => ({
          food: item._id,
          quantity: item.quantity,
          price: item.price
        })),
        deliveryInfo,
        paymentMethod: 'cash' // Default to cash on delivery
      };

      const response = await axios.post('http://localhost:5000/api/orders', orderData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      setOrderDetails({
        ...response.data,
        orderId: response.data._id,
        customerInfo: response.data.deliveryInfo,
        estimatedDelivery: new Date(Date.now() + 45*60000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
      });
      
      setCheckoutStep('confirmation');
      setCart([]);
      localStorage.removeItem('cart');
    } catch (error) {
      console.error('Order placement error:', error);
      setError(error.response?.data?.message || error.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  // Calculate totals
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const deliveryFee = deliveryInfo.deliveryOption === 'delivery' ? 5 : 0;
  const tax = subtotal * 0.1;
  const total = subtotal + tax + deliveryFee;

  // Render components based on checkout step
  const renderStep = () => {
    switch (checkoutStep) {
      case 'cart':
        return (
          <CartPage 
            cart={cart}
            subtotal={subtotal}
            tax={tax}
            deliveryFee={deliveryFee}
            total={total}
            updateCartItem={updateCartItem}
            removeFromCart={removeFromCart}
            onBack={() => setCheckoutStep('menu')}
            onCheckout={() => setCheckoutStep('checkout')}
          />
        );
      case 'checkout':
        return (
          <CheckoutPage 
            deliveryInfo={deliveryInfo}
            cart={cart}
            subtotal={subtotal}
            tax={tax}
            deliveryFee={deliveryFee}
            total={total}
            onChange={handleDeliveryInfoChange}
            onSubmit={handlePlaceOrder}
            onBack={() => setCheckoutStep('cart')}
            loading={loading}
            error={error}
          />
        );
      case 'confirmation':
        return (
          <ConfirmationPage 
            orderDetails={orderDetails}
            onBackToMenu={() => setCheckoutStep('menu')}
          />
        );
      default:
        return (
          <MenuPage 
            activeCategory={activeCategory}
            categories={categories}
            filteredItems={filteredItems}
            foodItems={foodItems}
            cartItemCount={cart.reduce((count, item) => count + item.quantity, 0)}
            onCategoryChange={setActiveCategory}
            onAddToCart={handleAddToCart}
            onViewCart={() => setCheckoutStep('cart')}
            showLoginModal={showLoginModal}
            setShowLoginModal={setShowLoginModal}
            navigate={navigate}
            loading={loading}
            error={error}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {renderStep()}
    </div>
  );
};

export default Menu;