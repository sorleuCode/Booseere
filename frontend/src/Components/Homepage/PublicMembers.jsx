import React, { useState, useEffect } from 'react';
import { memberAPI } from '../../api/members';
import LoadingSpinner from '../UI/LoadingSpinner';

const PublicMembers = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [positionFilter, setPositionFilter] = useState('');

  const loadPublicMembers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await memberAPI.getPublicMembers({
        search: searchTerm,
        position: positionFilter,
      });
      setMembers(response.data || response);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load members');
      console.error('Error loading public members:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPublicMembers();
  }, [searchTerm, positionFilter]);

  const getPositionColor = (position) => {
    const colors = {
      'President': '#dc2626',
      'Vice President': '#ea580c',
      'Secretary': '#2563eb',
      'Treasurer': '#059669',
      'Member': '#6b7280',
    };
    return colors[position] || '#6b7280';
  };

  const filteredMembers = members.filter(member => 
    member.status === 'active' && 
    (member.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
     member.membershipNumber?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="public-members">
      <div className="public-members-header">
        <h2>👥 Our Members</h2>
        <p>Meet the active members of our cooperative society</p>
        
        <div className="search-filters">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search by name or membership number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="position-filter">
            <select
              value={positionFilter}
              onChange={(e) => setPositionFilter(e.target.value)}
            >
              <option value="">All Positions</option>
              <option value="President">President</option>
              <option value="Vice President">Vice President</option>
              <option value="Secretary">Secretary</option>
              <option value="Treasurer">Treasurer</option>
              <option value="Member">Member</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner size="large" text="Loading members..." />
      ) : error ? (
        <div className="error-state">
          <p>❌ {error}</p>
          <button onClick={loadPublicMembers}>Retry</button>
        </div>
      ) : (
        <>
          <div className="members-stats">
            <div className="stat-card">
              <h3>{filteredMembers.length}</h3>
              <p>Active Members</p>
            </div>
            <div className="stat-card">
              <h3>{members.length}</h3>
              <p>Total Members</p>
            </div>
            <div className="stat-card">
              <h3>{members.filter(m => m.position !== 'Member').length}</h3>
              <p>Executive Members</p>
            </div>
          </div>

          <div className="members-grid">
            {filteredMembers.length === 0 ? (
              <div className="no-members">
                <p>No active members found matching your criteria.</p>
              </div>
            ) : (
              filteredMembers.map(member => (
                <div key={member._id} className="member-card">
                  <div className="member-avatar">
                    {member.profileImage ? (
                      <img src={member.profileImage} alt={member.fullName} />
                    ) : (
                      <div className="avatar-placeholder">
                        {member.fullName?.charAt(0)?.toUpperCase() || 'M'}
                      </div>
                    )}
                  </div>
                  
                  <div className="member-info">
                    <h3>{member.fullName}</h3>
                    <p className="member-position">{member.position}</p>
                    <p className="member-number">Member #{member.membershipNumber}</p>
                  </div>

                  <div className="member-role">
                    <span
                      className="position-badge"
                      style={{ backgroundColor: getPositionColor(member.position) }}
                    >
                      {member.position}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}

      <style jsx>{`
        .public-members {
          padding: 40px 20px;
          max-width: 1200px;
          margin: 0 auto;
        }
        .public-members-header {
          text-align: center;
          margin-bottom: 40px;
        }
        .public-members-header h2 {
          font-size: 2.5em;
          color: #1e293b;
          margin-bottom: 10px;
        }
        .public-members-header p {
          font-size: 1.2em;
          color: #64748b;
          margin-bottom: 30px;
        }
        .search-filters {
          display: flex;
          justify-content: center;
          gap: 16px;
          flex-wrap: wrap;
        }
        .search-box input {
          padding: 12px 16px;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          font-size: 1em;
          width: 300px;
        }
        .search-box input:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }
        .position-filter select {
          padding: 12px 16px;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          font-size: 1em;
          background: white;
        }
        .members-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          margin-bottom: 40px;
        }
        .stat-card {
          background: white;
          padding: 24px;
          border-radius: 12px;
          text-align: center;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          border: 1px solid #e2e8f0;
        }
        .stat-card h3 {
          font-size: 2em;
          color: #3b82f6;
          margin: 0 0 8px 0;
        }
        .stat-card p {
          color: #64748b;
          margin: 0;
        }
        .members-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 32px;
          padding: 20px 0;
        }
        .member-card {
          background: white;
          border-radius: 16px;
          padding: 24px;
          box-shadow: 0 4px 6px rgba(0,0,0,0.07);
          border: 1px solid #e2e8f0;
          transition: all 0.3s ease;
          text-align: center;
          position: relative;
          overflow: hidden;
        }
        .member-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 24px rgba(0,0,0,0.15);
          border-color: #3b82f6;
        }
        .member-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(90deg, #3b82f6, #059669);
        }
        .member-avatar {
          margin-bottom: 20px;
          position: relative;
        }
        .member-avatar img {
          width: 100px;
          height: 100px;
          border-radius: 50%;
          object-fit: cover;
          border: 4px solid #f1f5f9;
          box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        }
        .avatar-placeholder {
          width: 100px;
          height: 100px;
          border-radius: 50%;
          background: linear-gradient(135deg, #3b82f6, #059669);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2.5em;
          font-weight: bold;
          margin: 0 auto;
          border: 4px solid #f1f5f9;
          box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        }
        .member-info {
          text-align: center;
          margin-bottom: 16px;
        }
        .member-info h3 {
          margin: 0 0 8px 0;
          color: #1e293b;
          font-size: 1.25em;
          font-weight: 600;
        }
        .member-position {
          color: #059669;
          font-size: 0.95em;
          font-weight: 500;
          margin: 0 0 4px 0;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .member-number {
          color: #6b7280;
          font-size: 0.85em;
          margin: 0;
          font-weight: 500;
        }
        .member-role {
          text-align: center;
          padding-top: 12px;
          border-top: 1px solid #e2e8f0;
        }
        .position-badge {
          display: inline-block;
          padding: 8px 16px;
          border-radius: 20px;
          color: white;
          font-size: 0.875em;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .no-members {
          text-align: center;
          padding: 60px 20px;
          color: #64748b;
          grid-column: 1 / -1;
        }
        .error-state {
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

export default PublicMembers;