const express = require('express');
const router = express.Router();

const {
  getDashboardStats,
  getAllUsers,
  updateUserStatus,
  getAllDealers,
  approveDealer,
  rejectDealer,
  suspendDealer,
  verifyDealer,
  getAllListings,
  approveListing,
  rejectListing,
  deleteListingAdmin,
  getAllEnquiries,
  getBoosts,
} = require('../controllers/adminController');

const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect, authorize('admin'));

// Dashboard
router.get('/stats', getDashboardStats);

// Users
router.get('/users', getAllUsers);
router.put('/users/:userId/status', updateUserStatus);

// Dealers
router.get('/dealers', getAllDealers);
router.put('/dealers/:dealerId/approve',  approveDealer);
router.put('/dealers/:dealerId/reject',   rejectDealer);
router.put('/dealers/:dealerId/suspend',  suspendDealer);
router.put('/dealers/:dealerId/verify',   verifyDealer);

// Listings
router.get('/listings', getAllListings);
router.put('/listings/:listingId/approve', approveListing);
router.put('/listings/:listingId/reject',  rejectListing);
router.delete('/listings/:listingId',      deleteListingAdmin);

// Enquiries
router.get('/enquiries', getAllEnquiries);

// Boosts
router.get('/boosts', getBoosts);

module.exports = router;
