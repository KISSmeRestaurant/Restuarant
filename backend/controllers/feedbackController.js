import Feedback from '../models/Feedback.js';

// Submit feedback (public route - no authentication required)
export const submitFeedback = async (req, res) => {
  try {
    const { customerName, customerEmail, rating, message, orderId } = req.body;

    // Validate required fields
    if (!customerName || !customerEmail || !rating || !message) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide all required fields: name, email, rating, and message'
      });
    }

    // Validate rating
    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        status: 'fail',
        message: 'Rating must be between 1 and 5'
      });
    }

    // Create feedback
    const feedback = await Feedback.create({
      customerName,
      customerEmail,
      rating,
      message,
      orderId: orderId || null
    });

    res.status(201).json({
      status: 'success',
      message: 'Thank you for your feedback!',
      data: {
        feedback: {
          id: feedback._id,
          customerName: feedback.customerName,
          rating: feedback.rating,
          message: feedback.message,
          createdAt: feedback.createdAt
        }
      }
    });
  } catch (err) {
    console.error('Error submitting feedback:', err);
    res.status(500).json({
      status: 'error',
      message: 'Failed to submit feedback. Please try again.'
    });
  }
};

// Get public feedback for display on home page
export const getPublicFeedback = async (req, res) => {
  try {
    const { limit = 6 } = req.query;

    // Get recent feedback with good ratings (4-5 stars) for public display
    const feedback = await Feedback.find({
      rating: { $gte: 4 }
    })
    .select('customerName rating message createdAt')
    .sort({ createdAt: -1 })
    .limit(parseInt(limit));

    res.status(200).json({
      status: 'success',
      results: feedback.length,
      data: feedback
    });
  } catch (err) {
    console.error('Error fetching public feedback:', err);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch feedback'
    });
  }
};

// Get all feedback (admin/staff only)
export const getAllFeedback = async (req, res) => {
  try {
    const { page = 1, limit = 10, rating, sortBy = 'createdAt' } = req.query;
    
    // Build filter
    const filter = {};
    if (rating) {
      filter.rating = parseInt(rating);
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get feedback with pagination
    const feedback = await Feedback.find(filter)
      .sort({ [sortBy]: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const total = await Feedback.countDocuments(filter);

    res.status(200).json({
      status: 'success',
      results: feedback.length,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit),
      data: feedback
    });
  } catch (err) {
    console.error('Error fetching all feedback:', err);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch feedback'
    });
  }
};

// Get feedback statistics
export const getFeedbackStats = async (req, res) => {
  try {
    const stats = await Feedback.aggregate([
      {
        $group: {
          _id: null,
          totalFeedback: { $sum: 1 },
          averageRating: { $avg: '$rating' },
          ratingDistribution: {
            $push: '$rating'
          }
        }
      },
      {
        $project: {
          _id: 0,
          totalFeedback: 1,
          averageRating: { $round: ['$averageRating', 1] },
          ratingDistribution: 1
        }
      }
    ]);

    // Calculate rating distribution
    const ratingCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    if (stats.length > 0) {
      stats[0].ratingDistribution.forEach(rating => {
        ratingCounts[rating]++;
      });
    }

    const result = stats.length > 0 ? {
      ...stats[0],
      ratingDistribution: ratingCounts
    } : {
      totalFeedback: 0,
      averageRating: 0,
      ratingDistribution: ratingCounts
    };

    res.status(200).json({
      status: 'success',
      data: result
    });
  } catch (err) {
    console.error('Error fetching feedback stats:', err);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch feedback statistics'
    });
  }
};

// Respond to feedback (staff only)
export const respondToFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    const { staffResponse } = req.body;

    if (!staffResponse) {
      return res.status(400).json({
        status: 'fail',
        message: 'Staff response is required'
      });
    }

    const feedback = await Feedback.findByIdAndUpdate(
      id,
      {
        staffResponse,
        respondedAt: new Date()
      },
      { new: true, runValidators: true }
    );

    if (!feedback) {
      return res.status(404).json({
        status: 'fail',
        message: 'Feedback not found'
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Response added successfully',
      data: feedback
    });
  } catch (err) {
    console.error('Error responding to feedback:', err);
    res.status(500).json({
      status: 'error',
      message: 'Failed to respond to feedback'
    });
  }
};
