const { Category, GalleryItem } = require('../models');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

// @desc      Get all categories
// @route     GET /api/categories
// @access    Public
exports.getCategories = asyncHandler(async (req, res, next) => {
  const categories = await Category.findAll({
    where: { },
    order: [['name', 'ASC']]
  });

  res.status(200).json({
    success: true,
    count: categories.length,
    data: categories
  });
});

// @desc      Get single category
// @route     GET /api/categories/:id
// @access    Public
exports.getCategory = asyncHandler(async (req, res, next) => {
  const category = await Category.findByPk(req.params.id);

  if (!category) {
    return next(
      new ErrorResponse(`Category not found with id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: category
  });
});

// @desc      Create category
// @route     POST /api/categories
// @access    Private/Admin
exports.createCategory = asyncHandler(async (req, res, next) => {
  // Only allow admin to create categories
  if (req.user.role !== 'admin') {
    return next(
      new ErrorResponse('Access denied. Admin role required.', 403)
    );
  }

  const category = await Category.create(req.body);

  res.status(201).json({
    success: true,
    data: category
  });
});

// @desc      Update category
// @route     PUT /api/categories/:id
// @access    Private/Admin
exports.updateCategory = asyncHandler(async (req, res, next) => {
  // Only allow admin to update categories
  if (req.user.role !== 'admin') {
    return next(
      new ErrorResponse('Access denied. Admin role required.', 403)
    );
  }

  const category = await Category.findByPk(req.params.id);

  if (!category) {
    return next(
      new ErrorResponse(`Category not found with id of ${req.params.id}`, 404)
    );
  }

  await category.update(req.body);

  res.status(200).json({
    success: true,
    data: category
  });
});

// @desc      Delete category
// @route     DELETE /api/categories/:id
// @access    Private/Admin
exports.deleteCategory = asyncHandler(async (req, res, next) => {
  // Only allow admin to delete categories
  if (req.user.role !== 'admin') {
    return next(
      new ErrorResponse('Access denied. Admin role required.', 403)
    );
  }

  const category = await Category.findByPk(req.params.id);

  if (!category) {
    return next(
      new ErrorResponse(`Category not found with id of ${req.params.id}`, 404)
    );
  }

  // Check if any gallery items are using this category
  const galleryItems = await GalleryItem.findAll({
    where: { categoryId: req.params.id }
  });

  if (galleryItems.length > 0) {
    return next(
      new ErrorResponse('Cannot delete category. It is being used by gallery items.', 400)
    );
  }

  await category.destroy();

  res.status(200).json({
    success: true,
    data: {}
  });
});