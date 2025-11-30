import React, { useState, useEffect } from 'react';
import { useDashboard } from '../../context/DashboardContext';
import { useConfirm } from '../../hooks';
import { adminAPI } from '../../api/admin';
import { formatDateTime, formatDate } from '../../utils/dateUtils';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import LoadingSpinner from '../UI/LoadingSpinner';
import ConfirmModal from '../UI/ConfirmModal';

function DashboardOverview() {
  const { stats: dashboardStats, loading: dashboardLoading, refreshDashboard } = useDashboard();
  const { confirm, confirmState } = useConfirm();
  const [chartData, setChartData] = useState({ contributionTrend: [], loanDistribution: [] });
  const [chartLoading, setChartLoading] = useState(false);

  // Load chart data
  const loadChartData = async () => {
    try {
      setChartLoading(true);
      const response = await adminAPI.getChartData();
      if (response.success) {
        const processedData = {
          contributionTrend: response.data.contributionTrend || [],
          loanDistribution: response.data.loanDistribution || []
        };
        setChartData(processedData);
      }
    } catch (error) {
      console.error('Error loading chart data:', error);
      setChartData({ contributionTrend: [], loanDistribution: [] });
    } finally {
      setChartLoading(false);
    }
  };

  useEffect(() => {
    loadChartData();
  }, []);

  useEffect(() => {
    if (dashboardStats) {
      loadChartData();
    }
  }, [dashboardStats]);

  const formatCurrency = (amount) => {
    return `₦${amount.toLocaleString()}`;
  };

  const handleRefresh = async () => {
    await refreshDashboard();
  };

  return (
    <div className="overview-content">
      {/* Dashboard Stats Section */}
      <div className="stats-section">
        <div className="section-header">
          <h2>📈 Dashboard Statistics</h2>
          <button className="btn-refresh" onClick={handleRefresh} disabled={dashboardLoading.stats}>
            {dashboardLoading.stats ? '🔄' : '🔄'} Refresh
          </button>
        </div>

        {dashboardLoading.stats ? (
          <LoadingSpinner size="medium" text="Loading statistics..." />
        ) : dashboardStats ? (
          <div className="stats-cards">
            <div className="stat-card">
              <div className="stat-icon blue">👥</div>
              <div className="stat-details">
                <p className="stat-label">Total Members</p>
                <h3 className="stat-value">{dashboardStats.members?.total || 0}</h3>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon green">💰</div>
              <div className="stat-details">
                <p className="stat-label">Total Contributions</p>
                <h3 className="stat-value">{formatCurrency(dashboardStats.contributions?.total || 0)}</h3>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon orange">📤</div>
              <div className="stat-details">
                <p className="stat-label">Total Loans Issued</p>
                <h3 className="stat-value">{formatCurrency(dashboardStats.loans?.totalIssued || 0)}</h3>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon purple">✅</div>
              <div className="stat-details">
                <p className="stat-label">Outstanding Loans</p>
                <h3 className="stat-value">{formatCurrency(dashboardStats.loans?.outstanding || 0)}</h3>
              </div>
            </div>
          </div>
        ) : (
          <div className="error-state">
            <p>⚠️ Failed to load dashboard statistics</p>
            <button onClick={handleRefresh}>Retry</button>
          </div>
        )}
      </div>

      {/* Charts Section */}
      <div className="charts-section">
        <div className="section-header">
          <h2>📊 Analytics & Trends</h2>
        </div>

        {chartLoading ? (
          <LoadingSpinner size="medium" text="Loading chart data..." />
        ) : (
          <div className="charts-grid">
            {/* Contribution Trend Chart */}
            <div className="chart-card">
              <h3>Contribution Trends (Last 12 Months)</h3>
              {chartData.contributionTrend && chartData.contributionTrend.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={chartData.contributionTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="month"
                      fontSize={12}
                      angle={-45}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis fontSize={12} />
                    <Tooltip formatter={(value) => [`₦${value.toLocaleString()}`, 'Contributions']} />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="contributions"
                      stroke="#8884d8"
                      strokeWidth={2}
                      dot={{ fill: '#8884d8', r: 3 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="no-data">
                  <p>No contribution data available</p>
                </div>
              )}
            </div>

            {/* Loan Distribution Chart */}
            <div className="chart-card">
              <h3>Loan Status Distribution</h3>
              {chartData.loanDistribution && chartData.loanDistribution.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={chartData.loanDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={70}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {chartData.loanDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value}`, 'Count']} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="no-data">
                  <p>No loan data available</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

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
}

export default DashboardOverview;