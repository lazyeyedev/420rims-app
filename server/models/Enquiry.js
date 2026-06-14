const mongoose = require('mongoose');

const enquirySchema = new mongoose.Schema(
  {
    listing: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing', required: true },
    dealer: { type: mongoose.Schema.Types.ObjectId, ref: 'Dealer', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    guestName: { type: String },
    guestEmail: { type: String },
    guestPhone: { type: String },
    message: { type: String, required: true, maxlength: 1000 },
    type: { type: String, enum: ['general', 'price', 'test_drive', 'finance'], default: 'general' },
    status: { type: String, enum: ['new', 'read', 'responded', 'closed'], default: 'new' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Enquiry', enquirySchema);
