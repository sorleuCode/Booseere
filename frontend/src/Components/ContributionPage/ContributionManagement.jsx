import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { contributionAPI } from '../../api/contributions';
import { memberAPI } from '../../api/members';
import { useConfirm } from '../../hooks';
import LoadingSpinner from '../UI/LoadingSpinner';
import ConfirmModal from '../UI/ConfirmModal';

const ContributionManagement = () => {
  const navigate = useNavigate();
  const { confirm, confirmState } = useConfirm();
  const [contributions, setContributions] = useState([]);
  const [filteredContributions, setFilteredContributions] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedContribution, setSelectedContribution] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Filter and search state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [memberFilter, setMemberFilter] = useState('all');
  const [sortBy, setSortBy] = useState('paymentDate');
  const [sortOrder, setSortOrder] = useState('desc');

  const [formData, setFormData] = useState({
    memberId: '',
    amount: '',
    contributionType: 'monthly',
    paymentMethod: 'cash',
    paymentDate: new Date().toISOString().split('T')[0],
    notes: '',
  });

  // Load contributions
  const loadContributions = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await contributionAPI.getAll();
      setContributions(response.data || response);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load contributions');
      console.error('Error loading contributions:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load members for dropdown
  const loadMembers = async () => {
    try {
      const response = await memberAPI.getAll();
      setMembers(response.data || response);
    } catch (err) {
      console.error('Error loading members:', err);
    }
  };

  // Add contribution
  const addContribution = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const response = await contributionAPI.add({
        ...formData,
        amount: Number(formData.amount),
      });
      if (response.success) {
        setContributions(prev => [response.data, ...prev]);
        setShowModal(false);
        setFormData({
          memberId: '',
          amount: '',
          contributionType: 'monthly',
          paymentMethod: 'cash',
          paymentDate: new Date().toISOString().split('T')[0],
          notes: '',
        });
      }
    } catch (err) {
      console.error('Error adding contribution:', err);
      alert('Failed to add contribution');
    } finally {
      setSubmitting(false);
    }
  };

  // Update contribution
  const updateContribution = async (id, updateData) => {
    try {
      const response = await contributionAPI.update(id, updateData);
      if (response.success) {
        setContributions(prev => prev.map(c => 
          c._id === id ? response.data : c
        ));
        setSelectedContribution(null);
      }
    } catch (err) {
      toast.error('Failed to update contribution');
      console.error('Error updating contribution:', err);
    }
  };

  // Delete contribution
  const deleteContribution = async (id) => {
    const confirmed = await confirm({
      title: 'Delete Contribution',
      message: 'Are you sure you want to delete this contribution? This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      confirmButtonClass: 'btn-danger'
    });

    if (confirmed) {
      try {
        await contributionAPI.delete(id);
        setContributions(prev => prev.filter(c => c._id !== id));
        setSelectedContribution(null);
      } catch (err) {
        toast.error('Failed to delete contribution');
        console.error('Error deleting contribution:', err);
      }
    }
  };


  // Filter and sort contributions
  const filterAndSortContributions = () => {
    let filtered = [...contributions];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(contribution =>
        contribution.receiptNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contribution.memberId?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contribution.contributionType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contribution.paymentMethod?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(contribution => contribution.status === statusFilter);
    }

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(contribution => contribution.contributionType === typeFilter);
    }

    // Member filter
    if (memberFilter !== 'all') {
      filtered = filtered.filter(contribution => contribution.memberId?._id === memberFilter);
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue, bValue;

      switch (sortBy) {
        case 'amount':
          aValue = a.amount || 0;
          bValue = b.amount || 0;
          break;
        case 'paymentDate':
          aValue = new Date(a.paymentDate);
          bValue = new Date(b.paymentDate);
          break;
        case 'memberName':
          aValue = a.memberId?.fullName || '';
          bValue = b.memberId?.fullName || '';
          break;
        case 'receiptNumber':
          aValue = a.receiptNumber || '';
          bValue = b.receiptNumber || '';
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

    setFilteredContributions(filtered);
  };

  useEffect(() => {
    loadContributions();
    loadMembers();
  }, []);

  useEffect(() => {
    filterAndSortContributions();
  }, [contributions, searchTerm, statusFilter, typeFilter, memberFilter, sortBy, sortOrder]);

  const formatCurrency = (amount) => {
    return `₦${amount?.toLocaleString() || 0}`;
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'verified': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type) => {
    switch (type?.toLowerCase()) {
      case 'monthly': return 'bg-blue-100 text-blue-800';
      case 'special': return 'bg-purple-100 text-purple-800';
      case 'registration': return 'bg-green-100 text-green-800';
      case 'fine': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return <LoadingSpinner size="large" text="Loading contributions..." />;
  }

  return (
    <div className="contribution-management">
      <div className="contribution-header">
        <div className="header-left">
          <button className="btn-back" onClick={() => navigate('/admin')}>
            ← Back to Dashboard
          </button>
          <h2>Contribution Management</h2>
        </div>
        <div className="header-actions">
          <button onClick={() => setShowModal(true)} className="btn-add">
            Add Contribution
          </button>
          <button onClick={loadContributions} className="btn-refresh">
            Refresh
          </button>
        </div>
      </div>

      {/* Search and Filter Controls */}
      <div className="filters-section">
        <div className="search-box">
          <div className="contribution-search-wrapper">
            <input
              type="text"
              placeholder="Search by receipt number, member name, type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="contribution-search-input"
            />
          </div>
        </div>

        <div className="filter-controls">
          <div className="filter-wrapper">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="contribution-filter-select"
            >
              <option value="all">All Status</option>
              <option value="verified">Verified</option>
              <option value="pending">Pending</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <div className="filter-wrapper">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="contribution-filter-select"
            >
              <option value="all">All Types</option>
              <option value="monthly">Monthly</option>
              <option value="special">Special</option>
              <option value="registration">Registration</option>
              <option value="fine">Fine</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="filter-wrapper">
            <select
              value={memberFilter}
              onChange={(e) => setMemberFilter(e.target.value)}
              className="contribution-filter-select"
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
              className="contribution-filter-select"
            >
              <option value="paymentDate">Sort by Date</option>
              <option value="amount">Sort by Amount</option>
              <option value="memberName">Sort by Member</option>
              <option value="receiptNumber">Sort by Receipt</option>
            </select>
          </div>

          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="contribution-sort-toggle"
          >
            {sortOrder === 'asc' ? '↑' : '↓'}
          </button>
        </div>
      </div>

      {error && (
        <div className="error-message">
          <p>⚠️ {error}</p>
          <button onClick={loadContributions}>Retry</button>
        </div>
      )}

      <div className="contribution-stats">
        <div className="stat-card">
          <h3>{filteredContributions.length}</h3>
          <p>Filtered Contributions</p>
        </div>
        <div className="stat-card">
          <h3>{formatCurrency(
            filteredContributions.reduce((sum, c) => sum + (c.amount || 0), 0)
          )}</h3>
          <p>Filtered Amount</p>
        </div>
        <div className="stat-card">
          <h3>{filteredContributions.filter(c => c.status === 'verified').length}</h3>
          <p>Verified</p>
        </div>
        <div className="stat-card">
          <h3>{filteredContributions.filter(c => c.status === 'pending').length}</h3>
          <p>Pending</p>
        </div>
      </div>

      <div className="contribution-table">
        <table>
          <thead>
            <tr>
              <th>Receipt No.</th>
              <th>Member</th>
              <th>Amount</th>
              <th>Type</th>
              <th>Payment Method</th>
              <th>Payment Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredContributions.map(contribution => (
              <tr key={contribution._id}>
                <td>{contribution.receiptNumber || 'N/A'}</td>
                <td>{contribution.memberId?.fullName || 'N/A'}</td>
                <td>{formatCurrency(contribution.amount)}</td>
                <td>
                  <span className={`type-pill ${getTypeColor(contribution.contributionType)}`}>
                    {contribution.contributionType}
                  </span>
                </td>
                <td>{contribution.paymentMethod}</td>
                <td>{new Date(contribution.paymentDate).toLocaleDateString()}</td>
                <td>
                  <span className={`status-pill ${getStatusColor(contribution.status)}`}>
                    {contribution.status}
                  </span>
                </td>
                <td>
                  <button 
                    onClick={() => setSelectedContribution(contribution)}
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

      {/* Add Contribution Modal */}
      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Add Contribution</h3>
            <form onSubmit={addContribution}>
              <div className="form-group">
                <label>Member:</label>
                <select 
                  name="memberId"
                  value={formData.memberId}
                  onChange={(e) => setFormData({...formData, memberId: e.target.value})}
                  required
                >
                  <option value="">Select Member</option>
                  {members.map(member => (
                    <option key={member._id} value={member._id}>
                      {member.fullName}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label>Amount:</label>
                <input 
                  type="number" 
                  name="amount"
                  value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: e.target.value})}
                  required 
                />
              </div>
              
              <div className="form-group">
                <label>Contribution Type:</label>
                <select 
                  name="contributionType"
                  value={formData.contributionType}
                  onChange={(e) => setFormData({...formData, contributionType: e.target.value})}
                >
                  <option value="monthly">Monthly</option>
                  <option value="special">Special</option>
                  <option value="registration">Registration</option>
                  <option value="fine">Fine</option>
                  <option value="other">Other</option>
                </select>
              </div>
              
              <div className="form-group">
                <label>Payment Method:</label>
                <select 
                  name="paymentMethod"
                  value={formData.paymentMethod}
                  onChange={(e) => setFormData({...formData, paymentMethod: e.target.value})}
                >
                  <option value="cash">Cash</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="mobile_money">Mobile Money</option>
                </select>
              </div>
              
              <div className="form-group">
                <label>Payment Date:</label>
                <input 
                  type="date" 
                  name="paymentDate"
                  value={formData.paymentDate}
                  onChange={(e) => setFormData({...formData, paymentDate: e.target.value})}
                  required 
                />
              </div>
              
              <div className="form-group">
                <label>Notes:</label>
                <textarea 
                  name="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  rows="3"
                />
              </div>
              
              <div className="modal-buttons">
                <button type="submit" className="btn-primary" disabled={submitting}>
                  {submitting ? 'Adding...' : 'Add Contribution'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn-secondary"
                  disabled={submitting}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Contribution Details Modal */}
      {selectedContribution && (
        <div className="modal-backdrop" onClick={() => setSelectedContribution(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Contribution Details</h3>
            <div className="contribution-details">
              <p><strong>Receipt Number:</strong> {selectedContribution.receiptNumber || 'N/A'}</p>
              <p><strong>Member:</strong> {selectedContribution.memberId?.fullName}</p>
              <p><strong>Amount:</strong> {formatCurrency(selectedContribution.amount)}</p>
              <p><strong>Type:</strong> {selectedContribution.contributionType}</p>
              <p><strong>Payment Method:</strong> {selectedContribution.paymentMethod}</p>
              <p><strong>Payment Date:</strong> {new Date(selectedContribution.paymentDate).toLocaleDateString()}</p>
              <p><strong>Status:</strong> 
                <span className={`status-pill ${getStatusColor(selectedContribution.status)}`}>
                  {selectedContribution.status}
                </span>
              </p>
              <p><strong>Notes:</strong> {selectedContribution.notes || 'None'}</p>
            </div>

            <div className="contribution-actions">
              {selectedContribution.status === 'pending' && (
                <>
                  <button 
                    onClick={() => updateContribution(selectedContribution._id, { status: 'verified' })}
                    className="btn-verify"
                  >
                    Verify
                  </button>
                  <button 
                    onClick={() => updateContribution(selectedContribution._id, { status: 'rejected' })}
                    className="btn-reject"
                  >
                    Reject
                  </button>
                </>
              )}
              
              <button 
                onClick={() => deleteContribution(selectedContribution._id)}
                className="btn-delete"
              >
                Delete
              </button>
            </div>

            <button 
              onClick={() => setSelectedContribution(null)}
              className="btn-close"
            >
              Close
            </button>
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
        .contribution-management {
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
          content: '💰 Filter & Search Contributions';
          display: block;
          text-align: center;
          font-size: 0.95rem;
          color: #059669;
          margin-bottom: 20px;
          font-weight: 600;
          opacity: 0.9;
        }

        .search-box {
          margin-bottom: 20px;
        }

        .contribution-search-wrapper {
          position: relative;
          width: 100%;
        }

        .contribution-search-wrapper::before {
          content: '💳';
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

        .contribution-search-wrapper:focus-within::before {
          color: #059669;
          transform: translateY(-50%) scale(1.1);
        }

        .contribution-search-input {
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

        .contribution-search-input:focus {
          outline: none;
          border-color: #059669;
          box-shadow: 
            0 4px 20px rgba(5, 150, 105, 0.15),
            0 0 0 4px rgba(5, 150, 105, 0.1);
          transform: translateY(-2px);
          background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
        }

        .contribution-search-input::placeholder {
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

        .filter-wrapper:nth-child(1)::before { content: '✅'; }
        .filter-wrapper:nth-child(2)::before { content: '📋'; }
        .filter-wrapper:nth-child(3)::before { content: '👤'; }
        .filter-wrapper:nth-child(4)::before { content: '📅'; }

        .filter-wrapper:focus-within::before {
          color: #059669;
          transform: translateY(-50%) scale(1.1);
        }

        .contribution-filter-select {
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

        .contribution-filter-select:hover {
          border-color: #10b981;
          box-shadow: 0 4px 15px rgba(16, 185, 129, 0.15);
          transform: translateY(-1px);
        }

        .contribution-filter-select:focus {
          outline: none;
          border-color: #059669;
          box-shadow: 
            0 4px 20px rgba(5, 150, 105, 0.15),
            0 0 0 4px rgba(5, 150, 105, 0.1);
        }

        .contribution-sort-toggle {
          padding: 12px 16px;
          background: linear-gradient(135deg, #059669, #10b981);
          border: none;
          border-radius: 12px;
          cursor: pointer;
          font-size: 16px;
          font-weight: 700;
          color: white;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: 0 4px 15px rgba(5, 150, 105, 0.3);
          min-width: 50px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .contribution-sort-toggle:hover {
          background: linear-gradient(135deg, #047857, #059669);
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(5, 150, 105, 0.4);
        }

        .contribution-sort-toggle:active {
          transform: translateY(0);
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .contribution-management {
            padding: 16px;
          }

          .contribution-header {
            flex-direction: column;
            gap: 16px;
            align-items: stretch;
          }

          .header-left {
            text-align: center;
          }

          .header-actions {
            justify-content: center;
            flex-wrap: wrap;
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
          .contribution-search-wrapper {
            min-width: auto;
            width: 100%;
          }

          .contribution-search-input,
          .contribution-filter-select {
            width: 100%;
            min-width: auto;
          }

          .contribution-stats {
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 12px;
          }

          .stat-card h3 {
            font-size: 1.5em;
          }

          .contribution-table {
            overflow-x: auto;
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
        }

        @media (max-width: 480px) {
          .contribution-management {
            padding: 12px;
          }

          .filters-section {
            padding: 12px;
          }

          .contribution-stats {
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

          .btn-back, .btn-add, .btn-refresh {
            padding: 6px 10px;
            font-size: 12px;
          }
        }
        .contribution-header {
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
        .header-actions {
          display: flex;
          gap: 10px;
          align-items: center;
        }
        .filter-select {
          padding: 8px 12px;
          border: 1px solid #d1d5db;
          border-radius: 4px;
        }
        .contribution-stats {
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
        .contribution-table {
          background: white;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          overflow-x: auto;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          min-width: 800px;
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
        .status-pill, .type-pill {
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
        .form-group {
          margin-bottom: 15px;
        }
        .form-group label {
          display: block;
          margin-bottom: 5px;
          font-weight: 500;
        }
        .form-group input,
        .form-group select,
        .form-group textarea {
          width: 100%;
          padding: 8px 12px;
          border: 1px solid #d1d5db;
          border-radius: 4px;
        }
        .contribution-details {
          margin: 20px 0;
        }
        .contribution-details p {
          margin: 10px 0;
        }
        .contribution-actions {
          display: flex;
          gap: 10px;
          margin: 20px 0;
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
        .btn-add {
          background: #10b981;
          color: white;
        }
        .btn-refresh {
          background: #3b82f6;
          color: white;
        }
        .btn-verify {
          background: #10b981;
          color: white;
        }
        .btn-reject {
          background: #ef4444;
          color: white;
        }
        .btn-delete {
          background: #dc2626;
          color: white;
        }
      `}</style>
    </div>
  );
};

export default ContributionManagement;