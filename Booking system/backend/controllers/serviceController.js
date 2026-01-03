const { Service, Staff, Branch } = require('../models');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const path = require('path');
const fs = require('fs');

// @desc      Get all services
// @route     GET /api/services
// @access    Public
exports.getServices = asyncHandler(async (req, res, next) => {
  const services = await Service.findAll({
    include: [
      {
        model: Branch,
        attributes: ['id', 'name', 'address', 'city']
      }
    ],
    where: { isActive: true },
    order: [['name', 'ASC']]
  });

  res.status(200).json({
    success: true,
    count: services.length,
    data: services
  });
});

// @desc      Get single service
// @route     GET /api/services/:id
// @access    Public
exports.getService = asyncHandler(async (req, res, next) => {
  const service = await Service.findByPk(req.params.id, {
    include: [
      {
        model: Branch,
        attributes: ['id', 'name', 'address', 'city']
      }
    ]
  });

  if (!service || !service.isActive) {
    return next(
      new ErrorResponse(`Service not found with id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: service
  });
});

// @desc      Create new service
// @route     POST /api/services
// @access    Private/Admin
exports.createService = asyncHandler(async (req, res, next) => {
  console.log('Create service request body:', req.body);
  console.log('Create service file:', req.file);

  // Validate required fields manually since they come as form data
  const { name, description, duration, price, category, branchId } = req.body;

  if (!name) {
    return next(new ErrorResponse('Service name is required', 400));
  }

  if (!duration) {
    return next(new ErrorResponse('Service duration is required', 400));
  }

  if (!price) {
    return next(new ErrorResponse('Service price is required', 400));
  }

  const serviceData = {
    name,
    description,
    duration: parseInt(duration),
    price: parseFloat(price),
    category,
    branchId: branchId ? parseInt(branchId) : null
  };

  // If there's an image uploaded, add the image path to the service data
  if (req.file) {
    serviceData.image = `/uploads/services/${req.file.filename}`;
  }

  console.log('Service data to create:', serviceData);

  const service = await Service.create(serviceData);

  res.status(201).json({
    success: true,
    data: service
  });
});

// @desc      Update service
// @route     PUT /api/services/:id
// @access    Private/Admin
exports.updateService = asyncHandler(async (req, res, next) => {
  console.log('Update service request body:', req.body);
  console.log('Update service file:', req.file);

  let service = await Service.findByPk(req.params.id);

  if (!service) {
    return next(
      new ErrorResponse(`Service not found with id of ${req.params.id}`, 404)
    );
  }

  // Extract fields from req.body
  const { name, description, duration, price, category, branchId, isActive } = req.body;

  const serviceData = {};

  // Only add fields to serviceData if they are provided
  if (name !== undefined && name !== '') serviceData.name = name;
  if (description !== undefined && description !== '') serviceData.description = description;
  if (duration !== undefined && duration !== '') serviceData.duration = parseInt(duration);
  if (price !== undefined && price !== '') serviceData.price = parseFloat(price);
  if (category !== undefined && category !== '') serviceData.category = category;
  if (branchId !== undefined && branchId !== '') serviceData.branchId = parseInt(branchId);
  if (isActive !== undefined && isActive !== '') serviceData.isActive = isActive === 'true';

  // If there's a new image uploaded, handle the old image deletion and set the new image
  if (req.file) {
    // Delete the old image if it exists
    if (service.image) {
      const imagePath = path.join(__dirname, '../public', service.image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }
    serviceData.image = `/uploads/services/${req.file.filename}`;
  }

  console.log('Service data to update:', serviceData);

  service = await service.update(serviceData);

  res.status(200).json({
    success: true,
    data: service
  });
});

// @desc      Delete service
// @route     DELETE /api/services/:id
// @access    Private/Admin
exports.deleteService = asyncHandler(async (req, res, next) => {
  const service = await Service.findByPk(req.params.id);

  if (!service) {
    return next(
      new ErrorResponse(`Service not found with id of ${req.params.id}`, 404)
    );
  }

  await service.destroy();

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc      Get services by branch
// @route     GET /api/services/branch/:branchId
// @access    Public
exports.getServicesByBranch = asyncHandler(async (req, res, next) => {
  const services = await Service.findAll({
    where: { 
      branchId: req.params.branchId,
      isActive: true 
    },
    include: [
      {
        model: Branch,
        attributes: ['id', 'name', 'address', 'city']
      }
    ],
    order: [['name', 'ASC']]
  });

  res.status(200).json({
    success: true,
    count: services.length,
    data: services
  });
});