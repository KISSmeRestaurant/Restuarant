import { useState } from 'react';
import { motion } from 'framer-motion';
import { MdRestaurantMenu, MdPhotoCamera, MdEdit, MdDelete, MdAdd } from 'react-icons/md';

const FoodManagementTab = ({ 
  foodItems, 
  error, 
  setError,
  handleAddFood,
  handleDeleteFood,
  categories,
  setCategories
}) => {
  const [showAddFoodForm, setShowAddFoodForm] = useState(false);
  const [newFood, setNewFood] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    foodType: 'veg',
    image: null
  });
  const [newCategory, setNewCategory] = useState('');
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryImage, setCategoryImage] = useState(null);

  const handleAddCategory = async () => {
  if (newCategory.trim() && !categories.some(cat => cat.name.toLowerCase() === newCategory.toLowerCase())) {
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      
      formData.append('name', newCategory);
      if (categoryImage) {
        formData.append('image', categoryImage);
      }

      const response = await fetch('https://restuarant-sh57.onrender.com/api/categories', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          // Don't set Content-Type header when using FormData
          // The browser will set it automatically with the correct boundary
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add category');
      }

      const data = await response.json();
      setCategories([...categories, data]);
      setNewCategory('');
      setCategoryImage(null);
      setShowAddCategory(false);
    } catch (err) {
      setError(err.message);
      console.error('Category operation error:', err);
    }
  } else {
    setError('Category name is required or already exists');
  }
};

const handleUpdateCategory = async () => {
  if (newCategory.trim() && editingCategory) {
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      
      formData.append('name', newCategory);
      
      // Important: Check if categoryImage exists and is a File object
      if (categoryImage instanceof File) {
        formData.append('image', categoryImage);
      }

      const response = await fetch(`https://restuarant-sh57.onrender.com/api/categories/${editingCategory._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
          // Don't set Content-Type header - let browser set it with boundary
        },
        body: formData
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to update category');
      }

      const data = await response.json();
      setCategories(categories.map(cat => 
        cat._id === editingCategory._id ? data : cat
      ));

      // Reset form
      setNewCategory('');
      setCategoryImage(null);
      setEditingCategory(null);
      setShowAddCategory(false);
    } catch (err) {
      setError(err.message);
      console.error('Category update error:', err);
    }
  } else {
    setError('Category name is required');
  }
};

  const handleDeleteCategory = async (categoryId) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`https://restuarant-sh57.onrender.com/api/categories/${categoryId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to delete category');
        }

        setCategories(categories.filter(cat => cat._id !== categoryId));
        
        if (newFood.category === categories.find(c => c._id === categoryId)?.name) {
          setNewFood({...newFood, category: ''});
        }
      } catch (err) {
        setError(err.message);
        console.error('Delete category error:', err);
      }
    }
  };

  const handleEditCategory = (category) => {
    setEditingCategory(category);
    setNewCategory(category.name);
    setShowAddCategory(true);
    setCategoryImage(null);
  };

  const vegItems = foodItems.filter(item => item.foodType === 'veg');
  const nonVegItems = foodItems.filter(item => item.foodType === 'non-veg');

  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Food Items</h2>
        <button
          onClick={() => setShowAddFoodForm(!showAddFoodForm)}
          className="bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-md flex items-center text-sm"
        >
          <MdRestaurantMenu className="mr-2" />
          {showAddFoodForm ? 'Cancel' : 'Add New Food'}
        </button>
      </div>

      {showAddFoodForm && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="bg-white shadow rounded-lg overflow-hidden mb-6"
        >
          <div className="px-6 py-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Food Item</h3>
            <form onSubmit={(e) => handleAddFood(e, newFood, setNewFood, setShowAddFoodForm)}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    value={newFood.name}
                    onChange={(e) => setNewFood({...newFood, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                  <input
                    type="number"
                    value={newFood.price}
                    onChange={(e) => setNewFood({...newFood, price: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <div className="flex items-center space-x-2">
                    <select
                      value={newFood.category}
                      onChange={(e) => setNewFood({...newFood, category: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      required
                    >
                      <option value="">Select Category</option>
                      {categories.map(cat => (
                        <option key={cat._id} value={cat.name}>{cat.name}</option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddCategory(!showAddCategory);
                        setEditingCategory(null);
                        setNewCategory('');
                      }}
                      className="bg-gray-200 hover:bg-gray-300 p-2 rounded-md text-sm"
                    >
                      <MdAdd />
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Food Type</label>
                  <select
                    value={newFood.foodType}
                    onChange={(e) => setNewFood({...newFood, foodType: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    required
                  >
                    <option value="veg">Vegetarian</option>
                    <option value="non-veg">Non-Vegetarian</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Image</label>
                  <div className="flex items-center">
                    <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-md border border-gray-300 text-xs">
                      <MdPhotoCamera className="inline mr-1" />
                      Choose File
                      <input
                        type="file"
                        onChange={(e) => setNewFood({...newFood, image: e.target.files[0]})}
                        className="hidden"
                        accept="image/*"
                      />
                    </label>
                    {newFood.image && (
                      <span className="ml-2 text-xs text-gray-600 truncate max-w-xs">
                        {newFood.image.name}
                      </span>
                    )}
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={newFood.description}
                    onChange={(e) => setNewFood({...newFood, description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    rows="3"
                  ></textarea>
                </div>
              </div>
              <div className="mt-6">
                <button
                  type="submit"
                  className="bg-pink-600 hover:bg-pink-700 text-white px-6 py-2 rounded-md text-sm"
                >
                  Add Food Item
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      )}

      <div className="bg-white shadow rounded-lg overflow-hidden mb-8">
        <div className="px-6 py-4 border-b border-gray-200 bg-blue-50">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-blue-800">Food Categories ({categories.length})</h3>
            <button
              onClick={() => {
                setShowAddCategory(true);
                setEditingCategory(null);
                setNewCategory('');
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md text-sm flex items-center"
            >
              <MdAdd className="mr-1" />
              Add Category
            </button>
          </div>
        </div>
        <div className="p-6">
          {showAddCategory && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="text-lg font-medium text-gray-800 mb-3">
                {editingCategory ? 'Edit Category' : 'Add New Category'}
              </h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category Name</label>
                  <input
                    type="text"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    placeholder="Enter category name"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category Image</label>
                  <div className="flex items-center">
                    <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-md border border-gray-300 text-xs">
                      <MdPhotoCamera className="inline mr-1" />
                      Choose Image
                      <input
                        type="file"
                        onChange={(e) => setCategoryImage(e.target.files[0])}
                        className="hidden"
                        accept="image/*"
                      />
                    </label>
                    {categoryImage ? (
                      <span className="ml-2 text-xs text-gray-600 truncate max-w-xs">
                        {categoryImage.name}
                      </span>
                    ) : editingCategory?.imageUrl ? (
                      <span className="ml-2 text-xs text-gray-600">Current image will be kept</span>
                    ) : null}
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={editingCategory ? handleUpdateCategory : handleAddCategory}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm"
                  >
                    {editingCategory ? 'Update' : 'Add'} Category
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddCategory(false);
                      setNewCategory('');
                      setCategoryImage(null);
                      setEditingCategory(null);
                    }}
                    className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-md text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {categories.map(category => (
              <div key={category._id} className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <div className="relative h-32 w-full bg-gray-100">
                  {category.imageUrl ? (
                    <img
                      src={category.imageUrl}
                      alt={category.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "/default-food.jpg";
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-r from-gray-100 to-gray-50">
                      <span className="text-gray-400 text-sm">No image</span>
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium text-gray-800 capitalize">{category.name}</h4>
                    <div className="flex space-x-1">
                      <button
                        onClick={() => handleEditCategory(category)}
                        className="text-blue-600 hover:text-blue-800 p-1"
                        title="Edit"
                      >
                        <MdEdit size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(category._id)}
                        className="text-red-600 hover:text-red-800 p-1"
                        title="Delete"
                      >
                        <MdDelete size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-8">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-green-50">
            <h3 className="text-lg font-medium text-green-800">Vegetarian Items ({vegItems.length})</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Image
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {vegItems.length > 0 ? (
                  vegItems.map((food) => (
                    <tr key={food._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {food.imageUrl ? (
                          <img
                            src={food.imageUrl}
                            alt={food.name}
                            className="h-12 w-12 rounded-full object-cover"
                            onError={(e) => {
                              e.target.onerror = null; 
                              e.target.src = "https://via.placeholder.com/100";
                            }}
                          />
                        ) : (
                          <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
                            <MdRestaurantMenu className="text-gray-400" />
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{food.name}</div>
                        <div className="text-sm text-gray-500">{food.description}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 capitalize">
                          {food.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${food.price}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button className="text-blue-600 hover:text-blue-900 mr-4">
                          <MdEdit className="inline" />
                        </button>
                        <button 
                          onClick={() => handleDeleteFood(food._id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <MdDelete className="inline" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                      No vegetarian items found. Add some to get started!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-red-50">
            <h3 className="text-lg font-medium text-red-800">Non-Vegetarian Items ({nonVegItems.length})</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Image
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {nonVegItems.length > 0 ? (
                  nonVegItems.map((food) => (
                    <tr key={food._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {food.imageUrl ? (
                          <img
                            src={food.imageUrl}
                            alt={food.name}
                            className="h-12 w-12 rounded-full object-cover"
                            onError={(e) => {
                              e.target.onerror = null; 
                              e.target.src = "https://via.placeholder.com/100";
                            }}
                          />
                        ) : (
                          <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
                            <MdRestaurantMenu className="text-gray-400" />
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{food.name}</div>
                        <div className="text-sm text-gray-500">{food.description}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 capitalize">
                          {food.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${food.price}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button className="text-blue-600 hover:text-blue-900 mr-4">
                          <MdEdit className="inline" />
                        </button>
                        <button 
                          onClick={() => handleDeleteFood(food._id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <MdDelete className="inline" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                      No non-vegetarian items found. Add some to get started!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FoodManagementTab;