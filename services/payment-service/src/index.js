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
app.post('/api/payments/process', (req, res) => {
  const { amount, currency, paymentMethod, bookingId } = req.body;
  
  // Simulate payment processing
  console.log(`Processing payment: $${amount} ${currency} for booking ${bookingId}`);
  
  res.json({
    success: true,
    paymentId: 'pay_' + Date.now(),
    status: 'completed',
    amount,
    currency
  });
});

app.get('/api/payments/:paymentId', (req, res) => {
  res.json({
    paymentId: req.params.paymentId,
    status: 'completed',
    amount: 50.00,
    currency: 'USD',
    createdAt: new Date().toISOString()
  });
});

app.post('/api/payments/:paymentId/refund', (req, res) => {
  res.json({
    success: true,
    refundId: 'ref_' + Date.now(),
    status: 'processed',
    amount: req.body.amount || 50.00
  });
});

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy', 
    service: 'payment-service',
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`Payment Service running on port ${PORT}`);
});

module.exports = app;