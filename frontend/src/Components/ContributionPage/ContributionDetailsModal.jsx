import React from 'react';
import './ContributionManagement.css';

const ContributionDetailsModal = ({ contribution, onClose, onDelete, onUpdate }) => {
  if (!contribution) return null;

  const formatCurrency = (amount) => `₦${amount?.toLocaleString() || 0}`;

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'verified': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content loan-details-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">📋 Contribution Details</h3>
          <button onClick={onClose} className="modal-close-btn">×</button>
        </div>

        <div className="modal-body">
          <div className="loan-details-grid">
            <div className="detail-section">
              <h4>Contribution Info</h4>
              <div className="details-list">
                <div className="detail-item">
                  <span className="detail-label">Receipt:</span>
                  <span className="detail-value">{contribution.receiptNumber || 'N/A'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Member:</span>
                  <span className="detail-value">{contribution.memberId?.fullName || 'N/A'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Amount:</span>
                  <span className="detail-value highlight">{formatCurrency(contribution.amount)}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Type:</span>
                  <span className={`type-pill ${getStatusColor(contribution.contributionType)}`}>{contribution.contributionType}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Payment Method:</span>
                  <span className="detail-value">{contribution.paymentMethod || 'N/A'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Payment Date:</span>
                  <span className="detail-value">{contribution.paymentDate ? new Date(contribution.paymentDate).toLocaleDateString() : 'N/A'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Status:</span>
                  <span className={`status-pill ${getStatusColor(contribution.status)}`}>{contribution.status}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Notes:</span>
                  <span className="detail-value">{contribution.notes || 'None'}</span>
                </div>
              </div>
            </div>

            <div className="action-section">
              <h4>Actions</h4>
              <div className="loan-actions">
                {contribution.status === 'pending' && (
                  <>
                    <button onClick={() => onUpdate(contribution._id || contribution.id, { status: 'verified' })} className="btn-verify">Verify</button>
                    <button onClick={() => onUpdate(contribution._id || contribution.id, { status: 'rejected' })} className="btn-reject">Reject</button>
                  </>
                )}

                <button onClick={() => onDelete(contribution._id || contribution.id)} className="btn-delete">Delete</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContributionDetailsModal;
