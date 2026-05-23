import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import FileCard from '../components/FileCard';
import { getAllFiles, downloadFile, deleteFile } from '../utils/api';
import './Dashboard.css';

const Dashboard = () => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    try {
      setLoading(true);
      const data = await getAllFiles();
      setFiles(data);
    } catch (error) {
      toast.error('Failed to fetch files');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (id, filename) => {
    try {
      const blob = await downloadFile(id);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('File downloaded successfully');
    } catch (error) {
      toast.error('Failed to download file');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this file?')) {
      try {
        await deleteFile(id);
        toast.success('File deleted successfully');
        fetchFiles();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to delete file');
      }
    }
  };

  const filteredFiles = files.filter(file => {
    if (filter === 'all') return true;
    return file.category === filter;
  });

  const user = JSON.parse(localStorage.getItem('user'));

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>📂 File Dashboard</h1>
        <p>View and manage all your shared files</p>
      </div>

      <div className="filter-section">
        <button 
          className={filter === 'all' ? 'filter-btn active' : 'filter-btn'}
          onClick={() => setFilter('all')}
        >
          All Files ({files.length})
        </button>
        <button 
          className={filter === 'office' ? 'filter-btn active' : 'filter-btn'}
          onClick={() => setFilter('office')}
        >
          🏢 Office ({files.filter(f => f.category === 'office').length})
        </button>
        <button 
          className={filter === 'home' ? 'filter-btn active' : 'filter-btn'}
          onClick={() => setFilter('home')}
        >
          🏠 Home ({files.filter(f => f.category === 'home').length})
        </button>
        <button 
          className={filter === 'shared' ? 'filter-btn active' : 'filter-btn'}
          onClick={() => setFilter('shared')}
        >
          🔗 Shared ({files.filter(f => f.category === 'shared').length})
        </button>
      </div>

      {loading ? (
        <div className="loading">Loading files...</div>
      ) : filteredFiles.length === 0 ? (
        <div className="no-files">
          <p>📭 No files found</p>
          <p>Start by uploading your first file!</p>
        </div>
      ) : (
        <div className="files-grid">
          {filteredFiles.map((file) => (
            <FileCard
              key={file._id}
              file={file}
              onDownload={handleDownload}
              onDelete={handleDelete}
              showDelete={file.uploadedBy._id === user._id}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;