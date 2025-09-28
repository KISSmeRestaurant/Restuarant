import { FaLock, FaUserShield } from 'react-icons/fa';

const LockedTab = ({ tabName, message }) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
      <div className="text-center">
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-gray-200 mb-4">
          <FaLock className="h-8 w-8 text-gray-500" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {tabName} Access Restricted
        </h3>
        <p className="text-sm text-gray-600 mb-4 max-w-md">
          {message || `You don't have permission to access the ${tabName} section. Please contact your administrator to request access.`}
        </p>
        <div className="flex items-center justify-center text-xs text-gray-500">
          <FaUserShield className="mr-1" />
          <span>Contact Administrator for Access</span>
        </div>
      </div>
    </div>
  );
};

export default LockedTab;
