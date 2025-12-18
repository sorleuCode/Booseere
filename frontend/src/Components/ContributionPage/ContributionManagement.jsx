import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { contributionAPI } from '../../api/contributions';
import { memberAPI } from '../../api/members';
import { useConfirm } from '../../hooks';
import LoadingSpinner from '../UI/LoadingSpinner';
import ConfirmModal from '../UI/ConfirmModal';
import ContributionDetailsModal from './ContributionDetailsModal';
import './ContributionManagement.css';

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
    memberLabel: '',
    amount: '',
    contributionType: 'monthly',
    paymentMethod: 'cash',
    paymentDate: new Date().toISOString().split('T')[0],
    notes: '',
  });
  // Search state for member selector
  const [memberSearch, setMemberSearch] = useState('');
  const [showMemberDropdown, setShowMemberDropdown] = useState(false);
  const [debouncedMemberSearch, setDebouncedMemberSearch] = useState(memberSearch);
  useEffect(() => {
    const t = setTimeout(() => setDebouncedMemberSearch(memberSearch), 250);
    return () => clearTimeout(t);
  }, [memberSearch]);

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
  const loadMembers = useCallback(async () => {
    try {
      const response = await memberAPI.getAll();
      setMembers(response.data || response);
    } catch (err) {
      console.error('Error loading members:', err);
    }
  }, []);

  // Add contribution
  const addContribution = useCallback(async (e) => {
    e.preventDefault();
    setSubmitting(true);
    // pre-submit validation
    if (!formData.memberId) {
      alert('Please select a member for this contribution');
      setSubmitting(false);
      return;
    }
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
          memberLabel: '',
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
  }, [formData]);

  // Update contribution
  const updateContribution = useCallback(async (id, updateData) => {
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
  }, []);

  // Delete contribution
  const deleteContribution = useCallback(async (id) => {
    if (!id) return;
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
  }, [confirm]);


  // Filter and sort contributions
  const filterAndSortContributions = useCallback(() => {
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
  }, [searchTerm, statusFilter, typeFilter, memberFilter, sortBy, sortOrder, contributions]);

  // Aggregate contributions by member for the aggregated view
  const memberAggregates = React.useMemo(() => {
    const map = new Map();
    filteredContributions.forEach(c => {
      const rawId = c.memberId?._id || c.memberId;
      if (!rawId || rawId === 'undefined' || rawId === 'null') {
        console.warn('Contribution entry with missing/invalid memberId:', c);
        return; // skip entries with invalid memberId
      }
      const id = String(rawId);
      const name = c.memberId?.fullName || 'Unknown';
      if (!map.has(id)) {
        map.set(id, { memberId: id, fullName: name, total: 0, lastPayment: null, count: 0 });
      }
      const entry = map.get(id);
      entry.total += (c.amount || 0);
      entry.count += 1;
      const pd = new Date(c.paymentDate);
      if (!entry.lastPayment || pd > new Date(entry.lastPayment)) entry.lastPayment = c.paymentDate;
    });
    return Array.from(map.values()).sort((a,b) => b.total - a.total);
  }, [filteredContributions]);

  useEffect(() => {
    loadContributions();
    loadMembers();
  }, [loadMembers]);

  useEffect(() => {
    filterAndSortContributions();
  }, [filterAndSortContributions]);

  /* Render helpers */
  const renderMemberAggregates = () => (
    <div className="contribution-table">
      <table>
        <thead>
          <tr>
            <th>Member</th>
            <th>Total Contribution</th>
            <th>Last Payment</th>
            <th>Count</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {memberAggregates.map(entry => (
            <tr key={entry.memberId}>
              <td>{entry.fullName}</td>
              <td>{formatCurrency(entry.total)}</td>
              <td>{entry.lastPayment ? new Date(entry.lastPayment).toLocaleDateString() : 'N/A'}</td>
              <td>{entry.count}</td>
              <td>
                <button
                  onClick={async () => {
                    try {
                      const rawId = entry.memberId;
                      if (!rawId || rawId === 'undefined' || rawId === 'null') {
                        console.error('Invalid memberId for entry (skipping):', entry);
                        setSelectedContribution({ member: { _id: null, fullName: entry.fullName }, contributions: [], total: entry.total });
                        return;
                      }

                      const memberIdToUse = String(rawId);
                      const resp = await contributionAPI.getByMember(encodeURIComponent(memberIdToUse));
                      const data = resp.data || resp;
                      const contributionsArr = data.data || data;
                      // pick most recent contribution (by paymentDate) to open details directly
                      if (Array.isArray(contributionsArr) && contributionsArr.length > 0) {
                        const sorted = contributionsArr.slice().sort((a,b) => new Date(b.paymentDate) - new Date(a.paymentDate));
                        setSelectedContribution(sorted[0]);
                      } else if (contributionsArr && contributionsArr._id) {
                        setSelectedContribution(contributionsArr);
                      } else {
                        setSelectedContribution(null);
                      }
                      setShowModal(false);
                    } catch (err) {
                      console.error('Failed to load member contributions:', err);
                        // no contributions found for this member
                        setSelectedContribution(null);
                        setShowModal(false);
                    }
                  }}
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
  );

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
          <button onClick={() => { setSelectedContribution(null); setShowModal(true); setMemberSearch(''); setFormData({ memberId: '', memberLabel: '', amount: '', contributionType: 'monthly', paymentMethod: 'cash', paymentDate: new Date().toISOString().split('T')[0], notes: '' }); }} className="btn-add">
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

      {renderMemberAggregates()}

      {selectedContribution && (
        <ContributionDetailsModal
          contribution={selectedContribution}
          onClose={() => setSelectedContribution(null)}
          onDelete={deleteContribution}
          onUpdate={updateContribution}
        />
      )}

      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Add Contribution</h2>
              <button type="button" className="modal-close-btn" onClick={() => setShowModal(false)}>×</button>
            </div>

            <div className="modal-body">
              <form onSubmit={addContribution}>
                <div className="form-group" style={{position: 'relative'}}>
                  <label>Member</label>
                  <input
                    type="text"
                    placeholder="Search member by name..."
                    value={memberSearch}
                    onChange={(e) => {
                      setMemberSearch(e.target.value);
                      setShowMemberDropdown(true);
                    }}
                    onFocus={() => setShowMemberDropdown(true)}
                    required
                  />
                  {showMemberDropdown && (
                    <div className="member-dropdown" style={{position: 'absolute', zIndex: 30, background: 'white', border: '1px solid #e2e8f0', width: '100%', maxHeight: 220, overflowY: 'auto'}}>
                      {members.filter(m => m.fullName?.toLowerCase().includes((debouncedMemberSearch || '').toLowerCase())).map(m => (
                        <div key={m._id} style={{padding: 8, cursor: 'pointer'}} onMouseDown={(ev) => {
                          ev.preventDefault();
                          setFormData(prev => ({...prev, memberId: m._id, memberLabel: m.fullName}));
                          setMemberSearch(m.fullName);
                          setShowMemberDropdown(false);
                        }}>{m.fullName} <span style={{color: '#64748b'}}>({m.membershipNumber || ''})</span></div>
                      ))}
                      {members.filter(m => m.fullName?.toLowerCase().includes((debouncedMemberSearch || '').toLowerCase())).length === 0 && (
                        <div style={{padding: 8, color: '#94a3b8'}}>No members found</div>
                      )}
                    </div>
                  )}
                </div>
                <div className="form-group">
                  <label>Amount (₦)</label>
                  <input type="number" name="amount" min="0" step="0.01" value={formData.amount} onChange={(e) => setFormData(prev => ({...prev, amount: e.target.value}))} required />
                </div>
                <div className="form-group">
                  <label>Type</label>
                  <select value={formData.contributionType} onChange={(e) => setFormData(prev => ({...prev, contributionType: e.target.value}))}>
                    <option value="monthly">Monthly</option>
                    <option value="special">Special</option>
                    <option value="registration">Registration</option>
                    <option value="fine">Fine</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Payment Method</label>
                  <select value={formData.paymentMethod} onChange={(e) => setFormData(prev => ({...prev, paymentMethod: e.target.value}))}>
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
                    onChange={(e) => setFormData(prev => ({...prev, paymentDate: e.target.value}))}
                    required 
                  />
                </div>
                
                <div className="form-group">
                  <label>Notes:</label>
                  <textarea 
                    name="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({...prev, notes: e.target.value}))}
                    rows="3"
                  />
                </div>
                
                <div className="modal-footer">
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

      
    </div>
  );
};

export default ContributionManagement;