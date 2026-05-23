import React, { useState, useEffect, useRef } from 'react';
import { searchUsers, shareFile } from '../utils/api';
import toast from 'react-hot-toast';

export default function ShareModal({ file, onClose, onUpdated }) {
  const [emailInput, setEmailInput] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [isPublic, setIsPublic] = useState(file?.isPublic || false);
  const [loading, setLoading] = useState(false);
  const searchRef = useRef(null);

  useEffect(() => {
    if (file?.sharedWith) {
      setSelectedUsers(file.sharedWith.map(u => ({ _id: u._id, name: u.name, email: u.email })));
    }
  }, [file]);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (emailInput.length >= 2) {
        try {
          const { data } = await searchUsers(emailInput);
          setSearchResults(data.filter(u => !selectedUsers.find(s => s._id === u._id)));
        } catch { setSearchResults([]); }
      } else {
        setSearchResults([]);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [emailInput, selectedUsers]);

  const addUser = (user) => {
    setSelectedUsers(prev => [...prev, user]);
    setEmailInput('');
    setSearchResults([]);
  };

  const removeUser = (userId) => {
    setSelectedUsers(prev => prev.filter(u => u._id !== userId));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const emails = selectedUsers.map(u => u.email);
      const { data } = await shareFile(file._id, { emails, isPublic });
      onUpdated(data);
      toast.success('Sharing settings updated');
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update sharing');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <span className="modal-title">Share File</span>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 20 }}>
          📄 <strong style={{ color: 'var(--text-primary)' }}>{file?.originalName}</strong>
        </p>

        <div className="toggle-row">
          <label className="toggle">
            <input type="checkbox" checked={isPublic} onChange={e => setIsPublic(e.target.checked)} />
            <span className="toggle-slider" />
          </label>
          <span className="toggle-label">Make public (anyone with access can view)</span>
        </div>

        <div className="form-group" style={{ marginTop: 16 }}>
          <label className="form-label">Share with people</label>
          <div style={{ position: 'relative' }} ref={searchRef}>
            <input
              type="text" className="form-input"
              placeholder="Search by email..."
              value={emailInput}
              onChange={e => setEmailInput(e.target.value)}
            />
            {searchResults.length > 0 && (
              <div className="search-results">
                {searchResults.map(user => (
                  <div key={user._id} className="search-result-item" onClick={() => addUser(user)}>
                    <div className="user-avatar" style={{ width: 30, height: 30, fontSize: '0.75rem' }}>
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="search-result-name">{user.name}</div>
                      <div className="search-result-email">{user.email}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {selectedUsers.length > 0 && (
            <div className="shared-users">
              {selectedUsers.map(user => (
                <div key={user._id} className="user-chip">
                  <span>{user.name}</span>
                  <button onClick={() => removeUser(user._id)}>✕</button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 24 }}>
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={loading}>
            {loading ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>
    </div>
  );
}
