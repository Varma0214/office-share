const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const auth = require('../middleware/auth');
const Document = require('../models/Document');

// 1. Create the uploads folder automatically if it doesn't exist
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// 2. Configure Multer Disk Engine storage for all file extensions
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        const fileExt = path.extname(file.originalname);
        // Clean file name to prevent encoding issues with special characters
        const fileName = path.basename(file.originalname, fileExt).replace(/[^a-zA-Z0-9]/g, "_");
        cb(null, Date.now() + '-' + fileName + fileExt);
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 25 * 1024 * 1024 } // 25MB individual file limit
});

// @route   POST api/documents
// @desc    Upload any file format with strict space constraints
// CRITICAL FIX: The parameter string here ('attachedFile') matches your frontend FormData exactly
router.post('/', auth, upload.single('attachedFile'), async (req, res) => {
    try {
        const { title, note } = req.body;
        
        if (!title) {
            if (req.file) fs.unlinkSync(req.file.path); 
            return res.status(400).json({ msg: 'Document title is required' });
        }

        // Calculate total space used by this specific user
        const userDocs = await Document.find({ user: req.user.id });
        const currentUsedSpace = userDocs.reduce((acc, doc) => acc + (doc.fileSize || 0), 0);
        
        const incomingFileSize = req.file ? req.file.size : 0;

        // Block upload if it goes over your 25MB MongoDB free tier limit
        if (currentUsedSpace + incomingFileSize > (25 * 1024 * 1024)) {
            if (req.file) fs.unlinkSync(req.file.path); 
            return res.status(400).json({ 
                msg: `Storage Limit Exceeded! You are allowed a maximum of 25MB total. Please delete older files.` 
            });
        }

        // Build the new document structure mapping cleanly to your User Schema
        const newDoc = new Document({
            user: req.user.id,
            title,
            note,
            pdfUrl: req.file ? `/uploads/${req.file.filename}` : null, // Stores the static link path string
            fileSize: incomingFileSize 
        });

        const savedDoc = await newDoc.save();
        return res.json(savedDoc);

    } catch (err) {
        console.error("Upload Route Error Log:", err);
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path); // Remove file if database fails to save
        }
        return res.status(500).json({ msg: 'Internal Server Error processing file upload' });
    }
});

// @route   GET api/documents
// @desc    Fetch files for logged-in user
router.get('/', auth, async (req, res) => {
    try {
        const documents = await Document.find({ user: req.user.id }).sort({ createdAt: -1 });
        return res.json(documents);
    } catch (err) {
        return res.status(500).json({ msg: 'Server Error fetching documents stream' });
    }
});

// @route   DELETE api/documents/:id
// @desc    Delete a file to recover storage space
router.delete('/:id', auth, async (req, res) => {
    try {
        const doc = await Document.findById(req.params.id);
        
        if (!doc) return res.status(404).json({ msg: 'Document not found' });
        if (doc.user.toString() !== req.user.id) return res.status(401).json({ msg: 'Unauthorized action' });

        // Safe check to delete physical asset from the backend storage disk
        if (doc.pdfUrl) {
            const filePath = path.join(__dirname, '..', doc.pdfUrl);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }

        await doc.deleteOne();
        return res.json({ msg: 'Document deleted successfully, space freed!' });
    } catch (err) {
        return res.status(500).json({ msg: 'Server Error executing document deletion' });
    }
});

module.exports = router;