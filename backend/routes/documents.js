const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const auth = require('../middleware/auth');
const Document = require('../models/Document');

// Configuring Multer Disk Engine storage for ANY file type
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        // Keeps the original file extension safely (e.g., .docx, .pptx, .xlsx)
        const fileExt = path.extname(file.originalname);
        const fileName = path.basename(file.originalname, fileExt).replace(/[^a-zA-Z0-9]/g, "_");
        cb(null, Date.now() + '-' + fileName + fileExt);
    }
});

// REMOVED fileFilter to allow PPT, Word, Excel, Images, etc.
const upload = multer({ 
    storage: storage,
    limits: { fileSize: 25 * 1024 * 1024 } // Hard limit of 25MB per file upload
});

// @route   POST api/documents
// @desc    Add a note / upload any file type with space quotas
router.post('/', auth, upload.single('attachedFile'), async (req, res) => {
    try {
        const { title, note } = req.body;
        
        if (!title) {
            if (req.file) fs.unlinkSync(req.file.path); 
            return res.status(400).json({ msg: 'Document title is required' });
        }

        // 1. Calculate how much space this user is currently using
        const userDocs = await Document.find({ user: req.user.id });
        const currentUsedSpace = userDocs.reduce((acc, doc) => acc + (doc.fileSize || 0), 0);
        
        // 2. Check the size of the incoming file
        const incomingFileSize = req.file ? req.file.size : 0;

        // 3. Enforce 25MB restriction rules
        if (currentUsedSpace + incomingFileSize > (25 * 1024 * 1024)) {
            if (req.file) fs.unlinkSync(req.file.path); 
            return res.status(400).json({ 
                msg: `Storage Limit Exceeded! You are allowed a maximum of 25MB total. Please delete older files.` 
            });
        }

        const newDoc = new Document({
            user: req.user.id,
            title,
            note,
            pdfUrl: req.file ? `/uploads/${req.file.filename}` : null, // Keeps the database key path compatible
            fileSize: incomingFileSize 
        });

        const savedDoc = await newDoc.save();
        res.json(savedDoc);
    } catch (err) {
        if (req.file) fs.unlinkSync(req.file.path);
        res.status(500).send('Server Error storing file');
    }
});

// @route   GET api/documents
router.get('/', auth, async (req, res) => {
    try {
        const documents = await Document.find({ user: req.user.id }).sort({ createdAt: -1 });
        res.json(documents);
    } catch (err) {
        res.status(500).send('Server Error fetching files');
    }
});

// @route   DELETE api/documents/:id
router.delete('/:id', auth, async (req, res) => {
    try {
        const doc = await Document.findById(req.params.id);
        
        if (!doc) return res.status(404).json({ msg: 'Document not found' });
        if (doc.user.toString() !== req.user.id) return res.status(401).json({ msg: 'Unauthorized deletion' });

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