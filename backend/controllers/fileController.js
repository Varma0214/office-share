const File = require('../models/File');

// @desc    Upload a file
// @route   POST /api/files/upload
// @access  Private
const uploadFile = async (req, res) => {
  try {
    if (!req.files || !req.files.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const file = req.files.file;
    const { description, category } = req.body;

    // Create file document
    const newFile = await File.create({
      filename: file.name,
      originalName: file.name,
      mimetype: file.mimetype,
      size: file.size,
      fileData: file.data,
      uploadedBy: req.user._id,
      description: description || '',
      category: category || 'shared'
    });

    res.status(201).json({
      message: 'File uploaded successfully',
      file: {
        _id: newFile._id,
        filename: newFile.filename,
        originalName: newFile.originalName,
        mimetype: newFile.mimetype,
        size: newFile.size,
        description: newFile.description,
        category: newFile.category,
        createdAt: newFile.createdAt
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all files for user
// @route   GET /api/files
// @access  Private
const getFiles = async (req, res) => {
  try {
    const files = await File.find({ uploadedBy: req.user._id })
      .select('-fileData')
      .sort({ createdAt: -1 });

    res.json(files);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all files (shared view)
// @route   GET /api/files/all
// @access  Private
const getAllFiles = async (req, res) => {
  try {
    const files = await File.find()
      .select('-fileData')
      .populate('uploadedBy', 'name email')
      .sort({ createdAt: -1 });

    res.json(files);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Download a file
// @route   GET /api/files/download/:id
// @access  Private
const downloadFile = async (req, res) => {
  try {
    const file = await File.findById(req.params.id);

    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }

    res.set({
      'Content-Type': file.mimetype,
      'Content-Disposition': `attachment; filename="${file.originalName}"`,
      'Content-Length': file.size
    });

    res.send(file.fileData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a file
// @route   DELETE /api/files/:id
// @access  Private
const deleteFile = async (req, res) => {
  try {
    const file = await File.findById(req.params.id);

    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }

    // Check if user owns the file
    if (file.uploadedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this file' });
    }

    await file.deleteOne();

    res.json({ message: 'File deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get file by category
// @route   GET /api/files/category/:category
// @access  Private
const getFilesByCategory = async (req, res) => {
  try {
    const files = await File.find({ 
      uploadedBy: req.user._id,
      category: req.params.category 
    })
      .select('-fileData')
      .sort({ createdAt: -1 });

    res.json(files);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  uploadFile,
  getFiles,
  getAllFiles,
  downloadFile,
  deleteFile,
  getFilesByCategory
};