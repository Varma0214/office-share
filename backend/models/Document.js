const mongoose = require('mongoose');

const DocumentSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    note: {
        type: String,
        trim: true
    },
    pdfUrl: {
        type: String, // Stores the secure Cloudinary web URL string
        default: null
    },
    fileSize: { 
        type: Number, 
        default: 0 // Tracked in bytes
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 172800 // 🔥 AUTOMATIC EXPIRATION: 2 Days = 172800 seconds
    }
});

module.exports = mongoose.model('Document', DocumentSchema);