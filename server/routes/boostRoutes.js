const express = require('express');
const router  = express.Router();

const {
  getBoostPricing,
  initializeBoost,
  paystackWebhook,
  verifyBoostPayment,
} = require('../controllers/boostController');

const { protect }    = require('../middleware/authMiddleware');
const { authorize }  = require('../middleware/roleMiddleware');

// Webhook — must use raw body for signature verification
// express.raw applied here so it doesn't affect other routes
router.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  paystackWebhook
);

// Public
router.get('/pricing', getBoostPricing);

// Dealer protected
router.post('/initialize', protect, authorize('dealer'), initializeBoost);
router.get('/verify/:reference', protect, verifyBoostPayment);

module.exports = router;
