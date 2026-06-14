const express = require('express');
const router  = express.Router();
const { getMyEnquiries, updateProfile, uploadAvatar } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/enquiries', getMyEnquiries);
router.put('/profile', uploadAvatar, updateProfile);

module.exports = router;
