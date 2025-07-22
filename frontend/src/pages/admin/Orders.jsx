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
  FaUser,
  FaDollarSign,
  FaShoppingCart,
  FaChartLine,
  FaPercentage
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
  const [orderStats, setOrderStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsDateRange, setStatsDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
    endDate: new Date()
  });
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

  // Calculate order statistics from orders data (fallback for production)
  useEffect(() => {
    const calculateOrderStats = () => {
      if (!orders || orders.length === 0) {
        setOrderStats({
          summary: {
            totalOrders: 0,
            totalRevenue: 0,
            deliveredRevenue: 0,
            pendingRevenue: 0,
            averageOrderValue: 0,
            deliveryRate: 0,
            cancellationRate: 0
          },
          breakdown: {
            delivered: { count: 0, revenue: 0 },
            pending: { count: 0, revenue: 0 },
            cancelled: { count: 0, revenue: 0 }
          }
        });
        setStatsLoading(false);
        return;
      }

      // Filter orders by date range
      const filteredOrders = orders.filter(order => {
        const orderDate = new Date(order.createdAt);
        return orderDate >= statsDateRange.startDate && orderDate <= statsDateRange.endDate;
      });

      let totalRevenue = 0;
      let deliveredRevenue = 0;
      let pendingRevenue = 0;
      let cancelledRevenue = 0;
      let deliveredCount = 0;
      let pendingCount = 0;
      let cancelledCount = 0;

      filteredOrders.forEach(order => {
        const amount = order.totalAmount || 0;
        totalRevenue += amount;

        if (order.status === 'delivered') {
          deliveredRevenue += amount;
          deliveredCount += 1;
        } else if (['pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery'].includes(order.status)) {
          pendingRevenue += amount;
          pendingCount += 1;
        } else if (order.status === 'cancelled') {
          cancelledRevenue += amount;
          cancelledCount += 1;
        }
      });

      const totalOrders = filteredOrders.length;
      const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
      const deliveryRate = totalOrders > 0 ? (deliveredCount / totalOrders) * 100 : 0;
      const cancellationRate = totalOrders > 0 ? (cancelledCount / totalOrders) * 100 : 0;

      setOrderStats({
        summary: {
          totalOrders,
          totalRevenue: Math.round(totalRevenue * 100) / 100,
          deliveredRevenue: Math.round(deliveredRevenue * 100) / 100,
          pendingRevenue: Math.round(pendingRevenue * 100) / 100,
          averageOrderValue: Math.round(averageOrderValue * 100) / 100,
          deliveryRate: Math.round(deliveryRate * 100) / 100,
          cancellationRate: Math.round(cancellationRate * 100) / 100
        },
        breakdown: {
          delivered: {
            count: deliveredCount,
            revenue: Math.round(deliveredRevenue * 100) / 100
          },
          pending: {
            count: pendingCount,
            revenue: Math.round(pendingRevenue * 100) / 100
          },
          cancelled: {
            count: cancelledCount,
            revenue: Math.round(cancelledRevenue * 100) / 100
          }
        }
      });
      setStatsLoading(false);
    };

    setStatsLoading(true);
    calculateOrderStats();
  }, [orders, statsDateRange]);

  // Calculate daily revenue from orders
  const getDailyRevenue = () => {
    if (!orders || orders.length === 0) return [];

    const dailyData = {};
    
    orders.forEach(order => {
      const orderDate = new Date(order.createdAt);
      const dateKey = orderDate.toISOString().split('T')[0]; // YYYY-MM-DD format
      const dateDisplay = orderDate.toLocaleDateString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
      
      if (!dailyData[dateKey]) {
        dailyData[dateKey] = {
          date: dateDisplay,
          totalRevenue: 0,
          deliveredRevenue: 0,
          pendingRevenue: 0,
          cancelledRevenue: 0,
          totalOrders: 0,
          deliveredOrders: 0,
          pendingOrders: 0,
          cancelledOrders: 0
        };
      }
      
      const orderAmount = order.totalAmount || 0;
      dailyData[dateKey].totalRevenue += orderAmount;
      dailyData[dateKey].totalOrders += 1;
      
      if (order.status === 'delivered') {
        dailyData[dateKey].deliveredRevenue += orderAmount;
        dailyData[dateKey].deliveredOrders += 1;
      } else if (['pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery'].includes(order.status)) {
        dailyData[dateKey].pendingRevenue += orderAmount;
        dailyData[dateKey].pendingOrders += 1;
      } else if (order.status === 'cancelled') {
        dailyData[dateKey].cancelledRevenue += orderAmount;
        dailyData[dateKey].cancelledOrders += 1;
      }
    });
    
    // Convert to array and sort by date (newest first)
    return Object.keys(dailyData)
      .sort((a, b) => new Date(b) - new Date(a))
      .map(key => ({ dateKey: key, ...dailyData[key] }));
  };

  const dailyRevenue = getDailyRevenue();

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

  // Update stats date range
  const updateStatsDateRange = (startDate, endDate) => {
    setStatsDateRange({ startDate, endDate });
  };

  // Statistics Card Component
  const StatCard = ({ title, value, icon: Icon, color, subtitle, loading }) => (
    <div className={`p-6 rounded-xl shadow-lg ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {title}
          </p>
          {loading ? (
            <div className="animate-pulse">
              <div className={`h-8 w-24 rounded mt-2 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
            </div>
          ) : (
            <p className={`text-2xl font-bold mt-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {value}
            </p>
          )}
          {subtitle && (
            <p className={`text-xs mt-1 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
              {subtitle}
            </p>
          )}
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );

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
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Revenue"
          value={orderStats ? `$${orderStats.summary.totalRevenue.toFixed(2)}` : '$0.00'}
          icon={FaDollarSign}
          color="bg-green-500"
          subtitle={orderStats ? `Last ${Math.ceil((statsDateRange.endDate - statsDateRange.startDate) / (1000 * 60 * 60 * 24))} days` : ''}
          loading={statsLoading}
        />
        <StatCard
          title="Delivered Revenue"
          value={orderStats ? `$${orderStats.summary.deliveredRevenue.toFixed(2)}` : '$0.00'}
          icon={FaCheckCircle}
          color="bg-blue-500"
          subtitle={orderStats ? `${orderStats.breakdown.delivered.count} orders delivered` : ''}
          loading={statsLoading}
        />
        <StatCard
          title="Total Orders"
          value={orderStats ? orderStats.summary.totalOrders.toString() : '0'}
          icon={FaShoppingCart}
          color="bg-purple-500"
          subtitle={orderStats ? `Avg: $${orderStats.summary.averageOrderValue.toFixed(2)} per order` : ''}
          loading={statsLoading}
        />
        <StatCard
          title="Delivery Rate"
          value={orderStats ? `${orderStats.summary.deliveryRate.toFixed(1)}%` : '0%'}
          icon={FaChartLine}
          color="bg-orange-500"
          subtitle={orderStats ? `${orderStats.summary.cancellationRate.toFixed(1)}% cancelled` : ''}
          loading={statsLoading}
        />
      </div>

      {/* Revenue Breakdown */}
      {orderStats && (
        <div className={`p-6 rounded-xl shadow-lg ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Revenue Breakdown
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Delivered Orders</p>
                  <p className={`text-xl font-bold ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
                    ${orderStats.breakdown.delivered.revenue.toFixed(2)}
                  </p>
                  <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                    {orderStats.breakdown.delivered.count} orders
                  </p>
                </div>
                <FaCheckCircle className="text-green-500 w-8 h-8" />
              </div>
            </div>
            <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Pending Orders</p>
                  <p className={`text-xl font-bold ${darkMode ? 'text-yellow-400' : 'text-yellow-600'}`}>
                    ${orderStats.breakdown.pending.revenue.toFixed(2)}
                  </p>
                  <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                    {orderStats.breakdown.pending.count} orders
                  </p>
                </div>
                <FaClock className="text-yellow-500 w-8 h-8" />
              </div>
            </div>
            <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Cancelled Orders</p>
                  <p className={`text-xl font-bold ${darkMode ? 'text-red-400' : 'text-red-600'}`}>
                    ${orderStats.breakdown.cancelled.revenue.toFixed(2)}
                  </p>
                  <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                    {orderStats.breakdown.cancelled.count} orders
                  </p>
                </div>
                <FaTimesCircle className="text-red-500 w-8 h-8" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Daily Revenue Table */}
      {dailyRevenue.length > 0 && (
        <div className={`p-6 rounded-xl shadow-lg ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Daily Revenue Breakdown
            <span className="ml-2 text-sm font-normal text-gray-500">
              (Last {dailyRevenue.length} days)
            </span>
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className={darkMode ? 'bg-gray-700' : 'bg-gray-50'}>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    <span className={darkMode ? 'text-gray-300' : 'text-gray-500'}>Date</span>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    <span className={darkMode ? 'text-gray-300' : 'text-gray-500'}>Total Revenue</span>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    <span className={darkMode ? 'text-gray-300' : 'text-gray-500'}>Delivered</span>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    <span className={darkMode ? 'text-gray-300' : 'text-gray-500'}>Pending</span>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    <span className={darkMode ? 'text-gray-300' : 'text-gray-500'}>Orders</span>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    <span className={darkMode ? 'text-gray-300' : 'text-gray-500'}>Avg Order</span>
                  </th>
                </tr>
              </thead>
              <tbody className={`divide-y ${darkMode ? 'divide-gray-700 bg-gray-800' : 'divide-gray-200 bg-white'}`}>
                {dailyRevenue.map((day, index) => (
                  <tr key={day.dateKey} className={`${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {day.date}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm font-bold ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
                        ${day.totalRevenue.toFixed(2)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                        ${day.deliveredRevenue.toFixed(2)}
                      </div>
                      <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {day.deliveredOrders} orders
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm ${darkMode ? 'text-yellow-400' : 'text-yellow-600'}`}>
                        ${day.pendingRevenue.toFixed(2)}
                      </div>
                      <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {day.pendingOrders} orders
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        {day.totalOrders}
                      </div>
                      {day.cancelledOrders > 0 && (
                        <div className={`text-xs ${darkMode ? 'text-red-400' : 'text-red-500'}`}>
                          {day.cancelledOrders} cancelled
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        ${day.totalOrders > 0 ? (day.totalRevenue / day.totalOrders).toFixed(2) : '0.00'}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {dailyRevenue.length > 10 && (
            <div className={`mt-4 text-center text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Showing recent {dailyRevenue.length} days of revenue data
            </div>
          )}
        </div>
      )}

      {/* Orders Table */}
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
              <div className="flex gap-2">
                <DatePicker
                  selected={statsDateRange.startDate}
                  onChange={(date) => updateStatsDateRange(date, statsDateRange.endDate)}
                  placeholderText="Start date"
                  className={`px-3 py-2 text-sm rounded-lg ${darkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white border-gray-300'}`}
                  dateFormat="MMM d, yyyy"
                />
                <DatePicker
                  selected={statsDateRange.endDate}
                  onChange={(date) => updateStatsDateRange(statsDateRange.startDate, date)}
                  placeholderText="End date"
                  className={`px-3 py-2 text-sm rounded-lg ${darkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white border-gray-300'}`}
                  dateFormat="MMM d, yyyy"
                />
              </div>
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
    </div>
  );
};

export default AdminOrders;