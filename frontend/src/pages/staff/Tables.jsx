import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaTable, 
  FaUsers, 
  FaPlus, 
  FaTimes, 
  FaUtensils,
  FaShoppingCart,
  FaCheck,
  FaClock,
  FaArrowLeft,
  FaPrint
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import SearchBar from '../../components/common/SearchBar';
import { apiRequest } from '../../config/api.js';

const Tables = () => {
  const navigate = useNavigate();
  const [tables, setTables] = useState([]);
  const [foodItems, setFoodItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedTable, setSelectedTable] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showAddMoreModal, setShowAddMoreModal] = useState(false);
  const [orderItems, setOrderItems] = useState([]);
  const [addMoreItems, setAddMoreItems] = useState([]);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [staffDetails, setStaffDetails] = useState(null);
  const [customerInfo, setCustomerInfo] = useState({
    notes: ''
  });
  const [filteredFoodItems, setFilteredFoodItems] = useState([]);

  // Handle search results
  const handleSearchResults = (results) => {
    if (results === null) {
      // No search query, show all items
      setFilteredFoodItems(foodItems);
    } else {
      // Show filtered results
      setFilteredFoodItems(results);
    }
  };

  // Fetch tables and food items
  useEffect(() => {
    fetchStaffDetails();
    fetchTables();
    fetchFoodItems();
  }, []);

  const fetchStaffDetails = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await apiRequest('/staff/me');

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token');
          navigate('/login');
          return;
        }
        throw new Error('Failed to fetch staff details');
      }

      const data = await response.json();
      setStaffDetails(data.data);
    } catch (err) {
      console.error('Error fetching staff details:', err);
      setError('Failed to fetch staff details');
    }
  };

  const fetchTables = async () => {
    try {
      const response = await apiRequest('/tables');

      if (!response.ok) {
        throw new Error(`Failed to fetch tables: ${response.status}`);
      }

      const data = await response.json();
      setTables(data.data || []);
      setError(''); // Clear any previous errors
    } catch (err) {
      console.error('Error fetching tables:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchFoodItems = async () => {
    try {
      const response = await apiRequest('/foods');

      if (!response.ok) {
        throw new Error('Failed to fetch food items');
      }

      const data = await response.json();
      setFoodItems(data || []);
      setFilteredFoodItems(data || []);
    } catch (err) {
      console.error('Error fetching food items:', err);
      setError('Failed to fetch food items');
    }
  };

  // Handle table selection for taking order
  const handleTakeOrder = (table) => {
    if (table.status !== 'available') {
      alert('This table is not available for new orders');
      return;
    }
    setSelectedTable(table);
    setShowOrderModal(true);
    setOrderItems([]);
    setCustomerInfo({ notes: '' });
    setFilteredFoodItems(foodItems);
  };

  // Add item to order
  const addItemToOrder = (foodItem) => {
    const existingItem = orderItems.find(item => item.food._id === foodItem._id);
    
    if (existingItem) {
      setOrderItems(orderItems.map(item =>
        item.food._id === foodItem._id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setOrderItems([...orderItems, {
        food: foodItem,
        quantity: 1,
        price: foodItem.price
      }]);
    }
  };

  // Remove item from order
  const removeItemFromOrder = (foodId) => {
    setOrderItems(orderItems.filter(item => item.food._id !== foodId));
  };

  // Update item quantity
  const updateItemQuantity = (foodId, quantity) => {
    if (quantity <= 0) {
      removeItemFromOrder(foodId);
      return;
    }
    
    setOrderItems(orderItems.map(item =>
      item.food._id === foodId
        ? { ...item, quantity }
        : item
    ));
  };

  // Calculate total
  const calculateTotal = () => {
    return orderItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  // Submit order
  const submitOrder = async () => {
    if (orderItems.length === 0) {
      alert('Please add items to the order');
      return;
    }


    try {
      // Create order
      const orderData = {
        items: orderItems.map(item => ({
          food: item.food._id,
          quantity: item.quantity,
          price: item.price
        })),
        deliveryInfo: {
          notes: customerInfo.notes,
          deliveryType: 'dine-in'
        },
        orderType: 'dine-in',
        table: selectedTable._id,
        totalAmount: calculateTotal()
      };

      const response = await apiRequest('/orders', {
        method: 'POST',
        body: JSON.stringify(orderData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create order');
      }

      const orderResult = await response.json();
      const orderId = orderResult.data?._id || orderResult._id;

      if (!orderId) {
        throw new Error('Order created but no ID returned');
      }

      // Update table status
      const assignResponse = await apiRequest(`/tables/${selectedTable._id}/assign-order`, {
        method: 'PATCH',
        body: JSON.stringify({ orderId })
      });

      if (!assignResponse.ok) {
        console.warn('Order created but failed to assign to table');
      }

      // Refresh tables
      await fetchTables();
      
      // Close modal
      setShowOrderModal(false);
      setSelectedTable(null);
      setOrderItems([]);
      setCustomerInfo({ notes: '' });
      
      alert('Order created successfully!');
    } catch (err) {
      console.error('Error submitting order:', err);
      setError(err.message);
      alert(`Failed to create order: ${err.message}`);
    }
  };

  // Handle add more food for occupied tables
  const handleAddMoreFood = async (table) => {
    if (table.status !== 'occupied' || !table.currentOrder) {
      alert('This table does not have an active order');
      return;
    }
    
    setSelectedTable(table);
    setCurrentOrder(table.currentOrder);
    setShowAddMoreModal(true);
    setAddMoreItems([]);
  };

  // Add item to add more items list
  const addItemToAddMore = (foodItem) => {
    const existingItem = addMoreItems.find(item => item.food._id === foodItem._id);
    
    if (existingItem) {
      setAddMoreItems(addMoreItems.map(item =>
        item.food._id === foodItem._id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setAddMoreItems([...addMoreItems, {
        food: foodItem,
        quantity: 1,
        price: foodItem.price
      }]);
    }
  };

  // Remove item from add more items list
  const removeItemFromAddMore = (foodId) => {
    setAddMoreItems(addMoreItems.filter(item => item.food._id !== foodId));
  };

  // Update add more item quantity
  const updateAddMoreItemQuantity = (foodId, quantity) => {
    if (quantity <= 0) {
      removeItemFromAddMore(foodId);
      return;
    }
    
    setAddMoreItems(addMoreItems.map(item =>
      item.food._id === foodId
        ? { ...item, quantity }
        : item
    ));
  };

  // Calculate add more total
  const calculateAddMoreTotal = () => {
    return addMoreItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  // Submit add more items
  const submitAddMoreItems = async () => {
    if (addMoreItems.length === 0) {
      alert('Please add items to the order');
      return;
    }

    try {
      const itemsData = addMoreItems.map(item => ({
        food: item.food._id,
        quantity: item.quantity,
        price: item.price
      }));

      const response = await apiRequest(`/tables/${selectedTable._id}/add-items`, {
        method: 'PATCH',
        body: JSON.stringify({ items: itemsData })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add items to order');
      }

      // Refresh tables
      await fetchTables();
      
      // Close modal
      setShowAddMoreModal(false);
      setSelectedTable(null);
      setCurrentOrder(null);
      setAddMoreItems([]);
      
      alert('Items added to order successfully!');
    } catch (err) {
      setError(err.message);
      alert(`Failed to add items: ${err.message}`);
    }
  };

  // Print bill for table
  const handlePrintBill = async (table) => {
    if (table.status !== 'occupied' || !table.currentOrder) {
      alert('This table does not have an active order to print');
      return;
    }

    try {
      const response = await apiRequest(`/tables/${table._id}/bill`);

      if (!response.ok) {
        throw new Error('Failed to fetch bill data');
      }

      const billData = await response.json();
      
      // Generate and print the bill
      printBill(billData.data);
      
      // After printing, mark table for cleaning
      await updateTableStatus(table._id, 'cleaning');
      
    } catch (err) {
      console.error('Error printing bill:', err);
      setError(err.message);
      alert(`Failed to print bill: ${err.message}`);
    }
  };

  // Generate printable bill content
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
    
    // Auto print after a short delay
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  };

  // Update table status
  const updateTableStatus = async (tableId, status) => {
    try {
      const response = await apiRequest(`/tables/${tableId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status })
      });

      if (!response.ok) {
        throw new Error('Failed to update table status');
      }

      await fetchTables();
      setError(''); // Clear any previous errors
    } catch (err) {
      console.error('Error updating table status:', err);
      setError(err.message);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800 border-green-200';
      case 'occupied': return 'bg-red-100 text-red-800 border-red-200';
      case 'reserved': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cleaning': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'available': return <FaCheck className="text-green-600" />;
      case 'occupied': return <FaUtensils className="text-red-600" />;
      case 'reserved': return <FaClock className="text-yellow-600" />;
      case 'cleaning': return <FaTable className="text-blue-600" />;
      default: return <FaTable className="text-gray-600" />;
    }
  };

  if (loading) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header staffDetails={staffDetails} />
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header staffDetails={staffDetails} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Page Header */}
        <div className="mb-6">
          <div className="flex items-center mb-4">
            <button
              onClick={() => navigate('/staff/dashboard')}
              className="mr-4 p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <FaArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Restaurant Tables</h1>
              <p className="text-gray-600">Manage table orders and status</p>
            </div>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg mr-3">
                  <FaCheck className="text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Available</p>
                  <p className="text-2xl font-semibold text-green-600">
                    {tables.filter(t => t.status === 'available').length}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <div className="flex items-center">
                <div className="p-2 bg-red-100 rounded-lg mr-3">
                  <FaUtensils className="text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Occupied</p>
                  <p className="text-2xl font-semibold text-red-600">
                    {tables.filter(t => t.status === 'occupied').length}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg mr-3">
                  <FaTable className="text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Cleaning</p>
                  <p className="text-2xl font-semibold text-blue-600">
                    {tables.filter(t => t.status === 'cleaning').length}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <div className="flex items-center">
                <div className="p-2 bg-gray-100 rounded-lg mr-3">
                  <FaTable className="text-gray-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Tables</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {tables.length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded">
            <p>{error}</p>
          </div>
        )}

        {/* Tables Grid */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {tables.map((table) => (
                <motion.div
                  key={table._id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.02 }}
                  className={`relative p-6 rounded-lg border-2 transition-all cursor-pointer ${getStatusColor(table.status)}`}
                >
                  <div className="text-center">
                    <div className="flex justify-center mb-3">
                      {getStatusIcon(table.status)}
                    </div>
                    
                    <h4 className="font-semibold text-xl mb-2">
                      Table {table.tableNumber}
                    </h4>
                    
                    <div className="flex items-center justify-center text-sm mb-3">
                      <FaUsers className="mr-2" />
                      <span>{table.capacity} seats</span>
                    </div>
                    
                    <div className="text-sm mb-4 capitalize font-medium">
                      {table.location}
                    </div>
                    
                    <div className={`text-sm font-medium px-3 py-1 rounded-full mb-4 ${getStatusColor(table.status)}`}>
                      {table.status}
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-2">
                      {table.status === 'available' && (
                        <button
                          onClick={() => handleTakeOrder(table)}
                          className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors flex items-center justify-center"
                        >
                          <FaPlus className="mr-2" />
                          Take Order
                        </button>
                      )}
                      
                      {table.status === 'occupied' && (
                        <>
                          <button
                            onClick={() => handleAddMoreFood(table)}
                            className="w-full bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700 transition-colors flex items-center justify-center"
                          >
                            <FaPlus className="mr-2" />
                            Add More Food
                          </button>
                          <button
                            onClick={() => handlePrintBill(table)}
                            className="w-full bg-purple-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-purple-700 transition-colors flex items-center justify-center"
                          >
                            <FaPrint className="mr-2" />
                            Print Bill
                          </button>
                        </>
                      )}
                      
                      {table.status === 'cleaning' && (
                        <button
                          onClick={() => updateTableStatus(table._id, 'available')}
                          className="w-full bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700 transition-colors"
                        >
                          Mark Available
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Empty State */}
            {tables.length === 0 && (
              <div className="text-center py-12">
                <FaTable className="mx-auto text-6xl text-gray-300 mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No Tables Available</h3>
                <p className="text-gray-500">Contact admin to set up restaurant tables</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Order Modal */}
      <AnimatePresence>
        {showOrderModal && selectedTable && (
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
              className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden"
            >
              {/* Modal Header */}
              <div className="flex justify-between items-center p-6 border-b">
                <h3 className="text-xl font-semibold">
                  Take Order - Table {selectedTable.tableNumber}
                </h3>
                <button
                  onClick={() => setShowOrderModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <FaTimes size={20} />
                </button>
              </div>

              <div className="flex h-[70vh]">
                {/* Food Items */}
                <div className="flex-1 p-6 overflow-y-auto border-r">
                  <h4 className="font-semibold mb-4">Menu Items</h4>
                  
                  {/* Search Bar */}
                  <div className="mb-4">
                    <SearchBar 
                      allItems={foodItems} 
                      onSearchResults={handleSearchResults}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {filteredFoodItems.map((item) => (
                      <div
                        key={item._id}
                        className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => addItemToOrder(item)}
                      >
                        <h5 className="font-medium">{item.name}</h5>
                        <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                        <div className="flex justify-between items-center">
                          <span className="font-semibold text-green-600">£{item.price}</span>
                          <button className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700">
                            Add
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Order Summary */}
                <div className="w-80 p-6 bg-gray-50">
                  <h4 className="font-semibold mb-4">Order Summary</h4>
                  
                  {/* Customer Info */}
                  <div className="mb-4 space-y-2">
                    <textarea
                      placeholder="Special Notes"
                      value={customerInfo.notes}
                      onChange={(e) => setCustomerInfo({...customerInfo, notes: e.target.value})}
                      className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 h-20 resize-none"
                    />
                  </div>

                  {/* Order Items */}
                  <div className="space-y-2 mb-4 max-h-40 overflow-y-auto">
                    {orderItems.map((item) => (
                      <div key={item.food._id} className="flex justify-between items-center bg-white p-2 rounded">
                        <div className="flex-1">
                          <div className="font-medium text-sm">{item.food.name}</div>
                          <div className="text-xs text-gray-600">£{item.price} each</div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => updateItemQuantity(item.food._id, item.quantity - 1)}
                            className="w-6 h-6 bg-gray-200 rounded text-xs hover:bg-gray-300"
                          >
                            -
                          </button>
                          <span className="text-sm font-medium">{item.quantity}</span>
                          <button
                            onClick={() => updateItemQuantity(item.food._id, item.quantity + 1)}
                            className="w-6 h-6 bg-gray-200 rounded text-xs hover:bg-gray-300"
                          >
                            +
                          </button>
                          <button
                            onClick={() => removeItemFromOrder(item.food._id)}
                            className="text-red-600 hover:text-red-800 ml-2"
                          >
                            <FaTimes size={12} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Total */}
                  <div className="border-t pt-4 mb-4">
                    <div className="flex justify-between items-center font-semibold text-lg">
                      <span>Total:</span>
                      <span>£{calculateTotal().toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    onClick={submitOrder}
                    disabled={orderItems.length === 0}
                    className="w-full bg-green-600 text-white py-3 rounded font-medium hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    <FaShoppingCart className="mr-2" />
                    Submit Order
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add More Food Modal */}
      <AnimatePresence>
        {showAddMoreModal && selectedTable && (
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
              className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden"
            >
              {/* Modal Header */}
              <div className="flex justify-between items-center p-6 border-b">
                <h3 className="text-xl font-semibold">
                  Add More Food - Table {selectedTable.tableNumber}
                </h3>
                <button
                  onClick={() => setShowAddMoreModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <FaTimes size={20} />
                </button>
              </div>

              <div className="flex h-[70vh]">
                {/* Food Items */}
                <div className="flex-1 p-6 overflow-y-auto border-r">
                  <h4 className="font-semibold mb-4">Menu Items</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {foodItems.map((item) => (
                      <div
                        key={item._id}
                        className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => addItemToAddMore(item)}
                      >
                        <h5 className="font-medium">{item.name}</h5>
                        <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                        <div className="flex justify-between items-center">
                          <span className="font-semibold text-green-600">£{item.price}</span>
                          <button className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700">
                            Add
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Add More Items Summary */}
                <div className="w-80 p-6 bg-gray-50">
                  <h4 className="font-semibold mb-4">Additional Items</h4>
                  
                  {/* Current Order Info */}
                  {currentOrder && (
                    <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                      <h5 className="font-medium text-blue-800 mb-1">Current Order</h5>
                      <p className="text-sm text-blue-600">
                        Customer: {currentOrder.deliveryInfo?.name || 'N/A'}
                      </p>
                      <p className="text-sm text-blue-600">
                        Total: £{currentOrder.totalAmount?.toFixed(2) || '0.00'}
                      </p>
                    </div>
                  )}

                  {/* Add More Items */}
                  <div className="space-y-2 mb-4 max-h-40 overflow-y-auto">
                    {addMoreItems.map((item) => (
                      <div key={item.food._id} className="flex justify-between items-center bg-white p-2 rounded">
                        <div className="flex-1">
                          <div className="font-medium text-sm">{item.food.name}</div>
                          <div className="text-xs text-gray-600">£{item.price} each</div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => updateAddMoreItemQuantity(item.food._id, item.quantity - 1)}
                            className="w-6 h-6 bg-gray-200 rounded text-xs hover:bg-gray-300"
                          >
                            -
                          </button>
                          <span className="text-sm font-medium">{item.quantity}</span>
                          <button
                            onClick={() => updateAddMoreItemQuantity(item.food._id, item.quantity + 1)}
                            className="w-6 h-6 bg-gray-200 rounded text-xs hover:bg-gray-300"
                          >
                            +
                          </button>
                          <button
                            onClick={() => removeItemFromAddMore(item.food._id)}
                            className="text-red-600 hover:text-red-800 ml-2"
                          >
                            <FaTimes size={12} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Additional Items Total */}
                  <div className="border-t pt-4 mb-4">
                    <div className="flex justify-between items-center font-semibold text-lg">
                      <span>Additional Total:</span>
                      <span>£{calculateAddMoreTotal().toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    onClick={submitAddMoreItems}
                    disabled={addMoreItems.length === 0}
                    className="w-full bg-green-600 text-white py-3 rounded font-medium hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    <FaPlus className="mr-2" />
                    Add Items to Order
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Tables;
