import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';
import { API_BASE_URL } from '../config';

const Dashboard = () => {
    const [documents, setDocuments] = useState([]);
    const [title, setTitle] = useState('');
    const [note, setNote] = useState('');
    const [attachedFile, setAttachedFile] = useState(null); // Renamed state to represent all formats
    const [usedSpace, setUsedSpace] = useState(0); 
    const [status, setStatus] = useState({ type: '', text: '' });
    const navigate = useNavigate();

    const token = localStorage.getItem('token');
    const SPACE_LIMIT_MB = 25;

    const BACKEND_ROOT_URL = API_BASE_URL.replace(/\/api$/, '');

    const fetchLoggedData = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/documents`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setDocuments(res.data);
            
            const totalBytes = res.data.reduce((acc, doc) => acc + (doc.fileSize || 0), 0);
            const totalMB = (totalBytes / (1024 * 1024)).toFixed(2);
            setUsedSpace(totalMB);
        } catch (err) {
            console.error('Error loading documents:', err);
        }
    };

    useEffect(() => {
        fetchLoggedData();
    }, []);

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setStatus({ type: '', text: '' });

        const dataPayload = new FormData();
        dataPayload.append('title', title);
        dataPayload.append('note', note);
        if (attachedFile) dataPayload.append('attachedFile', attachedFile); // Matches the updated backend multer key

        try {
            await axios.post(`${API_BASE_URL}/documents`, dataPayload, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            setTitle('');
            setNote('');
            setAttachedFile(null);
            document.getElementById('fileInput').value = ''; 
            setStatus({ type: 'success', text: '✅ File uploaded successfully!' });
            fetchLoggedData();
        } catch (err) {
            setStatus({ 
                type: 'error', 
                text: err.response?.data?.msg || '❌ Failed to save document.' 
            });
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this file to free up space?")) return;
        
        try {
            await axios.delete(`${API_BASE_URL}/documents/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setStatus({ type: 'success', text: '🗑️ File removed and space recovered!' });
            fetchLoggedData();
        } catch (err) {
            setStatus({ type: 'error', text: 'Failed to clear the document.' });
        }
    };

    const handleSignOut = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    // Helper function to extract and highlight file types elegantly on screen
    const getFileLinkText = (url) => {
        if (!url) return '';
        const ext = url.split('.').pop().toUpperCase();
        return `📥 Download ${ext} File`;
    };

    return (
        <div className="dashboard-wrapper">
            <div className="dashboard-header">
                <h2>📁 Office & Home File Share</h2>
                <button onClick={handleSignOut} className="logout-btn">Log Out</button>
            </div>

            <div style={{ backgroundColor: '#fffbeb', border: '1px solid #f59e0b', color: '#b45309', padding: '15px', borderRadius: '8px', marginBottom: '20px', fontSize: '14px', fontWeight: '500' }}>
                ⚠️ <strong>Notice:</strong> All files uploaded to this platform are completely deleted automatically after <strong>2 days (48 hours)</strong>. Please download files to your local machine before they expire.
            </div>

            <div style={{ background: '#1e293b', padding: '15px', borderRadius: '8px', marginBottom: '25px', border: '1px solid #334155' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px' }}>
                    <span><strong>Your Storage Quota Usage:</strong></span>
                    <span><strong>{usedSpace} MB / {SPACE_LIMIT_MB} MB</strong></span>
                </div>
                <div style={{ width: '100%', backgroundColor: '#0f172a', borderRadius: '4px', height: '10px', overflow: 'hidden' }}>
                    <div style={{ 
                        width: `${Math.min((usedSpace / SPACE_LIMIT_MB) * 100, 100)}%`, 
                        backgroundColor: usedSpace > 20 ? '#ef4444' : '#3b82f6', 
                        height: '100%', 
                        transition: 'width 0.3s ease' 
                    }}></div>
                </div>
            </div>

            {status.text && (
                <div className={`status-msg ${status.type}`}>
                    {status.text}
                </div>
            )}

            <div className="upload-section">
                <h3>Upload New Notes or Work Files</h3>
                <form onSubmit={handleFormSubmit}>
                    <div style={{ marginBottom: '16px' }}>
                        <input type="text" placeholder="Title (e.g., Q3 Financial Sheet or Project Slides)" value={title} onChange={(e) => setTitle(e.target.value)} required />
                    </div>
                    <div style={{ marginBottom: '16px' }}>
                        <textarea placeholder="Type any reminders, descriptions, or inline notes here..." value={note} onChange={(e) => setNote(e.target.value)} />
                    </div>
                    <div className="file-input-wrapper">
                        <label>Attach Any File Type (Word, Excel, PPT, Image, etc.):</label>
                        {/* CHANGED: Removed accept="application/pdf" to open up all file pickers */}
                        <input id="fileInput" type="file" onChange={(e) => setAttachedFile(e.target.files[0])} className="file-custom-input" />
                    </div>
                    <button type="submit" className="submit-btn">Save & Upload</button>
                </form>
            </div>

            <h3 className="stream-title">Your Saved Files & Notes</h3>
            
            {documents.length === 0 ? (
                <div className="empty-state">
                    <p>No documents found. Use the box above to save your first file!</p>
                </div>
            ) : (
                <div className="document-grid">
                    {documents.map((doc) => (
                        <div key={doc._id} className="doc-card">
                            <div>
                                <h4 className="doc-title">{doc.title}</h4>
                                {doc.note && <div className="doc-note">{doc.note}</div>}
                            </div>
                            <div style={{ marginTop: '15px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    {doc.pdfUrl ? (
                                        <a href={`${BACKEND_ROOT_URL}${doc.pdfUrl}`} download target="_blank" rel="noopener noreferrer" className="doc-link">
                                            {getFileLinkText(doc.pdfUrl)} &rarr;
                                        </a>
                                    ) : <span></span>}
                                    
                                    <button onClick={() => handleDelete(doc._id)} style={{ background: 'transparent', color: '#fca5a5', border: '1px solid #ef4444', padding: '4px 10px', fontSize: '12px', borderRadius: '4px' }}>
                                        Delete File
                                    </button>
                                </div>
                                <small className="doc-timestamp">
                                    Uploaded: {new Date(doc.createdAt).toLocaleString()} <br/>
                                    <span style={{ color: '#f59e0b' }}>⚠️ Self-destructs in 2 days</span>
                                </small>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Dashboard;