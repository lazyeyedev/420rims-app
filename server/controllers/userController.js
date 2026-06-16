const User = require('../models/User');
const Enquiry = require('../models/Enquiry');
const cloudinary = require('cloudinary').v2;
const multerStorageCloudinary = require('multer-storage-cloudinary');
const CloudinaryStorage = multerStorageCloudinary.CloudinaryStorage || multerStorageCloudinary;
const multer = require('multer');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const avatarStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: '420rims/avatars',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 300, height: 300, crop: 'fill', gravity: 'face', quality: 'auto' }],
  },
});

const uploadAvatar = multer({
  storage: avatarStorage,
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    allowed.includes(file.mimetype) ? cb(null, true) : cb(new Error('Only JPEG, PNG, WebP allowed'), false);
  },
  limits: { fileSize: 5 * 1024 * 1024 },
}).single('avatar');

// GET /api/users/enquiries  (protected)
const getMyEnquiries = async (req, res) => {
  const enquiries = await Enquiry.find({ user: req.user._id })
    .populate('listing', 'title make model year images')
    .populate('dealer', 'businessName')
    .sort({ createdAt: -1 });

  const shaped = enquiries.map(e => {
    const obj = e.toObject();
    if (obj.listing?.images) obj.listing.images = obj.listing.images.slice(0, 1);
    return obj;
  });

  res.status(200).json({ enquiries: shaped, total: shaped.length });
};

// PUT /api/users/profile  (protected)
const updateProfile = async (req, res) => {
  const { name, phone } = req.body;

  const updates = {};
  if (name)  updates.name  = name;
  if (phone) updates.phone = phone;
  if (req.file) updates.avatar = req.file.path;

  const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true })
    .select('-password');

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  res.status(200).json(user);
};

module.exports = { getMyEnquiries, updateProfile, uploadAvatar };
