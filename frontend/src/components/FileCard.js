import React, { useState } from 'react';
import { formatFileSize, getFileIcon, getCategoryColor, formatDate } from '../utils/fileHelpers';
import { deleteFile } from '../utils/api';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function FileCard({ file, currentUser, onDelete, onShare }) {
  const isOwner =
    file.uploadedBy?._id === currentUser?._id ||
    file.uploadedBy === currentUser?._id;
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/files/download/${file._id}`,
        {
          responseType: 'blob',
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      // Check if response is an error JSON disguised as blob
      const contentType = response.headers['content-type'] || '';
      if (contentType.includes('application/json')) {
        const text = await response.data.text();
        const json = JSON.parse(text);
        toast.error(json.message || 'Download failed');
        return;
      }

      const blob = new Blob([response.data], { type: file.fileType });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.originalName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast.success('Downloaded successfully');
    } catch (err) {
      // Parse blob error response
      if (err.response?.data instanceof Blob) {
        try {
          const text = await err.response.data.text();
          const json = JSON.parse(text);
          toast.error(json.message || 'Download failed');
        } catch {
          toast.error('Download failed');
        }
      } else {
        toast.error(err.response?.data?.message || 'Download failed');
      }
    } finally {
      setDownloading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Delete "${file.originalName}"?`)) return;
    try {
      await deleteFile(file._id);
      onDelete(file._id);
      toast.success('File deleted');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  const catColor = getCategoryColor(file.category);

  return (
    <div className="file-card" style={{ '--cat-color': catColor }}>
      <div className="file-card-header">
        <div className="file-icon-wrap" style={{ background: `${catColor}18` }}>
          {getFileIcon(file.fileType, file.category)}
        </div>
        <div className="file-info">
          <div className="file-name" title={file.originalName}>{file.originalName}</div>
          <div className="file-meta">
            {formatFileSize(file.fileSize)} · {formatDate(file.createdAt)}
          </div>
          <div className="file-meta" style={{ marginTop: 2 }}>
            by {isOwner ? 'You' : file.uploadedBy?.name}
          </div>
        </div>
      </div>

      {file.description && <div className="file-desc">{file.description}</div>}

      <div className="file-tags">
        <span className="tag">{file.category}</span>
        {file.isPublic && <span className="tag tag-public">🌐 Public</span>}
        {!file.isPublic && file.sharedWith?.length > 0 && (
          <span className="tag tag-shared">👥 {file.sharedWith.length} shared</span>
        )}
        {file.downloadCount > 0 && (
          <span className="tag">⬇ {file.downloadCount}</span>
        )}
      </div>

      <div className="file-card-footer">
        <button
          className="btn btn-ghost btn-sm"
          onClick={handleDownload}
          disabled={downloading}
        >
          {downloading ? '⏳ Downloading...' : '⬇ Download'}
        </button>
        {isOwner && (
          <>
            <button className="btn btn-success btn-sm" onClick={() => onShare(file)}>
              ⇄ Share
            </button>
            <button className="btn btn-danger btn-sm" onClick={handleDelete}>
              🗑
            </button>
          </>
        )}
      </div>
    </div>
  );
}