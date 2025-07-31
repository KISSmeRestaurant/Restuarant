import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaTable, 
  FaCalendarAlt, 
  FaEye, 
  FaPrint, 
  FaTimes,
  FaUsers,
  FaUtensils,
  FaReceipt,
  FaChartLine,
  FaFilter
} from 'react-icons/fa';

const TableAnalyticsTab = () => {
  const [tableOrders, setTableOrders] = useState([]);
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedTable, setSelectedTable] = useState('all');
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showBillModal, setShowBillModal] = useState(false);
  const [billData, setBillData] = useState(null);

  // Fetch tables and orders
  useEffect(() => {
    fetchTables();
    fetchTableOrders();
  }, [selectedDate, selectedTable]);

  const fetchTables = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/admin/tables', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch tables');
      }

      const data = await response.json();
      setTables(data.data || []);
    } catch (err) {
      setError(err.message);
    }
  };

  const fetchTableOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({
        date: selectedDate,
        ...(selectedTable !== 'all' && { tableId: selectedTable })
      });

      const response = await fetch(`http://localhost:5000/api/admin/tables/orders?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch table orders');
      }

      const data = await response.json();
      setTableOrders(data.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setShowOrderDetails(true);
  };

  const handleViewBill = async (order) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/tables/${order.table._id}/bill`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch bill data');
      }

      const data = await response.json();
      setBillData(data.data);
      setShowBillModal(true);
    } catch (err) {
      setError(err.message);
    }
  };

  const printBill = (billData) => {
    const printWindow = window.open('', '_blank');
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Bill - Table ${billData.table.number}</title>
        <style>
          body {
            font-family: 'Courier New', monospace;
            margin: 0;
            padding: 20px;
            font-size: 12px;
            line-height: 1.4;
          }
          .bill-container {
            max-width: 300px;
            margin: 0 auto;
          }
          .header {
            text-align: center;
            border-bottom: 2px solid #000;
            padding-bottom: 10px;
            margin-bottom: 15px;
          }
          .restaurant-name {
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 5px;
          }
          .restaurant-info {
            font-size: 10px;
            margin-bottom: 2px;
          }
          .bill-info {
            margin-bottom: 15px;
          }
          .bill-info div {
            margin-bottom: 3px;
          }
          .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 15px;
          }
          .items-table th,
          .items-table td {
            text-align: left;
            padding: 3px 0;
            border-bottom: 1px dashed #ccc;
          }
          .items-table th {
            font-weight: bold;
            border-bottom: 1px solid #000;
          }
          .item-name {
            width: 60%;
          }
          .item-qty {
            width: 15%;
            text-align: center;
          }
          .item-price {
            width: 25%;
            text-align: right;
          }
          .totals {
            border-top: 2px solid #000;
            padding-top: 10px;
          }
          .total-line {
            display: flex;
            justify-content: space-between;
            margin-bottom: 3px;
          }
          .final-total {
            font-weight: bold;
            font-size: 14px;
            border-top: 1px solid #000;
            padding-top: 5px;
            margin-top: 5px;
          }
          .footer {
            text-align: center;
            margin-top: 20px;
            padding-top: 10px;
            border-top: 1px dashed #000;
            font-size: 10px;
          }
          @media print {
            body { margin: 0; padding: 10px; }
            .bill-container { max-width: none; }
          }
        </style>
      </head>
      <body>
        <div class="bill-container">
          <div class="header">
            <div class="restaurant-name">${billData.restaurant.name}</div>
            <div class="restaurant-info">${billData.restaurant.address}</div>
            <div class="restaurant-info">Tel: ${billData.restaurant.phone}</div>
            <div class="restaurant-info">Email: ${billData.restaurant.email}</div>
          </div>
          
          <div class="bill-info">
            <div><strong>Order #:</strong> ${billData.order.orderNumber}</div>
            <div><strong>Table:</strong> ${billData.table.number} (${billData.table.capacity} seats)</div>
            <div><strong>Location:</strong> ${billData.table.location}</div>
            <div><strong>Customer:</strong> ${billData.order.customer.name}</div>
            ${billData.order.customer.phone ? `<div><strong>Phone:</strong> ${billData.order.customer.phone}</div>` : ''}
            <div><strong>Date:</strong> ${new Date(billData.order.date).toLocaleString()}</div>
            <div><strong>Served by:</strong> ${billData.printedBy}</div>
          </div>

          <table class="items-table">
            <thead>
              <tr>
                <th class="item-name">Item</th>
                <th class="item-qty">Qty</th>
                <th class="item-price">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${billData.order.items.map(item => `
                <tr>
                  <td class="item-name">${item.name}</td>
                  <td class="item-qty">${item.quantity}</td>
                  <td class="item-price">${billData.order.pricing.currencySymbol}${item.totalPrice.toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="totals">
            <div class="total-line">
              <span>Subtotal:</span>
              <span>${billData.order.pricing.currencySymbol}${billData.order.pricing.subtotal.toFixed(2)}</span>
            </div>
            ${billData.order.pricing.serviceCharge > 0 ? `
            <div class="total-line">
              <span>Service Charge:</span>
              <span>${billData.order.pricing.currencySymbol}${billData.order.pricing.serviceCharge.toFixed(2)}</span>
            </div>
            ` : ''}
            <div class="total-line">
              <span>VAT (${billData.order.pricing.vatRate}%):</span>
              <span>${billData.order.pricing.currencySymbol}${billData.order.pricing.vatAmount.toFixed(2)}</span>
            </div>
            <div class="total-line final-total">
              <span>TOTAL:</span>
              <span>${billData.order.pricing.currencySymbol}${billData.order.pricing.totalAmount.toFixed(2)}</span>
            </div>
          </div>

          ${billData.order.customer.notes ? `
          <div style="margin-top: 15px; padding-top: 10px; border-top: 1px dashed #000;">
            <strong>Notes:</strong> ${billData.order.customer.notes}
          </div>
          ` : ''}

          <div class="footer">
            <div>Thank you for dining with us!</div>
            <div>Printed on: ${new Date(billData.printedAt).toLocaleString()}</div>
          </div>
        </div>
      </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
    
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'preparing': return 'bg-orange-100 text-orange-800';
      case 'ready': return 'bg-green-100 text-green-800';
      case 'delivered': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Calculate daily statistics
  const dailyStats = {
    totalOrders: tableOrders.length,
    totalRevenue: tableOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0),
    averageOrderValue: tableOrders.length > 0 ? 
      tableOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0) / tableOrders.length : 0,
    tablesUsed: new Set(tableOrders.map(order => order.table?._id)).size
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Table Analytics</h2>
          <p className="text-gray-600">View daily orders and bills for each table</p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded">
          <p>{error}</p>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center space-x-2">
            <FaCalendarAlt className="text-gray-500" />
            <label className="text-sm font-medium text-gray-700">Date:</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <FaFilter className="text-gray-500" />
            <label className="text-sm font-medium text-gray-700">Table:</label>
            <select
              value={selectedTable}
              onChange={(e) => setSelectedTable(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Tables</option>
              {tables.map((table) => (
                <option key={table._id} value={table._id}>
                  Table {table.tableNumber}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Daily Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-full mr-4">
              <FaUtensils className="text-blue-600 text-xl" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900">{dailyStats.totalOrders}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-full mr-4">
              <FaChartLine className="text-green-600 text-xl" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">£{dailyStats.totalRevenue.toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-full mr-4">
              <FaReceipt className="text-purple-600 text-xl" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Avg Order Value</p>
              <p className="text-2xl font-bold text-gray-900">£{dailyStats.averageOrderValue.toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-3 bg-orange-100 rounded-full mr-4">
              <FaTable className="text-orange-600 text-xl" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Tables Used</p>
              <p className="text-2xl font-bold text-gray-900">{dailyStats.tablesUsed}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Orders for {new Date(selectedDate).toLocaleDateString()}
            {selectedTable !== 'all' && ` - Table ${tables.find(t => t._id === selectedTable)?.tableNumber}`}
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order #
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Table
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Items
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {tableOrders.map((order) => (
                <tr key={order._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {order.orderNumber || `#${order._id.slice(-6)}`}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center">
                      <FaTable className="mr-2 text-gray-400" />
                      Table {order.table?.tableNumber || 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div>
                      <div className="font-medium">{order.deliveryInfo?.name || 'N/A'}</div>
                      {order.deliveryInfo?.phone && (
                        <div className="text-gray-500">{order.deliveryInfo.phone}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {order.items?.length || 0} items
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    £{(order.totalAmount || 0).toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(order.createdAt).toLocaleTimeString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleViewOrder(order)}
                        className="text-blue-600 hover:text-blue-900 p-1 rounded"
                        title="View Order Details"
                      >
                        <FaEye />
                      </button>
                      <button
                        onClick={() => handleViewBill(order)}
                        className="text-green-600 hover:text-green-900 p-1 rounded"
                        title="View/Print Bill"
                      >
                        <FaPrint />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {tableOrders.length === 0 && (
          <div className="text-center py-12">
            <FaUtensils className="mx-auto text-6xl text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No Orders Found</h3>
            <p className="text-gray-500">
              No orders found for {new Date(selectedDate).toLocaleDateString()}
              {selectedTable !== 'all' && ` for the selected table`}
            </p>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      <AnimatePresence>
        {showOrderDetails && selectedOrder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden"
            >
              <div className="flex justify-between items-center p-6 border-b">
                <h3 className="text-xl font-semibold">
                  Order Details - {selectedOrder.orderNumber || `#${selectedOrder._id.slice(-6)}`}
                </h3>
                <button
                  onClick={() => setShowOrderDetails(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <FaTimes size={20} />
                </button>
              </div>

              <div className="p-6 overflow-y-auto max-h-[70vh]">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h4 className="font-semibold mb-3">Order Information</h4>
                    <div className="space-y-2 text-sm">
                      <div><strong>Table:</strong> {selectedOrder.table?.tableNumber || 'N/A'}</div>
                      <div><strong>Customer:</strong> {selectedOrder.deliveryInfo?.name || 'N/A'}</div>
                      <div><strong>Phone:</strong> {selectedOrder.deliveryInfo?.phone || 'N/A'}</div>
                      <div><strong>Status:</strong> 
                        <span className={`ml-2 px-2 py-1 text-xs rounded-full ${getStatusColor(selectedOrder.status)}`}>
                          {selectedOrder.status}
                        </span>
                      </div>
                      <div><strong>Order Time:</strong> {new Date(selectedOrder.createdAt).toLocaleString()}</div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-3">Special Notes</h4>
                    <p className="text-sm text-gray-600">
                      {selectedOrder.deliveryInfo?.notes || 'No special notes'}
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Order Items</h4>
                  <div className="border rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Qty</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {selectedOrder.items?.map((item, index) => (
                          <tr key={index}>
                            <td className="px-4 py-2 text-sm text-gray-900">
                              {item.food?.name || 'Unknown Item'}
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-900">{item.quantity}</td>
                            <td className="px-4 py-2 text-sm text-gray-900">£{item.price?.toFixed(2)}</td>
                            <td className="px-4 py-2 text-sm font-medium text-gray-900">
                              £{(item.price * item.quantity).toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="mt-4 flex justify-end">
                    <div className="text-right">
                      <div className="text-lg font-semibold">
                        Total: £{(selectedOrder.totalAmount || 0).toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bill Modal */}
      <AnimatePresence>
        {showBillModal && billData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-hidden"
            >
              <div className="flex justify-between items-center p-4 border-b">
                <h3 className="text-lg font-semibold">Bill Preview</h3>
                <button
                  onClick={() => setShowBillModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <FaTimes size={20} />
                </button>
              </div>

              <div className="p-4 overflow-y-auto max-h-[70vh]">
                <div className="text-center mb-4">
                  <h4 className="font-bold text-lg">{billData.restaurant.name}</h4>
                  <p className="text-sm text-gray-600">{billData.restaurant.address}</p>
                  <p className="text-sm text-gray-600">Tel: {billData.restaurant.phone}</p>
                </div>

                <div className="mb-4 text-sm">
                  <div><strong>Order #:</strong> {billData.order.orderNumber}</div>
                  <div><strong>Table:</strong> {billData.table.number}</div>
                  <div><strong>Customer:</strong> {billData.order.customer.name}</div>
                  <div><strong>Date:</strong> {new Date(billData.order.date).toLocaleString()}</div>
                </div>

                <div className="border-t border-b py-2 mb-4">
                  {billData.order.items.map((item, index) => (
                    <div key={index} className="flex justify-between text-sm py-1">
                      <span>{item.name} x{item.quantity}</span>
                      <span>£{item.totalPrice.toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>£{billData.order.pricing.subtotal.toFixed(2)}</span>
                  </div>
                  {billData.order.pricing.serviceCharge > 0 && (
                    <div className="flex justify-between">
                      <span>Service Charge:</span>
                      <span>£{billData.order.pricing.serviceCharge.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>VAT ({billData.order.pricing.vatRate}%):</span>
                    <span>£{billData.order.pricing.vatAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg border-t pt-2">
                    <span>TOTAL:</span>
                    <span>£{billData.order.pricing.totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="p-4 border-t">
                <button
                  onClick={() => printBill(billData)}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
                >
                  <FaPrint className="mr-2" />
                  Print Bill
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TableAnalyticsTab;
