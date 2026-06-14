const mongoose = require('mongoose');

const dealerSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    businessName: { type: String, required: true, trim: true },
    businessAddress: { type: String, required: true },
    region: { type: String, required: true },
    phone: { type: String, required: true },
    whatsapp: { type: String },
    logo: { type: String, default: '' },
    coverImage: { type: String, default: '' },
    description: { type: String, maxlength: 500 },
    subscriptionTier: { type: String, enum: ['basic', 'pro', 'premium'], default: 'basic' },
    subscriptionExpiry: { type: Date },
    isVerified: { type: Boolean, default: false },
    isApproved: { type: Boolean, default: false },
    totalListings: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Dealer', dealerSchema);
