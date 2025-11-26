// pages/FullAdminDashboard.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useMembers } from '../../context/MembersContext';
import { uploadToCloudinary } from '../../services/cloudinaryService';
import LoadingSpinner from '../UI/LoadingSpinner';
import './Admindash.css';

function FullAdminDashboard() {
  const { user, logout } = useAuth();
  const { members, loading, error, handleAddMember, handleUpdateMember, handleDeleteMember } = useMembers();
  const [activeTab, setActiveTab] = useState('overview');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [editMode, setEditMode] = useState({ stats: false, note: false });

  // Dashboard Stats (Editable)
  const [dashboardStats, setDashboardStats] = useState({
    totalMembers: 500,
    totalSavings: 25000000,
    totalLoans: 5000000,
    activeMembers: 450
  });

  const [tempStats, setTempStats] = useState({...dashboardStats});

  // Admin Notes History
  const [noteHistory, setNoteHistory] = useState([
    {
      id: 1,
      content: "Welcome to Unity Cooperative Admin Dashboard. All systems running smoothly. Last update: November 2024.",
      date: "2024-11-01",
      time: "10:30 AM"
    }
  ]);
  const [newNote, setNewNote] = useState("");

  

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showBorrowModal, setShowBorrowModal] = useState(false);

  const [newMember, setNewMember] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    totalSaved: 0,
    photo: null,
    photoPreview: null
  });
  const [uploadProgress, setUploadProgress] = useState(0);

  const [newBorrow, setNewBorrow] = useState({
    amount: 0,
    reason: '',
    date: new Date().toISOString().split('T')[0]
  });

  // Members are now loaded automatically by the MembersContext

  // Save to localStorage and update homepage
  useEffect(() => {
    localStorage.setItem('cooperativeMembers', JSON.stringify(members));
    localStorage.setItem('dashboardStats', JSON.stringify(dashboardStats));
    localStorage.setItem('noteHistory', JSON.stringify(noteHistory));
  }, [members, dashboardStats, noteHistory]);

  const formatCurrency = (amount) => {
    return `₦${amount.toLocaleString()}`;
  };

  // Save Stats
  const saveStats = () => {
    setDashboardStats(tempStats);
    setEditMode({...editMode, stats: false});
  };

  const cancelStatsEdit = () => {
    setTempStats(dashboardStats);
    setEditMode({...editMode, stats: false});
  };

  // Add New Note
  const addNote = () => {
    if (newNote.trim() === '') return;
    
    const now = new Date();
    const note = {
      id: noteHistory.length + 1,
      content: newNote,
      date: now.toISOString().split('T')[0],
      time: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
    };
    
    setNoteHistory([note, ...noteHistory]); // Add new note at the beginning
    setNewNote('');
  };

  // Delete Note
  const deleteNote = (id) => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      setNoteHistory(noteHistory.filter(n => n.id !== id));
    }
  };

  // Handle Image Upload for New Member with Cloudinary
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size should be less than 5MB');
        return;
      }

      try {
        setUploadProgress(0);
        const uploadResult = await uploadToCloudinary(file, {
          onProgress: (progress) => setUploadProgress(progress),
          folder: 'booseere/members'
        });
        
        setNewMember({
          ...newMember,
          photo: uploadResult.secure_url,
          photoPreview: uploadResult.secure_url
        });
      } catch (error) {
        setError('Failed to upload photo: ' + error.message);
      }
    }
  };

  // Handle Image Upload for Edit Member
  const handleEditImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedMember({
          ...selectedMember,
          photo: reader.result
        });
      };
      reader.readAsDataURL(file);
    }
  };

  // Add Member Form Submit
  const handleAddMemberSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const memberData = {
        name: newMember.name,
        email: newMember.email,
        phone: newMember.phone,
        address: newMember.address,
        totalSaved: newMember.totalSaved,
        photo: newMember.photo || null,
        position: 'Member', // Default position for backend compatibility
      };
      
      await handleAddMember(memberData);
      setShowAddModal(false);
      setNewMember({ 
        name: '', 
        email: '', 
        phone: '', 
        address: '', 
        totalSaved: 0, 
        photo: null,
        photoPreview: null
      });
      setUploadProgress(0);
    } catch (error) {
      console.error('Error adding member:', error);
      alert('Failed to add member. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Edit Member Form Submit
  const handleEditMemberSubmit = async (e) => {
    e.preventDefault();
    try {
      await handleUpdateMember(selectedMember._id || selectedMember.id, selectedMember);
      setShowEditModal(false);
    } catch (error) {
      console.error('Error updating member:', error);
      alert('Failed to update member. Please try again.');
    }
  };

  // Delete Member
  const handleDeleteMemberClick = async (id) => {
    if (window.confirm('Are you sure you want to delete this member?')) {
      try {
        await handleDeleteMember(id);
        setSelectedMember(null);
      } catch (error) {
        console.error('Error deleting member:', error);
        alert('Failed to delete member. Please try again.');
      }
    }
  };

  // Add Borrow Record
  const handleAddBorrow = async (e) => {
    e.preventDefault();
    try {
      const loanData = {
        amount: Number(newBorrow.amount),
        reason: newBorrow.reason,
        date: newBorrow.date,
      };
      
      const updatedMember = await addLoanRecord(selectedMember._id || selectedMember.id, loanData);
      setMembers(members.map(m => (m._id || m.id) === (selectedMember._id || selectedMember.id) ? updatedMember : m));
      setSelectedMember(updatedMember);
      setShowBorrowModal(false);
      setNewBorrow({ amount: 0, reason: '', date: new Date().toISOString().split('T')[0] });
    } catch (error) {
      console.error('Error adding loan record:', error);
      alert('Failed to add loan record. Please try again.');
    }
  };

  // Logout is now handled by AuthContext

  return (
    <div className="full-admin-dashboard">
      
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="sidebar-brand">
          <div className="brand-icon">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2"/>
              <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2"/>
              <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2"/>
            </svg>
          </div>
          <div>
            <h3>Booseere Multipurpose</h3>
            <p>Admin Panel</p>
          </div>
        </div>

        <nav className="sidebar-menu">
          <button className={`menu-item ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => { setActiveTab('overview'); setSelectedMember(null); }}>
            <span className="item-icon">📊</span>
            <span>Overview</span>
          </button>
          <button className={`menu-item ${activeTab === 'members' ? 'active' : ''}`} onClick={() => { setActiveTab('members'); setSelectedMember(null); }}>
            <span className="item-icon">👥</span>
            <span>Members</span>
          </button>
          
          <button className="menu-item logout" onClick={logout}>
            <span className="item-icon">🚪</span>
            <span>Logout</span>
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        
        {/* Top Bar */}
        <header className="top-bar">
          <h1>{activeTab === 'overview' ? 'Dashboard Overview' : activeTab === 'members' ? 'Members Management' : 'Settings'}</h1>
          <div className="top-actions">
            <span className="admin-user">Admin</span>
          </div>
        </header>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="overview-content">
            
            {/* Admin Note Section */}
            <div className="note-section">
              <div className="section-header">
                <h2>📝 Admin Notes</h2>
              </div>
              
              {/* Add New Note */}
              <div className="add-note-box">
                <textarea 
                  className="note-input"
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Write a new note..."
                  rows="3"
                />
                <button className="btn-add-note" onClick={addNote}>
                  + Add Note
                </button>
              </div>

              {/* Notes History */}
              <div className="notes-history">
                <h3>Notes History ({noteHistory.length})</h3>
                {noteHistory.length > 0 ? (
                  <div className="notes-list">
                    {noteHistory.map((note) => (
                      <div key={note.id} className="note-item">
                        <div className="note-content">
                          <p>{note.content}</p>
                          <div className="note-meta">
                            <span className="note-date">📅 {note.date}</span>
                            <span className="note-time">🕐 {note.time}</span>
                          </div>
                        </div>
                        <button className="btn-delete-note" onClick={() => deleteNote(note.id)}>
                          🗑️
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="no-notes">No notes yet. Add your first note above.</p>
                )}
              </div>
            </div>

            {/* Dashboard Stats Section */}
            <div className="stats-section">
              <div className="section-header">
                <h2>📈 Dashboard Statistics</h2>
                {!editMode.stats ? (
                  <button className="btn-edit-small" onClick={() => setEditMode({...editMode, stats: true})}>Edit Stats</button>
                ) : (
                  <div className="edit-actions">
                    <button className="btn-save" onClick={saveStats}>Save</button>
                    <button className="btn-cancel" onClick={cancelStatsEdit}>Cancel</button>
                  </div>
                )}
              </div>

              <div className="stats-cards">
                <div className="stat-card">
                  <div className="stat-icon blue">👥</div>
                  <div className="stat-details">
                    <p className="stat-label">Total Members</p>
                    {editMode.stats ? (
                      <input 
                        type="number" 
                        value={tempStats.totalMembers}
                        onChange={(e) => setTempStats({...tempStats, totalMembers: Number(e.target.value)})}
                        className="stat-input"
                      />
                    ) : (
                      <h3 className="stat-value">{dashboardStats.totalMembers}</h3>
                    )}
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon green">💰</div>
                  <div className="stat-details">
                    <p className="stat-label">Total Savings</p>
                    {editMode.stats ? (
                      <input 
                        type="number" 
                        value={tempStats.totalSavings}
                        onChange={(e) => setTempStats({...tempStats, totalSavings: Number(e.target.value)})}
                        className="stat-input"
                      />
                    ) : (
                      <h3 className="stat-value">{formatCurrency(dashboardStats.totalSavings)}</h3>
                    )}
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon orange">📤</div>
                  <div className="stat-details">
                    <p className="stat-label">Total Loans</p>
                    {editMode.stats ? (
                      <input 
                        type="number" 
                        value={tempStats.totalLoans}
                        onChange={(e) => setTempStats({...tempStats, totalLoans: Number(e.target.value)})}
                        className="stat-input"
                      />
                    ) : (
                      <h3 className="stat-value">{formatCurrency(dashboardStats.totalLoans)}</h3>
                    )}
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon purple">✅</div>
                  <div className="stat-details">
                    <p className="stat-label">Active Members</p>
                    {editMode.stats ? (
                      <input 
                        type="number" 
                        value={tempStats.activeMembers}
                        onChange={(e) => setTempStats({...tempStats, activeMembers: Number(e.target.value)})}
                        className="stat-input"
                      />
                    ) : (
                      <h3 className="stat-value">{dashboardStats.activeMembers}</h3>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Members */}
            <div className="recent-section">
              <h2>Recent Members</h2>
              <div className="recent-list">
                {members?.slice(0, 5)?.map(member => (
                  <div key={member.id} className="recent-item" onClick={() => { setSelectedMember(member); setActiveTab('members'); }}>
                    <img src={member.photo} alt={member.name} />
                    <div className="recent-info">
                      <h4>{member.name}</h4>
                      <p>{member.email}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* Members Tab */}
        {activeTab === 'members' && !selectedMember && (
          <div className="members-content">
            <div className="members-header">
              <h2>All Members ({members.length})</h2>
              <button className="btn-add-member" onClick={() => setShowAddModal(true)}>
                + Add New Member
              </button>
            </div>

            {loading ? (
              <LoadingSpinner size="large" text="Loading members..." />
            ) : error ? (
              <div className="error-state">
                <p>⚠️ {error}</p>
                <button onClick={() => window.location.reload()}>Retry</button>
              </div>
            ) : members.length === 0 ? (
              <div className="empty-state">
                <p>No members found. Click "Add New Member" to get started.</p>
              </div>
            ) : (
              <div className="members-grid">
                {members.map(member => (
                  <div key={member._id || member.id} className="member-card" onClick={() => setSelectedMember(member)}>
                    <img src={member.photo || '/api/placeholder/150/150'} alt={member.name} className="member-photo" />
                    <h3>{member.name}</h3>
                    <p className="member-email">{member.email}</p>
                    <div className="member-stats">
                      <div>
                        <span className="mini-label">Saved</span>
                        <span className="mini-value">{formatCurrency(member.totalSaved || 0)}</span>
                      </div>
                      <div>
                        <span className="mini-label">Borrowed</span>
                        <span className="mini-value">{formatCurrency(member.totalBorrowed || 0)}</span>
                      </div>
                    </div>
                    <span className={`status-pill ${(member.status || 'Active').toLowerCase()}`}>{member.status || 'Active'}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Member Details */}
        {selectedMember && activeTab === 'members' && (
          <div className="member-detail-view">
            <button className="btn-back" onClick={() => setSelectedMember(null)}>← Back to Members</button>

            <div className="detail-container">
              <div className="detail-header">
                <img src={selectedMember.photo} alt={selectedMember.name} className="detail-photo" />
                <div className="detail-title">
                  <h2>{selectedMember.name}</h2>
                  <p>{selectedMember.email}</p>
                  <span className={`status-pill ${selectedMember.status.toLowerCase()}`}>{selectedMember.status}</span>
                </div>
                <div className="detail-actions">
                  <button className="btn-edit-member" onClick={() => setShowEditModal(true)}>✏️ Edit</button>
                  <button className="btn-delete-member" onClick={() => handleDeleteMemberClick(selectedMember._id || selectedMember.id)}>🗑️ Delete</button>
                </div>
              </div>

              <div className="detail-info-grid">
                <div className="info-box">
                  <span className="info-label">Phone</span>
                  <span className="info-value">{selectedMember.phone}</span>
                </div>
                <div className="info-box">
                  <span className="info-label">Address</span>
                  <span className="info-value">{selectedMember.address}</span>
                </div>
                <div className="info-box">
                  <span className="info-label">Join Date</span>
                  <span className="info-value">{selectedMember.joinDate}</span>
                </div>
               
                <div className="info-box highlight">
                  <span className="info-label">Total Saved</span>
                  <span className="info-value big">{formatCurrency(selectedMember.totalSaved)}</span>
                </div>
                <div className="info-box highlight">
                  <span className="info-label">Total Borrowed</span>
                  <span className="info-value big">{formatCurrency(selectedMember.totalBorrowed)}</span>
                </div>
              </div>

              <div className="borrow-section">
                <div className="borrow-header">
                  <h3>💳 Borrow History</h3>
                  <button className="btn-add-borrow" onClick={() => setShowBorrowModal(true)}>+ Add Loan</button>
                </div>
                {selectedMember.borrowHistory.length > 0 ? (
                  <div className="borrow-list">
                    {selectedMember.borrowHistory.map((borrow, idx) => (
                      <div key={idx} className="borrow-item">
                        <div className="borrow-info">
                          <h4>{formatCurrency(borrow.amount)}</h4>
                          <p>{borrow.reason}</p>
                          <span className="borrow-date">📅 {borrow.date}</span>
                        </div>
                        <span className={`borrow-status ${borrow.status.toLowerCase()}`}>{borrow.status}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="no-data">No borrow history yet</p>
                )}
              </div>
            </div>
          </div>
        )}

      </main>

      {/* Add Member Modal */}
      {showAddModal && (
        <div className="modal-backdrop" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Add New Member</h2>
            <form onSubmit={handleAddMemberSubmit} className="modal-form">
              
              {/* Photo Upload Section */}
              <div className="photo-upload-section">
                <div className="photo-preview">
                  {newMember.photoPreview ? (
                    <img src={newMember.photoPreview} alt="Preview" className="preview-image" />
                  ) : (
                    <div className="no-photo">
                      <span className="camera-icon">📷</span>
                      <p>No photo selected</p>
                    </div>
                  )}
                </div>
                <div className="upload-controls">
                  <label htmlFor="member-photo" className="btn-upload">
                    📤 Upload Photo
                    <input
                      type="file"
                      id="member-photo"
                      accept="image/*"
                      onChange={handleImageUpload}
                      style={{ display: 'none' }}
                    />
                  </label>
                  {newMember.photoPreview && (
                    <button
                      type="button"
                      className="btn-remove-photo"
                      onClick={() => setNewMember({...newMember, photo: null, photoPreview: null})}
                    >
                      🗑️ Remove
                    </button>
                  )}
                </div>
              </div>

              <input type="text" placeholder="Full Name *" value={newMember.name} onChange={(e) => setNewMember({...newMember, name: e.target.value})} required />
              <input type="email" placeholder="Email *" value={newMember.email} onChange={(e) => setNewMember({...newMember, email: e.target.value})} required />
              <input type="tel" placeholder="Phone *" value={newMember.phone} onChange={(e) => setNewMember({...newMember, phone: e.target.value})} required />
              <input type="text" placeholder="Address *" value={newMember.address} onChange={(e) => setNewMember({...newMember, address: e.target.value})} required />
              <input type="number" placeholder="Initial Savings" value={newMember.totalSaved} onChange={(e) => setNewMember({...newMember, totalSaved: Number(e.target.value)})} />
             
              <div className="modal-buttons">
                <button type="submit" className={`btn-primary ${isSubmitting ? 'btn-loading' : ''}`} disabled={isSubmitting}>
                  {isSubmitting ? 'Adding...' : 'Add Member'}
                </button>
                <button type="button" className="btn-secondary" onClick={() => setShowAddModal(false)} disabled={isSubmitting}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Member Modal */}
      {showEditModal && (
        <div className="modal-backdrop" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Edit Member</h2>
            <form onSubmit={handleEditMemberSubmit} className="modal-form">
              
              {/* Photo Upload Section */}
              <div className="photo-upload-section">
                <div className="photo-preview">
                  <img src={selectedMember.photo} alt={selectedMember.name} className="preview-image" />
                </div>
                <div className="upload-controls">
                  <label htmlFor="edit-member-photo" className="btn-upload">
                    📤 Change Photo
                    <input
                      type="file"
                      id="edit-member-photo"
                      accept="image/*"
                      onChange={handleEditImageUpload}
                      style={{ display: 'none' }}
                    />
                  </label>
                </div>
              </div>

              <input type="text" value={selectedMember.name} onChange={(e) => setSelectedMember({...selectedMember, name: e.target.value})} required />
              <input type="email" value={selectedMember.email} onChange={(e) => setSelectedMember({...selectedMember, email: e.target.value})} required />
              <input type="tel" value={selectedMember.phone} onChange={(e) => setSelectedMember({...selectedMember, phone: e.target.value})} required />
              <input type="text" value={selectedMember.address} onChange={(e) => setSelectedMember({...selectedMember, address: e.target.value})} required />
              <input type="number" value={selectedMember.totalSaved} onChange={(e) => setSelectedMember({...selectedMember, totalSaved: Number(e.target.value)})} />
             
              <div className="modal-buttons">
                <button type="submit" className="btn-primary">Save Changes</button>
                <button type="button" className="btn-secondary" onClick={() => setShowEditModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Borrow Modal */}
      {showBorrowModal && (
        <div className="modal-backdrop" onClick={() => setShowBorrowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Add Loan Record</h2>
            <form onSubmit={handleAddBorrow} className="modal-form">
              <input type="number" placeholder="Amount" value={newBorrow.amount} onChange={(e) => setNewBorrow({...newBorrow, amount: Number(e.target.value)})} required />
              <input type="text" placeholder="Reason" value={newBorrow.reason} onChange={(e) => setNewBorrow({...newBorrow, reason: e.target.value})} required />
              <input type="date" value={newBorrow.date} onChange={(e) => setNewBorrow({...newBorrow, date: e.target.value})} required />
              <div className="modal-buttons">
                <button type="submit" className="btn-primary">Add Loan</button>
                <button type="button" className="btn-secondary" onClick={() => setShowBorrowModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default FullAdminDashboard;