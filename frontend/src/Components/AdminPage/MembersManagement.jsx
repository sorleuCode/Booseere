import React, { useState } from 'react';
import { useMembers } from '../../context/MembersContext';
import { useConfirm } from '../../hooks';
import { uploadToCloudinary } from '../../services/cloudinaryService';
import { loanAPI } from '../../api/loans';
import { formatDateTime, formatDate } from '../../utils/dateUtils';
import LoadingSpinner from '../UI/LoadingSpinner';
import ConfirmModal from '../UI/ConfirmModal';

function MembersManagement({ selectedMember, setSelectedMember }) {
  const { members, loading, error, handleAddMember, handleUpdateMember, handleDeleteMember } = useMembers();
  const { confirm, confirmState } = useConfirm();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter and search state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [positionFilter, setPositionFilter] = useState('all');
  const [sortBy, setSortBy] = useState('joinDate');
  const [sortOrder, setSortOrder] = useState('desc');
  const [filteredMembers, setFilteredMembers] = useState([]);

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showLoanModal, setShowLoanModal] = useState(false);

  const [newMember, setNewMember] = useState({
    fullName: '',
    phone: '',
    address: '',
    totalContributions: 0,
    photo: null,
    photoPreview: null
  });
  const [uploadProgress, setUploadProgress] = useState(0);
  const [imageErrorStates, setImageErrorStates] = useState({});

  const [newLoan, setNewLoan] = useState({
    loanAmount: '',
    purpose: '',
    interestRate: 5,
  });

  // Filter and sort members
  const filterAndSortMembers = () => {
    let filtered = [...members];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(member =>
        member.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.phone?.includes(searchTerm) ||
        member.membershipNumber?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(member => member.status === statusFilter);
    }

    // Position filter
    if (positionFilter !== 'all') {
      if (positionFilter === 'executive') {
        filtered = filtered.filter(member => member.position !== 'Member');
      } else {
        filtered = filtered.filter(member => member.position === positionFilter);
      }
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue, bValue;

      switch (sortBy) {
        case 'fullName':
          aValue = a.fullName || '';
          bValue = b.fullName || '';
          break;
        case 'totalContributions':
          aValue = a.totalContributions || 0;
          bValue = b.totalContributions || 0;
          break;
        case 'joinDate':
          aValue = new Date(a.joinDate);
          bValue = new Date(b.joinDate);
          break;
        default:
          aValue = a.createdAt;
          bValue = b.createdAt;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredMembers(filtered);
  };

  // Update filtered members when filters or members change
  React.useEffect(() => {
    filterAndSortMembers();
  }, [members, searchTerm, statusFilter, positionFilter, sortBy, sortOrder]);

  const formatCurrency = (amount) => {
    return `₦${amount.toLocaleString()}`;
  };

  // Create a reliable SVG placeholder
  const createPlaceholderImage = (text = 'Member') => {
    const svg = `
      <svg width="150" height="150" xmlns="http://www.w3.org/2000/svg">
        <rect width="150" height="150" fill="#4f9cf9"/>
        <text x="75" y="75" font-family="Arial, sans-serif" font-size="12" fill="white" text-anchor="middle" dy=".3em">${text}</text>
      </svg>
    `;
    return `data:image/svg+xml;base64,${btoa(svg)}`;
  };

  const defaultPlaceholder = createPlaceholderImage('Member');

  // Handle image errors to prevent infinite loops
  const handleImageError = (e, memberId) => {
    const key = memberId || 'default';
    if (!imageErrorStates[key]) {
      setImageErrorStates(prev => ({ ...prev, [key]: true }));
      e.target.src = defaultPlaceholder;
    }
  };

  // Handle Image Upload for New Member with Cloudinary
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB');
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
        setUploadProgress(0);
      } catch (error) {
        alert('Failed to upload photo: ' + error.message);
      }
    }
  };

  // Handle Image Upload for Edit Member with Cloudinary
  const handleEditImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB');
        return;
      }

      try {
        setUploadProgress(0);
        const uploadResult = await uploadToCloudinary(file, {
          onProgress: (progress) => setUploadProgress(progress),
          folder: 'booseere/members'
        });

        setSelectedMember({
          ...selectedMember,
          profileImage: uploadResult.secure_url,
          photo: uploadResult.secure_url,
          photoPreview: uploadResult.secure_url
        });
        setUploadProgress(0);
      } catch (error) {
        alert('Failed to upload photo: ' + error.message);
      }
    }
  };

  // Add Member Form Submit
  const handleAddMemberSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const memberData = {
        fullName: newMember.fullName,
        phone: newMember.phone,
        address: newMember.address,
        totalContributions: newMember.totalContributions || 0,
        profileImage: newMember.photo || null,
        position: 'Member',
      };

      await handleAddMember(memberData);
      setShowAddModal(false);
      setNewMember({
        fullName: '',
        phone: '',
        address: '',
        totalContributions: 0,
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
      const updateData = {
        ...selectedMember,
        profileImage: selectedMember.profileImage || selectedMember.photo || null
      };
      
      await handleUpdateMember(selectedMember._id || selectedMember.id, updateData);
      setShowEditModal(false);
    } catch (error) {
      console.error('Error updating member:', error);
      alert('Failed to update member. Please try again.');
    }
  };

  // Delete Member
  const handleDeleteMemberClick = async (id) => {
    const confirmed = await confirm({
      title: 'Delete Member',
      message: 'Are you sure you want to delete this member? This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      confirmButtonClass: 'btn-danger'
    });

    if (confirmed) {
      try {
        await handleDeleteMember(id);
        setSelectedMember(null);
      } catch (error) {
        console.error('Error deleting member:', error);
        alert('Failed to delete member. Please try again.');
      }
    }
  };

  // Create Loan for Member
  const handleCreateLoan = async (e) => {
    e.preventDefault();
    try {
      const loanData = {
        loanAmount: Number(newLoan.loanAmount),
        purpose: newLoan.purpose,
        interestRate: Number(newLoan.interestRate),
        memberId: selectedMember._id,
      };

      const response = await loanAPI.apply(loanData);
      if (response.success) {
        alert('Loan created successfully!');
        setShowLoanModal(false);
        setNewLoan({
          loanAmount: '',
          purpose: '',
          interestRate: 5,
        });
      }
    } catch (error) {
      console.error('Error creating loan:', error);
      alert('Failed to create loan. Please try again.');
    }
  };

  return (
    <>
      {!selectedMember ? (
        <div className="members-content">
          <div className="members-header">
            <h2>All Members ({filteredMembers.length})</h2>
            <button className="btn-add-member" onClick={() => setShowAddModal(true)}>
              + Add New Member
            </button>
          </div>

          {/* Search and Filter Controls */}
          <div className="filters-section">
            <div className="search-box">
              <input
                type="text"
                placeholder="Search by name, phone, membership number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>

            <div className="filter-controls">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
              </select>

              <select
                value={positionFilter}
                onChange={(e) => setPositionFilter(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Positions</option>
                <option value="executive">Executive</option>
                <option value="President">President</option>
                <option value="Vice President">Vice President</option>
                <option value="Secretary">Secretary</option>
                <option value="Treasurer">Treasurer</option>
                <option value="Member">Member</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="filter-select"
              >
                <option value="joinDate">Sort by Join Date</option>
                <option value="fullName">Sort by Name</option>
                <option value="totalContributions">Sort by Contributions</option>
              </select>

              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="sort-toggle"
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </button>
            </div>
          </div>

          {loading ? (
            <LoadingSpinner size="large" />
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
              {filteredMembers.map(member => (
                <div key={member._id || member.id} className="member-card" onClick={() => setSelectedMember(member)}>
                  <img 
                    src={member.profileImage || defaultPlaceholder} 
                    alt={member.fullName} 
                    className="member-photo"
                    onError={(e) => handleImageError(e, member._id || member.id)}
                  />
                  <h3>{member.fullName}</h3>
                  <div className="member-stats">
                    <div>
                      <span className="mini-label">Saved</span>
                      <span className="mini-value">{formatCurrency(member.totalContributions || 0)}</span>
                    </div>
                    <div>
                      <span className="mini-label">Borrowed</span>
                      <span className="mini-value">{formatCurrency(member.totalLoans || 0)}</span>
                    </div>
                  </div>
                  <span className={`status-pill ${(member.status || 'active').toLowerCase()}`}>{member.status || 'active'}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="member-detail-view">
          <button className="btn-back" onClick={() => setSelectedMember(null)}>← Back to Members</button>

          <div className="detail-container">
            <div className="detail-header">
              <img 
                src={selectedMember.profileImage || defaultPlaceholder} 
                alt={selectedMember.fullName} 
                className="detail-photo"
                onError={(e) => handleImageError(e, selectedMember._id || selectedMember.id)}
              />
              <div className="detail-title">
                <h2>{selectedMember.fullName}</h2>
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
                <span className="info-value">{formatDateTime(selectedMember.joinDate)}</span>
              </div>

              <div className="info-box highlight">
                <span className="info-label">Total Contributions</span>
                <span className="info-value big">{formatCurrency(selectedMember.totalContributions || 0)}</span>
              </div>
              <div className="info-box highlight">
                <span className="info-label">Total Loans</span>
                <span className="info-value big">{formatCurrency(selectedMember.totalLoans || 0)}</span>
              </div>
            </div>

            <div className="loan-section">
              <div className="loan-header">
                <h3>💳 Loan Management</h3>
                <button className="btn-create-loan" onClick={() => setShowLoanModal(true)}>
                  + Create Loan
                </button>
              </div>
              <p className="loan-info">Create and manage loans for this member</p>
            </div>
          </div>
        </div>
      )}

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

              <input type="text" placeholder="Full Name *" value={newMember.fullName || ''} onChange={(e) => setNewMember({...newMember, fullName: e.target.value})} required />
              <input type="tel" placeholder="Phone *" value={newMember.phone} onChange={(e) => setNewMember({...newMember, phone: e.target.value})} required />
              <input type="text" placeholder="Address *" value={newMember.address} onChange={(e) => setNewMember({...newMember, address: e.target.value})} required />
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="Initial Contribution Amount (₦)"
                value={newMember.totalContributions || ''}
                onChange={(e) => {
                  const value = Number(e.target.value);
                  if (value >= 0) {
                    setNewMember({...newMember, totalContributions: value});
                  }
                }}
              />

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
                  <img 
                    src={selectedMember.profileImage || selectedMember.photoPreview || defaultPlaceholder} 
                    alt={selectedMember.fullName} 
                    className="preview-image"
                    onError={(e) => handleImageError(e, selectedMember._id || selectedMember.id)}
                  />
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
                  {uploadProgress > 0 && uploadProgress < 100 && (
                    <div className="upload-progress">
                      <div className="progress-bar">
                        <div 
                          className="progress-fill" 
                          style={{ width: `${uploadProgress}%` }}
                        ></div>
                      </div>
                      <span className="progress-text">{uploadProgress}%</span>
                    </div>
                  )}
                </div>
              </div>

              <input type="text" value={selectedMember.fullName} onChange={(e) => setSelectedMember({...selectedMember, fullName: e.target.value})} required />
              <input type="tel" value={selectedMember.phone} onChange={(e) => setSelectedMember({...selectedMember, phone: e.target.value})} required />
              <input type="text" value={selectedMember.address} onChange={(e) => setSelectedMember({...selectedMember, address: e.target.value})} required />
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="Total Contribution Amount (₦)"
                value={selectedMember.totalContributions || ''}
                onChange={(e) => {
                  const value = Number(e.target.value);
                  if (value >= 0) {
                    setSelectedMember({...selectedMember, totalContributions: value});
                  }
                }}
              />

              <div className="modal-buttons">
                <button type="submit" className="btn-primary">Save Changes</button>
                <button type="button" className="btn-secondary" onClick={() => setShowEditModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Loan Modal */}
      {showLoanModal && (
        <div className="modal-backdrop" onClick={() => setShowLoanModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Create Loan for {selectedMember?.fullName}</h2>
            <form onSubmit={handleCreateLoan}>
              <div className="form-group">
                <label>Loan Amount (₦):</label>
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  placeholder="Enter loan amount (₦)"
                  value={newLoan.loanAmount || ''}
                  onChange={(e) => {
                    const value = Number(e.target.value);
                    if (value >= 0) {
                      setNewLoan({...newLoan, loanAmount: e.target.value});
                    }
                  }}
                  required
                />
              </div>

              <div className="form-group">
                <label>Purpose:</label>
                <textarea
                  value={newLoan.purpose}
                  onChange={(e) => setNewLoan({...newLoan, purpose: e.target.value})}
                  required
                  placeholder="Describe the purpose of the loan"
                  rows="3"
                />
              </div>

              <div className="form-group">
                <label>Interest Rate (%):</label>
                <input
                  type="number"
                  value={newLoan.interestRate}
                  onChange={(e) => setNewLoan({...newLoan, interestRate: e.target.value})}
                  required
                  min="0"
                  step="0.1"
                  placeholder="5"
                />
              </div>

              <div className="modal-buttons">
                <button type="submit" className="btn-primary">
                  Create Loan Application
                </button>
                <button
                  type="button"
                  onClick={() => setShowLoanModal(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={confirmState.isOpen}
        title={confirmState.title}
        message={confirmState.message}
        confirmText={confirmState.confirmText}
        cancelText={confirmState.cancelText}
        confirmButtonClass={confirmState.confirmButtonClass}
        onConfirm={confirmState.onConfirm}
        onCancel={confirmState.onCancel}
      />

      <style jsx>{`
        .upload-progress {
          margin-top: 12px;
          padding: 8px;
          background: #f8fafc;
          border-radius: 6px;
          border: 1px solid #e2e8f0;
        }
        .progress-bar {
          width: 100%;
          height: 6px;
          background: #e2e8f0;
          border-radius: 3px;
          overflow: hidden;
          margin-bottom: 4px;
        }
        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #3b82f6, #1d4ed8);
          border-radius: 3px;
          transition: width 0.3s ease;
        }
        .progress-text {
          font-size: 0.75em;
          color: #64748b;
          font-weight: 500;
        }
      `}</style>
    </>
  );
}

export default MembersManagement;