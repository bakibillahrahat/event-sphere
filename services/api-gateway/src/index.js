const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const PORT = process.env.PORT || 3000;

// Service URLs
const services = {
  user: process.env.USER_SERVICE_URL || 'http://user-service:3000',
  event: process.env.EVENT_SERVICE_URL || 'http://event-service:3000',
  booking: process.env.BOOKING_SERVICE_URL || 'http://booking-service:3000',
  notification: process.env.NOTIFICATION_SERVICE_URL || 'http://notification-service:3000',
  payment: process.env.PAYMENT_SERVICE_URL || 'http://payment-service:3000',
  analytics: process.env.ANALYTICS_SERVICE_URL || 'http://analytics-service:3000'
};

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000 // limit each IP to 1000 requests per windowMs
});

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(limiter);
app.use(express.json({ limit: '10mb' }));

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy', 
    service: 'api-gateway',
    timestamp: new Date().toISOString(),
    services: Object.keys(services)
  });
});

// Route to microservices
app.use('/api/users', createProxyMiddleware({
  target: services.user,
  changeOrigin: true,
  pathRewrite: {
    '^/api/users': '/api/users'
  }
}));

app.use('/api/auth', createProxyMiddleware({
  target: services.user,
  changeOrigin: true,
  pathRewrite: {
    '^/api/auth': '/api/auth'
  }
}));

app.use('/api/events', createProxyMiddleware({
  target: services.event,
  changeOrigin: true,
  pathRewrite: {
    '^/api/events': '/api/events'
  }
}));

app.use('/api/categories', createProxyMiddleware({
  target: services.event,
  changeOrigin: true,
  pathRewrite: {
    '^/api/categories': '/api/categories'
  }
}));

app.use('/api/bookings', createProxyMiddleware({
  target: services.booking,
  changeOrigin: true,
  pathRewrite: {
    '^/api/bookings': '/api/bookings'
  }
}));

app.use('/api/notifications', createProxyMiddleware({
  target: services.notification,
  changeOrigin: true,
  pathRewrite: {
    '^/api/notifications': '/api/notifications'
  }
}));

app.use('/api/payments', createProxyMiddleware({
  target: services.payment,
  changeOrigin: true,
  pathRewrite: {
    '^/api/payments': '/api/payments'
  }
}));

app.use('/api/analytics', createProxyMiddleware({
  target: services.analytics,
  changeOrigin: true,
  pathRewrite: {
    '^/api/analytics': '/api/analytics'
  }
}));

// Default route
app.get('/', (req, res) => {
  res.json({
    message: 'EventSphere API Gateway',
    version: '1.0.0',
    services: Object.keys(services),
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      events: '/api/events',
      categories: '/api/categories',
      bookings: '/api/bookings',
      notifications: '/api/notifications',
      payments: '/api/payments',
      analytics: '/api/analytics'
    }
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    message: 'The requested endpoint does not exist'
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Gateway error:', err);
  res.status(500).json({
    error: 'Gateway error',
    message: 'An error occurred in the API Gateway'
  });
});

app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
  console.log('Available services:', Object.keys(services));
});

module.exports = app;