const User = require('../models/User');
const Dealer = require('../models/Dealer');
const generateToken = require('../utils/generateToken');
const { sendWelcomeEmail } = require('../utils/emailService');

// POST /api/auth/register
const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error('Please provide name, email, and password');
  }

  const existing = await User.findOne({ email });
  if (existing) {
    res.status(400);
    throw new Error('Email already registered');
  }

  const user = await User.create({ name, email, password, role: 'user' });

  // Fire-and-forget welcome email
  sendWelcomeEmail({ email: user.email, name: user.name }).catch(() => {});

  const token = generateToken({ id: user._id, role: user.role });

  res.status(201).json({
    token,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      phone: user.phone,
    },
  });
};

// POST /api/auth/register/dealer
const registerDealer = async (req, res) => {
  const { name, email, password, businessName, businessAddress, region, phone, whatsapp } = req.body;

  if (!name || !email || !password || !businessName || !businessAddress || !region || !phone) {
    res.status(400);
    throw new Error('Please provide all required fields: name, email, password, businessName, businessAddress, region, phone');
  }

  const existing = await User.findOne({ email });
  if (existing) {
    res.status(400);
    throw new Error('Email already registered');
  }

  const user = await User.create({ name, email, password, role: 'dealer', phone });

  const dealer = await Dealer.create({
    user: user._id,
    businessName,
    businessAddress,
    region,
    phone,
    whatsapp: whatsapp || '',
  });

  // Fire-and-forget welcome email
  sendWelcomeEmail({ email: user.email, name: user.name }).catch(() => {});

  const token = generateToken({ id: user._id, role: user.role });

  res.status(201).json({
    token,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
    },
    dealer: {
      _id: dealer._id,
      businessName: dealer.businessName,
      businessAddress: dealer.businessAddress,
      region: dealer.region,
      phone: dealer.phone,
      subscriptionTier: dealer.subscriptionTier,
      isApproved: dealer.isApproved,
    },
  });
};

// POST /api/auth/login
const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error('Please provide email and password');
  }

  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    res.status(401);
    throw new Error('Invalid credentials');
  }

  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    res.status(401);
    throw new Error('Invalid credentials');
  }

  if (!user.isActive) {
    res.status(403);
    throw new Error('Your account has been deactivated. Contact support.');
  }

  let dealerProfile = null;
  if (user.role === 'dealer') {
    dealerProfile = await Dealer.findOne({ user: user._id });
  }

  const token = generateToken({ id: user._id, role: user.role });

  res.status(200).json({
    token,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      phone: user.phone,
    },
    dealer: dealerProfile,
  });
};

// GET /api/auth/me  (protected)
const getMe = async (req, res) => {
  let dealerProfile = null;
  if (req.user.role === 'dealer') {
    dealerProfile = await Dealer.findOne({ user: req.user._id });
  }

  res.status(200).json({
    user: req.user,
    dealer: dealerProfile,
  });
};

// PUT /api/auth/change-password  (protected)
const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    res.status(400);
    throw new Error('Please provide currentPassword and newPassword');
  }

  if (newPassword.length < 6) {
    res.status(400);
    throw new Error('New password must be at least 6 characters');
  }

  const user = await User.findById(req.user._id).select('+password');
  const isMatch = await user.matchPassword(currentPassword);
  if (!isMatch) {
    res.status(401);
    throw new Error('Current password is incorrect');
  }

  user.password = newPassword;
  await user.save(); // triggers pre-save bcrypt hook

  res.status(200).json({ message: 'Password updated successfully' });
};

module.exports = { registerUser, registerDealer, login, getMe, changePassword };
