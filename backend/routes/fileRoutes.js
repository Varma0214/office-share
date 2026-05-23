const express = require('express');
const router = express.Router();
const {
  uploadFile,
  getFiles,
  getAllFiles,
  downloadFile,
  deleteFile,
  getFilesByCategory
} = require('../controllers/fileController');
const { protect } = require('../middleware/authMiddleware');

router.post('/upload', protect, uploadFile);
router.get('/', protect, getFiles);
router.get('/all', protect, getAllFiles);
router.get('/download/:id', protect, downloadFile);
router.delete('/:id', protect, deleteFile);
router.get('/category/:category', protect, getFilesByCategory);

module.exports = router;