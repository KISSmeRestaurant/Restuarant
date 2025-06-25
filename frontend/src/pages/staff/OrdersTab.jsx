import { useState } from 'react';
import React from 'react';

const OrdersTab = ({ orders, updateOrderStatus, darkMode }) => {
  const [expandedOrder, setExpandedOrder] = useState(null);

  const toggleExpand = (orderId) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  return (
    <div className={`rounded-xl shadow-lg overflow-hidden ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
      <div className={`px-6 py-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <h3 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Order Management
          <span className="ml-2 text-sm font-normal text-gray-500">
            ({orders.length} total orders)
          </span>
        </h3>
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
            {orders.map((order) => (
              <React.Fragment key={order._id}>
                <tr 
                  className={`hover:${darkMode ? 'bg-gray-700' : 'bg-gray-50'} cursor-pointer`}
                  onClick={() => toggleExpand(order._id)}
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
                      darkMode ? 'bg-gray-600 text-gray-200' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={order.status}
                      onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                      className={`rounded-md p-1 text-sm ${darkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white border-gray-300'}`}
                      onClick={(e) => e.stopPropagation()} // Prevent row toggle when clicking select
                    >
                      <option value="pending">Pending</option>
                      <option value="preparing">Preparing</option>
                      <option value="ready">Ready</option>
                      <option value="delivered">Delivered</option>
                    </select>
                  </td>
                </tr>
                
                {expandedOrder === order._id && (
                  <tr className={darkMode ? 'bg-gray-700' : 'bg-gray-50'}>
                    <td colSpan="5" className="px-6 py-4">
                      <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-600' : 'bg-gray-100'}`}>
                        <h4 className={`font-medium mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          Order Details
                        </h4>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h5 className={`font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                              Order Items
                            </h5>
                            <ul className="space-y-2">
                              {order.items.map((item) => (
                                <li 
                                  key={`${order._id}-${item.food?._id || item.name}`} 
                                  className="flex justify-between"
                                >
                                  <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                                    {item.food?.name || 'Item'} × {item.quantity}
                                  </span>
                                  <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>
                                    ${(item.food?.price * item.quantity).toFixed(2) || '0.00'}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          </div>
                          
                          <div>
                            <h5 className={`font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                              Delivery Information
                            </h5>
                            <div className={`space-y-1 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                              <p>Name: {order.deliveryInfo?.name || 'N/A'}</p>
                              <p>Phone: {order.deliveryInfo?.phone || 'N/A'}</p>
                              <p>Address: {order.deliveryInfo?.address || 'N/A'}</p>
                              {order.deliveryInfo?.instructions && (
                                <p>Instructions: {order.deliveryInfo.instructions}</p>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className={`mt-3 pt-3 border-t ${darkMode ? 'border-gray-500' : 'border-gray-200'}`}>
                          <div className="flex justify-between">
                            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                              Order placed at: {new Date(order.createdAt).toLocaleString()}
                            </p>
                            <p className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                              Total: ${order.totalAmount?.toFixed(2) || '0.00'}
                            </p>
                          </div>
                          {order.notes && (
                            <p className={`mt-1 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                              <span className="font-medium">Notes:</span> {order.notes}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
      
      {orders.length === 0 && (
        <div className={`p-8 text-center ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          No orders found
        </div>
      )}
    </div>
  );
};

export default OrdersTab;