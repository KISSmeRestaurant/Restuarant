const DashboardTab = ({ admin, foodItems }) => {
  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Stats Cards */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm font-medium">Total Food Items</h3>
          <p className="text-2xl font-bold text-gray-800 mt-2">{foodItems.length}</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm font-medium">Admin Since</h3>
          <p className="text-2xl font-bold text-gray-800 mt-2">
            {new Date(admin?.createdAt).toLocaleDateString()}
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm font-medium">Last Login</h3>
          <p className="text-2xl font-bold text-gray-800 mt-2">
            {new Date(admin?.lastLogin).toLocaleDateString()}
          </p>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Admin Information</h3>
        </div>
        <div className="px-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-medium text-gray-500">Full Name</h4>
              <p className="mt-1 text-sm text-gray-900">
                {admin?.firstName} {admin?.lastName}
              </p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500">Email</h4>
              <p className="mt-1 text-sm text-gray-900">
                {admin?.email}
              </p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500">Phone</h4>
              <p className="mt-1 text-sm text-gray-900">
                {admin?.phone || 'Not provided'}
              </p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500">Postcode</h4>
              <p className="mt-1 text-sm text-gray-900">
                {admin?.postcode || 'Not provided'}
              </p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500">Role</h4>
              <p className="mt-1 text-sm text-gray-900 capitalize">
                {admin?.role}
              </p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500">Account Created</h4>
              <p className="mt-1 text-sm text-gray-900">
                {new Date(admin?.createdAt).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardTab;