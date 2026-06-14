const mongoose = require('mongoose');

const boostSchema = new mongoose.Schema(
  {
    listing: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing', required: true },
    dealer: { type: mongoose.Schema.Types.ObjectId, ref: 'Dealer', required: true },
    boostType: { type: String, enum: ['featured', 'top', 'banner'], required: true },
    durationDays: { type: Number, required: true },
    amountPaid: { type: Number, required: true },
    currency: { type: String, default: 'GHS' },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    paystackReference: { type: String },
    status: { type: String, enum: ['active', 'expired', 'pending'], default: 'pending' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Boost', boostSchema);
