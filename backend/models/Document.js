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
        type: String,
        default: null
    },
    fileSize: { 
        type: Number, 
        default: 0 // Size in Bytes
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 172800 // 🔥 AUTOMATIC DELETION: 172800 seconds = 2 days
    }
});

module.exports = mongoose.model('Document', DocumentSchema);