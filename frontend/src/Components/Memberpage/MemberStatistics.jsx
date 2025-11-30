import React, { useState, useEffect } from 'react';
import { memberAPI } from '../../api/members';
import { contributionAPI } from '../../api/contributions';
import { loanAPI } from '../../api/loans';
import LoadingSpinner from '../UI/LoadingSpinner';

const MemberStatistics = ({ memberId }) => {
  const [member, setMember] = useState(null);
  const [contributions, setContributions] = useState([]);
  const [loans, setLoans] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadMemberData = async () => {
    if (!memberId) return;
    
    try {
      setLoading(true);
      setError(null);

      // Load member details
      const memberResponse = await memberAPI.getById(memberId);
      setMember(memberResponse.data || memberResponse);

      // Load member contributions
      const contributionsResponse = await contributionAPI.getByMember(memberId);
      setContributions(contributionsResponse.data || contributionsResponse);

      // Load member loans
      const loansResponse = await loanAPI.getByMember(memberId);
      setLoans(loansResponse.data || loansResponse);

      // Calculate statistics
      const contributionsData = contributionsResponse.data || contributionsResponse || [];
      const loansData = loansResponse.data || loansResponse || [];
      
      const totalContributions = contributionsData.reduce((sum, c) => sum + (c.amount || 0), 0);
      const totalLoans = loansData.reduce((sum, l) => sum + (l.loanAmount || 0), 0);
      const outstandingLoans = loansData.reduce((sum, l) => sum + (l.outstandingBalance || 0), 0);
      const totalRepaid = loansData.reduce((sum, l) => sum + (l.amountPaid || 0), 0);

      const monthlyContributions = contributionsData.filter(c => 
        c.contributionType === 'monthly'
      ).reduce((sum, c) => sum + (c.amount || 0), 0);

      const specialContributions = contributionsData.filter(c => 
        c.contributionType === 'special'
      ).reduce((sum, c) => sum + (c.amount || 0), 0);

      const activeLoans = loansData.filter(l => 
        ['disbursed', 'repaying'].includes(l.status)
      ).length;

      const completedLoans = loansData.filter(l => 
        l.status === 'completed'
      ).length;

      setStats({
        totalContributions,
        totalLoans,
        outstandingLoans,
        totalRepaid,
        monthlyContributions,
        specialContributions,
        activeLoans,
        completedLoans,
        contributionCount: contributionsData.length,
        loanCount: loansData.length,
      });

    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load member statistics');
      console.error('Error loading member statistics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMemberData();
  }, [memberId]);

  const formatCurrency = (amount) => {
    return `₦${amount?.toLocaleString() || 0}`;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return <LoadingSpinner size="large" text="Loading member statistics..." />;
  }

  if (error) {
    return (
      <div className="member-statistics">
        <div className="error-state">
          <p>❌ {error}</p>
          <button onClick={loadMemberData}>Retry</button>
        </div>
      </div>
    );
  }

  if (!member) {
    return (
      <div className="member-statistics">
        <div className="empty-state">
          <p>Member not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="member-statistics">
      <div className="statistics-header">
        <div className="member-info">
          <h2>{member.fullName}</h2>
          <p>Membership Number: {member.membershipNumber}</p>
          <p>Member Since: {formatDate(member.joinDate)}</p>
          <span className={`status-pill ${member.status.toLowerCase()}`}>
            {member.status}
          </span>
        </div>
      </div>

      <div className="statistics-grid">
        {/* Financial Overview */}
        <div className="stats-section">
          <h3>💰 Financial Overview</h3>
          <div className="stats-grid">
            <div className="stat-card highlight">
              <div className="stat-value">{formatCurrency(stats?.totalContributions || 0)}</div>
              <div className="stat-label">Total Contributions</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats?.contributionCount || 0}</div>
              <div className="stat-label">Contributions Made</div>
            </div>
            <div className="stat-card highlight">
              <div className="stat-value">{formatCurrency(stats?.monthlyContributions || 0)}</div>
              <div className="stat-label">Monthly Contributions</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{formatCurrency(stats?.specialContributions || 0)}</div>
              <div className="stat-label">Special Contributions</div>
            </div>
          </div>
        </div>

        {/* Loan Summary */}
        <div className="stats-section">
          <h3>🏦 Loan Summary</h3>
          <div className="stats-grid">
            <div className="stat-card highlight">
              <div className="stat-value">{formatCurrency(stats?.totalLoans || 0)}</div>
              <div className="stat-label">Total Loans Received</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats?.loanCount || 0}</div>
              <div className="stat-label">Number of Loans</div>
            </div>
            <div className="stat-card highlight warning">
              <div className="stat-value">{formatCurrency(stats?.outstandingLoans || 0)}</div>
              <div className="stat-label">Outstanding Balance</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{formatCurrency(stats?.totalRepaid || 0)}</div>
              <div className="stat-label">Total Repaid</div>
            </div>
          </div>
        </div>

        {/* Status Breakdown */}
        <div className="stats-section">
          <h3>📊 Account Status</h3>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-value">{stats?.activeLoans || 0}</div>
              <div className="stat-label">Active Loans</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats?.completedLoans || 0}</div>
              <div className="stat-label">Completed Loans</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{member.position || 'Member'}</div>
              <div className="stat-label">Position</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{member.phone || 'Not set'}</div>
              <div className="stat-label">Phone Number</div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="recent-activity">
        <h3>📋 Recent Activity</h3>
        <div className="activity-tabs">
          <div className="tab-content">
            <div className="activity-section">
              <h4>Recent Contributions</h4>
              {contributions.length > 0 ? (
                <div className="activity-list">
                  {contributions.slice(0, 5).map(contribution => (
                    <div key={contribution._id} className="activity-item contribution">
                      <div className="activity-info">
                        <div className="activity-amount">{formatCurrency(contribution.amount)}</div>
                        <div className="activity-details">
                          <span className="activity-type">{contribution.contributionType}</span>
                          <span className="activity-date">{formatDate(contribution.paymentDate)}</span>
                        </div>
                      </div>
                      <span className={`activity-status ${contribution.status.toLowerCase()}`}>
                        {contribution.status}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="no-activity">No contributions found</p>
              )}
            </div>

            <div className="activity-section">
              <h4>Recent Loans</h4>
              {loans.length > 0 ? (
                <div className="activity-list">
                  {loans.slice(0, 5).map(loan => (
                    <div key={loan._id} className="activity-item loan">
                      <div className="activity-info">
                        <div className="activity-amount">{formatCurrency(loan.loanAmount)}</div>
                        <div className="activity-details">
                          <span className="activity-purpose">{loan.purpose}</span>
                          <span className="activity-date">{formatDate(loan.applicationDate)}</span>
                        </div>
                      </div>
                      <span className={`activity-status ${loan.status.toLowerCase()}`}>
                        {loan.status}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="no-activity">No loans found</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .member-statistics {
          padding: 20px;
        }
        .statistics-header {
          background: white;
          border-radius: 12px;
          padding: 24px;
          margin-bottom: 24px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .member-info h2 {
          margin: 0 0 8px 0;
          color: #1e293b;
        }
        .member-info p {
          margin: 4px 0;
          color: #64748b;
        }
        .status-pill {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 0.875em;
          font-weight: 500;
          margin-top: 8px;
        }
        .status-pill.active {
          background: #dcfce7;
          color: #166534;
        }
        .status-pill.inactive {
          background: #fef2f2;
          color: #dc2626;
        }
        .statistics-grid {
          display: grid;
          gap: 24px;
          margin-bottom: 24px;
        }
        .stats-section {
          background: white;
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .stats-section h3 {
          margin: 0 0 20px 0;
          color: #1e293b;
        }
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
        }
        .stat-card {
          text-align: center;
          padding: 20px;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          background: #f8fafc;
        }
        .stat-card.highlight {
          background: #eff6ff;
          border-color: #3b82f6;
        }
        .stat-card.warning {
          background: #fef3c7;
          border-color: #f59e0b;
        }
        .stat-value {
          font-size: 1.5em;
          font-weight: bold;
          color: #1e293b;
          margin-bottom: 4px;
        }
        .stat-label {
          color: #64748b;
          font-size: 0.9em;
        }
        .recent-activity {
          background: white;
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .recent-activity h3 {
          margin: 0 0 20px 0;
          color: #1e293b;
        }
        .activity-section {
          margin-bottom: 32px;
        }
        .activity-section h4 {
          margin: 0 0 16px 0;
          color: #374151;
        }
        .activity-list {
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          overflow: hidden;
        }
        .activity-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px;
          border-bottom: 1px solid #f1f5f9;
        }
        .activity-item:last-child {
          border-bottom: none;
        }
        .activity-info {
          flex: 1;
        }
        .activity-amount {
          font-weight: bold;
          color: #1e293b;
          margin-bottom: 4px;
        }
        .activity-details {
          display: flex;
          gap: 16px;
          align-items: center;
        }
        .activity-type, .activity-purpose {
          color: #374151;
          font-size: 0.9em;
        }
        .activity-date {
          color: #64748b;
          font-size: 0.875em;
        }
        .activity-status {
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 0.875em;
          font-weight: 500;
        }
        .activity-status.verified {
          background: #dcfce7;
          color: #166534;
        }
        .activity-status.pending {
          background: #fef3c7;
          color: #92400e;
        }
        .activity-status.approved {
          background: #dbeafe;
          color: #1e40af;
        }
        .activity-status.disbursed {
          background: #dcfce7;
          color: #166534;
        }
        .activity-status.repaying {
          background: #e9d5ff;
          color: #6b21a8;
        }
        .no-activity {
          text-align: center;
          color: #64748b;
          padding: 40px;
        }
        .error-state, .empty-state {
          text-align: center;
          padding: 40px;
          color: #64748b;
        }
        .error-state button {
          margin-top: 16px;
          padding: 8px 16px;
          background: #3b82f6;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
};

export default MemberStatistics;