import express from 'express';
import Reservation from '../models/Reservation.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Create reservation
router.post('/', auth, async (req, res) => {
  try {
    const reservation = new Reservation({
      ...req.body,
      user: req.user.id
    });

    await reservation.save();
    res.status(201).send(reservation);
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

// Get booked slots for a specific date (public endpoint)
router.get('/booked-slots', async (req, res) => {
  try {
    const { date } = req.query;
    
    if (!date) {
      return res.status(400).send({ error: 'Date is required' });
    }

    // Create start and end of day for the given date
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    // Find all reservations for the specified date
    const reservations = await Reservation.find({
      date: {
        $gte: startOfDay,
        $lte: endOfDay
      },
      status: { $ne: 'cancelled' } // Exclude cancelled reservations
    }).select('time');

    // Extract just the time slots that are booked
    const bookedSlots = reservations.map(reservation => ({
      time: reservation.time
    }));

    res.send({ bookedSlots });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

// Get all reservations (for admin/staff)
router.get('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'staff') {
      return res.status(403).send({ error: 'Not authorized' });
    }

    const reservations = await Reservation.find().populate('user', 'name email');
    res.send(reservations);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

// Get user's own reservations
router.get('/my-reservations', auth, async (req, res) => {
  try {
    const reservations = await Reservation.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.send(reservations);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

// Update reservation status (admin/staff only)
router.patch('/:id/status', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'staff') {
      return res.status(403).send({ error: 'Not authorized' });
    }

    const { status } = req.body;
    const reservation = await Reservation.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!reservation) {
      return res.status(404).send({ error: 'Reservation not found' });
    }

    res.send(reservation);
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

export default router;
