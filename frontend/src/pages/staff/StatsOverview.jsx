import { FaUtensils, FaTable } from 'react-icons/fa';
import { MdRateReview } from 'react-icons/md';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const StatsOverview = ({ orders, customerFeedback, darkMode }) => {
  // Calculate order status distribution
  const orderStatusData = {
    pending: orders.filter(o => o.status === 'pending').length,
    preparing: orders.filter(o => o.status === 'preparing').length,
    ready: orders.filter(o => o.status === 'ready').length,
    delivered: orders.filter(o => o.status === 'delivered').length
  };

  // Calculate feedback status distribution
  const feedbackStatusData = {
    unread: customerFeedback.filter(f => !f.read).length,
    read: customerFeedback.filter(f => f.read).length
  };

  // Prepare chart data
  const orderChartData = {
    labels: ['Pending', 'Preparing', 'Ready', 'Delivered'],
    datasets: [{
      label: 'Orders by Status',
      data: Object.values(orderStatusData),
      backgroundColor: [
        'rgba(255, 206, 86, 0.7)',
        'rgba(54, 162, 235, 0.7)',
        'rgba(75, 192, 192, 0.7)',
        'rgba(153, 102, 255, 0.7)'
      ],
      borderColor: [
        'rgba(255, 206, 86, 1)',
        'rgba(54, 162, 235, 1)',
        'rgba(75, 192, 192, 1)',
        'rgba(153, 102, 255, 1)'
      ],
      borderWidth: 1
    }]
  };

  const feedbackChartData = {
    labels: ['Unread', 'Read'],
    datasets: [{
      label: 'Feedback Status',
      data: Object.values(feedbackStatusData),
      backgroundColor: [
        'rgba(255, 99, 132, 0.7)',
        'rgba(75, 192, 192, 0.7)'
      ],
      borderColor: [
        'rgba(255, 99, 132, 1)',
        'rgba(75, 192, 192, 1)'
      ],
      borderWidth: 1
    }]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: darkMode ? '#fff' : '#333'
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          color: darkMode ? '#fff' : '#333'
        },
        grid: {
          color: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
        }
      },
      x: {
        ticks: {
          color: darkMode ? '#fff' : '#333'
        },
        grid: {
          color: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
        }
      }
    }
  };

  return (
    <div className="mb-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className={`rounded-xl p-6 shadow ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="flex items-center">
            <div className={`p-4 rounded-full ${darkMode ? 'bg-blue-900' : 'bg-blue-100'} text-blue-600 mr-4`}>
              <FaUtensils className="text-2xl" />
            </div>
            <div>
              <p className={`text-base font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>Total Orders</p>
              <p className={`text-3xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {orders.length}
              </p>
            </div>
          </div>
        </div>
        
        <div className={`rounded-xl p-6 shadow ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="flex items-center">
            <div className={`p-4 rounded-full ${darkMode ? 'bg-green-900' : 'bg-green-100'} text-green-600 mr-4`}>
              <FaUtensils className="text-2xl" />
            </div>
            <div>
              <p className={`text-base font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>Pending Orders</p>
              <p className={`text-3xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {orders.filter(o => o.status === 'pending').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className={`rounded-xl p-6 shadow ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="flex items-center">
            <div className={`p-4 rounded-full ${darkMode ? 'bg-purple-900' : 'bg-purple-100'} text-purple-600 mr-4`}>
              <MdRateReview className="text-2xl" />
            </div>
            <div>
              <p className={`text-base font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>New Feedback</p>
              <p className={`text-3xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {customerFeedback.length}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className={`rounded-xl p-6 shadow ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <h3 className={`text-lg font-medium mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Order Status Distribution</h3>
          <Bar data={orderChartData} options={chartOptions} />
        </div>
        <div className={`rounded-xl p-6 shadow ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <h3 className={`text-lg font-medium mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Feedback Status Distribution</h3>
          <Bar data={feedbackChartData} options={chartOptions} />
        </div>
      </div>
    </div>
  );
};

export default StatsOverview;