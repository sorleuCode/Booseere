import React, { useState } from 'react';
import { adminAPI } from '../../api/admin';

const ExportData = () => {
  const [loading, setLoading] = useState({});
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const exportTypes = [
    {
      type: 'members',
      name: 'Member Data',
      description: 'Export all member information including personal details and status',
      icon: '👥',
      fields: ['Membership Number', 'Full Name', 'Email', 'Phone', 'Address', 'Position', 'Status', 'Join Date']
    },
    {
      type: 'contributions',
      name: 'Contribution Records',
      description: 'Export all contribution transactions with member details',
      icon: '💰',
      fields: ['Receipt Number', 'Member Name', 'Membership Number', 'Amount', 'Type', 'Payment Date', 'Status']
    },
    {
      type: 'loans',
      name: 'Loan Records',
      description: 'Export all loan applications, statuses, and repayment history',
      icon: '🏦',
      fields: ['Member Name', 'Membership Number', 'Loan Amount', 'Interest Rate', 'Status', 'Application Date', 'Outstanding Balance']
    }
  ];

  const handleExport = async (type) => {
    setLoading(prev => ({ ...prev, [type]: true }));
    setError('');
    setMessage('');

    try {
      const response = await adminAPI.exportData(type);
      
      // Create download link
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Generate filename with timestamp
      const timestamp = new Date().toISOString().split('T')[0];
      link.download = `${type}_export_${timestamp}.csv`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      setMessage(`${exportTypes.find(t => t.type === type).name} exported successfully!`);
    } catch (err) {
      console.error('Export error:', err);
      setError(`Failed to export ${exportTypes.find(t => t.type === type).name}. Please try again.`);
    } finally {
      setLoading(prev => ({ ...prev, [type]: false }));
    }
  };

  return (
    <div className="export-data">
      <div className="export-header">
        <h2>Export Cooperative Data</h2>
        <p>Download comprehensive reports in CSV format for external analysis or record keeping.</p>
      </div>

      {message && (
        <div className="success-message">
          <p>✅ {message}</p>
        </div>
      )}

      {error && (
        <div className="error-message">
          <p>❌ {error}</p>
        </div>
      )}

      <div className="export-grid">
        {exportTypes.map(exportType => (
          <div key={exportType.type} className="export-card">
            <div className="export-card-header">
              <div className="export-icon">{exportType.icon}</div>
              <h3>{exportType.name}</h3>
            </div>
            
            <p className="export-description">{exportType.description}</p>
            
            <div className="export-fields">
              <h4>Includes:</h4>
              <ul>
                {exportType.fields.map((field, index) => (
                  <li key={index}>{field}</li>
                ))}
              </ul>
            </div>

            <button
              onClick={() => handleExport(exportType.type)}
              disabled={loading[exportType.type]}
              className="btn-export"
            >
              {loading[exportType.type] ? (
                <>
                  <span className="spinner"></span>
                  Exporting...
                </>
              ) : (
                <>
                  <span className="download-icon">📥</span>
                  Export {exportType.name}
                </>
              )}
            </button>
          </div>
        ))}
      </div>

      <div className="export-info">
        <h3>Export Information</h3>
        <div className="info-grid">
          <div className="info-item">
            <h4>📄 Format</h4>
            <p>All exports are provided in CSV (Comma Separated Values) format, compatible with Excel, Google Sheets, and other spreadsheet applications.</p>
          </div>
          <div className="info-item">
            <h4>🔄 Fresh Data</h4>
            <p>Exports contain real-time data from the database at the time of download, ensuring you have the most current information.</p>
          </div>
          <div className="info-item">
            <h4>🔒 Security</h4>
            <p>All exports are secured through admin authentication and contain only data you have permission to access.</p>
          </div>
          <div className="info-item">
            <h4>📊 Usage</h4>
            <p>Use exports for external analysis, backup purposes, reporting to stakeholders, or migrating data to other systems.</p>
          </div>
        </div>
      </div>

      <style jsx>{`
        .export-data {
          padding: 20px;
        }
        .export-header {
          margin-bottom: 30px;
        }
        .export-header h2 {
          color: #1e293b;
          margin-bottom: 10px;
        }
        .export-header p {
          color: #64748b;
          font-size: 1.1em;
        }
        .export-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
          gap: 24px;
          margin-bottom: 40px;
        }
        .export-card {
          background: white;
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          border: 1px solid #e2e8f0;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .export-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 12px rgba(0,0,0,0.15);
        }
        .export-card-header {
          display: flex;
          align-items: center;
          margin-bottom: 16px;
        }
        .export-icon {
          font-size: 2em;
          margin-right: 12px;
        }
        .export-card-header h3 {
          margin: 0;
          color: #1e293b;
          font-size: 1.25em;
        }
        .export-description {
          color: #64748b;
          margin-bottom: 20px;
          line-height: 1.5;
        }
        .export-fields {
          margin-bottom: 24px;
        }
        .export-fields h4 {
          margin: 0 0 8px 0;
          color: #374151;
          font-size: 0.9em;
        }
        .export-fields ul {
          margin: 0;
          padding-left: 20px;
          color: #64748b;
          font-size: 0.9em;
        }
        .export-fields li {
          margin-bottom: 4px;
        }
        .btn-export {
          width: 100%;
          padding: 12px 20px;
          background: #3b82f6;
          color: white;
          border: none;
          border-radius: 8px;
          font-weight: 500;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: background 0.2s;
        }
        .btn-export:hover:not(:disabled) {
          background: #2563eb;
        }
        .btn-export:disabled {
          background: #9ca3af;
          cursor: not-allowed;
        }
        .spinner {
          width: 16px;
          height: 16px;
          border: 2px solid #f3f3f3;
          border-top: 2px solid white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .success-message, .error-message {
          padding: 12px 16px;
          border-radius: 6px;
          margin-bottom: 20px;
        }
        .success-message {
          background: #dcfce7;
          color: #166534;
          border: 1px solid #bbf7d0;
        }
        .error-message {
          background: #fef2f2;
          color: #dc2626;
          border: 1px solid #fecaca;
        }
        .export-info {
          background: #f8fafc;
          border-radius: 12px;
          padding: 24px;
          border: 1px solid #e2e8f0;
        }
        .export-info h3 {
          margin-top: 0;
          color: #1e293b;
          margin-bottom: 20px;
        }
        .info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
        }
        .info-item {
          text-align: center;
        }
        .info-item h4 {
          margin-bottom: 8px;
          color: #374151;
        }
        .info-item p {
          color: #64748b;
          font-size: 0.9em;
          line-height: 1.4;
        }
      `}</style>
    </div>
  );
};

export default ExportData;