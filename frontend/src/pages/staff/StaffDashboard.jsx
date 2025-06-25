import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaUtensils, 
  FaTable,
  FaUser,
  FaBell,
  FaSearch,
  FaMoon,
  FaSun,
  FaClock
} from 'react-icons/fa';
import { MdKitchen, MdRateReview } from 'react-icons/md';

// Import components
import Header from './Header';
import StatsOverview from './StatsOverview';
import OrdersTab from './OrdersTab';
import ReservationsTab from './ReservationsTab';
import KitchenTab from './KitchenTab';
import FeedbackTab from './FeedbackTab';

const StaffDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [customerFeedback, setCustomerFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [staffDetails, setStaffDetails] = useState(null);
  const [activeTab, setActiveTab] = useState('orders');
  const [shiftStatus, setShiftStatus] = useState('notStarted');
  const [shiftStartTime, setShiftStartTime] = useState(null);
  const [shiftDuration, setShiftDuration] = useState('00:00:00');
  const [darkMode, setDarkMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState([]);
  const navigate = useNavigate();

  // Calculate shift duration
  useEffect(() => {
    let interval;
    if (shiftStatus === 'active' && shiftStartTime) {
      interval = setInterval(() => {
        const now = new Date();
        const diff = now - new Date(shiftStartTime);
        const hours = Math.floor(diff / (1000 * 60 * 60)).toString().padStart(2, '0');
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)).toString().padStart(2, '0');
        const seconds = Math.floor((diff % (1000 * 60)) / 1000).toString().padStart(2, '0');
        setShiftDuration(`${hours}:${minutes}:${seconds}`);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [shiftStatus, shiftStartTime]);

  // Fetch functions
  const fetchOrders = async (token) => {
    const response = await fetch('http://localhost:5000/api/staff/orders', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    const data = await response.json();
    setOrders(data.data);
    checkForNewOrders(data.data);
  };

  const fetchReservations = async (token) => {
    try {
      const response = await fetch('http://localhost:5000/api/staff/reservations', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      const reservationsData = Array.isArray(data) ? data : (data.data || []);
      setReservations(reservationsData);
      checkForNewReservations(reservationsData);
    } catch (error) {
      console.error('Error fetching reservations:', error);
      setError('Failed to load reservations. Please try again.');
      setReservations([]);
    }
  };

  const fetchCustomerFeedback = async (token) => {
    const response = await fetch('http://localhost:5000/api/staff/feedback', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    const data = await response.json();
    setCustomerFeedback(data.data);
  };

  // Initial data fetching
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        
        if (!token) {
          navigate('/login');
          return;
        }

        // Fetch staff details
        const staffResponse = await fetch('http://localhost:5000/api/staff/me', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
        });

        if (!staffResponse.ok) {
          if (staffResponse.status === 401) {
            localStorage.removeItem('token');
            navigate('/login');
            return;
          }
          throw new Error('Failed to fetch staff details');
        }

        const staffData = await staffResponse.json();
        setStaffDetails(staffData.data);

        await Promise.all([
          fetchOrders(token),
          fetchReservations(token),
          fetchCustomerFeedback(token)
        ]);
      } catch (err) {
        console.error('Error in fetchData:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  // Check for active shift
useEffect(() => {
  const fetchActiveShift = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/staff/shift/active', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.data) {
          setShiftStatus('active');
          setShiftStartTime(new Date(data.data.startTime));
        }
      } else if (response.status === 404) {
        // No active shift found is okay
        setShiftStatus('notStarted');
      }
    } catch (err) {
      console.error('Error checking active shift:', err);
    }
  };

  fetchActiveShift();
}, [navigate]);

  // Check for new orders/reservations
  const checkForNewOrders = (newOrders) => {
    if (orders.length > 0 && newOrders.length > orders.length) {
      const newOrder = newOrders.find(order => 
        !orders.some(o => o._id === order._id)
      );
      if (newOrder) {
        addNotification(`New order #${newOrder._id.slice(-6)} received`);
      }
    }
  };

  const checkForNewReservations = (newReservations) => {
    if (reservations.length > 0 && newReservations.length > reservations.length) {
      const newReservation = newReservations.find(res => 
        !reservations.some(r => r._id === res._id)
      );
      if (newReservation) {
        addNotification(`New reservation from ${newReservation.name}`);
      }
    }
  };

  const addNotification = (message) => {
    const newNotification = {
      id: Date.now(),
      message,
      timestamp: new Date().toLocaleTimeString(),
      read: false
    };
    setNotifications(prev => [newNotification, ...prev]);
  };

  const markNotificationAsRead = (id) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/staff/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) throw new Error('Failed to update order status');

      setOrders(orders.map(order => 
        order._id === orderId ? { ...order, status: newStatus } : order
      ));
      
      const order = orders.find(o => o._id === orderId);
      if (order) {
        addNotification(`Order #${orderId.slice(-6)} status changed to ${newStatus}`);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const updateReservationStatus = async (reservationId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/staff/reservations/${reservationId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) throw new Error('Failed to update reservation status');

      setReservations(reservations.map(res => 
        res._id === reservationId ? { ...res, status: newStatus } : res
      ));
      
      const reservation = reservations.find(r => r._id === reservationId);
      if (reservation) {
        addNotification(`Reservation #${reservationId.slice(-6)} status changed to ${newStatus}`);
      }
    } catch (err) {
      setError(err.message);
    }
  };

const startShift = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch('http://localhost:5000/api/staff/shift/start', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({}) // Empty body is fine
    });

    if (!response.ok) {
      const errorData = await response.json();
      // Handle "already active" error differently
      if (errorData.message === 'You already have an active shift') {
        // Fetch the existing active shift instead
        const activeShiftResponse = await fetch('http://localhost:5000/api/staff/shift/active', {
          headers: {
            'Authorization': `Bearer ${token}`,
          }
        });
        
        if (activeShiftResponse.ok) {
          const activeShiftData = await activeShiftResponse.json();
          setShiftStatus('active');
          setShiftStartTime(new Date(activeShiftData.data.startTime));
          return;
        }
      }
      throw new Error(errorData.message || 'Failed to start shift');
    }
    
    const data = await response.json();
    setShiftStatus('active');
    setShiftStartTime(new Date(data.data.startTime));
    addNotification('Shift started');
  } catch (err) {
    console.error('Shift start error:', err);
    setError(err.message);
  }
};

  const endShift = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/staff/shift/end', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to end shift');
      
      setShiftStatus('ended');
      setShiftDuration('00:00:00');
      addNotification('Shift ended');
    } catch (err) {
      setError(err.message);
    }
  };

  // Filter data based on search query
  const filteredOrders = useMemo(() => {
    if (!searchQuery) return orders;
    return orders.filter(order => 
      order._id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (order.deliveryInfo?.name?.toLowerCase().includes(searchQuery.toLowerCase())) ||
      order.status.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [orders, searchQuery]);

  const filteredReservations = useMemo(() => {
    if (!searchQuery) return reservations;
    return reservations.filter(reservation => 
      reservation._id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      reservation.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      reservation.status.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [reservations, searchQuery]);

  const filteredFeedback = useMemo(() => {
    if (!searchQuery) return customerFeedback;
    return customerFeedback.filter(feedback => 
      feedback.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      feedback.message.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [customerFeedback, searchQuery]);

  if (loading) {
    return (
      <div className={`flex justify-center items-center h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`min-h-screen p-4 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50'}`}>
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
          <p className="text-lg">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-50'}`}>
      <Header 
  staffDetails={staffDetails} 
  shiftStatus={shiftStatus} 
  startShift={startShift} 
  endShift={endShift}
  shiftDuration={shiftDuration}
  shiftStartTime={shiftStartTime}  // Add this
  darkMode={darkMode}
  setDarkMode={setDarkMode}
  notifications={notifications}
  markNotificationAsRead={markNotificationAsRead}
/>

      {/* Search Bar */}
      <div className={`sticky top-0 z-10 ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-md p-4`}>
        <div className="max-w-7xl mx-auto flex items-center">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
            </div>
            <input
              type="text"
              placeholder="Search orders, reservations, feedback..."
              className={`block w-full pl-10 pr-3 py-3 rounded-lg ${darkMode ? 'bg-gray-700 text-white placeholder-gray-400' : 'bg-gray-100 text-gray-900 placeholder-gray-500'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className={`sticky top-16 z-10 ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex overflow-x-auto">
            <button
              onClick={() => setActiveTab('orders')}
              className={`px-6 py-4 font-medium text-base flex-shrink-0 ${activeTab === 'orders' ? 
                `${darkMode ? 'border-b-2 border-blue-400 text-blue-400' : 'border-b-2 border-blue-500 text-blue-600'}` : 
                `${darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'}`}`}
            >
              <div className="flex items-center">
                <FaUtensils className="mr-2 text-lg" /> Orders
                {orders.filter(o => o.status === 'pending').length > 0 && (
                  <span className="ml-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                    {orders.filter(o => o.status === 'pending').length}
                  </span>
                )}
              </div>
            </button>
            
            <button
              onClick={() => setActiveTab('reservations')}
              className={`px-6 py-4 font-medium text-base flex-shrink-0 ${activeTab === 'reservations' ? 
                `${darkMode ? 'border-b-2 border-green-400 text-green-400' : 'border-b-2 border-green-500 text-green-600'}` : 
                `${darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'}`}`}
            >
              <div className="flex items-center">
                <FaTable className="mr-2 text-lg" /> Reservations
                {reservations.filter(r => r.status === 'pending').length > 0 && (
                  <span className="ml-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                    {reservations.filter(r => r.status === 'pending').length}
                  </span>
                )}
              </div>
            </button>
            
            <button
              onClick={() => setActiveTab('kitchen')}
              className={`px-6 py-4 font-medium text-base flex-shrink-0 ${activeTab === 'kitchen' ? 
                `${darkMode ? 'border-b-2 border-yellow-400 text-yellow-400' : 'border-b-2 border-yellow-500 text-yellow-600'}` : 
                `${darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'}`}`}
            >
              <div className="flex items-center">
                <MdKitchen className="mr-2 text-lg" /> Kitchen
              </div>
            </button>
            
            <button
              onClick={() => setActiveTab('feedback')}
              className={`px-6 py-4 font-medium text-base flex-shrink-0 ${activeTab === 'feedback' ? 
                `${darkMode ? 'border-b-2 border-purple-400 text-purple-400' : 'border-b-2 border-purple-500 text-purple-600'}` : 
                `${darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'}`}`}
            >
              <div className="flex items-center">
                <MdRateReview className="mr-2 text-lg" /> Feedback
                {customerFeedback.filter(f => !f.read).length > 0 && (
                  <span className="ml-2 bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                    {customerFeedback.filter(f => !f.read).length}
                  </span>
                )}
              </div>
            </button>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <StatsOverview 
          orders={orders} 
          reservations={reservations} 
          customerFeedback={customerFeedback}
          darkMode={darkMode}
        />

        {activeTab === 'orders' && (
          <OrdersTab 
            orders={filteredOrders} 
            updateOrderStatus={updateOrderStatus} 
            darkMode={darkMode}
          />
        )}

        {activeTab === 'reservations' && (
          <ReservationsTab 
            reservations={filteredReservations} 
            updateReservationStatus={updateReservationStatus}
            darkMode={darkMode}
            isLoading={loading}
          />
        )}

        {activeTab === 'kitchen' && (
          <KitchenTab 
            orders={filteredOrders} 
            updateOrderStatus={updateOrderStatus}
            darkMode={darkMode}
          />
        )}

        {activeTab === 'feedback' && (
          <FeedbackTab 
            customerFeedback={filteredFeedback}
            darkMode={darkMode}
          />
        )}
      </main>
    </div>
  );
};

export default StaffDashboard;