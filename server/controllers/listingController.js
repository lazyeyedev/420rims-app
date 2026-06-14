const Listing = require('../models/Listing');
const Dealer = require('../models/Dealer');
const Enquiry = require('../models/Enquiry');
const { cloudinary } = require('../utils/cloudinaryUpload');

// GET /api/listings  (public)
const getListings = async (req, res) => {
  const {
    make, model, year, minPrice, maxPrice, region, condition,
    transmission, fuelType, bodyType, isBoosted,
    page = 1, limit = 20,
  } = req.query;

  const filter = { isActive: true, isApproved: true };

  if (make)         filter.make = { $regex: make, $options: 'i' };
  if (model)        filter.model = { $regex: model, $options: 'i' };
  if (year)         filter.year = Number(year);
  if (region)       filter.region = { $regex: region, $options: 'i' };
  if (condition)    filter.condition = condition;
  if (transmission) filter.transmission = transmission;
  if (fuelType)     filter.fuelType = fuelType;
  if (bodyType)     filter.bodyType = bodyType;
  if (isBoosted)    filter.isBoosted = isBoosted === 'true';
  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }

  const pageNum  = Math.max(1, parseInt(page));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
  const skip     = (pageNum - 1) * limitNum;

  const [listings, total] = await Promise.all([
    Listing.find(filter)
      .populate('dealer', 'businessName logo region isVerified')
      .sort({ isBoosted: -1, createdAt: -1 })
      .skip(skip)
      .limit(limitNum),
    Listing.countDocuments(filter),
  ]);

  res.status(200).json({
    listings,
    total,
    page: pageNum,
    totalPages: Math.ceil(total / limitNum),
  });
};

// GET /api/listings/:id  (public)
const getListing = async (req, res) => {
  const listing = await Listing.findById(req.params.id).populate('dealer');

  if (!listing || !listing.isActive || !listing.isApproved) {
    res.status(404);
    throw new Error('Listing not found');
  }

  await Listing.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });

  res.status(200).json(listing);
};

// POST /api/listings  (dealer only)
const createListing = async (req, res) => {
  const dealer = await Dealer.findOne({ user: req.user._id });
  if (!dealer) {
    res.status(404);
    throw new Error('Dealer profile not found');
  }

  const {
    title, make, model, year, price, currency, mileage, mileageUnit,
    transmission, fuelType, condition, bodyType, color, description,
    location, region,
  } = req.body;

  if (!title || !make || !model || !year || !price) {
    res.status(400);
    throw new Error('title, make, model, year, and price are required');
  }

  const imageUrls = req.files ? req.files.map((f) => f.path) : [];

  const listing = await Listing.create({
    dealer: dealer._id,
    title, make, model,
    year: Number(year),
    price: Number(price),
    currency, mileage: mileage ? Number(mileage) : undefined,
    mileageUnit, transmission, fuelType, condition, bodyType,
    color, description, location, region,
    images: imageUrls,
    isApproved: false,
  });

  await Dealer.findByIdAndUpdate(dealer._id, { $inc: { totalListings: 1 } });

  res.status(201).json(listing);
};

// PUT /api/listings/:id  (dealer only)
const updateListing = async (req, res) => {
  const dealer = await Dealer.findOne({ user: req.user._id });
  if (!dealer) {
    res.status(404);
    throw new Error('Dealer profile not found');
  }

  const listing = await Listing.findById(req.params.id);
  if (!listing) {
    res.status(404);
    throw new Error('Listing not found');
  }

  if (listing.dealer.toString() !== dealer._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to update this listing');
  }

  const forbidden = ['dealer', 'isApproved', 'views', 'enquiryCount', 'isBoosted', 'boostExpiry'];
  const updates = { ...req.body };
  forbidden.forEach((f) => delete updates[f]);

  if (req.files && req.files.length > 0) {
    const newUrls = req.files.map((f) => f.path);
    const combined = [...listing.images, ...newUrls];
    updates.images = combined.slice(0, 10); // enforce max 10
  }

  const updated = await Listing.findByIdAndUpdate(req.params.id, updates, {
    new: true,
    runValidators: true,
  });

  res.status(200).json(updated);
};

// DELETE /api/listings/:id  (dealer only — soft delete)
const deleteListing = async (req, res) => {
  const dealer = await Dealer.findOne({ user: req.user._id });
  if (!dealer) {
    res.status(404);
    throw new Error('Dealer profile not found');
  }

  const listing = await Listing.findById(req.params.id);
  if (!listing) {
    res.status(404);
    throw new Error('Listing not found');
  }

  if (listing.dealer.toString() !== dealer._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to delete this listing');
  }

  await Listing.findByIdAndUpdate(req.params.id, { isActive: false });
  await Dealer.findByIdAndUpdate(dealer._id, { $inc: { totalListings: -1 } });

  res.status(200).json({ message: 'Listing removed successfully' });
};

// DELETE /api/listings/:id/images  (dealer only)
const deleteListingImage = async (req, res) => {
  const dealer = await Dealer.findOne({ user: req.user._id });
  if (!dealer) {
    res.status(404);
    throw new Error('Dealer profile not found');
  }

  const listing = await Listing.findById(req.params.id);
  if (!listing) {
    res.status(404);
    throw new Error('Listing not found');
  }

  if (listing.dealer.toString() !== dealer._id.toString()) {
    res.status(403);
    throw new Error('Not authorized');
  }

  const { imageUrl } = req.body;
  if (!imageUrl) {
    res.status(400);
    throw new Error('imageUrl is required');
  }

  // Extract Cloudinary public ID from URL: folder/filename (no extension)
  const parts = imageUrl.split('/');
  const filenameWithExt = parts[parts.length - 1];
  const filename = filenameWithExt.split('.')[0];
  const folder = parts[parts.length - 2];
  const publicId = `${folder}/${filename}`;

  await cloudinary.uploader.destroy(publicId);

  const updatedImages = listing.images.filter((url) => url !== imageUrl);
  const updated = await Listing.findByIdAndUpdate(
    req.params.id,
    { images: updatedImages },
    { new: true }
  );

  res.status(200).json({ images: updated.images });
};

// GET /api/listings/dealer/mine  (dealer only)
const getDealerListings = async (req, res) => {
  const dealer = await Dealer.findOne({ user: req.user._id });
  if (!dealer) {
    res.status(404);
    throw new Error('Dealer profile not found');
  }

  const { page = 1, limit = 20 } = req.query;
  const pageNum  = Math.max(1, parseInt(page));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
  const skip     = (pageNum - 1) * limitNum;

  const [listings, total] = await Promise.all([
    Listing.find({ dealer: dealer._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum),
    Listing.countDocuments({ dealer: dealer._id }),
  ]);

  res.status(200).json({
    listings,
    total,
    page: pageNum,
    totalPages: Math.ceil(total / limitNum),
  });
};

// POST /api/listings/:id/enquiry  (public + authenticated)
const submitEnquiry = async (req, res) => {
  const listing = await Listing.findById(req.params.id);
  if (!listing || !listing.isActive || !listing.isApproved) {
    res.status(404);
    throw new Error('Listing not found');
  }

  const { message, type, guestName, guestEmail, guestPhone } = req.body;

  if (!message) {
    res.status(400);
    throw new Error('Message is required');
  }

  // Guest validation — only required if not authenticated
  if (!req.user && (!guestName || !guestEmail || !guestPhone)) {
    res.status(400);
    throw new Error('guestName, guestEmail, and guestPhone are required for guest enquiries');
  }

  const enquiry = await Enquiry.create({
    listing: listing._id,
    dealer: listing.dealer,
    user: req.user ? req.user._id : undefined,
    guestName: req.user ? undefined : guestName,
    guestEmail: req.user ? undefined : guestEmail,
    guestPhone: req.user ? undefined : guestPhone,
    message,
    type: type || 'general',
  });

  await Listing.findByIdAndUpdate(req.params.id, { $inc: { enquiryCount: 1 } });

  res.status(201).json(enquiry);
};

module.exports = {
  getListings,
  getListing,
  createListing,
  updateListing,
  deleteListing,
  deleteListingImage,
  getDealerListings,
  submitEnquiry,
};
