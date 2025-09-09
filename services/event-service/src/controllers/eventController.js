const Event = require('../models/Event');
const Joi = require('joi');
const axios = require('axios');

const USER_SERVICE_URL = process.env.USER_SERVICE_URL || 'http://localhost:3001';

// Validation schemas
const createEventSchema = Joi.object({
  title: Joi.string().max(200).required(),
  description: Joi.string().max(2000).required(),
  shortDescription: Joi.string().max(300).optional(),
  category: Joi.string().required(),
  dateTime: Joi.object({
    start: Joi.date().required(),
    end: Joi.date().greater(Joi.ref('start')).required()
  }).required(),
  location: Joi.object({
    venue: Joi.string().required(),
    address: Joi.string().required(),
    city: Joi.string().required(),
    state: Joi.string().required(),
    zipCode: Joi.string().required(),
    country: Joi.string().optional(),
    coordinates: Joi.object({
      lat: Joi.number().optional(),
      lng: Joi.number().optional()
    }).optional()
  }).required(),
  pricing: Joi.object({
    type: Joi.string().valid('free', 'paid').required(),
    amount: Joi.number().min(0).optional(),
    currency: Joi.string().optional()
  }).required(),
  capacity: Joi.object({
    total: Joi.number().min(1).required()
  }).required(),
  images: Joi.array().items(Joi.object({
    url: Joi.string().uri().required(),
    alt: Joi.string().optional(),
    isPrimary: Joi.boolean().optional()
  })).optional(),
  tags: Joi.array().items(Joi.string()).optional(),
  isPublic: Joi.boolean().optional(),
  requirements: Joi.object({
    ageLimit: Joi.object({
      min: Joi.number().optional(),
      max: Joi.number().optional()
    }).optional(),
    specialRequirements: Joi.array().items(Joi.string()).optional()
  }).optional(),
  socialLinks: Joi.object({
    website: Joi.string().uri().optional(),
    facebook: Joi.string().uri().optional(),
    twitter: Joi.string().uri().optional(),
    instagram: Joi.string().uri().optional()
  }).optional(),
  registrationDeadline: Joi.date().optional()
});

// Helper function to verify user token
const verifyUser = async (token) => {
  try {
    const response = await axios.post(`${USER_SERVICE_URL}/api/auth/verify-token`, {}, {
      headers: { Authorization: token }
    });
    return response.data;
  } catch (error) {
    throw new Error('Invalid user token');
  }
};

// Create new event
exports.createEvent = async (req, res) => {
  try {
    const { error, value } = createEventSchema.validate(req.body);
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
    
    // Set available capacity to total capacity initially
    value.capacity.available = value.capacity.total;
    value.organizer = userInfo.user._id;

    const event = new Event(value);
    await event.save();
    await event.populate('category');

    res.status(201).json({
      message: 'Event created successfully',
      event
    });
  } catch (error) {
    console.error('Create event error:', error);
    if (error.message === 'Invalid user token') {
      return res.status(401).json({ error: error.message });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get all events with filtering and pagination
exports.getEvents = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    let filter = { status: 'published' };

    // Apply filters
    if (req.query.category) filter.category = req.query.category;
    if (req.query.organizer) filter.organizer = req.query.organizer;
    if (req.query.city) filter['location.city'] = new RegExp(req.query.city, 'i');
    if (req.query.search) {
      filter.$text = { $search: req.query.search };
    }
    if (req.query.dateFrom) {
      filter['dateTime.start'] = { $gte: new Date(req.query.dateFrom) };
    }
    if (req.query.dateTo) {
      filter['dateTime.end'] = { $lte: new Date(req.query.dateTo) };
    }
    if (req.query.priceType) {
      filter['pricing.type'] = req.query.priceType;
    }

    const events = await Event.find(filter)
      .populate('category')
      .skip(skip)
      .limit(limit)
      .sort({ 'dateTime.start': 1 });

    const total = await Event.countDocuments(filter);

    res.json({
      events,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get event by ID
exports.getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate('category');
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    res.json({ event });
  } catch (error) {
    console.error('Get event by ID error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update event
exports.updateEvent = async (req, res) => {
  try {
    const { error, value } = createEventSchema.validate(req.body);
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
    
    // Check if user owns the event or is admin
    const existingEvent = await Event.findById(req.params.id);
    if (!existingEvent) {
      return res.status(404).json({ error: 'Event not found' });
    }

    if (existingEvent.organizer !== userInfo.user._id && userInfo.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to update this event' });
    }

    const event = await Event.findByIdAndUpdate(
      req.params.id,
      value,
      { new: true, runValidators: true }
    ).populate('category');

    res.json({ 
      message: 'Event updated successfully',
      event 
    });
  } catch (error) {
    console.error('Update event error:', error);
    if (error.message === 'Invalid user token') {
      return res.status(401).json({ error: error.message });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Delete event
exports.deleteEvent = async (req, res) => {
  try {
    // Verify user token
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Authorization token required' });
    }

    const userInfo = await verifyUser(authHeader);
    
    // Check if user owns the event or is admin
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    if (event.organizer !== userInfo.user._id && userInfo.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to delete this event' });
    }

    await Event.findByIdAndDelete(req.params.id);

    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Delete event error:', error);
    if (error.message === 'Invalid user token') {
      return res.status(401).json({ error: error.message });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update event capacity (used by booking service)
exports.updateCapacity = async (req, res) => {
  try {
    const { available } = req.body;
    
    if (typeof available !== 'number' || available < 0) {
      return res.status(400).json({ error: 'Invalid available capacity' });
    }

    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    if (available > event.capacity.total) {
      return res.status(400).json({ error: 'Available capacity cannot exceed total capacity' });
    }

    event.capacity.available = available;
    await event.save();

    res.json({ 
      message: 'Event capacity updated successfully',
      capacity: event.capacity
    });
  } catch (error) {
    console.error('Update capacity error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};