import React from 'react';
import './FileCard.css';

const FileCard = ({ file, onDownload, onDelete, showDelete }) => {
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getFileIcon = (mimetype) => {
    if (mimetype.includes('pdf')) return '📄';
    if (mimetype.includes('word') || mimetype.includes('document')) return '📝';
    if (mimetype.includes('sheet') || mimetype.includes('excel')) return '📊';
    if (mimetype.includes('presentation') || mimetype.includes('powerpoint')) return '📽️';
    if (mimetype.includes('image')) return '🖼️';
    if (mimetype.includes('video')) return '🎥';
    if (mimetype.includes('audio')) return '🎵';
    if (mimetype.includes('zip') || mimetype.includes('rar')) return '🗜️';
    return '📎';
  };

  const getCategoryBadge = (category) => {
    const badges = {
      office: { emoji: '🏢', color: '#3498db' },
      home: { emoji: '🏠', color: '#e74c3c' },
      shared: { emoji: '🔗', color: '#2ecc71' }
    };
    return badges[category] || badges.shared;
  };

  const badge = getCategoryBadge(file.category);

  return (
    <div className="file-card">
      <div className="file-icon">{getFileIcon(file.mimetype)}</div>
      <div className="file-details">
        <h3 className="file-name">{file.originalName}</h3>
        {file.description && <p className="file-description">{file.description}</p>}
        <div className="file-meta">
          <span className="file-size">{formatFileSize(file.size)}</span>
          <span className="file-date">{formatDate(file.createdAt)}</span>
        </div>
        {file.uploadedBy && (
          <p className="file-uploader">By: {file.uploadedBy.name}</p>
        )}
        <span 
          className="category-badge" 
          style={{ backgroundColor: badge.color }}
        >
          {badge.emoji} {file.category}
        </span>
      </div>
      <div className="file-actions">
        <button 
          onClick={() => onDownload(file._id, file.originalName)} 
          className="btn-download"
        >
          ⬇️ Download
        </button>
        {showDelete && (
          <button 
            onClick={() => onDelete(file._id)} 
            className="btn-delete"
          >
            🗑️ Delete
          </button>
        )}
      </div>
    </div>
  );
};

export default FileCard;