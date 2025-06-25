import React from 'react'; 
import { useState, useEffect } from 'react';
import { 
  FaSearch, 
  FaFilter, 
  FaCalendarAlt, 
  FaUser, 
  FaPhone, 
  FaUsers,
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
  FaEdit,
  FaTrash,
  FaPrint,
  FaFileExport,
  FaArrowUp,
  FaArrowDown
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import moment from 'moment';

const Reservations = () => {
  const [reservations, setReservations] = useState([]);
  const [filteredReservations, setFilteredReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState(null);
  const [expandedReservation, setExpandedReservation] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'asc' });

  // Fetch reservations data
  useEffect(() => {
    const fetchReservations = async () => {
      try {
        setError('');
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:5000/api/reservations', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        const data = await response.json();
        if (response.ok) {
          setReservations(data);
          setFilteredReservations(data);
        } else {
          throw new Error(data.message || 'Failed to fetch reservations');
        }
      } catch (error) {
        setError(error.message);
        toast.error(`Error fetching reservations: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchReservations();
  }, []);

  // Apply filters
  useEffect(() => {
    let result = [...reservations];
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(reservation => 
        reservation._id.toLowerCase().includes(term) ||
        reservation.name.toLowerCase().includes(term) ||
        reservation.phone?.includes(term) ||
        reservation.email?.toLowerCase().includes(term)
      );
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter(reservation => reservation.status === statusFilter);
    }
    
    // Apply date filter
    if (dateFilter) {
      const filterDate = new Date(dateFilter);
      result = result.filter(reservation => {
        const reservationDate = new Date(reservation.date);
        return (
          reservationDate.getDate() === filterDate.getDate() &&
          reservationDate.getMonth() === filterDate.getMonth() &&
          reservationDate.getFullYear() === filterDate.getFullYear()
        );
      });
    }
    
    // Apply sorting
    if (sortConfig.key) {
      result.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    
    setFilteredReservations(result);
  }, [searchTerm, statusFilter, dateFilter, reservations, sortConfig]);

  // Update reservation status
  const updateStatus = async (reservationId, newStatus) => {
    try {
      setError('');
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/reservations/${reservationId}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) {
        throw new Error('Failed to update reservation status');
      }

      setReservations(reservations.map(reservation => 
        reservation._id === reservationId ? { ...reservation, status: newStatus } : reservation
      ));
      toast.success(`Reservation status updated to ${newStatus}`);
    } catch (err) {
      setError(err.message);
      toast.error(`Error updating reservation: ${err.message}`);
    }
  };

  // Delete reservation
  const deleteReservation = async (reservationId) => {
    try {
      if (!window.confirm('Are you sure you want to delete this reservation?')) return;
      
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/reservations/${reservationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete reservation');
      }

      setReservations(reservations.filter(r => r._id !== reservationId));
      toast.success('Reservation deleted successfully');
    } catch (err) {
      setError(err.message);
      toast.error(`Error deleting reservation: ${err.message}`);
    }
  };

  // Print reservation details
  const printReservation = (reservation) => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Reservation #${reservation._id.slice(-6)}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { color: #333; }
            .header { text-align: center; margin-bottom: 20px; }
            .info { margin-bottom: 15px; }
            .footer { margin-top: 30px; font-size: 0.9em; text-align: center; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Restaurant Name</h1>
            <p>Reservation Details</p>
          </div>
          <div class="info">
            <p><strong>Reservation ID:</strong> #${reservation._id.slice(-6)}</p>
            <p><strong>Date:</strong> ${new Date(reservation.date).toLocaleDateString()}</p>
            <p><strong>Time:</strong> ${reservation.time}</p>
            <p><strong>Status:</strong> ${reservation.status}</p>
          </div>
          <h3>Customer Information</h3>
          <p><strong>Name:</strong> ${reservation.name}</p>
          <p><strong>Phone:</strong> ${reservation.phone || 'N/A'}</p>
          <p><strong>Email:</strong> ${reservation.email || 'N/A'}</p>
          <p><strong>Guests:</strong> ${reservation.guests}</p>
          ${reservation.specialRequests ? `<p><strong>Special Requests:</strong> ${reservation.specialRequests}</p>` : ''}
          <div class="footer">
            <p>Thank you for choosing us!</p>
            <p>${new Date().toLocaleDateString()}</p>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  };

  // Export to CSV
  const exportToCSV = () => {
    const headers = [
      'Reservation ID', 'Date', 'Time', 'Customer', 'Phone', 'Email', 
      'Guests', 'Status', 'Special Requests'
    ];
    
    const csvContent = [
      headers.join(','),
      ...filteredReservations.map(reservation => [
        `#${reservation._id.slice(-6)}`,
        new Date(reservation.date).toLocaleDateString(),
        reservation.time,
        reservation.name,
        reservation.phone || 'N/A',
        reservation.email || 'N/A',
        reservation.guests,
        reservation.status,
        reservation.specialRequests || 'None'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `reservations_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Request sort
  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl shadow-lg overflow-hidden bg-white">
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <h2 className="text-2xl font-semibold text-gray-900">
            Reservation Management
            <span className="ml-2 text-sm font-normal text-gray-500">
              ({filteredReservations.length} reservations)
            </span>
          </h2>
          <div className="mt-4 md:mt-0 flex flex-col sm:flex-row gap-3">
            <button
              onClick={exportToCSV}
              className="flex items-center px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-800"
            >
              <FaFileExport className="mr-2" />
              Export CSV
            </button>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="text-gray-500" />
            </div>
            <input
              type="text"
              placeholder="Search reservations..."
              className="pl-10 pr-4 py-2 w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaFilter className="text-gray-500" />
            </div>
            <select
              className="pl-10 pr-4 py-2 w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="cancelled">Cancelled</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaCalendarAlt className="text-gray-500" />
            </div>
            <DatePicker
              selected={dateFilter}
              onChange={(date) => setDateFilter(date)}
              placeholderText="Filter by date"
              className="pl-10 pr-4 py-2 w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              dateFormat="MMMM d, yyyy"
              isClearable
            />
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => requestSort('name')}
              >
                <div className="flex items-center">
                  Customer
                  {sortConfig.key === 'name' && (
                    sortConfig.direction === 'asc' ? 
                      <FaArrowUp className="ml-1" size={12} /> : 
                      <FaArrowDown className="ml-1" size={12} />
                  )}
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => requestSort('date')}
              >
                <div className="flex items-center">
                  Date
                  {sortConfig.key === 'date' && (
                    sortConfig.direction === 'asc' ? 
                      <FaArrowUp className="ml-1" size={12} /> : 
                      <FaArrowDown className="ml-1" size={12} />
                  )}
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Time
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => requestSort('guests')}
              >
                <div className="flex items-center">
                  Guests
                  {sortConfig.key === 'guests' && (
                    sortConfig.direction === 'asc' ? 
                      <FaArrowUp className="ml-1" size={12} /> : 
                      <FaArrowDown className="ml-1" size={12} />
                  )}
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredReservations.length > 0 ? (
              filteredReservations.map((reservation) => (
                <React.Fragment key={reservation._id}>
                  <tr 
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => setExpandedReservation(expandedReservation === reservation._id ? null : reservation._id)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-gray-900 font-medium">{reservation.name}</div>
                      <div className="text-gray-500 text-sm">{reservation.email || 'No email'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-gray-900">
                        {moment(reservation.date).format('MMM D, YYYY')}
                      </div>
                      <div className="text-gray-500 text-sm">
                        {moment(reservation.date).fromNow()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                      {reservation.time}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                      <div className="flex items-center">
                        <FaUsers className="mr-1 text-gray-500" />
                        {reservation.guests}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        reservation.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                        reservation.status === 'confirmed' ? 'bg-green-100 text-green-800' : 
                        reservation.status === 'cancelled' ? 'bg-red-100 text-red-800' : 
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {reservation.status === 'pending' && <FaClock className="mr-1" />}
                        {reservation.status === 'confirmed' && <FaCheckCircle className="mr-1" />}
                        {reservation.status === 'cancelled' && <FaTimesCircle className="mr-1" />}
                        {reservation.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex space-x-2">
                        <select
                          value={reservation.status}
                          onChange={(e) => updateStatus(reservation._id, e.target.value)}
                          className="rounded-md p-1 text-sm border border-gray-300"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="cancelled">Cancelled</option>
                          <option value="completed">Completed</option>
                        </select>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            printReservation(reservation);
                          }}
                          className="p-2 rounded bg-gray-100 hover:bg-gray-200 text-gray-800"
                          title="Print reservation"
                        >
                          <FaPrint size={14} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteReservation(reservation._id);
                          }}
                          className="p-2 rounded bg-gray-100 hover:bg-gray-200 text-gray-800"
                          title="Delete reservation"
                        >
                          <FaTrash size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                  
                  {expandedReservation === reservation._id && (
                    <tr className="bg-gray-50">
                      <td colSpan="6" className="px-6 py-4">
                        <div className="p-4 rounded-lg bg-gray-100">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <h4 className="font-medium mb-3 text-gray-900">
                                <FaUser className="inline mr-2" />
                                Customer Details
                              </h4>
                              <div className="space-y-2 text-sm text-gray-700">
                                <p><strong>Name:</strong> {reservation.name}</p>
                                <p><strong>Phone:</strong> {reservation.phone || 'N/A'}</p>
                                <p><strong>Email:</strong> {reservation.email || 'N/A'}</p>
                              </div>
                            </div>
                            
                            <div>
                              <h4 className="font-medium mb-3 text-gray-900">
                                Reservation Details
                              </h4>
                              <div className="space-y-3">
                                <div className="text-sm text-gray-700">
                                  <p><strong>Reservation ID:</strong> #{reservation._id.slice(-6)}</p>
                                  <p><strong>Date:</strong> {moment(reservation.date).format('MMMM D, YYYY')}</p>
                                  <p><strong>Time:</strong> {reservation.time}</p>
                                  <p><strong>Guests:</strong> {reservation.guests}</p>
                                </div>
                                {reservation.specialRequests && (
                                  <div className="p-2 rounded bg-white">
                                    <p className="font-medium">Special Requests:</p>
                                    <p>{reservation.specialRequests}</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="px-6 py-8 text-center">
                  <div className="p-8 text-gray-500">
                    {searchTerm || statusFilter !== 'all' || dateFilter ? (
                      <p>No reservations match your search criteria</p>
                    ) : (
                      <p>No reservations found</p>
                    )}
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Reservations;