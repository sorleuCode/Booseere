import React, { useState, useEffect } from 'react';
import { loanAPI } from '../../api/loans';
import { memberAPI } from '../../api/members';
import { useConfirm } from '../../hooks';
import LoadingSpinner from '../UI/LoadingSpinner';
import ConfirmModal from '../UI/ConfirmModal';

const LoanManagement = () => {
  const { confirm, confirmState } = useConfirm();
  const [loans, setLoans] = useState([]);
  const [filteredLoans, setFilteredLoans] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Filter and search state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [memberFilter, setMemberFilter] = useState('all');
  const [sortBy, setSortBy] = useState('applicationDate');
  const [sortOrder, setSortOrder] = useState('desc');

  // Load all loans
  const loadLoans = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await loanAPI.getAll();
      setLoans(response.data || response);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load loans');
      console.error('Error loading loans:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load members for filtering
  const loadMembers = async () => {
    try {
      const response = await memberAPI.getAll();
      setMembers(response.data || response);
    } catch (err) {
      console.error('Error loading members:', err);
    }
  };

  // Filter and sort loans
  const filterAndSortLoans = () => {
    let filtered = [...loans];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(loan =>
        loan.memberId?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        loan.purpose?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        loan.loanAmount?.toString().includes(searchTerm) ||
        loan.status?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(loan => loan.status === statusFilter);
    }

    // Member filter
    if (memberFilter !== 'all') {
      filtered = filtered.filter(loan => loan.memberId?._id === memberFilter);
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue, bValue;

      switch (sortBy) {
        case 'loanAmount':
          aValue = a.loanAmount || 0;
          bValue = b.loanAmount || 0;
          break;
        case 'applicationDate':
          aValue = new Date(a.applicationDate);
          bValue = new Date(b.applicationDate);
          break;
        case 'memberName':
          aValue = a.memberId?.fullName || '';
          bValue = b.memberId?.fullName || '';
          break;
        case 'outstandingBalance':
          aValue = a.outstandingBalance || 0;
          bValue = b.outstandingBalance || 0;
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

    setFilteredLoans(filtered);
  };

  // Approve loan
  const approveLoan = async (loanId) => {
    setActionLoading(true);
    try {
      const response = await loanAPI.approve(loanId);
      if (response.success) {
        setLoans(prev => prev.map(loan =>
          loan._id === loanId ? { ...loan, status: 'approved' } : loan
        ));
        setSelectedLoan(null);
      }
    } catch (err) {
      console.error('Error approving loan:', err);
      alert('Failed to approve loan');
    } finally {
      setActionLoading(false);
    }
  };

  // Reject loan
  const rejectLoan = async (loanId, reason) => {
    const confirmed = await confirm({
      title: 'Reject Loan Application',
      message: `Are you sure you want to reject this loan application?${reason ? ` Reason: ${reason}` : ''}`,
      confirmText: 'Reject Loan',
      cancelText: 'Cancel',
      confirmButtonClass: 'btn-danger'
    });

    if (confirmed) {
      try {
        const response = await loanAPI.reject(loanId, reason);
        if (response.success) {
          setLoans(prev => prev.map(loan =>
            loan._id === loanId ? { ...loan, status: 'rejected' } : loan
          ));
          setSelectedLoan(null);
        }
      } catch (err) {
        toast.error('Failed to reject loan');
        console.error('Error rejecting loan:', err);
      }
    }
  };

  // Disburse loan
  const disburseLoan = async (loanId) => {
    try {
      const response = await loanAPI.disburse(loanId);
      if (response.success) {
        setLoans(prev => prev.map(loan => 
          loan._id === loanId ? { ...loan, status: 'disbursed' } : loan
        ));
        setSelectedLoan(null);
      }
    } catch (err) {
      toast.error('Failed to disburse loan');
      console.error('Error disbursing loan:', err);
    }
  };

  // Add repayment
  const addRepayment = async (loanId, paymentData) => {
    setActionLoading(true);
    try {
      const response = await loanAPI.recordPayment(loanId, paymentData);
      if (response.success) {
        // Refresh loans to get updated data
        await loadLoans();
        setShowModal(false);
      }
    } catch (err) {
      console.error('Error adding repayment:', err);
      alert('Failed to add repayment');
    } finally {
      setActionLoading(false);
    }
  };

  useEffect(() => {
    loadLoans();
    loadMembers();
  }, []);

  useEffect(() => {
    filterAndSortLoans();
  }, [loans, searchTerm, statusFilter, memberFilter, sortBy, sortOrder]);

  const formatCurrency = (amount) => {
    return `₦${amount?.toLocaleString() || 0}`;
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-blue-100 text-blue-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'disbursed': return 'bg-green-100 text-green-800';
      case 'repaying': return 'bg-purple-100 text-purple-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return <LoadingSpinner size="large" text="Loading loans..." />;
  }

  return (
    <div className="loan-management">
      <div className="loan-header">
        <div className="header-left">
          <button className="btn-back" onClick={() => window.history.back()}>
            ← Back
          </button>
          <h2>Loan Management</h2>
        </div>
        <button onClick={loadLoans} className="btn-refresh">
          Refresh
        </button>
      </div>

      {/* Search and Filter Controls */}
      <div className="filters-section">
        <div className="search-box">
          <div className="loan-search-wrapper">
            <input
              type="text"
              placeholder="Search by member name, purpose, amount..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="loan-search-input"
            />
          </div>
        </div>

        <div className="filter-controls">
          <div className="filter-wrapper">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="loan-filter-select"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="disbursed">Disbursed</option>
              <option value="repaying">Repaying</option>
              <option value="completed">Completed</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <div className="filter-wrapper">
            <select
              value={memberFilter}
              onChange={(e) => setMemberFilter(e.target.value)}
              className="loan-filter-select"
            >
              <option value="all">All Members</option>
              {members.map(member => (
                <option key={member._id} value={member._id}>
                  {member.fullName}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-wrapper">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="loan-filter-select"
            >
              <option value="applicationDate">Sort by Date</option>
              <option value="loanAmount">Sort by Amount</option>
              <option value="memberName">Sort by Member</option>
              <option value="outstandingBalance">Sort by Balance</option>
            </select>
          </div>

          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="loan-sort-toggle"
          >
            {sortOrder === 'asc' ? '↑' : '↓'}
          </button>
        </div>
      </div>

      {error && (
        <div className="error-message">
          <p>⚠️ {error}</p>
          <button onClick={loadLoans}>Retry</button>
        </div>
      )}

      <div className="loan-stats">
        <div className="stat-card">
          <h3>{filteredLoans.length}</h3>
          <p>Filtered Loans</p>
        </div>
        <div className="stat-card">
          <h3>{filteredLoans.filter(l => l.status === 'pending').length}</h3>
          <p>Pending Approval</p>
        </div>
        <div className="stat-card">
          <h3>{filteredLoans.filter(l => ['disbursed', 'repaying'].includes(l.status)).length}</h3>
          <p>Active Loans</p>
        </div>
      </div>

      <div className="loan-table">
        <table>
          <thead>
            <tr>
              <th>Member</th>
              <th>Amount</th>
              <th>Purpose</th>
              <th>Status</th>
              <th>Application Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredLoans.map(loan => (
              <tr key={loan._id}>
                <td>{loan.memberId?.fullName || 'N/A'}</td>
                <td>{formatCurrency(loan.loanAmount)}</td>
                <td>{loan.purpose}</td>
                <td>
                  <span className={`status-pill ${getStatusColor(loan.status)}`}>
                    {loan.status}
                  </span>
                </td>
                <td>{new Date(loan.applicationDate).toLocaleDateString()}</td>
                <td>
                  <button 
                    onClick={() => setSelectedLoan(loan)}
                    className="btn-view"
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedLoan && (
        <div className="modal-backdrop" onClick={() => setSelectedLoan(null)}>
          <div className="modal-content loan-details-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>📋 Loan Details</h3>
              <button
                className="modal-close-btn"
                onClick={() => setSelectedLoan(null)}
                type="button"
              >
                ×
              </button>
            </div>

            <div className="loan-details-grid">
              <div className="detail-section">
                <h4>Loan Information</h4>
                <div className="details-list">
                  <div className="detail-item">
                    <span className="detail-label">Member:</span>
                    <span className="detail-value">{selectedLoan.memberId?.fullName}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Loan Amount:</span>
                    <span className="detail-value">{formatCurrency(selectedLoan.loanAmount)}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Interest Rate:</span>
                    <span className="detail-value">{selectedLoan.interestRate}%</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Total Amount:</span>
                    <span className="detail-value">{formatCurrency(selectedLoan.totalAmount)}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Purpose:</span>
                    <span className="detail-value">{selectedLoan.purpose}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Status:</span>
                    <span className={`status-pill ${getStatusColor(selectedLoan.status)}`}>
                      {selectedLoan.status}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Outstanding Balance:</span>
                    <span className="detail-value highlight">{formatCurrency(selectedLoan.outstandingBalance)}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Application Date:</span>
                    <span className="detail-value">{new Date(selectedLoan.applicationDate).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <div className="action-section">
                <h4>Actions</h4>
                <div className="loan-actions">
                  {selectedLoan.status === 'pending' && (
                    <>
                      <button
                        onClick={() => approveLoan(selectedLoan._id)}
                        className="btn-approve"
                        disabled={actionLoading}
                      >
                        {actionLoading ? 'Approving...' : '✅ Approve Loan'}
                      </button>
                      <button
                        onClick={() => rejectLoan(selectedLoan._id, 'Rejected by admin')}
                        className="btn-reject"
                      >
                        ❌ Reject Loan
                      </button>
                    </>
                  )}

                  {selectedLoan.status === 'approved' && (
                    <button
                      onClick={() => disburseLoan(selectedLoan._id)}
                      className="btn-disburse"
                    >
                      💰 Disburse Funds
                    </button>
                  )}

                  {['disbursed', 'repaying'].includes(selectedLoan.status) && (
                    <button
                      onClick={() => setShowModal(true)}
                      className="btn-repayment"
                    >
                      ➕ Add Repayment
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="repayment-history">
              <h4>💳 Repayment History</h4>
              {selectedLoan.repayments?.length > 0 ? (
                <div className="repayments-list">
                  {selectedLoan.repayments.map((repayment, index) => (
                    <div key={index} className="repayment-item">
                      <div className="repayment-info">
                        <span className="repayment-amount">{formatCurrency(repayment.amount)}</span>
                        <span className="repayment-date">{new Date(repayment.paymentDate).toLocaleDateString()}</span>
                      </div>
                      {repayment.notes && (
                        <div className="repayment-notes">{repayment.notes}</div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-repayments">
                  <p>📝 No repayments recorded yet</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="modal-content repayment-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>💰 Add Repayment</h3>
              <button
                className="modal-close-btn"
                onClick={() => setShowModal(false)}
                type="button"
              >
                ×
              </button>
            </div>

            <div className="repayment-info">
              <div className="info-item">
                <span className="info-label">Member:</span>
                <span className="info-value">{selectedLoan?.memberId?.fullName}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Outstanding Balance:</span>
                <span className="info-value">{formatCurrency(selectedLoan?.outstandingBalance)}</span>
              </div>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              const paymentData = {
                amount: Number(formData.get('amount')),
                paymentDate: formData.get('paymentDate'),
                notes: formData.get('notes'),
              };
              addRepayment(selectedLoan._id, paymentData);
            }} className="repayment-form">
              <div className="form-group">
                <label htmlFor="repayment-amount">Payment Amount (₦)</label>
                <input
                  id="repayment-amount"
                  type="number"
                  name="amount"
                  placeholder="Enter payment amount"
                  min="0.01"
                  step="0.01"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="repayment-date">Payment Date</label>
                <input
                  id="repayment-date"
                  type="date"
                  name="paymentDate"
                  defaultValue={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="repayment-notes">Notes (Optional)</label>
                <textarea
                  id="repayment-notes"
                  name="notes"
                  placeholder="Add any notes about this payment..."
                  rows="3"
                />
              </div>

              <div className="modal-buttons">
                <button type="submit" className="btn-primary" disabled={actionLoading}>
                  {actionLoading ? 'Processing Payment...' : 'Record Payment'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn-secondary"
                  disabled={actionLoading}
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
        .loan-management {
          padding: 20px;
        }

        .filters-section {
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(248, 250, 252, 0.8));
          padding: 24px;
          border-radius: 20px;
          box-shadow: 
            0 4px 20px rgba(0, 0, 0, 0.08),
            0 1px 3px rgba(0, 0, 0, 0.1),
            inset 0 1px 0 rgba(255, 255, 255, 0.6);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(226, 232, 240, 0.8);
          margin-bottom: 24px;
          position: relative;
        }

        .filters-section::before {
          content: '🔍 Filter & Search Loans';
          display: block;
          text-align: center;
          font-size: 0.95rem;
          color: #6366f1;
          margin-bottom: 20px;
          font-weight: 600;
          opacity: 0.9;
        }

        .search-box {
          margin-bottom: 20px;
        }

        .loan-search-wrapper {
          position: relative;
          width: 100%;
        }

        .loan-search-wrapper::before {
          content: '💰';
          position: absolute;
          right: 16px;
          top: 50%;
          transform: translateY(-50%);
          font-size: 18px;
          z-index: 2;
          color: #94a3b8;
          transition: all 0.3s ease;
          pointer-events: none;
        }

        .loan-search-wrapper:focus-within::before {
          color: #6366f1;
          transform: translateY(-50%) scale(1.1);
        }

        .loan-search-input {
          width: 100%;
          padding: 16px 48px 16px 20px;
          border: 2px solid #e2e8f0;
          border-radius: 16px;
          font-size: 16px;
          background: #ffffff;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
          font-weight: 500;
        }

        .loan-search-input:focus {
          outline: none;
          border-color: #6366f1;
          box-shadow: 
            0 4px 20px rgba(99, 102, 241, 0.15),
            0 0 0 4px rgba(99, 102, 241, 0.1);
          transform: translateY(-2px);
          background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
        }

        .loan-search-input::placeholder {
          color: #94a3b8;
          font-weight: 400;
        }

        .filter-controls {
          display: flex;
          gap: 16px;
          align-items: center;
          flex-wrap: wrap;
        }

        .filter-wrapper {
          position: relative;
          min-width: 140px;
        }

        .filter-wrapper::before {
          content: '';
          position: absolute;
          left: 16px;
          top: 50%;
          transform: translateY(-50%);
          font-size: 16px;
          z-index: 1;
          color: #94a3b8;
          transition: all 0.3s ease;
          pointer-events: none;
        }

        .filter-wrapper:nth-child(1)::before { content: '📊'; }
        .filter-wrapper:nth-child(2)::before { content: '👤'; }
        .filter-wrapper:nth-child(3)::before { content: '📅'; }

        .filter-wrapper:focus-within::before {
          color: #6366f1;
          transform: translateY(-50%) scale(1.1);
        }

        .loan-filter-select {
          width: 100%;
          padding: 12px 16px 12px 44px;
          border: 2px solid #e2e8f0;
          border-radius: 12px;
          font-size: 14px;
          background: #ffffff;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
          appearance: none;
          -webkit-appearance: none;
          -moz-appearance: none;
          background-image: url("data:image/svg+xml;charset=US-ASCII,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><polyline points='6,9 12,15 18,9'></polyline></svg>");
          background-repeat: no-repeat;
          background-position: right 12px center;
          background-size: 14px;
          font-weight: 600;
        }

        .loan-filter-select:hover {
          border-color: #a855f7;
          box-shadow: 0 4px 15px rgba(168, 85, 247, 0.15);
          transform: translateY(-1px);
        }

        .loan-filter-select:focus {
          outline: none;
          border-color: #6366f1;
          box-shadow: 
            0 4px 20px rgba(99, 102, 241, 0.15),
            0 0 0 4px rgba(99, 102, 241, 0.1);
        }

        .loan-sort-toggle {
          padding: 12px 16px;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          border: none;
          border-radius: 12px;
          cursor: pointer;
          font-size: 16px;
          font-weight: 700;
          color: white;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: 0 4px 15px rgba(99, 102, 241, 0.3);
          min-width: 50px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .loan-sort-toggle:hover {
          background: linear-gradient(135deg, #5b21b6, #7c3aed);
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(99, 102, 241, 0.4);
        }

        .loan-sort-toggle:active {
          transform: translateY(0);
        }
        .loan-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }
        .header-left {
          display: flex;
          align-items: center;
          gap: 15px;
        }
        .btn-back {
          background: #6b7280;
          color: white;
          border: none;
          padding: 8px 12px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
        }
        .btn-back:hover {
          background: #4b5563;
        }
        .loan-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          margin-bottom: 30px;
        }
        .stat-card {
          background: white;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          text-align: center;
        }
        .stat-card h3 {
          font-size: 2em;
          margin: 0;
          color: #2563eb;
        }
        .loan-table {
          background: white;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        table {
          width: 100%;
          border-collapse: collapse;
        }
        th, td {
          padding: 12px;
          text-align: left;
          border-bottom: 1px solid #e5e7eb;
        }
        th {
          background: #f9fafb;
          font-weight: 600;
        }
        .status-pill {
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 0.875em;
          font-weight: 500;
        }
        .modal-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }
        .modal-content {
          background: white;
          padding: 30px;
          border-radius: 8px;
          max-width: 500px;
          width: 90%;
          max-height: 80vh;
          overflow-y: auto;
        }
        .loan-details {
          margin: 20px 0;
        }
        .loan-details p {
          margin: 10px 0;
        }
        .loan-actions {
          display: flex;
          gap: 10px;
          margin: 20px 0;
        }
        .repayment-history {
          margin: 20px 0;
        }
        .repayments-list {
          border: 1px solid #e5e7eb;
          border-radius: 4px;
          padding: 10px;
        }
        .repayment-item {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          border-bottom: 1px solid #f3f4f6;
        }
        .repayment-item:last-child {
          border-bottom: none;
        }
        .modal-buttons {
          display: flex;
          gap: 10px;
          margin-top: 20px;
        }
        button {
          padding: 8px 16px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-weight: 500;
        }
        .btn-primary {
          background: #2563eb;
          color: white;
        }
        .btn-secondary {
          background: #6b7280;
          color: white;
        }
        .btn-approve {
          background: #10b981;
          color: white;
        }
        .btn-reject {
          background: #ef4444;
          color: white;
        }
        .btn-disburse {
          background: #3b82f6;
          color: white;
        }
        .btn-repayment {
          background: #8b5cf6;
          color: white;
        }

        /* Repayment Modal Styles */
        .repayment-modal {
          max-width: 500px;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          padding-bottom: 15px;
          border-bottom: 2px solid #f3f4f6;
        }

        .modal-header h3 {
          margin: 0;
          color: #1f2937;
          font-size: 24px;
          font-weight: 700;
        }

        .modal-close-btn {
          background: none;
          border: none;
          font-size: 28px;
          color: #6b7280;
          cursor: pointer;
          padding: 0;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          transition: all 0.2s ease;
        }

        .modal-close-btn:hover {
          background: #f3f4f6;
          color: #374151;
        }

        .repayment-info {
          background: #f8fafc;
          padding: 16px;
          border-radius: 8px;
          margin-bottom: 24px;
          border: 1px solid #e2e8f0;
        }

        .info-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }

        .info-item:last-child {
          margin-bottom: 0;
        }

        .info-label {
          font-weight: 600;
          color: #374151;
          font-size: 14px;
        }

        .info-value {
          color: #1f2937;
          font-weight: 500;
        }

        .repayment-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .form-group label {
          font-weight: 600;
          color: #374151;
          font-size: 14px;
        }

        .form-group input,
        .form-group textarea {
          padding: 12px 16px;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          font-size: 15px;
          font-family: inherit;
          transition: all 0.3s ease;
        }

        .form-group input:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .form-group input[type="number"] {
          text-align: right;
        }

        .form-group textarea {
          resize: vertical;
          min-height: 80px;
        }

        /* Loan Details Modal Styles */
        .loan-details-modal {
          max-width: 700px;
          width: 95%;
        }

        .loan-details-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 30px;
          margin-bottom: 30px;
        }

        .detail-section h4,
        .action-section h4 {
          margin: 0 0 16px 0;
          color: #1f2937;
          font-size: 18px;
          font-weight: 600;
          border-bottom: 2px solid #e5e7eb;
          padding-bottom: 8px;
        }

        .details-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .detail-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 0;
          border-bottom: 1px solid #f3f4f6;
        }

        .detail-item:last-child {
          border-bottom: none;
        }

        .detail-label {
          font-weight: 600;
          color: #374151;
          font-size: 14px;
        }

        .detail-value {
          color: #1f2937;
          font-weight: 500;
          text-align: right;
        }

        .detail-value.highlight {
          color: #dc2626;
          font-weight: 700;
          font-size: 16px;
        }

        .action-section .loan-actions {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .repayment-history h4 {
          margin: 0 0 16px 0;
          color: #1f2937;
          font-size: 18px;
          font-weight: 600;
        }

        .repayments-list {
          max-height: 200px;
          overflow-y: auto;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          background: #f9fafb;
        }

        .repayment-item {
          padding: 12px 16px;
          border-bottom: 1px solid #e5e7eb;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .repayment-item:last-child {
          border-bottom: none;
        }

        .repayment-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .repayment-amount {
          font-weight: 600;
          color: #059669;
        }

        .repayment-date {
          color: #6b7280;
          font-size: 14px;
        }

        .repayment-notes {
          color: #4b5563;
          font-size: 14px;
          font-style: italic;
        }

        .no-repayments {
          text-align: center;
          padding: 40px;
          color: #6b7280;
          background: #f9fafb;
          border-radius: 8px;
          border: 1px solid #e5e7eb;
        }

        /* Responsive Design */
        /* Responsive Design */
        @media (max-width: 768px) {
          .loan-management {
            padding: 16px;
          }

          .loan-header {
            flex-direction: column;
            gap: 16px;
            align-items: stretch;
          }

          .header-left {
            text-align: center;
          }

          .filters-section {
            padding: 20px;
            margin-bottom: 20px;
          }

          .filters-section::before {
            font-size: 0.9rem;
            margin-bottom: 16px;
          }

          .filter-controls {
            flex-direction: column;
            align-items: stretch;
            gap: 12px;
          }

          .filter-wrapper,
          .loan-search-wrapper {
            min-width: auto;
            width: 100%;
          }

          .loan-search-input,
          .loan-filter-select {
            width: 100%;
            min-width: auto;
          }

          .loan-stats {
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 12px;
          }

          .stat-card h3 {
            font-size: 1.5em;
          }

          .loan-table {
            overflow-x: auto;
          }

          table {
            min-width: 600px;
          }

          th, td {
            padding: 8px 6px;
            font-size: 14px;
          }

          .modal-content {
            margin: 16px;
            padding: 20px;
            width: calc(100% - 32px);
            max-width: none;
          }

          .loan-details-grid {
            grid-template-columns: 1fr;
            gap: 20px;
          }

          .repayment-modal {
            margin: 16px;
            width: calc(100% - 32px);
            max-width: none;
          }
        }

        @media (max-width: 480px) {
          .loan-management {
            padding: 12px;
          }

          .filters-section {
            padding: 12px;
          }

          .loan-stats {
            grid-template-columns: 1fr;
          }

          .stat-card {
            padding: 16px;
            text-align: center;
          }

          .stat-card h3 {
            font-size: 1.8em;
          }

          th, td {
            padding: 6px 4px;
            font-size: 12px;
          }

          .btn-back, .btn-refresh {
            padding: 6px 10px;
            font-size: 12px;
          }
        }
      `}</style>
    </div>
  );
};

export default LoanManagement;