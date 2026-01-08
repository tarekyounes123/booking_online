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
  .post(protect, uploadImage, createGalleryItem);

router
  .route('/:id')
  .get(getGalleryItem)
  .put(protect, uploadImage, updateGalleryItem)
  .delete(protect, deleteGalleryItem);

module.exports = router;