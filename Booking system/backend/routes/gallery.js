const express = require('express');
const {
  getGalleryItems,
  getGalleryItem,
  createGalleryItem,
  updateGalleryItem,
  deleteGalleryItem,
  uploadImage
} = require('../controllers/galleryController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router
  .route('/')
  .get(getGalleryItems)
  .post(protect, (req, res, next) => {
    // Use uploadImage middleware to handle multiple images
    uploadImage(req, res, (err) => {
      if (err) {
        return res.status(400).json({
          success: false,
          error: err.message
        });
      }
      next();
    });
  }, createGalleryItem);

router
  .route('/:id')
  .get(getGalleryItem)
  .put(protect, (req, res, next) => {
    // Use uploadImage middleware to handle multiple images (but only first one for update)
    uploadImage(req, res, (err) => {
      if (err) {
        return res.status(400).json({
          success: false,
          error: err.message
        });
      }
      next();
    });
  }, updateGalleryItem) // Allow optional image upload on update
  .delete(protect, deleteGalleryItem);

module.exports = router;