import React from 'react';  
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaSearch, 
  FaFilter, 
  FaClock, 
  FaCheckCircle, 
  FaTimesCircle,
  FaTruck,
  FaPrint,
  FaFileExport,
  FaCalendarAlt,
  FaUser
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const AdminOrders = ({ darkMode }) => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState(null);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const navigate = useNavigate();

  // Fetch orders data
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setError('');
        const token = localStorage.getItem('token');
        const response = await fetch('https://restuarant-sh57.onrender.com/api/orders', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch orders');
        }

        const data = await response.json();
        setOrders(data);
        setFilteredOrders(data);
      } catch (err) {
        setError(err.message);
        toast.error(`Error fetching orders: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  // Apply filters
  useEffect(() => {
    let result = [...orders];
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(order => 
        order._id.toLowerCase().includes(term) ||
        order.deliveryInfo?.name?.toLowerCase().includes(term) ||
        order.deliveryInfo?.phone?.includes(term)
      );
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter(order => order.status === statusFilter);
    }
    
    // Apply date filter
    if (dateFilter) {
      const filterDate = new Date(dateFilter);
      result = result.filter(order => {
        const orderDate = new Date(order.createdAt);
        return (
          orderDate.getDate() === filterDate.getDate() &&
          orderDate.getMonth() === filterDate.getMonth() &&
          orderDate.getFullYear() === filterDate.getFullYear()
        );
      });
    }
    
    setFilteredOrders(result);
  }, [searchTerm, statusFilter, dateFilter, orders]);

  // Update order status
  const updateStatus = async (orderId, newStatus) => {
    try {
      setError('');
      const token = localStorage.getItem('token');
      const response = await fetch(`https://restuarant-sh57.onrender.com/api/admin/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) {
        throw new Error('Failed to update order status');
      }

      setOrders(orders.map(order => 
        order._id === orderId ? { ...order, status: newStatus } : order
      ));
      toast.success(`Order status updated to ${newStatus}`);
    } catch (err) {
      setError(err.message);
      toast.error(`Error updating order: ${err.message}`);
    }
  };

  // Print order receipt
  const printReceipt = (order) => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Order Receipt #${order._id.slice(-6)}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { color: #333; }
            .header { text-align: center; margin-bottom: 20px; }
            .info { margin-bottom: 15px; }
            .items { width: 100%; border-collapse: collapse; margin: 15px 0; }
            .items th, .items td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            .total { font-weight: bold; text-align: right; margin-top: 10px; }
            .footer { margin-top: 30px; font-size: 0.9em; text-align: center; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Restaurant Name</h1>
            <p>Order Receipt</p>
          </div>
          <div class="info">
            <p><strong>Order ID:</strong> #${order._id.slice(-6)}</p>
            <p><strong>Date:</strong> ${new Date(order.createdAt).toLocaleString()}</p>
            <p><strong>Status:</strong> ${order.status}</p>
          </div>
          <h3>Customer Information</h3>
          <p>${order.deliveryInfo?.name || 'N/A'}</p>
          <p>${order.deliveryInfo?.phone || 'N/A'}</p>
          <p>${order.deliveryInfo?.address || 'N/A'}</p>
          <h3>Order Items</h3>
          <table class="items">
            <thead>
              <tr>
                <th>Item</th>
                <th>Quantity</th>
                <th>Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${order.items.map(item => `
                <tr>
                  <td>${item.food?.name || 'Item'}</td>
                  <td>${item.quantity}</td>
                  <td>$${item.food?.price?.toFixed(2) || '0.00'}</td>
                  <td>$${(item.food?.price * item.quantity).toFixed(2) || '0.00'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div class="total">
            <p>Subtotal: $${order.subTotal?.toFixed(2) || '0.00'}</p>
            <p>Tax: $${order.taxAmount?.toFixed(2) || '0.00'}</p>
            <p>Delivery: $${order.deliveryFee?.toFixed(2) || '0.00'}</p>
            <p>Total: $${order.totalAmount?.toFixed(2) || '0.00'}</p>
          </div>
          ${order.notes ? `<div class="notes"><p><strong>Notes:</strong> ${order.notes}</p></div>` : ''}
          <div class="footer">
            <p>Thank you for your order!</p>
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

  // Export orders to CSV
  const exportToCSV = () => {
    const headers = [
      'Order ID', 'Date', 'Customer', 'Phone', 'Items', 
      'Subtotal', 'Tax', 'Delivery', 'Total', 'Status'
    ];
    
    const csvContent = [
      headers.join(','),
      ...filteredOrders.map(order => [
        `#${order._id.slice(-6)}`,
        new Date(order.createdAt).toLocaleString(),
        order.deliveryInfo?.name || 'N/A',
        order.deliveryInfo?.phone || 'N/A',
        order.items.map(i => `${i.food?.name} (x${i.quantity})`).join('; '),
        order.subTotal?.toFixed(2) || '0.00',
        order.taxAmount?.toFixed(2) || '0.00',
        order.deliveryFee?.toFixed(2) || '0.00',
        order.totalAmount?.toFixed(2) || '0.00',
        order.status
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `orders_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className={`flex justify-center items-center h-64 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`p-4 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-xl shadow-lg overflow-hidden ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
      <div className={`p-6 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <h2 className={`text-2xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Order Management
            <span className="ml-2 text-sm font-normal text-gray-500">
              ({filteredOrders.length} orders)
            </span>
          </h2>
          <div className="mt-4 md:mt-0 flex flex-col sm:flex-row gap-3">
            <button
              onClick={exportToCSV}
              className={`flex items-center px-4 py-2 rounded-lg ${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-800'}`}
            >
              <FaFileExport className="mr-2" />
              Export CSV
            </button>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className={darkMode ? 'text-gray-400' : 'text-gray-500'} />
            </div>
            <input
              type="text"
              placeholder="Search orders..."
              className={`pl-10 pr-4 py-2 w-full rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${darkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white border-gray-300'}`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaFilter className={darkMode ? 'text-gray-400' : 'text-gray-500'} />
            </div>
            <select
              className={`pl-10 pr-4 py-2 w-full rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${darkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white border-gray-300'}`}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="preparing">Preparing</option>
              <option value="ready">Ready</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaCalendarAlt className={darkMode ? 'text-gray-400' : 'text-gray-500'} />
            </div>
            <DatePicker
              selected={dateFilter}
              onChange={(date) => setDateFilter(date)}
              placeholderText="Filter by date"
              className={`pl-10 pr-4 py-2 w-full rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${darkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white border-gray-300'}`}
              dateFormat="MMMM d, yyyy"
              isClearable
            />
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className={darkMode ? 'bg-gray-700' : 'bg-gray-50'}>
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                <span className={darkMode ? 'text-gray-300' : 'text-gray-500'}>Order ID</span>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                <span className={darkMode ? 'text-gray-300' : 'text-gray-500'}>Customer</span>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                <span className={darkMode ? 'text-gray-300' : 'text-gray-500'}>Date</span>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                <span className={darkMode ? 'text-gray-300' : 'text-gray-500'}>Total</span>
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
            {filteredOrders.length > 0 ? (
              filteredOrders.map((order) => (
                <React.Fragment key={order._id}>
                  <tr 
                    className={`hover:${darkMode ? 'bg-gray-700' : 'bg-gray-50'} cursor-pointer`}
                    onClick={() => setExpandedOrder(expandedOrder === order._id ? null : order._id)}
                  >
                    <td className={`px-6 py-4 whitespace-nowrap ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                      #{order._id.slice(-6)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={darkMode ? 'text-white' : 'text-gray-900'}>
                        {order.deliveryInfo?.name || 'N/A'}
                      </div>
                      <div className={darkMode ? 'text-gray-400' : 'text-gray-500'}>
                        {order.deliveryInfo?.phone || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                        {new Date(order.createdAt).toLocaleDateString()}
                      </div>
                      <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {new Date(order.createdAt).toLocaleTimeString()}
                      </div>
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap font-medium ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
                      ${order.totalAmount?.toFixed(2) || '0.00'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        order.status === 'pending' ? 
                          darkMode ? 'bg-yellow-900 text-yellow-200' : 'bg-yellow-100 text-yellow-800' :
                        order.status === 'preparing' ? 
                          darkMode ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-800' :
                        order.status === 'ready' ? 
                          darkMode ? 'bg-green-900 text-green-200' : 'bg-green-100 text-green-800' :
                        order.status === 'delivered' ?
                          darkMode ? 'bg-purple-900 text-purple-200' : 'bg-purple-100 text-purple-800' :
                        darkMode ? 'bg-gray-600 text-gray-200' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {order.status === 'pending' && <FaClock className="mr-1" />}
                        {order.status === 'preparing' && <FaClock className="mr-1" />}
                        {order.status === 'ready' && <FaCheckCircle className="mr-1" />}
                        {order.status === 'delivered' && <FaTruck className="mr-1" />}
                        {order.status === 'cancelled' && <FaTimesCircle className="mr-1" />}
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex space-x-2">
                        <select
                          value={order.status}
                          onChange={(e) => updateStatus(order._id, e.target.value)}
                          className={`rounded-md p-1 text-sm ${darkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white border-gray-300'}`}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="preparing">Preparing</option>
                          <option value="ready">Ready</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            printReceipt(order);
                          }}
                          className={`p-2 rounded ${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-800'}`}
                          title="Print receipt"
                        >
                          <FaPrint />
                        </button>
                      </div>
                    </td>
                  </tr>
                  
                  {expandedOrder === order._id && (
                    <tr className={darkMode ? 'bg-gray-700' : 'bg-gray-50'}>
                      <td colSpan="6" className="px-6 py-4">
                        <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-600' : 'bg-gray-100'}`}>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <h4 className={`font-medium mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                <FaUser className="inline mr-2" />
                                Customer Details
                              </h4>
                              <div className={`space-y-2 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                <p><strong>Name:</strong> {order.deliveryInfo?.name || 'N/A'}</p>
                                <p><strong>Phone:</strong> {order.deliveryInfo?.phone || 'N/A'}</p>
                                <p><strong>Address:</strong> {order.deliveryInfo?.address || 'N/A'}</p>
                                {order.deliveryInfo?.instructions && (
                                  <p><strong>Instructions:</strong> {order.deliveryInfo.instructions}</p>
                                )}
                              </div>
                            </div>
                            
                            <div>
                              <h4 className={`font-medium mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                Order Summary
                              </h4>
                              <div className="space-y-3">
                                <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                  <p><strong>Order ID:</strong> #{order._id.slice(-6)}</p>
                                  <p><strong>Order Date:</strong> {new Date(order.createdAt).toLocaleString()}</p>
                                  <p><strong>Payment Method:</strong> {order.paymentMethod || 'N/A'}</p>
                                </div>
                                {order.notes && (
                                  <div className={`p-2 rounded ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-white text-gray-700'}`}>
                                    <p className="font-medium">Customer Notes:</p>
                                    <p>{order.notes}</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          <div className="mt-6">
                            <h4 className={`font-medium mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                              Order Items
                            </h4>
                            <div className="overflow-x-auto">
                              <table className={`min-w-full ${darkMode ? 'bg-gray-700' : 'bg-white'}`}>
                                <thead className={darkMode ? 'bg-gray-600' : 'bg-gray-100'}>
                                  <tr>
                                    <th className="px-4 py-2 text-left">Item</th>
                                    <th className="px-4 py-2 text-left">Quantity</th>
                                    <th className="px-4 py-2 text-left">Unit Price</th>
                                    <th className="px-4 py-2 text-left">Total</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {order.items.map((item, index) => (
                                    <tr key={index} className={darkMode ? 'border-gray-600' : 'border-gray-200'}>
                                      <td className="px-4 py-2">{item.food?.name || 'Item'}</td>
                                      <td className="px-4 py-2">{item.quantity}</td>
                                      <td className="px-4 py-2">${item.food?.price?.toFixed(2) || '0.00'}</td>
                                      <td className="px-4 py-2">${(item.food?.price * item.quantity).toFixed(2) || '0.00'}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                          
                          <div className={`mt-6 pt-4 border-t ${darkMode ? 'border-gray-500' : 'border-gray-200'}`}>
                            <div className="flex justify-between">
                              <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                <p>Subtotal: ${order.subTotal?.toFixed(2) || '0.00'}</p>
                                <p>Tax: ${order.taxAmount?.toFixed(2) || '0.00'}</p>
                                <p>Delivery Fee: ${order.deliveryFee?.toFixed(2) || '0.00'}</p>
                              </div>
                              <div className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                Total: ${order.totalAmount?.toFixed(2) || '0.00'}
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
                  <div className={`p-8 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {searchTerm || statusFilter !== 'all' || dateFilter ? (
                      <p>No orders match your search criteria</p>
                    ) : (
                      <p>No orders found</p>
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

export default AdminOrders;