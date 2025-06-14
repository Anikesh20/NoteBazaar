const express = require('express');
const auth = require('../middleware/auth');
const { confirmPayment, createPaymentIntent } = require('../stripe');
// const twilio = require('twilio');

const router = express.Router();

// Initialize Twilio - temporarily disabled
// const twilioClient = twilio(
//   process.env.TWILIO_ACCOUNT_SID,
//   process.env.TWILIO_AUTH_TOKEN
// );

// Create a payment intent
router.post('/create-payment-intent', auth, async (req, res) => {
  try {
    const { amount } = req.body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    const paymentIntent = await createPaymentIntent(amount);
    
    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });
  } catch (error) {
    console.error('Payment intent creation error:', error);
    res.status(500).json({ 
      error: 'Failed to create payment intent',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Confirm a payment
router.post('/confirm-payment', auth, async (req, res) => {
  try {
    const { paymentIntentId } = req.body;
    console.log('Payment confirmation request received:', { paymentIntentId });
    
    if (!paymentIntentId) {
      return res.status(400).json({ error: 'Payment intent ID is required' });
    }

    const paymentIntent = await confirmPayment(paymentIntentId);
    console.log('Payment intent status:', paymentIntent.status);
    
    if (paymentIntent.status === 'succeeded') {
      res.json({
        success: true,
        paymentIntent
      });
    } else {
      console.log('Payment not successful:', paymentIntent.status);
      res.status(400).json({
        success: false,
        error: 'Payment not successful',
        status: paymentIntent.status
      });
    }
  } catch (error) {
    console.error('Error confirming payment:', error);
    res.status(500).json({ error: 'Failed to confirm payment' });
  }
});

module.exports = router; 