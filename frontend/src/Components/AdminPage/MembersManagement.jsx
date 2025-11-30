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
      } catch (error) {
        alert('Failed to upload photo: ' + error.message);
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
      await handleUpdateMember(selectedMember._id || selectedMember.id, selectedMember);
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
                    src={member.profileImage || 'https://via.placeholder.com/150x150/4f9cf9/ffffff?text=Member'} 
                    alt={member.fullName} 
                    className="member-photo"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/150x150/4f9cf9/ffffff?text=Member';
                    }}
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
                src={selectedMember.profileImage || 'https://via.placeholder.com/150x150/4f9cf9/ffffff?text=Member'} 
                alt={selectedMember.fullName} 
                className="detail-photo"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/150x150/4f9cf9/ffffff?text=Member';
                }}
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
                    src={selectedMember.profileImage || 'https://via.placeholder.com/150x150/4f9cf9/ffffff?text=Member'} 
                    alt={selectedMember.fullName} 
                    className="preview-image"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/150x150/4f9cf9/ffffff?text=Member';
                    }}
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
        .filters-section {
          background: white;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          margin-bottom: 20px;
        }

        .search-box {
          margin-bottom: 15px;
        }

        .search-input {
          width: 100%;
          padding: 12px 16px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 16px;
        }

        .search-input:focus {
          outline: none;
          border-color: #4f9cf9;
          box-shadow: 0 0 0 3px rgba(79, 156, 249, 0.1);
        }

        .filter-controls {
          display: flex;
          gap: 10px;
          align-items: center;
          flex-wrap: wrap;
        }

        .filter-select {
          padding: 8px 12px;
          border: 1px solid #d1d5db;
          border-radius: 4px;
          font-size: 14px;
          min-width: 120px;
        }

        .sort-toggle {
          padding: 8px 12px;
          background: #f3f4f6;
          border: 1px solid #d1d5db;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 600;
        }

        .sort-toggle:hover {
          background: #e5e7eb;
        }

        /* Loan Management Section */
        .loan-section {
          margin-top: 30px;
          padding: 20px;
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .loan-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
        }

        .loan-header h3 {
          margin: 0;
          color: #1f2937;
          font-size: 18px;
        }

        .btn-create-loan {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          padding: 10px 16px;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 2px 4px rgba(102, 126, 234, 0.3);
        }

        .btn-create-loan:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 8px rgba(102, 126, 234, 0.4);
        }

        .loan-info {
          color: #6b7280;
          font-size: 14px;
          margin: 0;
        }

        /* Responsive loan section */
        @media (max-width: 768px) {
          .loan-section {
            margin-top: 20px;
            padding: 16px;
          }

          .loan-header {
            flex-direction: column;
            gap: 12px;
            align-items: stretch;
          }

          .loan-header h3 {
            font-size: 16px;
          }

          .btn-create-loan {
            width: 100%;
            text-align: center;
            padding: 12px 16px;
            font-size: 16px;
          }
        }

        @media (max-width: 480px) {
          .loan-section {
            margin-top: 16px;
            padding: 12px;
          }

          .loan-header h3 {
            font-size: 14px;
          }

          .btn-create-loan {
            padding: 10px 14px;
            font-size: 14px;
          }

          .loan-info {
            font-size: 12px;
          }
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .members-content {
            padding: 16px;
          }

          .members-header {
            flex-direction: column;
            gap: 16px;
            align-items: stretch;
          }

          .filters-section {
            padding: 16px;
          }

          .filter-controls {
            flex-direction: column;
            align-items: stretch;
          }

          .filter-select {
            min-width: auto;
            width: 100%;
          }

          .members-grid {
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 16px;
          }

          .member-card {
            padding: 16px;
          }

          .modal-content {
            margin: 16px;
            padding: 20px;
            width: calc(100% - 32px);
            max-width: none;
          }
        }

        @media (max-width: 480px) {
          .members-content {
            padding: 12px;
          }

          .filters-section {
            padding: 12px;
          }

          .members-grid {
            grid-template-columns: 1fr;
          }

          .member-card {
            padding: 12px;
          }

          .btn-back, .btn-add-member {
            padding: 6px 10px;
            font-size: 12px;
          }
        }
      `}</style>
    </>
  );
}

export default MembersManagement;