import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MdRestaurantMenu, 
  MdPhotoCamera, 
  MdEdit, 
  MdDelete, 
  MdAdd, 
  MdClose,
  MdSave,
  MdCancel,
  MdVisibility,
  MdFilterList,
  MdSearch,
  MdFastfood,
  MdLocalDining
} from 'react-icons/md';
import { toast } from 'react-toastify';

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
  const [editingFood, setEditingFood] = useState(null);
  const [showEditFoodForm, setShowEditFoodForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all'); // all, veg, non-veg
  const [filterCategory, setFilterCategory] = useState('all');
  const [viewMode, setViewMode] = useState('table'); // table, grid
  
  const [newFood, setNewFood] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    foodType: 'veg',
    image: null
  });
  
  const [editFood, setEditFood] = useState({
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

  // Handle food editing
  const handleEditFood = (food) => {
    setEditingFood(food);
    setEditFood({
      name: food.name,
      description: food.description || '',
      price: food.price.toString(),
      category: food.category,
      foodType: food.foodType,
      image: null
    });
    setShowEditFoodForm(true);
  };

  const handleUpdateFood = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      
      formData.append('name', editFood.name);
      formData.append('description', editFood.description);
      formData.append('price', editFood.price);
      formData.append('category', editFood.category);
      formData.append('foodType', editFood.foodType);
      
      if (editFood.image) {
        formData.append('image', editFood.image);
      }

      const response = await fetch(`https://restuarant-sh57.onrender.com/api/foods/${editingFood._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update food item');
      }

      const updatedFood = await response.json();
      
      // Update the food items list (this would typically be handled by the parent component)
      toast.success('Food item updated successfully!');
      
      // Reset form
      setEditFood({
        name: '',
        description: '',
        price: '',
        category: '',
        foodType: 'veg',
        image: null
      });
      setEditingFood(null);
      setShowEditFoodForm(false);
      
      // Refresh the page or update the foodItems state
      window.location.reload();
      
    } catch (err) {
      setError(err.message);
      toast.error(`Error updating food item: ${err.message}`);
    }
  };

  // Filter and search functionality
  const getFilteredItems = () => {
    let filtered = [...foodItems];
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(item => item.foodType === filterType);
    }
    
    // Apply category filter
    if (filterCategory !== 'all') {
      filtered = filtered.filter(item => item.category === filterCategory);
    }
    
    return filtered;
  };

  const filteredItems = getFilteredItems();
  const vegItems = filteredItems.filter(item => item.foodType === 'veg');
  const nonVegItems = filteredItems.filter(item => item.foodType === 'non-veg');

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

      {/* Edit Food Form Modal */}
      <AnimatePresence>
        {showEditFoodForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium text-gray-900">Edit Food Item</h3>
                  <button
                    onClick={() => {
                      setShowEditFoodForm(false);
                      setEditingFood(null);
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <MdClose size={24} />
                  </button>
                </div>
              </div>
              
              <div className="px-6 py-4">
                <form onSubmit={handleUpdateFood}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                      <input
                        type="text"
                        value={editFood.name}
                        onChange={(e) => setEditFood({...editFood, name: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                      <input
                        type="number"
                        step="0.01"
                        value={editFood.price}
                        onChange={(e) => setEditFood({...editFood, price: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                      <select
                        value={editFood.category}
                        onChange={(e) => setEditFood({...editFood, category: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      >
                        <option value="">Select Category</option>
                        {categories.map(cat => (
                          <option key={cat._id} value={cat.name}>{cat.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Food Type</label>
                      <select
                        value={editFood.foodType}
                        onChange={(e) => setEditFood({...editFood, foodType: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      >
                        <option value="veg">🥬 Vegetarian</option>
                        <option value="non-veg">🍖 Non-Vegetarian</option>
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Current Image</label>
                      {editingFood?.imageUrl && (
                        <div className="mb-3">
                          <img
                            src={editingFood.imageUrl}
                            alt={editingFood.name}
                            className="h-20 w-20 rounded-lg object-cover border border-gray-200"
                          />
                        </div>
                      )}
                      <label className="block text-sm font-medium text-gray-700 mb-1">Update Image (Optional)</label>
                      <div className="flex items-center">
                        <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-md border border-gray-300 text-sm transition-colors">
                          <MdPhotoCamera className="inline mr-2" />
                          Choose New Image
                          <input
                            type="file"
                            onChange={(e) => setEditFood({...editFood, image: e.target.files[0]})}
                            className="hidden"
                            accept="image/*"
                          />
                        </label>
                        {editFood.image && (
                          <span className="ml-3 text-sm text-gray-600 truncate max-w-xs">
                            {editFood.image.name}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                      <textarea
                        value={editFood.description}
                        onChange={(e) => setEditFood({...editFood, description: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        rows="3"
                        placeholder="Enter food description..."
                      ></textarea>
                    </div>
                  </div>
                  
                  <div className="mt-6 flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => {
                        setShowEditFoodForm(false);
                        setEditingFood(null);
                      }}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                    >
                      <MdCancel className="inline mr-1" />
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
                    >
                      <MdSave className="inline mr-1" />
                      Update Food Item
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search and Filter Bar */}
      <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <MdFilterList className="mr-2" />
              Search & Filter Food Items
            </h3>
            <div className="text-sm text-gray-500">
              Total: {filteredItems.length} items
            </div>
          </div>
        </div>
        <div className="px-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MdSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search food items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Types</option>
              <option value="veg">🥬 Vegetarian</option>
              <option value="non-veg">🍖 Non-Vegetarian</option>
            </select>
            
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Categories</option>
              {categories.map(cat => (
                <option key={cat._id} value={cat.name}>{cat.name}</option>
              ))}
            </select>
            
            <button
              onClick={() => {
                setSearchTerm('');
                setFilterType('all');
                setFilterCategory('all');
              }}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

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
                        <button 
                          onClick={() => handleEditFood(food)}
                          className="text-blue-600 hover:text-blue-900 mr-4 p-1 rounded transition-colors"
                          title="Edit food item"
                        >
                          <MdEdit className="inline" />
                        </button>
                        <button 
                          onClick={() => handleDeleteFood(food._id)}
                          className="text-red-600 hover:text-red-900 p-1 rounded transition-colors"
                          title="Delete food item"
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
                        <button 
                          onClick={() => handleEditFood(food)}
                          className="text-blue-600 hover:text-blue-900 mr-4 p-1 rounded transition-colors"
                          title="Edit food item"
                        >
                          <MdEdit className="inline" />
                        </button>
                        <button 
                          onClick={() => handleDeleteFood(food._id)}
                          className="text-red-600 hover:text-red-900 p-1 rounded transition-colors"
                          title="Delete food item"
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