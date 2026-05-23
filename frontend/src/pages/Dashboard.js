import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getMyFiles, getSharedFiles } from '../utils/api';
import FileCard from '../components/FileCard';
import UploadZone from '../components/UploadZone';
import ShareModal from '../components/ShareModal';
import toast from 'react-hot-toast';

const TABS = [
  { id: 'upload', label: 'Upload', icon: '⬆' },
  { id: 'my', label: 'My Files', icon: '🗂' },
  { id: 'shared', label: 'Shared with Me', icon: '📥' },
];

const CATEGORIES = ['all', 'document', 'pdf', 'presentation', 'spreadsheet', 'image', 'other'];

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('my');
  const [myFiles, setMyFiles] = useState([]);
  const [sharedFiles, setSharedFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [shareTarget, setShareTarget] = useState(null);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    setLoading(true);
    try {
      const [myRes, sharedRes] = await Promise.all([getMyFiles(), getSharedFiles()]);
      setMyFiles(myRes.data);
      setSharedFiles(sharedRes.data);
    } catch {
      toast.error('Failed to load files');
    } finally {
      setLoading(false);
    }
  };

  const handleUploaded = (file) => {
    setMyFiles(prev => [file, ...prev]);
    setActiveTab('my');
  };

  const handleDelete = (fileId) => {
    setMyFiles(prev => prev.filter(f => f._id !== fileId));
  };

  const handleShareUpdated = (updatedFile) => {
    setMyFiles(prev => prev.map(f => f._id === updatedFile._id ? updatedFile : f));
  };

  const currentFiles = activeTab === 'my' ? myFiles : sharedFiles;

  const filteredFiles = currentFiles.filter(f => {
    const matchSearch = !search ||
      f.originalName.toLowerCase().includes(search.toLowerCase()) ||
      f.description?.toLowerCase().includes(search.toLowerCase());
    const matchCat = categoryFilter === 'all' || f.category === categoryFilter;
    return matchSearch && matchCat;
  });

  const stats = {
    total: myFiles.length,
    shared: myFiles.filter(f => f.isPublic || f.sharedWith?.length > 0).length,
    received: sharedFiles.length,
    downloads: myFiles.reduce((s, f) => s + (f.downloadCount || 0), 0)
  };

  return (
    <div className="dashboard">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <h2>⇄ FileSync</h2>
          <span>Office ↔ Home</span>
        </div>
        <nav className="sidebar-nav">
          <div className="nav-section-title">Menu</div>
          {TABS.map(tab => (
            <div
              key={tab.id}
              className={`nav-item ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="nav-icon">{tab.icon}</span>
              <span>{tab.label}</span>
              {tab.id === 'shared' && sharedFiles.length > 0 && (
                <span className="nav-badge">{sharedFiles.length}</span>
              )}
            </div>
          ))}
        </nav>
        <div className="sidebar-user">
          <div className="user-avatar">{user?.name?.charAt(0).toUpperCase()}</div>
          <div className="user-info">
            <div className="user-name">{user?.name}</div>
            <div className="user-email">{user?.email}</div>
          </div>
          <button
            className="btn btn-ghost btn-icon btn-sm"
            onClick={logout}
            title="Logout"
            style={{ marginLeft: 'auto', flexShrink: 0 }}
          >⎋</button>
        </div>
      </aside>

      {/* Main */}
      <main className="main-content">
        <div className="content-header">
          <div>
            <div className="content-title">
              {activeTab === 'upload' && 'Upload File'}
              {activeTab === 'my' && 'My Files'}
              {activeTab === 'shared' && 'Shared with Me'}
            </div>
            <div className="content-subtitle">
              {activeTab === 'upload' && 'Share any file between office and home'}
              {activeTab === 'my' && `${myFiles.length} file${myFiles.length !== 1 ? 's' : ''} uploaded`}
              {activeTab === 'shared' && `${sharedFiles.length} file${sharedFiles.length !== 1 ? 's' : ''} shared with you`}
            </div>
          </div>
        </div>

        <div className="content-body">
          {/* Stats */}
          {activeTab !== 'upload' && (
            <div className="stats-row">
              <div className="stat-card">
                <div className="stat-icon">🗂</div>
                <div className="stat-value">{stats.total}</div>
                <div className="stat-label">My Files</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">⇄</div>
                <div className="stat-value">{stats.shared}</div>
                <div className="stat-label">Shared Out</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">📥</div>
                <div className="stat-value">{stats.received}</div>
                <div className="stat-label">Received</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">⬇</div>
                <div className="stat-value">{stats.downloads}</div>
                <div className="stat-label">Downloads</div>
              </div>
            </div>
          )}

          {/* Upload Tab */}
          {activeTab === 'upload' && (
            <UploadZone onUploaded={handleUploaded} />
          )}

          {/* Files Tab */}
          {activeTab !== 'upload' && (
            <>
              <div className="search-bar">
                <span className="search-icon">🔍</span>
                <input
                  type="text"
                  placeholder="Search files..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>

              <div className="filter-bar">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    className={`filter-btn ${categoryFilter === cat ? 'active' : ''}`}
                    onClick={() => setCategoryFilter(cat)}
                  >
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </button>
                ))}
              </div>

              {loading ? (
                <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>
                  <div className="spinner" style={{ margin: '0 auto' }} />
                </div>
              ) : filteredFiles.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">
                    {activeTab === 'my' ? '🗂' : '📥'}
                  </div>
                  <h3>No files found</h3>
                  <p>
                    {activeTab === 'my'
                      ? 'Upload your first file using the Upload tab'
                      : 'Files shared with you will appear here'}
                  </p>
                </div>
              ) : (
                <div className="files-grid">
                  {filteredFiles.map(file => (
                    <FileCard
                      key={file._id}
                      file={file}
                      currentUser={user}
                      onDelete={handleDelete}
                      onShare={setShareTarget}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* Share Modal */}
      {shareTarget && (
        <ShareModal
          file={shareTarget}
          onClose={() => setShareTarget(null)}
          onUpdated={handleShareUpdated}
        />
      )}
    </div>
  );
}
