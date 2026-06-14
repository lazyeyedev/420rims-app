const express = require('express');
const router = express.Router();

const {
  getDealerProfile,
  updateDealerProfile,
  uploadDealerImage,
  getDealerEnquiries,
  markEnquiryRead,
  getDealerStats,
} = require('../controllers/dealerController');

const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// All dealer routes require authentication and dealer role
router.use(protect, authorize('dealer'));

router.get('/profile',   getDealerProfile);
router.put('/profile',   uploadDealerImage, updateDealerProfile);
router.get('/enquiries', getDealerEnquiries);
router.put('/enquiries/:enquiryId/read', markEnquiryRead);
router.get('/stats',     getDealerStats);

module.exports = router;
