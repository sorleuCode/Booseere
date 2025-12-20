import React, { useState } from 'react';
import { useMembers } from '../../context/MembersContext';
import { memberAPI } from '../../api/members';
import { useConfirm } from '../../hooks';
import { uploadToCloudinary } from '../../services/cloudinaryService';
import { loanAPI } from '../../api/loans';
import { formatDateTime } from '../../utils/dateUtils';
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
    // totalContributions removed — contributions must be added via Contributions page
    age: undefined,
    maritalStatus: '',
    sex: '',
    stateOfOrigin: '',
    localGovernment: '',
    occupation: '',
    guarantorName: '',
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
        profileImage: newMember.photo || null,
        position: 'Member',
        age: newMember.age,
        maritalStatus: newMember.maritalStatus,
        sex: newMember.sex,
        stateOfOrigin: newMember.stateOfOrigin,
        localGovernment: newMember.localGovernment,
        occupation: newMember.occupation,
        guarantorName: newMember.guarantorName,
      };

      await handleAddMember(memberData);
      setShowAddModal(false);
      setNewMember({
        fullName: '',
        phone: '',
        address: '',
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
      toast.error('Failed to update member. Please try again.');
      console.error('Error updating member:', error);
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
        toast.error('Failed to delete member. Please try again.');
        console.error('Error deleting member:', error);
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
      toast.error('Failed to create loan. Please try again.');
      console.error('Error creating loan:', error);
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
                <div key={member._id || member.id} className="member-card" onClick={async () => {
                  try {
                    const memberResponse = await memberAPI.getById(member._id || member.id);
                    const payload = memberResponse.data || memberResponse;
                    const memberObj = payload.member || payload.data?.member || payload.data || payload;
                    const contributions = payload.contributions || payload.data?.contributions || [];
                    const loans = payload.loans || payload.data?.loans || [];
                    setSelectedMember({ ...memberObj, contributions, loans });
                  } catch (err) {
                    // fallback to earlier shallow member if fetch fails
                    setSelectedMember(member);
                  }
                }}>
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
              {/* Personal Information Section */}
              <div className="info-section">
                <h3>👤 Personal Information</h3>
                <div className="info-grid">
                  <div className="info-box">
                    <span className="info-label">Full Name</span>
                    <span className="info-value">{selectedMember.fullName}</span>
                  </div>
                  <div className="info-box">
                    <span className="info-label">Membership Number</span>
                    <span className="info-value">{selectedMember.membershipNumber}</span>
                  </div>
                  <div className="info-box">
                    <span className="info-label">Position</span>
                    <span className="info-value">{selectedMember.position}</span>
                  </div>
                  <div className="info-box">
                    <span className="info-label">Status</span>
                    <span className={`status-pill ${selectedMember.status?.toLowerCase()}`}>{selectedMember.status}</span>
                  </div>
                  <div className="info-box">
                    <span className="info-label">Phone</span>
                    <span className="info-value">{selectedMember.phone || 'Not provided'}</span>
                  </div>
                  <div className="info-box">
                    <span className="info-label">Address</span>
                    <span className="info-value">{selectedMember.address || 'Not provided'}</span>
                  </div>
                  <div className="info-box">
                    <span className="info-label">Age</span>
                    <span className="info-value">{selectedMember.age || 'Not provided'}</span>
                  </div>
                  <div className="info-box">
                    <span className="info-label">Sex</span>
                    <span className="info-value">{selectedMember.sex || 'Not provided'}</span>
                  </div>
                  <div className="info-box">
                    <span className="info-label">Marital Status</span>
                    <span className="info-value">{selectedMember.maritalStatus || 'Not provided'}</span>
                  </div>
                </div>
              </div>

              {/* Location Information Section */}
              <div className="info-section">
                <h3>📍 Location Information</h3>
                <div className="info-grid">
                  <div className="info-box">
                    <span className="info-label">State of Origin</span>
                    <span className="info-value">{selectedMember.stateOfOrigin || 'Not provided'}</span>
                  </div>
                  <div className="info-box">
                    <span className="info-label">Local Government</span>
                    <span className="info-value">{selectedMember.localGovernment || 'Not provided'}</span>
                  </div>
                </div>
              </div>

              {/* Professional Information Section */}
              <div className="info-section">
                <h3>💼 Professional Information</h3>
                <div className="info-grid">
                  <div className="info-box">
                    <span className="info-label">Occupation</span>
                    <span className="info-value">{selectedMember.occupation || 'Not provided'}</span>
                  </div>
                  <div className="info-box">
                    <span className="info-label">Guarantor Name</span>
                    <span className="info-value">{selectedMember.guarantorName || 'Not provided'}</span>
                  </div>
                </div>
              </div>

              {/* Financial Information Section */}
              <div className="info-section">
                <h3>💰 Financial Information</h3>
                <div className="info-grid">
                  <div className="info-box highlight">
                    <span className="info-label">Total Contributions</span>
                    <span className="info-value big">{formatCurrency(selectedMember.totalContributions || 0)}</span>
                  </div>
                  <div className="info-box highlight">
                    <span className="info-label">Total Loans</span>
                    <span className="info-value big">{formatCurrency(selectedMember.totalLoans || 0)}</span>
                  </div>
                  <div className="info-box">
                    <span className="info-label">Outstanding Loan</span>
                    <span className="info-value">{formatCurrency(selectedMember.outstandingLoan || 0)}</span>
                  </div>
                </div>
              </div>

              {/* Membership Information Section */}
              <div className="info-section">
                <h3>📅 Membership Information</h3>
                <div className="info-grid">
                  <div className="info-box">
                    <span className="info-label">Join Date</span>
                    <span className="info-value">{formatDateTime(selectedMember.joinDate)}</span>
                  </div>
                  <div className="info-box">
                    <span className="info-label">Member Since</span>
                    <span className="info-value">{formatDateTime(selectedMember.createdAt)}</span>
                  </div>
                </div>
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
              {/* Small note when member has ongoing loans */}
              {selectedMember?.loans && selectedMember.loans.some(l => ['disbursed', 'repaying', 'approved', 'pending'].includes(l.status)) && (
                <p className="loan-note" style={{color: '#b45f00', marginTop: '8px'}}>
                  ⚠️ Note: This member has ongoing loan(s). Consider saving drafts or partial payments if they cannot pay in full.
                </p>
              )}
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
              {/* Initial contribution removed — add contributions via Contributions page */}
              
              
              
              <input
                type="number"
                placeholder="Age"
                value={newMember.age || ''}
                onChange={(e) => setNewMember({...newMember, age: e.target.value ? Number(e.target.value) : undefined})}
              />
              <select value={newMember.maritalStatus || ''} onChange={(e) => setNewMember({...newMember, maritalStatus: e.target.value})}>
                <option value="">Marital Status</option>
                <option value="single">Single</option>
                <option value="married">Married</option>
                <option value="divorced">Divorced</option>
                <option value="widowed">Widowed</option>
                <option value="other">Other</option>
              </select>
              <select value={newMember.sex || ''} onChange={(e) => setNewMember({...newMember, sex: e.target.value})}>
                <option value="">Sex</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
              <input type="text" placeholder="State of Origin" value={newMember.stateOfOrigin || ''} onChange={(e) => setNewMember({...newMember, stateOfOrigin: e.target.value})} />
              <input type="text" placeholder="Local Government" value={newMember.localGovernment || ''} onChange={(e) => setNewMember({...newMember, localGovernment: e.target.value})} />
              <input type="text" placeholder="Occupation" value={newMember.occupation || ''} onChange={(e) => setNewMember({...newMember, occupation: e.target.value})} />
              <input type="text" placeholder="Guarantor's Name" value={newMember.guarantorName || ''} onChange={(e) => setNewMember({...newMember, guarantorName: e.target.value})} />

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
              {/* totalContributions is managed via Contributions, not editable here */}
              <input
                type="number"
                placeholder="Age"
                value={selectedMember.age || ''}
                onChange={(e) => setSelectedMember({...selectedMember, age: e.target.value ? Number(e.target.value) : undefined})}
              />
              <select value={selectedMember.maritalStatus || ''} onChange={(e) => setSelectedMember({...selectedMember, maritalStatus: e.target.value})}>
                <option value="">Marital Status</option>
                <option value="single">Single</option>
                <option value="married">Married</option>
                <option value="divorced">Divorced</option>
                <option value="widowed">Widowed</option>
                <option value="other">Other</option>
              </select>
              <select value={selectedMember.sex || ''} onChange={(e) => setSelectedMember({...selectedMember, sex: e.target.value})}>
                <option value="">Sex</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
              <input type="text" placeholder="State of Origin" value={selectedMember.stateOfOrigin || ''} onChange={(e) => setSelectedMember({...selectedMember, stateOfOrigin: e.target.value})} />
              <input type="text" placeholder="Local Government" value={selectedMember.localGovernment || ''} onChange={(e) => setSelectedMember({...selectedMember, localGovernment: e.target.value})} />
              <input type="text" placeholder="Occupation" value={selectedMember.occupation || ''} onChange={(e) => setSelectedMember({...selectedMember, occupation: e.target.value})} />
              <input type="text" placeholder="Guarantor's Name" value={selectedMember.guarantorName || ''} onChange={(e) => setSelectedMember({...selectedMember, guarantorName: e.target.value})} />

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
    </>
  );
}

export default MembersManagement;