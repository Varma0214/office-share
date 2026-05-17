const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const auth = require('../middleware/auth');
const Document = require('../models/Document');

// Configuring Multer Disk Engine storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
        cb(null, true);
    } else {
        cb(new Error('System accepts PDFs only'), false);
    }
};

const upload = multer({ storage: storage, fileFilter: fileFilter });

// Define Per-User Storage Limit (25 MB in Bytes)
const USER_SPACE_LIMIT = 25 * 1024 * 1024; 

// @route   POST api/documents
// @desc    Add a note / upload PDF with strict space quotas
router.post('/', auth, upload.single('pdf'), async (req, res) => {
    try {
        const { title, note } = req.body;
        
        if (!title) {
            if (req.file) fs.unlinkSync(req.file.path); // Delete uploaded file if validation fails
            return res.status(400).json({ msg: 'Document title is required' });
        }

        // 1. Calculate how much space this user is currently using
        const userDocs = await Document.find({ user: req.user.id });
        const currentUsedSpace = userDocs.reduce((acc, doc) => acc + doc.fileSize, 0);
        
        // 2. Check the size of the incoming file
        const incomingFileSize = req.file ? req.file.size : 0;

        // 3. Enforce restriction rules
        if (currentUsedSpace + incomingFileSize > USER_SPACE_LIMIT) {
            if (req.file) fs.unlinkSync(req.file.path); // Clean up/Delete the file from backend storage
            return res.status(400).json({ 
                msg: `Storage Limit Exceeded! You are allowed a maximum of 25MB. Please delete existing files to free up space.` 
            });
        }

        const newDoc = new Document({
            user: req.user.id,
            title,
            note,
            pdfUrl: req.file ? `/uploads/${req.file.filename}` : null,
            fileSize: incomingFileSize // Save the file size in DB
        });

        const savedDoc = await newDoc.save();
        res.json(savedDoc);
    } catch (err) {
        if (req.file) fs.unlinkSync(req.file.path);
        res.status(500).send('Server Error storing file');
    }
});

// @route   GET api/documents
// @desc    Fetch specific logged-in user files
router.get('/', auth, async (req, res) => {
    try {
        const documents = await Document.find({ user: req.user.id }).sort({ createdAt: -1 });
        res.json(documents);
    } catch (err) {
        res.status(500).send('Server Error fetching files');
    }
});

// @route   DELETE api/documents/:id
// @desc    Manually delete a file to free up space
router.delete('/:id', auth, async (req, res) => {
    try {
        const doc = await Document.findById(req.id || req.params.id);
        
        if (!doc) return res.status(404).json({ msg: 'Document not found' });
        if (doc.user.toString() !== req.user.id) return res.status(401).json({ msg: 'Unauthorized deletion' });

        // Delete the physical PDF file from the server's backend uploads folder
        if (doc.pdfUrl) {
            const filePath = path.join(__dirname, '..', doc.pdfUrl);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }

        await doc.deleteOne();
        res.json({ msg: 'Document deleted successfully, space freed!' });
    } catch (err) {
        res.status(500).send('Server Error deleting file');
    }
});

module.exports = router;