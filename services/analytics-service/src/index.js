const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());

// Routes
app.get('/api/analytics/dashboard', (req, res) => {
  res.json({
    totalEvents: 156,
    totalBookings: 1243,
    totalRevenue: 87450.50,
    activeUsers: 892,
    popularCategories: [
      { name: 'Technology', count: 45 },
      { name: 'Music', count: 38 },
      { name: 'Sports', count: 32 },
      { name: 'Business', count: 28 }
    ],
    recentActivity: [
      { type: 'booking', message: 'New booking for Tech Conference 2024', timestamp: new Date() },
      { type: 'event', message: 'New event created: Music Festival', timestamp: new Date() }
    ]
  });
});

app.get('/api/analytics/events/:eventId', (req, res) => {
  res.json({
    eventId: req.params.eventId,
    views: 1245,
    bookings: 89,
    revenue: 4450.00,
    conversionRate: 7.15,
    demographics: {
      ageGroups: {
        '18-25': 25,
        '26-35': 35,
        '36-45': 25,
        '46+': 15
      }
    }
  });
});

app.get('/api/analytics/revenue', (req, res) => {
  res.json({
    period: req.query.period || 'month',
    data: [
      { date: '2024-01', amount: 15420.50 },
      { date: '2024-02', amount: 18650.75 },
      { date: '2024-03', amount: 22100.25 }
    ]
  });
});

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy', 
    service: 'analytics-service',
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`Analytics Service running on port ${PORT}`);
});

module.exports = app;