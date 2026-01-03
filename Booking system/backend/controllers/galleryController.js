const { GalleryItem } = require('../models');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../public/uploads/gallery');
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'gallery-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  // Accept only image files
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Middleware to handle multiple image uploads
exports.uploadImage = upload.array('images', 10); // Allow up to 10 images

// @desc      Get all gallery items
// @route     GET /api/gallery
// @access    Public
exports.getGalleryItems = asyncHandler(async (req, res, next) => {
  const galleryItems = await GalleryItem.findAll({
    order: [['createdAt', 'DESC']]
  });

  // Add full URL to image paths
  const itemsWithFullUrls = galleryItems.map(item => ({
    ...item.toJSON(),
    imageUrl: `/uploads/gallery/${item.imageUrl}` // Use relative path to match the static route
  }));

  res.status(200).json({
    success: true,
    count: itemsWithFullUrls.length,
    data: itemsWithFullUrls
  });
});

// @desc      Get single gallery item
// @route     GET /api/gallery/:id
// @access    Public
exports.getGalleryItem = asyncHandler(async (req, res, next) => {
  const galleryItem = await GalleryItem.findByPk(req.params.id);

  if (!galleryItem) {
    return next(
      new ErrorResponse(`Gallery item not found with id of ${req.params.id}`, 404)
    );
  }

  // Add full URL to image path
  const itemWithFullUrl = {
    ...galleryItem.toJSON(),
    imageUrl: `/uploads/gallery/${galleryItem.imageUrl}` // Use relative path to match the static route
  };

  res.status(200).json({
    success: true,
    data: itemWithFullUrl
  });
});

// @desc      Create gallery item with image upload
// @route     POST /api/gallery
// @access    Private/Admin
exports.createGalleryItem = asyncHandler(async (req, res, next) => {
  // Only allow admin to create gallery items
  if (req.user.role !== 'admin') {
    return next(
      new ErrorResponse('Access denied. Admin role required.', 403)
    );
  }

  if (!req.files || req.files.length === 0) {
    return next(
      new ErrorResponse('At least one image file is required', 400)
    );
  }

  // Create gallery items for each uploaded image
  const createdItems = [];
  for (const file of req.files) {
    const galleryItem = await GalleryItem.create({
      title: req.body.title,
      description: req.body.description,
      imageUrl: file.filename, // Store the filename
      imageFilename: file.originalname, // Store original filename
      category: req.body.category
    });

    // Add full URL to response
    const itemWithFullUrl = {
      ...galleryItem.toJSON(),
      imageUrl: `/uploads/gallery/${galleryItem.imageUrl}` // Use relative path to match the static route
    };

    createdItems.push(itemWithFullUrl);
  }

  res.status(201).json({
    success: true,
    count: createdItems.length,
    data: createdItems
  });
});

// @desc      Update gallery item with optional image upload
// @route     PUT /api/gallery/:id
// @access    Private/Admin
exports.updateGalleryItem = asyncHandler(async (req, res, next) => {
  // Only allow admin to update gallery items
  if (req.user.role !== 'admin') {
    return next(
      new ErrorResponse('Access denied. Admin role required.', 403)
    );
  }

  const galleryItem = await GalleryItem.findByPk(req.params.id);

  if (!galleryItem) {
    return next(
      new ErrorResponse(`Gallery item not found with id of ${req.params.id}`, 404)
    );
  }

  // If a new image is uploaded, delete the old one
  if (req.files && req.files.length > 0) {
    const file = req.files[0]; // Use first image for update
    const oldImagePath = path.join(__dirname, '../public/uploads/gallery', galleryItem.imageUrl);
    if (fs.existsSync(oldImagePath)) {
      fs.unlinkSync(oldImagePath);
    }

    // Update with new image
    await galleryItem.update({
      title: req.body.title,
      description: req.body.description,
      imageUrl: file.filename,
      imageFilename: file.originalname,
      category: req.body.category
    });
  } else {
    // Update without changing image
    await galleryItem.update({
      title: req.body.title,
      description: req.body.description,
      category: req.body.category
    });
  }

  // Add full URL to response
  const itemWithFullUrl = {
    ...galleryItem.toJSON(),
    imageUrl: `/uploads/gallery/${galleryItem.imageUrl}` // Use relative path to match the static route
  };

  res.status(200).json({
    success: true,
    data: itemWithFullUrl
  });
});

// @desc      Delete gallery item
// @route     DELETE /api/gallery/:id
// @access    Private/Admin
exports.deleteGalleryItem = asyncHandler(async (req, res, next) => {
  // Only allow admin to delete gallery items
  if (req.user.role !== 'admin') {
    return next(
      new ErrorResponse('Access denied. Admin role required.', 403)
    );
  }

  const galleryItem = await GalleryItem.findByPk(req.params.id);

  if (!galleryItem) {
    return next(
      new ErrorResponse(`Gallery item not found with id of ${req.params.id}`, 404)
    );
  }

  // Delete the image file from the server
  const imagePath = path.join(__dirname, '../public/uploads/gallery', galleryItem.imageUrl);
  if (fs.existsSync(imagePath)) {
    fs.unlinkSync(imagePath);
  }

  await galleryItem.destroy();

  res.status(200).json({
    success: true,
    data: {}
  });
});