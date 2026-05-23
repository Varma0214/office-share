import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { uploadFile } from '../utils/api';
import './Upload.css';

const Upload = () => {
  const [file, setFile] = useState(null);
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('shared');
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const navigate = useNavigate();

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      toast.error('Please select a file');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('description', description);
    formData.append('category', category);

    try {
      setLoading(true);
      await uploadFile(formData);
      toast.success('File uploaded successfully!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to upload file');
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="upload-container">
      <div className="upload-card">
        <h1 className="upload-title">📤 Upload File</h1>
        <p className="upload-subtitle">Share files between office and home</p>

        <form onSubmit={handleSubmit} className="upload-form">
          <div
            className={`drop-zone ${dragActive ? 'active' : ''}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              type="file"
              id="file-input"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
            
            {file ? (
              <div className="file-preview">
                <div className="file-icon-large">📎</div>
                <div className="file-info">
                  <p className="file-name">{file.name}</p>
                  <p className="file-size">{formatFileSize(file.size)}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setFile(null)}
                  className="btn-remove"
                >
                  ✕ Remove
                </button>
              </div>
            ) : (
              <label htmlFor="file-input" className="drop-zone-label">
                <div className="upload-icon">📁</div>
                <p>Drag and drop your file here</p>
                <p className="or-text">or</p>
                <button type="button" className="btn-browse">
                  Browse Files
                </button>
                <p className="file-types">
                  Supports: Word, Excel, PowerPoint, PDF, Images, and more
                </p>
              </label>
            )}
          </div>

          <div className="form-group">
            <label>Description (Optional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add a description for this file..."
              className="form-textarea"
              rows="3"
            />
          </div>

          <div className="form-group">
            <label>Category</label>
            <div className="category-options">
              <label className="radio-label">
                <input
                  type="radio"
                  value="office"
                  checked={category === 'office'}
                  onChange={(e) => setCategory(e.target.value)}
                />
                <span>🏢 Office</span>
              </label>
              <label className="radio-label">
                <input
                  type="radio"
                  value="home"
                  checked={category === 'home'}
                  onChange={(e) => setCategory(e.target.value)}
                />
                <span>🏠 Home</span>
              </label>
              <label className="radio-label">
                <input
                  type="radio"
                  value="shared"
                  checked={category === 'shared'}
                  onChange={(e) => setCategory(e.target.value)}
                />
                <span>🔗 Shared</span>
              </label>
            </div>
          </div>

          <button
            type="submit"
            className="btn-upload"
            disabled={loading || !file}
          >
            {loading ? 'Uploading...' : '📤 Upload File'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Upload;