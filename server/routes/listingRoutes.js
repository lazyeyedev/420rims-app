const express = require('express');
const router = express.Router();

const {
  getListings,
  getListing,
  createListing,
  updateListing,
  deleteListing,
  deleteListingImage,
  getDealerListings,
  submitEnquiry,
} = require('../controllers/listingController');

const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const { upload } = require('../utils/cloudinaryUpload');

// Public
router.get('/', getListings);
router.get('/dealer/mine', protect, authorize('dealer'), getDealerListings);
router.get('/:id', getListing);

// Dealer protected
router.post(
  '/',
  protect,
  authorize('dealer'),
  upload.array('images', 10),
  createListing
);

router.put(
  '/:id',
  protect,
  authorize('dealer'),
  upload.array('images', 10),
  updateListing
);

router.delete('/:id', protect, authorize('dealer'), deleteListing);
router.delete('/:id/images', protect, authorize('dealer'), deleteListingImage);

// Enquiry — protect is optional (guest or user)
router.post('/:id/enquiry', (req, res, next) => {
  protect(req, res, (err) => {
    // If token is present but invalid, err will be set — let it fail
    // If no token at all, just continue as guest
    if (err && err.message === 'Not authorized, no token') return next();
    if (err) return next(err);
    next();
  });
}, submitEnquiry);

module.exports = router;
