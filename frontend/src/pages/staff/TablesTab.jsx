import { useState, useEffect } from 'react';
import API_CONFIG from '../../config/api';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaTable,
  FaUsers,
  FaPlus,
  FaTimes,
  FaUtensils,
  FaShoppingCart,
  FaCheck,
  FaClock
} from 'react-icons/fa';

const TablesTab = ({ darkMode }) => {
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
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    phone: '',
    notes: ''
  });

  // Fetch tables and food items
  useEffect(() => {
    fetchTables();
    fetchFoodItems();
  }, []);

  const fetchTables = async () => {
    try {
      const token = localStorage.getItem('token');
      const baseUrl = API_CONFIG.BASE_URL;
      const response = await fetch(`${baseUrl}/tables`, {
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
    } finally {
      setLoading(false);
    }
  };

  const fetchFoodItems = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_CONFIG.BASE_URL}/foods`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch food items');
      }

      const data = await response.json();
      setFoodItems(data || []);
    } catch (err) {
      console.error('Error fetching food items:', err);
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
    setCustomerInfo({ name: '', phone: '', notes: '' });
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

    if (!customerInfo.name.trim()) {
      alert('Please enter customer name');
      return;
    }

    try {
      const token = localStorage.getItem('token');

      // Create order
      const orderData = {
        items: orderItems.map(item => ({
          food: item.food._id,
          quantity: item.quantity,
          price: item.price
        })),
        deliveryInfo: {
          name: customerInfo.name,
          phone: customerInfo.phone,
          notes: customerInfo.notes,
          deliveryType: 'dine-in'
        },
        orderType: 'dine-in',
        table: selectedTable._id,
        totalAmount: calculateTotal()
      };

      const response = await fetch(`${API_CONFIG.BASE_URL}/orders`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(orderData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create order');
      }

      const order = await response.json();

      // Update table status
      const baseUrl = API_CONFIG.BASE_URL;
      await fetch(`${baseUrl}/tables/${selectedTable._id}/assign-order`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ orderId: order._id })
      });

      // Refresh tables
      await fetchTables();

      // Close modal
      setShowOrderModal(false);
      setSelectedTable(null);

      alert('Order created successfully!');
    } catch (err) {
      setError(err.message);
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
      const token = localStorage.getItem('token');
      const baseUrl = API_CONFIG.BASE_URL;

      const itemsData = addMoreItems.map(item => ({
        food: item.food._id,
        quantity: item.quantity,
        price: item.price
      }));

      const response = await fetch(`${baseUrl}/tables/${selectedTable._id}/add-items`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
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
    }
  };

  // Update table status
  const updateTableStatus = async (tableId, status) => {
    try {
      const token = localStorage.getItem('token');
      const baseUrl = API_CONFIG.BASE_URL;
      const response = await fetch(`${baseUrl}/tables/${tableId}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      });

      if (!response.ok) {
        throw new Error('Failed to update table status');
      }

      await fetchTables();
    } catch (err) {
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
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className={`rounded-xl shadow-lg overflow-hidden ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
      {/* Header */}
      <div className={`px-6 py-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <h3 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Restaurant Tables
          <span className="ml-2 text-sm font-normal text-gray-500">
            ({tables.length} total tables)
          </span>
        </h3>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mx-6 mt-4 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded">
          <p>{error}</p>
        </div>
      )}

      {/* Tables Grid */}
      <div className="p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {tables.map((table) => (
            <motion.div
              key={table._id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.02 }}
              className={`relative p-4 rounded-lg border-2 transition-all cursor-pointer ${getStatusColor(table.status)}`}
            >
              <div className="text-center">
                <div className="flex justify-center mb-2">
                  {getStatusIcon(table.status)}
                </div>

                <h4 className="font-semibold text-lg mb-1">
                  Table {table.tableNumber}
                </h4>

                <div className="flex items-center justify-center text-sm mb-2">
                  <FaUsers className="mr-1" />
                  <span>{table.capacity} seats</span>
                </div>

                <div className="text-xs mb-3 capitalize">
                  {table.location}
                </div>

                <div className={`text-xs font-medium px-2 py-1 rounded-full ${getStatusColor(table.status)}`}>
                  {table.status}
                </div>

                {/* Action Buttons */}
                <div className="mt-3 space-y-1">
                  {table.status === 'available' && (
                    <button
                      onClick={() => handleTakeOrder(table)}
                      className="w-full bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700 transition-colors flex items-center justify-center"
                    >
                      <FaPlus className="mr-1" />
                      Take Order
                    </button>
                  )}

                  {table.status === 'occupied' && (
                    <>
                      <button
                        onClick={() => handleAddMoreFood(table)}
                        className="w-full bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-700 transition-colors flex items-center justify-center"
                      >
                        <FaPlus className="mr-1" />
                        Add More Food
                      </button>
                      <button
                        onClick={() => updateTableStatus(table._id, 'cleaning')}
                        className="w-full bg-yellow-600 text-white px-3 py-1 rounded text-xs hover:bg-yellow-700 transition-colors"
                      >
                        Mark for Cleaning
                      </button>
                    </>
                  )}

                  {table.status === 'cleaning' && (
                    <button
                      onClick={() => updateTableStatus(table._id, 'available')}
                      className="w-full bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-700 transition-colors"
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {foodItems.map((item) => (
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
                    <input
                      type="text"
                      placeholder="Customer Name *"
                      value={customerInfo.name}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                      className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      placeholder="Phone Number"
                      value={customerInfo.phone}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                      className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <textarea
                      placeholder="Special Notes"
                      value={customerInfo.notes}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, notes: e.target.value })}
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

export default TablesTab;
