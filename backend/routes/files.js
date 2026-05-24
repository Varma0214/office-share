const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const File = require('../models/File');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

// @route   POST /api/files/upload
router.post('/upload', protect, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const { description, isPublic, sharedWith } = req.body;

    let sharedWithUsers = [];
    if (sharedWith) {
      try {
        const emails = JSON.parse(sharedWith);
        const users = await User.find({ email: { $in: emails } }).select('_id');
        sharedWithUsers = users.map(u => u._id);
      } catch {}
    }

    const file = await File.create({
      filename: `${uuidv4()}_${req.file.originalname}`,
      originalName: req.file.originalname,
      fileType: req.file.mimetype,
      fileSize: req.file.size,
      fileData: req.file.buffer,
      uploadedBy: req.user._id,
      description: description || '',
      isPublic: isPublic === 'true',
      sharedWith: sharedWithUsers
    });

    const populated = await File.findById(file._id)
      .select('-fileData')
      .populate('uploadedBy', 'name email');

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/files/my
router.get('/my', protect, async (req, res) => {
  try {
    const files = await File.find({ uploadedBy: req.user._id })
      .select('-fileData')
      .populate('uploadedBy', 'name email')
      .populate('sharedWith', 'name email')
      .sort({ createdAt: -1 });
    res.json(files);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/files/shared
router.get('/shared', protect, async (req, res) => {
  try {
    const files = await File.find({
      $or: [{ sharedWith: req.user._id }, { isPublic: true }],
      uploadedBy: { $ne: req.user._id }
    })
      .select('-fileData')
      .populate('uploadedBy', 'name email')
      .populate('sharedWith', 'name email')
      .sort({ createdAt: -1 });
    res.json(files);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/files/all
router.get('/all', protect, async (req, res) => {
  try {
    const files = await File.find({
      $or: [
        { uploadedBy: req.user._id },
        { sharedWith: req.user._id },
        { isPublic: true }
      ]
    })
      .select('-fileData')
      .populate('uploadedBy', 'name email')
      .populate('sharedWith', 'name email')
      .sort({ createdAt: -1 });
    res.json(files);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/files/download/:id
router.get('/download/:id', protect, async (req, res) => {
  try {
    const file = await File.findById(req.params.id).select('+fileData');
    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }

    const isOwner = file.uploadedBy.toString() === req.user._id.toString();
    const isShared = file.sharedWith.map(id => id.toString()).includes(req.user._id.toString());

    if (!isOwner && !isShared && !file.isPublic) {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (!file.fileData || file.fileData.length === 0) {
      return res.status(404).json({ message: 'File data missing — please re-upload this file' });
    }

    file.downloadCount += 1;
    await file.save();

    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(file.originalName)}"`);
    res.setHeader('Content-Type', file.fileType);
    res.setHeader('Content-Length', file.fileData.length);
    res.send(file.fileData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/files/:id/share
router.put('/:id/share', protect, async (req, res) => {
  try {
    const file = await File.findById(req.params.id);
    if (!file) return res.status(404).json({ message: 'File not found' });

    if (file.uploadedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the owner can share this file' });
    }

    const { emails, isPublic } = req.body;

    if (typeof isPublic !== 'undefined') {
      file.isPublic = isPublic;
    }

    if (emails && emails.length > 0) {
      const users = await User.find({ email: { $in: emails } }).select('_id');
      const newIds = users.map(u => u._id.toString());
      const existing = file.sharedWith.map(id => id.toString());
      const merged = [...new Set([...existing, ...newIds])];
      file.sharedWith = merged;
    }

    await file.save();
    const updated = await File.findById(file._id)
      .select('-fileData')
      .populate('uploadedBy', 'name email')
      .populate('sharedWith', 'name email');
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/files/:id
router.delete('/:id', protect, async (req, res) => {
  try {
    const file = await File.findById(req.params.id);
    if (!file) return res.status(404).json({ message: 'File not found' });

    if (file.uploadedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the owner can delete this file' });
    }

    await file.deleteOne();
    res.json({ message: 'File deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;