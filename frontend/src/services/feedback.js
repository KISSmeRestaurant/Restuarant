// Feedback API service
const API_BASE_URL = import.meta.env.DEV 
  ? '/api/feedback' 
  : 'https://restuarant-sh57.onrender.com/api/feedback';

// Submit feedback (public - no auth required)
export const submitFeedback = async (feedbackData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(feedbackData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to submit feedback');
    }

    return data;
  } catch (error) {
    console.error('Error submitting feedback:', error);
    throw error;
  }
};

// Get public feedback for home page display
export const getPublicFeedback = async (limit = 6) => {
  try {
    const response = await fetch(`${API_BASE_URL}/public?limit=${limit}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch feedback');
    }

    return data;
  } catch (error) {
    console.error('Error fetching public feedback:', error);
    throw error;
  }
};

// Get all feedback (admin/staff only)
export const getAllFeedback = async (params = {}) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Authentication required');
    }

    const queryParams = new URLSearchParams(params).toString();
    const url = queryParams ? `${API_BASE_URL}/all?${queryParams}` : `${API_BASE_URL}/all`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch feedback');
    }

    return data;
  } catch (error) {
    console.error('Error fetching all feedback:', error);
    throw error;
  }
};

// Get feedback statistics (admin/staff only)
export const getFeedbackStats = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${API_BASE_URL}/stats`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch feedback statistics');
    }

    return data;
  } catch (error) {
    console.error('Error fetching feedback stats:', error);
    throw error;
  }
};

// Respond to feedback (staff only)
export const respondToFeedback = async (feedbackId, staffResponse) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${API_BASE_URL}/${feedbackId}/respond`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ staffResponse }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to respond to feedback');
    }

    return data;
  } catch (error) {
    console.error('Error responding to feedback:', error);
    throw error;
  }
};
