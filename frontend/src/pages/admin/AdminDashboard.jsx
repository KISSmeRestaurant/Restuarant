import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import DashboardTab from './DashboardTab';
import FoodManagementTab from './FoodManagementTab';
import Users from './Users';
import SettingsTab from './SettingsTab';
import Reservations from './Reservations';
import Orders from './Orders';
import StaffShifts from './StaffShifts';
import TableManagementTab from './TableManagementTab';

const AdminDashboard = () => {
  const [admin, setAdmin] = useState(null);
  const [foodItems, setFoodItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [reservations, setReservations] = useState([]);
  const [categories, setCategories] = useState([
    'appetizer', 'main', 'dessert', 'beverage', 'salad', 'soup'
  ]);
  const navigate = useNavigate();

  useEffect(() => {
const fetchAdminData = async () => {
  try {
    const token = localStorage.getItem('token');
    
    if (!token) {
      navigate('/login');
      return;
    }

    // Fetch admin details
    const adminResponse = await fetch('https://restuarant-sh57.onrender.com/api/admin/me', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!adminResponse.ok) {
      if (adminResponse.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
        return;
      }
      throw new Error('Failed to fetch admin details');
    }

    const adminData = await adminResponse.json();
    const adminDetails = adminData.data ? adminData.data : adminData;
    
    setAdmin({
      firstName: adminDetails.firstName,
      lastName: adminDetails.lastName,
      email: adminDetails.email,
      phone: adminDetails.phone,
      postcode: adminDetails.postcode,
      createdAt: adminDetails.createdAt,
      lastLogin: adminDetails.lastLogin || new Date(),
      role: adminDetails.role
    });

    // Fetch food items and categories in parallel
    const [foodResponse, categoriesResponse] = await Promise.all([
      fetch('https://restuarant-sh57.onrender.com/api/foods', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }),
      fetch('https://restuarant-sh57.onrender.com/api/categories', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
    ]);

    if (!foodResponse.ok || !categoriesResponse.ok) {
      throw new Error('Failed to fetch data');
    }

    const foodData = await foodResponse.json();
    const categoriesData = await categoriesResponse.json();
    
    setFoodItems(foodData);
    setCategories(categoriesData);
  } catch (err) {
    console.error('Fetch error:', err);
    setError(err.message);
  } finally {
    setLoading(false);
  }
};
    
    fetchAdminData();
  }, [navigate]);

  useEffect(() => {
  const fetchReservations = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://restuarant-sh57.onrender.com/api/reservations', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      if (response.ok) {
        setReservations(data);
      } else {
        throw new Error(data.message || 'Failed to fetch reservations');
      }
    } catch (error) {
      console.error(error);
    }
  };

  fetchReservations();
}, []);

  const handleAddFood = async (e, newFood, setNewFood, setShowAddFoodForm) => {
    e.preventDefault();
    try {
      setError('');
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('name', newFood.name);
      formData.append('description', newFood.description);
      formData.append('price', newFood.price);
      formData.append('category', newFood.category);
      formData.append('foodType', newFood.foodType);
      
      if (newFood.image) {
        if (!['image/jpeg', 'image/png', 'image/jpg'].includes(newFood.image.type)) {
          throw new Error('Only JPEG, JPG, or PNG images are allowed');
        }
        formData.append('image', newFood.image);
      }

      const response = await fetch('https://restuarant-sh57.onrender.com/api/foods', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add food item');
      }

      const data = await response.json();
      setFoodItems([data, ...foodItems]);
      setNewFood({
        name: '',
        description: '',
        price: '',
        category: '',
        foodType: 'veg',
        image: null
      });
      setShowAddFoodForm(false);
    } catch (err) {
      setError(err.message);
      console.error('Error adding food:', err);
    }
  };

  const handleDeleteFood = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://restuarant-sh57.onrender.com/api/foods/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete food item');
      }

      setFoodItems(foodItems.filter(item => item._id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar 
        sidebarOpen={sidebarOpen} 
        setSidebarOpen={setSidebarOpen} 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
      />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header activeTab={activeTab} admin={admin} />
        
        <main className="flex-1 overflow-y-auto p-6">
  {error && (
    <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
      <p>{error}</p>
    </div>
  )}

  {activeTab === 'dashboard' && (
    <DashboardTab admin={admin} foodItems={foodItems} />
  )}

  {activeTab === 'food' && (
    <FoodManagementTab 
      foodItems={foodItems} 
      error={error}
      setError={setError}
      handleAddFood={handleAddFood}
      handleDeleteFood={handleDeleteFood}
      categories={categories}
      setCategories={setCategories}
    />
  )}

  {activeTab === 'users' && (
    <div className="mb-8">
      <Users />
    </div>
  )}
  
  {activeTab === 'orders' && (
  <div className="mb-8">
    <Orders />
  </div>
)}

  {activeTab === 'reservations' && (
    <div className="mb-8">
      <Reservations />
    </div>
  )}

  {activeTab === 'staff-shifts' && (
    <div className="mb-8">
      <StaffShifts />
    </div>
  )}

  {activeTab === 'tables' && (
    <div className="mb-8">
      <TableManagementTab />
    </div>
  )}

  {activeTab === 'settings' && (
    <SettingsTab />
  )}
</main>
      </div>
    </div>
  );
};

export default AdminDashboard;