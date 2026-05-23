import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { uploadFile } from '../utils/api';
import { formatFileSize } from '../utils/fileHelpers';
import toast from 'react-hot-toast';

export default function UploadZone({ onUploaded }) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const onDrop = useCallback((accepted) => {
    if (accepted.length > 0) {
      setSelectedFile(accepted[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    maxSize: 50 * 1024 * 1024,
    onDropRejected: (files) => {
      const err = files[0]?.errors[0];
      if (err?.code === 'file-too-large') toast.error('File must be under 50MB');
      else toast.error('File type not supported');
    }
  });

  const handleUpload = async () => {
    if (!selectedFile) return toast.error('Please select a file first');
    setUploading(true);
    setProgress(0);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('description', description);
      formData.append('isPublic', isPublic);

      const { data } = await uploadFile(formData, setProgress);
      onUploaded(data);
      toast.success('File uploaded successfully!');
      setSelectedFile(null);
      setDescription('');
      setIsPublic(false);
      setProgress(0);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="upload-section">
      <div {...getRootProps()} className={`upload-zone ${isDragActive ? 'drag-active' : ''}`}>
        <input {...getInputProps()} />
        <div className="upload-icon">{selectedFile ? '✅' : '☁️'}</div>
        {selectedFile ? (
          <>
            <h3>{selectedFile.name}</h3>
            <p>{formatFileSize(selectedFile.size)}</p>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 6 }}>
              Click or drop to replace
            </p>
          </>
        ) : (
          <>
            <h3>{isDragActive ? 'Drop your file here' : 'Drag & drop a file'}</h3>
            <p>or click to browse</p>
            <p className="upload-hint">Word, PDF, PPT, Excel, Images · Max 50MB</p>
          </>
        )}
      </div>

      {selectedFile && (
        <div className="upload-options">
          <input
            type="text" className="form-input"
            placeholder="Description (optional)"
            value={description}
            onChange={e => setDescription(e.target.value)}
          />
          <div className="toggle-row">
            <label className="toggle">
              <input type="checkbox" checked={isPublic} onChange={e => setIsPublic(e.target.checked)} />
              <span className="toggle-slider" />
            </label>
            <span className="toggle-label">Public</span>
          </div>
          <button
            className="btn btn-primary"
            onClick={handleUpload}
            disabled={uploading}
          >
            {uploading ? `Uploading ${progress}%` : '⬆ Upload'}
          </button>
        </div>
      )}

      {uploading && (
        <div className="upload-progress">
          <div className="progress-label">
            <span>Uploading...</span>
            <span>{progress}%</span>
          </div>
          <div className="progress-bar-bg">
            <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}
    </div>
  );
}
