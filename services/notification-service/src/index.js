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
app.post('/api/notifications/send', (req, res) => {
  const { type, recipient, subject, message } = req.body;
  
  // Simulate sending notification
  console.log(`Sending ${type} notification to ${recipient}: ${subject}`);
  
  res.json({
    success: true,
    message: 'Notification sent successfully',
    notificationId: 'notif_' + Date.now()
  });
});

app.get('/api/notifications/templates', (req, res) => {
  res.json({
    templates: [
      { id: 'welcome', name: 'Welcome Email', type: 'email' },
      { id: 'booking_confirmed', name: 'Booking Confirmation', type: 'email' },
      { id: 'event_reminder', name: 'Event Reminder', type: 'email' },
      { id: 'event_cancelled', name: 'Event Cancellation', type: 'email' }
    ]
  });
});

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy', 
    service: 'notification-service',
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`Notification Service running on port ${PORT}`);
});

module.exports = app;