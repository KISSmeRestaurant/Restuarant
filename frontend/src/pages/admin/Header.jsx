import { FaUserCog } from 'react-icons/fa';

const Header = ({ activeTab, admin }) => {
  return (
    <header className="bg-white shadow">
      <div className="px-6 py-4 flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900 capitalize">{activeTab}</h2>
        <div className="flex items-center">
          <FaUserCog className="mr-2 text-gray-600" />
          <span className="text-gray-600">{admin?.firstName} {admin?.lastName}</span>
        </div>
      </div>
    </header>
  );
};

export default Header;
