const Booking = require('../models/Booking');
const Joi = require('joi');
const axios = require('axios');

const USER_SERVICE_URL = process.env.USER_SERVICE_URL || 'http://localhost:3001';
const EVENT_SERVICE_URL = process.env.EVENT_SERVICE_URL || 'http://localhost:3002';

// Validation schema
const createBookingSchema = Joi.object({
  eventId: Joi.string().required(),
  ticketQuantity: Joi.number().min(1).required(),
  attendeeInfo: Joi.array().items(Joi.object({
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    email: Joi.string().email().required(),
    phone: Joi.string().optional(),
    dietaryRequirements: Joi.string().optional(),
    emergencyContact: Joi.object({
      name: Joi.string().optional(),
      phone: Joi.string().optional()
    }).optional()
  })).min(1).required(),
  notes: Joi.string().max(500).optional()
});

// Helper functions
const verifyUser = async (token) => {
  const response = await axios.post(`${USER_SERVICE_URL}/api/auth/verify-token`, {}, {
    headers: { Authorization: token }
  });
  return response.data;
};

const getEvent = async (eventId) => {
  const response = await axios.get(`${EVENT_SERVICE_URL}/api/events/${eventId}`);
  return response.data.event;
};

const updateEventCapacity = async (eventId, newAvailable) => {
  await axios.patch(`${EVENT_SERVICE_URL}/api/events/${eventId}/capacity`, {
    available: newAvailable
  });
};

// Create new booking
exports.createBooking = async (req, res) => {
  try {
    const { error, value } = createBookingSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ 
        error: 'Validation error', 
        details: error.details[0].message 
      });
    }

    // Verify user token
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Authorization token required' });
    }

    const userInfo = await verifyUser(authHeader);
    
    // Get event details
    const event = await getEvent(value.eventId);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Check availability
    if (event.capacity.available < value.ticketQuantity) {
      return res.status(400).json({ error: 'Not enough tickets available' });
    }

    // Calculate total amount
    const totalAmount = event.pricing.type === 'free' ? 0 : event.pricing.amount * value.ticketQuantity;

    // Create booking
    const bookingData = {
      ...value,
      userId: userInfo.user._id,
      totalAmount,
      status: 'confirmed',
      paymentStatus: event.pricing.type === 'free' ? 'completed' : 'pending'
    };

    const booking = new Booking(bookingData);
    await booking.save();

    // Update event capacity
    await updateEventCapacity(value.eventId, event.capacity.available - value.ticketQuantity);

    res.status(201).json({
      message: 'Booking created successfully',
      booking
    });
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get user bookings
exports.getUserBookings = async (req, res) => {
  try {
    // Verify user token
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Authorization token required' });
    }

    const userInfo = await verifyUser(authHeader);
    
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const bookings = await Booking.find({ userId: userInfo.user._id })
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Booking.countDocuments({ userId: userInfo.user._id });

    res.json({
      bookings,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get user bookings error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get booking by ID
exports.getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    res.json({ booking });
  } catch (error) {
    console.error('Get booking by ID error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Cancel booking
exports.cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    if (booking.status === 'cancelled') {
      return res.status(400).json({ error: 'Booking already cancelled' });
    }

    // Update booking status
    booking.status = 'cancelled';
    await booking.save();

    // Get event and update capacity
    const event = await getEvent(booking.eventId);
    await updateEventCapacity(booking.eventId, event.capacity.available + booking.ticketQuantity);

    res.json({ 
      message: 'Booking cancelled successfully',
      booking 
    });
  } catch (error) {
    console.error('Cancel booking error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};