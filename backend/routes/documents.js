const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Document = require('../models/Document');

// @route   POST api/documents
// @desc    Save metadata and secure link without processing heavy body buffers
router.post('/', auth, async (req, res) => {
    try {
        const { title, note, fileUrl, fileSize } = req.body;
        
        if (!title) {
            return res.status(400).json({ msg: 'Document title is required' });
        }

        // Calculate space limits (Max 25MB total across user cluster records)
        const userDocs = await Document.find({ user: req.user.id });
        const currentUsedSpace = userDocs.reduce((acc, doc) => acc + (doc.fileSize || 0), 0);

        if (currentUsedSpace + (fileSize || 0) > (25 * 1024 * 1024)) {
            return res.status(400).json({ 
                msg: `Storage Limit Exceeded! You are allowed a maximum of 25MB total. Please delete older files.` 
            });
        }

        const newDoc = new Document({
            user: req.user.id,
            title,
            note,
            pdfUrl: fileUrl, // Contains Cloudinary link string
            fileSize: fileSize || 0
        });

        const savedDoc = await newDoc.save();
        return res.json(savedDoc);
    } catch (err) {
        return res.status(500).json({ msg: 'Internal Server Error saving document database reference' });
    }
});

// @route   GET api/documents
router.get('/', auth, async (req, res) => {
    try {
        const documents = await Document.find({ user: req.user.id }).sort({ createdAt: -1 });
        return res.json(documents);
    } catch (err) {
        return res.status(500).json({ msg: 'Server Error fetching documents stream' });
    }
});

// @route   DELETE api/documents/:id
router.delete('/:id', auth, async (req, res) => {
    try {
        const doc = await Document.findById(req.params.id);
        if (!doc) return res.status(404).json({ msg: 'Document not found' });
        if (doc.user.toString() !== req.user.id) return res.status(401).json({ msg: 'Unauthorized action' });

        await doc.deleteOne();
        return res.json({ msg: 'Document entry removed, space freed!' });
    } catch (err) {
        return res.status(500).json({ msg: 'Server Error executing document deletion' });
    }
});

module.exports = router;