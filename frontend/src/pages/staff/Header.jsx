import { useState } from 'react';
import { FaUser, FaBell, FaClock } from 'react-icons/fa';

const Header = ({ 
  staffDetails, 
  shiftStatus, 
  startShift, 
  endShift,
  shiftDuration,
  shiftStartTime,
  notifications,
  markNotificationAsRead
}) => {
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <div className="shadow bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <h1 className="text-3xl font-bold text-gray-900">
            Staff Dashboard
          </h1>
          
          <div className="flex items-center space-x-6">
            {shiftStatus === 'active' && shiftStartTime && (
              <div className="flex items-center text-blue-600">
                <FaClock className="mr-2 text-xl" />
                <div className="flex flex-col">
                  <span className="font-medium">{shiftDuration}</span>
                  <span className="text-xs">
                    Started at: {new Date(shiftStartTime).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            )}
            
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 rounded-full relative hover:bg-gray-100"
              >
                <FaBell className="text-xl text-gray-600" />
                {notifications.filter(n => !n.read).length > 0 && (
                  <span className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                    {notifications.filter(n => !n.read).length}
                  </span>
                )}
              </button>
              
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-72 rounded-md shadow-lg py-1 z-50 bg-white ring-1 ring-black ring-opacity-5">
                  <div className="px-4 py-2 border-b border-gray-200">
                    <p className="text-sm font-medium text-gray-900">
                      Notifications
                    </p>
                  </div>
                  <div className="max-h-60 overflow-y-auto">
                    {notifications.length > 0 ? (
                      notifications.map(notification => (
                        <div 
                          key={notification.id} 
                          className={`px-4 py-3 hover:bg-gray-50 cursor-pointer ${!notification.read ? 'bg-blue-50' : ''}`}
                          onClick={() => {
                            markNotificationAsRead(notification.id);
                            setShowNotifications(false);
                          }}
                        >
                          <p className="text-sm text-gray-800">
                            {notification.message}
                          </p>
                          <p className="text-xs mt-1 text-gray-500">
                            {notification.timestamp}
                          </p>
                        </div>
                      ))
                    ) : (
                      <div className="px-4 py-3 text-gray-500">
                        <p className="text-sm">No notifications</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            {shiftStatus === 'notStarted' && (
              <button 
                onClick={startShift}
                className="px-5 py-3 rounded-lg font-medium bg-green-600 hover:bg-green-700 text-white flex items-center"
              >
                Start Shift
              </button>
            )}
            
            {shiftStatus === 'active' && (
              <button 
                onClick={endShift}
                className="px-5 py-3 rounded-lg font-medium bg-red-600 hover:bg-red-700 text-white flex items-center"
              >
                End Shift
              </button>
            )}
            
            {staffDetails && (
              <div className="flex items-center text-gray-900">
                <div className="rounded-full p-3 mr-3 bg-gray-200">
                  <FaUser className="text-xl text-gray-600" />
                </div>
                <div>
                  <p className="font-medium text-lg">
                    {staffDetails.firstName} {staffDetails.lastName}
                  </p>
                  <p className="text-sm text-gray-500">
                    {staffDetails.role}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;