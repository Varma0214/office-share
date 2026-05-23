const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
  filename: {
    type: String,
    required: true
  },
  originalName: {
    type: String,
    required: true
  },
  fileType: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  filePath: {
    type: String,
    required: true
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sharedWith: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  isPublic: {
    type: Boolean,
    default: false
  },
  description: {
    type: String,
    default: ''
  },
  category: {
    type: String,
    enum: ['document', 'presentation', 'spreadsheet', 'pdf', 'image', 'other'],
    default: 'other'
  },
  downloadCount: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

// Auto-categorize based on mimetype
fileSchema.pre('save', function (next) {
  const type = this.fileType;
  if (type.includes('word') || type.includes('document')) this.category = 'document';
  else if (type.includes('presentation') || type.includes('powerpoint')) this.category = 'presentation';
  else if (type.includes('sheet') || type.includes('excel')) this.category = 'spreadsheet';
  else if (type.includes('pdf')) this.category = 'pdf';
  else if (type.includes('image')) this.category = 'image';
  else this.category = 'other';
  next();
});

module.exports = mongoose.model('File', fileSchema);
