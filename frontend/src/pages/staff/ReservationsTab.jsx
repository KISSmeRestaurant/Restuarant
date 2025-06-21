import { useState } from 'react';

const ReservationsTab = ({ reservations, updateReservationStatus, darkMode }) => {
  const [expandedReservation, setExpandedReservation] = useState(null);

  const toggleExpand = (reservationId) => {
    setExpandedReservation(expandedReservation === reservationId ? null : reservationId);
  };

  return (
    <div className={`rounded-xl shadow-lg overflow-hidden ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
      <div className={`px-6 py-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <h3 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Reservation Management
          <span className="ml-2 text-sm font-normal text-gray-500">
            ({reservations.length} total reservations)
          </span>
        </h3>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className={darkMode ? 'bg-gray-700' : 'bg-gray-50'}>
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                <span className={darkMode ? 'text-gray-300' : 'text-gray-500'}>ID</span>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                <span className={darkMode ? 'text-gray-300' : 'text-gray-500'}>Customer</span>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                <span className={darkMode ? 'text-gray-300' : 'text-gray-500'}>Date & Time</span>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                <span className={darkMode ? 'text-gray-300' : 'text-gray-500'}>Status</span>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                <span className={darkMode ? 'text-gray-300' : 'text-gray-500'}>Actions</span>
              </th>
            </tr>
          </thead>
          
          <tbody className={`divide-y ${darkMode ? 'divide-gray-700 bg-gray-800' : 'divide-gray-200 bg-white'}`}>
            {reservations.map((reservation) => (
              <>
                <tr 
                  key={reservation._id} 
                  className={`hover:${darkMode ? 'bg-gray-700' : 'bg-gray-50'} cursor-pointer`}
                  onClick={() => toggleExpand(reservation._id)}
                >
                  <td className={`px-6 py-4 whitespace-nowrap ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                    #{reservation._id.slice(-6)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={darkMode ? 'text-white' : 'text-gray-900'}>
                      {reservation.name}
                    </div>
                    <div className={darkMode ? 'text-gray-400' : 'text-gray-500'}>
                      {reservation.phone}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={darkMode ? 'text-white' : 'text-gray-900'}>
                      {new Date(reservation.date).toLocaleDateString()}
                    </div>
                    <div className={darkMode ? 'text-gray-400' : 'text-gray-500'}>
                      {reservation.time}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      reservation.status === 'pending' ? 
                        darkMode ? 'bg-yellow-900 text-yellow-200' : 'bg-yellow-100 text-yellow-800' :
                      reservation.status === 'confirmed' ? 
                        darkMode ? 'bg-green-900 text-green-200' : 'bg-green-100 text-green-800' :
                      darkMode ? 'bg-gray-600 text-gray-200' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {reservation.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={reservation.status}
                      onChange={(e) => updateReservationStatus(reservation._id, e.target.value)}
                      className={`rounded-md p-1 text-sm ${darkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white border-gray-300'}`}
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                </tr>
                
                {expandedReservation === reservation._id && (
                  <tr className={darkMode ? 'bg-gray-700' : 'bg-gray-50'}>
                    <td colSpan="5" className="px-6 py-4">
                      <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-600' : 'bg-gray-100'}`}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h4 className={`font-medium mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                              Reservation Details
                            </h4>
                            <ul className="space-y-1">
                              <li className="flex justify-between">
                                <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>Guests:</span>
                                <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>{reservation.guests}</span>
                              </li>
                              <li className="flex justify-between">
                                <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>Table Preference:</span>
                                <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>{reservation.tablePreference || 'Any'}</span>
                              </li>
                              <li className="flex justify-between">
                                <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>Created At:</span>
                                <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>
                                  {new Date(reservation.createdAt).toLocaleString()}
                                </span>
                              </li>
                            </ul>
                          </div>
                          
                          {reservation.specialRequests && (
                            <div>
                              <h4 className={`font-medium mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                Special Requests
                              </h4>
                              <p className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                                {reservation.specialRequests}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      </div>
      
      {reservations.length === 0 && (
        <div className={`p-8 text-center ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          No reservations found
        </div>
      )}
    </div>
  );
};

export default ReservationsTab;