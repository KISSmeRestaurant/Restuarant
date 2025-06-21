import express from 'express';
import Reservation from '../models/Reservation.js';
import { auth } from '../middleware/auth.js'; // ✅ FIXED IMPORT

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

export default router;
