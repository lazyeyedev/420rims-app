const mongoose = require('mongoose');

const listingSchema = new mongoose.Schema(
  {
    dealer: { type: mongoose.Schema.Types.ObjectId, ref: 'Dealer', required: true },
    title: { type: String, required: true, trim: true },
    make: { type: String, required: true },
    model: { type: String, required: true },
    year: { type: Number, required: true },
    price: { type: Number, required: true },
    currency: { type: String, enum: ['GHS', 'USD'], default: 'GHS' },
    mileage: { type: Number },
    mileageUnit: { type: String, enum: ['km', 'miles'], default: 'km' },
    transmission: { type: String, enum: ['automatic', 'manual'] },
    fuelType: { type: String, enum: ['petrol', 'diesel', 'electric', 'hybrid'] },
    condition: { type: String, enum: ['new', 'foreign used', 'locally used'] },
    bodyType: {
      type: String,
      enum: ['sedan', 'suv', 'pickup', 'hatchback', 'coupe', 'van', 'bus', 'convertible', 'truck'],
    },
    color: { type: String },
    description: { type: String, maxlength: 2000 },
    images: {
      type: [String],
      validate: { validator: (arr) => arr.length <= 10, message: 'Maximum 10 images allowed.' },
    },
    location: { type: String },
    region: { type: String },
    isFeatured: { type: Boolean, default: false },
    isBoosted: { type: Boolean, default: false },
    boostExpiry: { type: Date },
    isActive: { type: Boolean, default: true },
    isApproved: { type: Boolean, default: false },
    views: { type: Number, default: 0 },
    enquiryCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Listing', listingSchema);
