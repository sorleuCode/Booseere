import React, { useState, useEffect } from 'react';
import { useDashboard } from '../../context/DashboardContext';
import { useConfirm } from '../../hooks';
import { adminAPI } from '../../api/admin';
import { formatDate } from '../../utils/dateUtils';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import ConfirmModal from '../UI/ConfirmModal';

function DashboardOverview() {
  const { stats: dashboardStats, loading: dashboardLoading, refreshDashboard } = useDashboard();
  const { confirmState } = useConfirm();
  const [chartData, setChartData] = useState({ contributionTrend: [], loanDistribution: [] });
  const [chartLoading, setChartLoading] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

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
      } else {
        console.warn('Chart data API returned success=false');
        setChartData({ contributionTrend: [], loanDistribution: [] });
      }
    } catch (error) {
      console.error('Error loading chart data:', error);
      setChartData({ contributionTrend: [], loanDistribution: [] });
    }
  };

  useEffect(() => {
    const loadAllData = async () => {
      try {
        setChartLoading(true);
        setDataLoaded(false);
        setIsInitialLoad(true);

        // Set a timeout to prevent infinite loading
        const timeoutId = setTimeout(() => {
          console.warn('Dashboard loading timeout reached');
          setChartLoading(false);
          setDataLoaded(true);
          setIsInitialLoad(false);
        }, 15000); // 15 second timeout

        // Load chart data
        await loadChartData();

        // Check if we have dashboard stats
        if (dashboardStats) {
          // Stats are already loaded, we're good to go
          clearTimeout(timeoutId);
          setDataLoaded(true);
          setIsInitialLoad(false);
        }
        // If stats aren't loaded yet, the second useEffect will handle it
      } catch (error) {
        console.error('Error loading dashboard data:', error);
        setDataLoaded(true);
        setIsInitialLoad(false);
      } finally {
        setChartLoading(false);
      }
    };

    loadAllData();

    return () => {
      // Cleanup function to clear any pending timeouts
      // (handled within the async function)
    };
  }, []);

  useEffect(() => {
    if (dashboardStats && isInitialLoad) {
      // Dashboard stats just loaded, mark data as loaded
      setDataLoaded(true);
      setIsInitialLoad(false);
      console.log('Dashboard stats loaded, analytics ready');
    } else if (!dashboardStats && !isInitialLoad) {
      // If stats were reset (e.g., on refresh), reset our state too
      setIsInitialLoad(true);
      setDataLoaded(false);
    }
  }, [dashboardStats, isInitialLoad]);

  const formatCurrency = (amount) => {
    return `₦${amount.toLocaleString()}`;
  };

  const handleRefresh = async () => {
    // Reset loading states before refresh
    setChartLoading(true);
    setDataLoaded(false);
    setIsInitialLoad(true);

    try {
      await refreshDashboard();
      // After refresh, load chart data again
      await loadChartData();
    } catch (error) {
      console.error('Error during refresh:', error);
    } finally {
      // Let the useEffect handle setting the final states
      // based on whether dashboardStats is available
    }
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
          <div className="dashboard-loading">
            <div className="progress-bar">
              <div className="progress-fill"></div>
            </div>
            <p>Loading statistics...</p>
          </div>
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

        {(chartLoading || !dataLoaded || isInitialLoad) ? (
          <div className="charts-loading">
            <div className="pulse-loader">
              <div className="pulse-dot"></div>
              <div className="pulse-dot"></div>
              <div className="pulse-dot"></div>
            </div>
            <p>Loading charts...</p>
          </div>
        ) : (
          <div className="charts-grid">
            {/* Contribution Trend Chart */}
            <div className="chart-card">
              <h3>Contribution Trends (Last 12 Months)</h3>
              {chartData.contributionTrend && chartData.contributionTrend.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={chartData.contributionTrend}>
                    {/* <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" strokeWidth={1} /> */}
                    <XAxis
                      dataKey="month"
                      fontSize={12}
                      angle={-45}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis fontSize={12} />
                    <Tooltip formatter={(value) => [`₦${value.toLocaleString()}`, 'Contributions']} labelFormatter={(label) => formatDate(label)} />
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

// Add CSS styles for the progress bar loading indicator
<style jsx>{`
  .dashboard-loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 2rem;
    min-height: 300px;
    width: 100%;
  }

  .progress-bar {
    width: 100%;
    max-width: 400px;
    height: 6px;
    background-color: #e5e7eb;
    border-radius: 3px;
    overflow: hidden;
    margin-bottom: 1rem;
    position: relative;
  }

  .progress-fill {
    height: 100%;
    width: 100%;
    background: linear-gradient(90deg, #4f9cf9, #6366f1);
    background-size: 200% 100%;
    animation: progressAnimation 2s linear infinite;
    border-radius: 3px;
  }

  .dashboard-loading p {
    color: #4f9cf9;
    font-weight: 500;
    font-size: 1rem;
    margin: 0;
    text-align: center;
  }

  /* Charts Loading - Pulse Loader */
  .charts-loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 2rem;
    min-height: 300px;
    width: 100%;
  }

  .pulse-loader {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-bottom: 1rem;
    gap: 8px;
  }

  .pulse-dot {
    width: 12px;
    height: 12px;
    background-color: #4f9cf9;
    border-radius: 50%;
    animation: pulse 1.4s infinite ease-in-out;
  }

  .pulse-dot:nth-child(2) {
    animation-delay: 0.2s;
  }

  .pulse-dot:nth-child(3) {
    animation-delay: 0.4s;
  }

  @keyframes pulse {
    0%, 80%, 100% {
      transform: scale(0.8);
      opacity: 0.6;
    }
    40% {
      transform: scale(1.2);
      opacity: 1;
    }
  }

  .charts-loading p {
    color: #6366f1;
    font-weight: 500;
    font-size: 1rem;
    margin: 0;
    text-align: center;
  }

  @keyframes progressAnimation {
    0% {
      transform: translateX(-100%);
    }
    100% {
      transform: translateX(100%);
    }
  }
`}</style>
