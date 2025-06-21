const LoginModal = ({ setShowLoginModal, navigate }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg max-w-md w-full">
        <h3 className="text-xl font-bold mb-4">Login Required</h3>
        <p className="mb-6">You need to login to add items to your cart.</p>
        <div className="flex justify-end space-x-4">
          <button 
            onClick={() => setShowLoginModal(false)}
            className="px-4 py-2 border border-gray-300 rounded-lg"
          >
            Cancel
          </button>
          <button 
            onClick={() => navigate('/login', { state: { from: '/menu' } })}
            className="px-4 py-2 bg-amber-600 text-white rounded-lg"
          >
            Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;