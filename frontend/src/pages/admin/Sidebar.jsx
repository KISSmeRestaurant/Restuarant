import { 
  MdDashboard, 
  MdRestaurantMenu, 
  MdPeople, 
  MdSettings, 
  MdMenu, 
  MdClose,
  MdEventNote,
  MdShoppingCart, // Add this for orders icon
  MdAccessTime // Add this for staff shifts icon
} from 'react-icons/md';
import { FaUserCog } from 'react-icons/fa';

const Sidebar = ({ sidebarOpen, setSidebarOpen, activeTab, setActiveTab }) => {
  return (
    <div className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-gray-800 text-white transition-all duration-300 ease-in-out flex flex-col`}>
      <div className="p-4 flex items-center justify-between">
        {sidebarOpen ? (
          <h1 className="text-xl font-bold">Admin Panel</h1>
        ) : (
          <div className="w-8 h-8 bg-pink-600 rounded-full flex items-center justify-center">
            <FaUserCog className="text-white" />
          </div>
        )}
        <button 
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="text-white focus:outline-none"
        >
          {sidebarOpen ? <MdClose size={24} /> : <MdMenu size={24} />}
        </button>
      </div>
      
      <nav className="mt-6 flex-1">
        <div
          className={`flex items-center px-4 py-3 cursor-pointer ${activeTab === 'dashboard' ? 'bg-gray-700' : 'hover:bg-gray-700'}`}
          onClick={() => setActiveTab('dashboard')}
        >
          <MdDashboard className="text-xl" />
          {sidebarOpen && <span className="ml-3">Dashboard</span>}
        </div>
        
        <div
          className={`flex items-center px-4 py-3 cursor-pointer ${activeTab === 'food' ? 'bg-gray-700' : 'hover:bg-gray-700'}`}
          onClick={() => setActiveTab('food')}
        >
          <MdRestaurantMenu className="text-xl" />
          {sidebarOpen && <span className="ml-3">Food Management</span>}
        </div>
        
        <div
          className={`flex items-center px-4 py-3 cursor-pointer ${activeTab === 'orders' ? 'bg-gray-700' : 'hover:bg-gray-700'}`}
          onClick={() => setActiveTab('orders')}
        >
          <MdShoppingCart className="text-xl" />
          {sidebarOpen && <span className="ml-3">Orders</span>}
        </div>
        
        <div
          className={`flex items-center px-4 py-3 cursor-pointer ${activeTab === 'users' ? 'bg-gray-700' : 'hover:bg-gray-700'}`}
          onClick={() => setActiveTab('users')}
        >
          <MdPeople className="text-xl" />
          {sidebarOpen && <span className="ml-3">User Management</span>}
        </div>
        
        <div
          className={`flex items-center px-4 py-3 cursor-pointer ${activeTab === 'reservations' ? 'bg-gray-700' : 'hover:bg-gray-700'}`}
          onClick={() => setActiveTab('reservations')}
        >
          <MdEventNote className="text-xl" />
          {sidebarOpen && <span className="ml-3">Reservations</span>}
        </div>
        
        <div
          className={`flex items-center px-4 py-3 cursor-pointer ${activeTab === 'staff-shifts' ? 'bg-gray-700' : 'hover:bg-gray-700'}`}
          onClick={() => setActiveTab('staff-shifts')}
        >
          <MdAccessTime className="text-xl" />
          {sidebarOpen && <span className="ml-3">Staff Shifts</span>}
        </div>
        
        <div
          className={`flex items-center px-4 py-3 cursor-pointer ${activeTab === 'settings' ? 'bg-gray-700' : 'hover:bg-gray-700'}`}
          onClick={() => setActiveTab('settings')}
        >
          <MdSettings className="text-xl" />
          {sidebarOpen && <span className="ml-3">Settings</span>}
        </div>
      </nav>
    </div>
  );
};

export default Sidebar;
