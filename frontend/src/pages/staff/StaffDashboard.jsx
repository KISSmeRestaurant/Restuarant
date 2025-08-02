import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaUtensils, 
  FaTable,
  FaUser,
  FaBell,
  FaSearch,
  FaClock
} from 'react-icons/fa';
import { MdKitchen, MdRateReview } from 'react-icons/md';
import { fetchWithAuth } from '../../services/auth';

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
  const [activeTab, setActiveTab] = useState('');
  const [shiftStatus, setShiftStatus] = useState('notStarted');
  const [shiftStartTime, setShiftStartTime] = useState(null);
  const [shiftDuration, setShiftDuration] = useState('00:00:00');
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState([]);
  const navigate = useNavigate();

  // Helper functions
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

  // Data fetching functions
  const fetchActiveShift = async () => {
    try {
      const response = await fetchWithAuth('https://restuarant-sh57.onrender.com/api/staff/shift/active');

      if (response.ok) {
        const data = await response.json();
        if (data.data) {
          setShiftStatus('active');
          setShiftStartTime(new Date(data.data.startTime));
          
          // Calculate initial duration
          const now = new Date();
          const diff = now - new Date(data.data.startTime);
          const hours = Math.floor(diff / (1000 * 60 * 60)).toString().padStart(2, '0');
          const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)).toString().padStart(2, '0');
          const seconds = Math.floor((diff % (1000 * 60)) / 1000).toString().padStart(2, '0');
          setShiftDuration(`${hours}:${minutes}:${seconds}`);
        } else {
          setShiftStatus('notStarted');
        }
      } else if (response.status === 404) {
        setShiftStatus('notStarted');
      }
    } catch (err) {
      console.error('Error checking active shift:', err);
      setShiftStatus('notStarted');
    }
  };

  const fetchOrders = async () => {
    const response = await fetchWithAuth('https://restuarant-sh57.onrender.com/api/staff/orders');
    const data = await response.json();
    setOrders(data.data);
    checkForNewOrders(data.data);
  };

  const fetchReservations = async () => {
    try {
      const response = await fetchWithAuth('https://restuarant-sh57.onrender.com/api/staff/reservations');
      
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

  const fetchCustomerFeedback = async () => {
    const response = await fetchWithAuth('https://restuarant-sh57.onrender.com/api/staff/feedback');
    const data = await response.json();
    setCustomerFeedback(data.data);
  };

  // Shift management functions
  const startShift = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://restuarant-sh57.onrender.com/api/staff/shift/start', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.message === 'You already have an active shift') {
          // If shift already exists, fetch it
          const activeShiftResponse = await fetch('https://restuarant-sh57.onrender.com/api/staff/shift/active', {
            headers: {
              'Authorization': `Bearer ${token}`,
            }
          });
          
          if (activeShiftResponse.ok) {
            const activeShiftData = await activeShiftResponse.json();
            setShiftStatus('active');
            setShiftStartTime(new Date(activeShiftData.data.startTime));
            
            // Calculate initial duration
            const now = new Date();
            const diff = now - new Date(activeShiftData.data.startTime);
            const hours = Math.floor(diff / (1000 * 60 * 60)).toString().padStart(2, '0');
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)).toString().padStart(2, '0');
            const seconds = Math.floor((diff % (1000 * 60)) / 1000).toString().padStart(2, '0');
            setShiftDuration(`${hours}:${minutes}:${seconds}`);
            
            return;
          }
        }
        throw new Error(errorData.message || 'Failed to start shift');
      }
      
      const data = await response.json();
      setShiftStatus('active');
      setShiftStartTime(new Date(data.data.startTime));
      setShiftDuration('00:00:00');
      addNotification('Shift started');
    } catch (err) {
      console.error('Shift start error:', err);
      setError(err.message);
    }
  };

  const endShift = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://restuarant-sh57.onrender.com/api/staff/shift/end', {
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

  // Update functions
  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://restuarant-sh57.onrender.com/api/staff/orders/${orderId}/status`, {
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
      const response = await fetch(`https://restuarant-sh57.onrender.com/api/staff/reservations/${reservationId}/status`, {
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

  // Set default tab based on permissions - prioritize orders first
  useEffect(() => {
    if (staffDetails && !activeTab) {
      const permissions = staffDetails.permissions || { tableAccess: true, dashboardAccess: true };
      
      // Set default tab based on available permissions with proper priority
      if (permissions.tableAccess && permissions.dashboardAccess) {
        // If both permissions, default to orders
        setActiveTab('orders');
      } else if (permissions.tableAccess) {
        // If only table access, show orders
        setActiveTab('orders');
      } else if (permissions.dashboardAccess) {
        // If only dashboard access, show kitchen
        setActiveTab('kitchen');
      } else {
        // Fallback to feedback if no specific permissions
        setActiveTab('feedback');
      }
    }
  }, [staffDetails, activeTab]);

  // Initial data fetching
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        
        if (!token) {
          navigate('/login');
          return;
        }

        // First check for active shift
        await fetchActiveShift();

        // Then fetch other data
        const staffResponse = await fetch('https://restuarant-sh57.onrender.com/api/staff/me', {
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
          fetchOrders(),
          fetchReservations(),
          fetchCustomerFeedback()
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
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen p-4 bg-gray-50">
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
          <p className="text-lg">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        staffDetails={staffDetails} 
        shiftStatus={shiftStatus} 
        startShift={startShift} 
        endShift={endShift}
        shiftDuration={shiftDuration}
        shiftStartTime={shiftStartTime}
        notifications={notifications}
        markNotificationAsRead={markNotificationAsRead}
      />

      {/* Search Bar */}
      <div className="sticky top-0 z-10 bg-white shadow-md p-4">
        <div className="max-w-7xl mx-auto flex items-center">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="text-gray-500" />
            </div>
            <input
              type="text"
              placeholder="Search orders, reservations, feedback..."
              className="block w-full pl-10 pr-3 py-3 rounded-lg bg-gray-100 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="sticky top-16 z-10 bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex overflow-x-auto">
            {/* Orders Tab - Show if staff has table access or dashboard access */}
            {(staffDetails?.permissions?.tableAccess || staffDetails?.permissions?.dashboardAccess) && (
              <button
                onClick={() => setActiveTab('orders')}
                className={`px-6 py-4 font-medium text-base flex-shrink-0 ${activeTab === 'orders' ? 
                  'border-b-2 border-blue-500 text-blue-600' : 
                  'text-gray-500 hover:text-gray-700'}`}
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
            )}
            
            {/* Reservations Tab - Show if staff has table access */}
            {staffDetails?.permissions?.tableAccess && (
              <button
                onClick={() => setActiveTab('reservations')}
                className={`px-6 py-4 font-medium text-base flex-shrink-0 ${activeTab === 'reservations' ? 
                  'border-b-2 border-green-500 text-green-600' : 
                  'text-gray-500 hover:text-gray-700'}`}
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
            )}
            
            {/* Kitchen Tab - Show only if staff has dashboard access */}
            {staffDetails?.permissions?.dashboardAccess && (
              <button
                onClick={() => setActiveTab('kitchen')}
                className={`px-6 py-4 font-medium text-base flex-shrink-0 ${activeTab === 'kitchen' ? 
                  'border-b-2 border-yellow-500 text-yellow-600' : 
                  'text-gray-500 hover:text-gray-700'}`}
              >
                <div className="flex items-center">
                  <MdKitchen className="mr-2 text-lg" /> Kitchen
                </div>
              </button>
            )}
            
            {/* Feedback Tab - Always show */}
            <button
              onClick={() => setActiveTab('feedback')}
              className={`px-6 py-4 font-medium text-base flex-shrink-0 ${activeTab === 'feedback' ? 
                'border-b-2 border-purple-500 text-purple-600' : 
                'text-gray-500 hover:text-gray-700'}`}
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
        />

        {activeTab === 'orders' && (
          <OrdersTab 
            orders={filteredOrders} 
            updateOrderStatus={updateOrderStatus} 
          />
        )}

        {activeTab === 'reservations' && (
          <ReservationsTab 
            reservations={filteredReservations} 
            updateReservationStatus={updateReservationStatus}
            isLoading={loading}
          />
        )}

        {activeTab === 'kitchen' && (
          <KitchenTab 
            orders={filteredOrders} 
            updateOrderStatus={updateOrderStatus}
          />
        )}

        {activeTab === 'feedback' && (
          <FeedbackTab 
            customerFeedback={filteredFeedback}
          />
        )}
      </main>
    </div>
  );
};

export default StaffDashboard;
