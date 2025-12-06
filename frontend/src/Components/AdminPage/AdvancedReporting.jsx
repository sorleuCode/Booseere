import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../api/admin';
import LoadingSpinner from '../UI/LoadingSpinner';

const AdvancedReporting = () => {
  const [reports, setReports] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: '',
  });
  const [activeTab, setActiveTab] = useState('overview');

  const loadFinancialReport = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getFinancialReport(
        dateRange.startDate,
        dateRange.endDate
      );
      if (response.success) {
        setReports(response.data);
      }
    } catch (err) {
      console.error('Error loading financial report:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Set default date range to last 3 months
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 3);
    
    setDateRange({
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
    });
  }, []);

  useEffect(() => {
    if (dateRange.startDate && dateRange.endDate) {
      loadFinancialReport();
    }
  }, [dateRange]);

  const formatCurrency = (amount) => {
    return `₦${amount?.toLocaleString() || 0}`;
  };

  const formatPercentage = (value) => {
    return `${(value * 100).toFixed(1)}%`;
  };

  const getContributionTypeColor = (type) => {
    const colors = {
      monthly: '#3b82f6',
      special: '#8b5cf6',
      registration: '#10b981',
      fine: '#ef4444',
      other: '#6b7280',
    };
    return colors[type] || '#6b7280';
  };

  const getLoanStatusColor = (status) => {
    const colors = {
      pending: '#f59e0b',
      approved: '#3b82f6',
      disbursed: '#10b981',
      repaying: '#8b5cf6',
      completed: '#6b7280',
      rejected: '#ef4444',
      defaulted: '#dc2626',
    };
    return colors[status] || '#6b7280';
  };

  if (loading && !reports) {
    return <LoadingSpinner size="large" />;
  }

  return (
    <div className="advanced-reporting">
      <div className="reporting-header">
        <h2>📊 Advanced Financial Reporting</h2>
        <div className="date-range-selector">
          <label>Date Range:</label>
          <input
            type="date"
            value={dateRange.startDate}
            onChange={(e) => setDateRange({...dateRange, startDate: e.target.value})}
            max={dateRange.endDate}
          />
          <span>to</span>
          <input
            type="date"
            value={dateRange.endDate}
            onChange={(e) => setDateRange({...dateRange, endDate: e.target.value})}
            min={dateRange.startDate}
          />
          <button onClick={loadFinancialReport} disabled={loading}>
            {loading ? 'Loading...' : 'Refresh'}
          </button>
        </div>
      </div>

      <div className="report-tabs">
        <button
          className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button
          className={`tab-button ${activeTab === 'contributions' ? 'active' : ''}`}
          onClick={() => setActiveTab('contributions')}
        >
          Contributions
        </button>
        <button
          className={`tab-button ${activeTab === 'loans' ? 'active' : ''}`}
          onClick={() => setActiveTab('loans')}
        >
          Loans
        </button>
        <button
          className={`tab-button ${activeTab === 'trends' ? 'active' : ''}`}
          onClick={() => setActiveTab('trends')}
        >
          Trends
        </button>
      </div>

      <div className="report-content">
        {activeTab === 'overview' && (
          <div className="overview-report">
            <div className="summary-cards">
              <div className="summary-card">
                <h3>Total Contributions</h3>
                <div className="summary-value">
                  {formatCurrency(
                    reports?.contributionsByType?.reduce((sum, c) => sum + c.total, 0) || 0
                  )}
                </div>
                <div className="summary-subtitle">
                  {reports?.contributionsByType?.length || 0} contribution types
                </div>
              </div>
              <div className="summary-card">
                <h3>Active Loans</h3>
                <div className="summary-value">
                  {reports?.loanStats?.find(l => l._id === 'disbursed' || l._id === 'repaying')?.count || 0}
                </div>
                <div className="summary-subtitle">
                  {formatCurrency(
                    reports?.loanStats?.find(l => l._id === 'disbursed' || l._id === 'repaying')?.totalAmount || 0
                  )} disbursed
                </div>
              </div>
              <div className="summary-card">
                <h3>Completed Loans</h3>
                <div className="summary-value">
                  {reports?.loanStats?.find(l => l._id === 'completed')?.count || 0}
                </div>
                <div className="summary-subtitle">
                  {formatCurrency(
                    reports?.loanStats?.find(l => l._id === 'completed')?.totalAmount || 0
                  )} repaid
                </div>
              </div>
              <div className="summary-card">
                <h3>Collection Rate</h3>
                <div className="summary-value">
                  {formatPercentage(
                    (reports?.loanStats?.find(l => l._id === 'completed')?.count || 0) / 
                    (reports?.loanStats?.reduce((sum, l) => sum + l.count, 0) || 1)
                  )}
                </div>
                <div className="summary-subtitle">
                  Loan completion rate
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'contributions' && (
          <div className="contributions-report">
            <h3>Contributions by Type</h3>
            <div className="contributions-grid">
              {reports?.contributionsByType?.map((type, index) => (
                <div key={index} className="contribution-type-card">
                  <div 
                    className="type-indicator"
                    style={{ backgroundColor: getContributionTypeColor(type._id) }}
                  ></div>
                  <div className="type-info">
                    <h4>{type._id.charAt(0).toUpperCase() + type._id.slice(1)}</h4>
                    <div className="type-stats">
                      <div className="stat-row">
                        <span>Total Amount:</span>
                        <strong>{formatCurrency(type.total)}</strong>
                      </div>
                      <div className="stat-row">
                        <span>Transactions:</span>
                        <strong>{type.count}</strong>
                      </div>
                      <div className="stat-row">
                        <span>Average:</span>
                        <strong>{formatCurrency(type.total / type.count)}</strong>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'loans' && (
          <div className="loans-report">
            <h3>Loan Portfolio Analysis</h3>
            <div className="loan-status-grid">
              {reports?.loanStats?.map((status, index) => (
                <div key={index} className="loan-status-card">
                  <div 
                    className="status-indicator"
                    style={{ backgroundColor: getLoanStatusColor(status._id) }}
                  ></div>
                  <div className="status-info">
                    <h4>{status._id.charAt(0).toUpperCase() + status._id.slice(1)}</h4>
                    <div className="status-stats">
                      <div className="stat-row">
                        <span>Count:</span>
                        <strong>{status.count}</strong>
                      </div>
                      <div className="stat-row">
                        <span>Total Amount:</span>
                        <strong>{formatCurrency(status.totalAmount)}</strong>
                      </div>
                      <div className="stat-row">
                        <span>Average Loan:</span>
                        <strong>{formatCurrency(status.totalAmount / status.count)}</strong>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'trends' && (
          <div className="trends-report">
            <h3>Monthly Contribution Trends</h3>
            <div className="trends-chart">
              {reports?.monthlyContributions?.length > 0 ? (
                <div className="monthly-trends">
                  {reports.monthlyContributions.slice(0, 12).map((month, index) => (
                    <div key={index} className="month-bar">
                      <div className="bar-container">
                        <div 
                          className="bar"
                          style={{ 
                            height: `${Math.min((month.total / Math.max(...reports.monthlyContributions.map(m => m.total))) * 100, 100)}%`,
                            backgroundColor: '#3b82f6'
                          }}
                        ></div>
                      </div>
                      <div className="month-label">
                        <div className="month-name">
                          {new Date(month._id.year, month._id.month - 1).toLocaleDateString('en-US', { month: 'short' })}
                        </div>
                        <div className="month-amount">{formatCurrency(month.total)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-data">
                  <p>No monthly trend data available</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .advanced-reporting {
          padding: 20px;
        }
        .reporting-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
          flex-wrap: wrap;
          gap: 16px;
        }
        .reporting-header h2 {
          color: #1e293b;
          margin: 0;
        }
        .date-range-selector {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 16px;
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .date-range-selector label {
          font-weight: 500;
          color: #374151;
        }
        .date-range-selector input {
          padding: 6px 10px;
          border: 1px solid #d1d5db;
          border-radius: 4px;
        }
        .date-range-selector button {
          padding: 6px 12px;
          background: #3b82f6;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }
        .report-tabs {
          display: flex;
          gap: 4px;
          margin-bottom: 24px;
          background: white;
          padding: 4px;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .tab-button {
          padding: 10px 20px;
          border: none;
          background: transparent;
            border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
          color: #64748b;
          transition: all 0.2s;
        }
        .tab-button.active {
          background: #3b82f6;
          color: white;
        }
        .report-content {
          background: white;
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .summary-cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
        }
        .summary-card {
          padding: 24px;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          text-align: center;
        }
        .summary-card h3 {
          margin: 0 0 12px 0;
          color: #374151;
          font-size: 0.9em;
        }
        .summary-value {
          font-size: 2em;
          font-weight: bold;
          color: #1e293b;
          margin-bottom: 8px;
        }
        .summary-subtitle {
          color: #64748b;
          font-size: 0.9em;
        }
        .contributions-grid, .loan-status-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 20px;
          margin-top: 20px;
        }
        .contribution-type-card, .loan-status-card {
          display: flex;
          align-items: center;
          padding: 20px;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          background: #f8fafc;
        }
        .type-indicator, .status-indicator {
          width: 12px;
          height: 60px;
          border-radius: 6px;
          margin-right: 16px;
        }
        .type-info h4, .status-info h4 {
          margin: 0 0 12px 0;
          color: #1e293b;
        }
        .stat-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 4px;
          font-size: 0.9em;
        }
        .stat-row span {
          color: #64748b;
        }
        .stat-row strong {
          color: #1e293b;
        }
        .monthly-trends {
          display: flex;
          gap: 12px;
          align-items: end;
          height: 200px;
          padding: 20px 0;
        }
        .month-bar {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          height: 100%;
        }
        .bar-container {
          flex: 1;
          width: 100%;
          display: flex;
          align-items: end;
          justify-content: center;
          margin-bottom: 8px;
        }
        .bar {
          width: 100%;
          max-width: 40px;
          border-radius: 4px 4px 0 0;
          transition: height 0.3s ease;
        }
        .month-label {
          text-align: center;
          font-size: 0.8em;
        }
        .month-name {
          color: #64748b;
        }
        .month-amount {
          color: #1e293b;
          font-weight: 500;
        }
        .no-data {
          text-align: center;
          padding: 40px;
          color: #64748b;
        }
      `}</style>
    </div>
  );
};

export default AdvancedReporting;