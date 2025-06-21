const FeedbackTab = ({ customerFeedback }) => {
  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Customer Feedback</h3>
      </div>
      <div className="p-6">
        {customerFeedback.length > 0 ? (
          <div className="space-y-4">
            {customerFeedback.map((feedback) => (
              <div key={feedback._id} className="border rounded-lg p-4">
                <div className="flex justify-between">
                  <div className="font-medium">{feedback.customerName}</div>
                  <div className="text-sm text-gray-500">
                    {new Date(feedback.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <div className="mt-2 text-gray-700">{feedback.message}</div>
                <div className="mt-2">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    feedback.rating >= 4 ? 'bg-green-100 text-green-800' :
                    feedback.rating >= 2 ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    Rating: {feedback.rating}/5
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500 py-4">No customer feedback available</div>
        )}
      </div>
    </div>
  );
};

export default FeedbackTab;