import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../api/admin';
import LoadingSpinner from '../UI/LoadingSpinner';

const AdminUserManagement = () => {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    fullName: '',
    phone: '',
  });

  // Load admin users (this would need to be implemented in backend)
  const loadAdmins = async () => {
    try {
      setLoading(true);
      setError(null);
      // Note: This endpoint would need to be created in backend
      // For now, we'll create admin users but can't list them yet
      setAdmins([]);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load admin users');
    } finally {
      setLoading(false);
    }
  };

  // Create new admin user
  const createAdmin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const result = await adminAPI.createAdmin(formData);
      if (result.success) {
        setShowModal(false);
        setFormData({
          username: '',
          email: '',
          password: '',
          fullName: '',
          phone: '',
        });
        alert('Admin user created successfully!');
        await loadAdmins();
      } else {
        setError(result.message || 'Failed to create admin user');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create admin user');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdmins();
  }, []);

  return (
    <div className="admin-user-management">
      <div className="admin-header">
        <h2>Admin User Management</h2>
        <button onClick={() => setShowModal(true)} className="btn-add-admin">
          Add New Admin
        </button>
      </div>

      {error && (
        <div className="error-message">
          <p>⚠️ {error}</p>
        </div>
      )}

      <div className="admin-info">
        <div className="info-card">
          <h3>About Admin Management</h3>
          <p>This section allows you to create new admin users for the cooperative management system.</p>
          <ul>
            <li>Admins can access the dashboard and manage all cooperative operations</li>
            <li>Each admin has their own login credentials</li>
            <li>Admin accounts are separate from member accounts</li>
            <li>Admin users can manage members, contributions, and loans</li>
          </ul>
        </div>
      </div>

      <div className="admin-list">
        <h3>Current Admin Users</h3>
        {loading ? (
          <LoadingSpinner text="Loading admin users..." />
        ) : admins.length === 0 ? (
          <div className="empty-state">
            <p>No additional admin users found. Only the main admin account is active.</p>
            <p>Use the "Add New Admin" button to create additional admin accounts.</p>
          </div>
        ) : (
          <div className="admin-grid">
            {admins.map(admin => (
              <div key={admin._id} className="admin-card">
                <div className="admin-info">
                  <h4>{admin.fullName || admin.username}</h4>
                  <p>{admin.email}</p>
                  <p>{admin.phone || 'No phone'}</p>
                  <span className="status-pill active">Active</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Admin Modal */}
      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Create New Admin User</h3>
            <form onSubmit={createAdmin}>
              <div className="form-group">
                <label>Username *</label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({...formData, username: e.target.value})}
                  required
                  placeholder="Enter username"
                />
              </div>

              <div className="form-group">
                <label>Email Address *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                  placeholder="Enter email address"
                />
              </div>

              <div className="form-group">
                <label>Password *</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  required
                  minLength="6"
                  placeholder="Enter password (min 6 characters)"
                />
              </div>

              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                  placeholder="Enter full name"
                />
              </div>

              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  placeholder="Enter phone number"
                />
              </div>

              <div className="modal-buttons">
                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? 'Creating...' : 'Create Admin'}
                </button>
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        .admin-user-management {
          padding: 20px;
        }
        .admin-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
        }
        .btn-add-admin {
          background: #10b981;
          color: white;
          padding: 10px 20px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
        }
        .btn-add-admin:hover {
          background: #059669;
        }
        .admin-info {
          margin-bottom: 30px;
        }
        .info-card {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 20px;
        }
        .info-card h3 {
          margin-top: 0;
          color: #334155;
        }
        .info-card ul {
          color: #64748b;
          line-height: 1.6;
        }
        .admin-list {
          background: white;
          border-radius: 8px;
          padding: 20px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .admin-list h3 {
          margin-top: 0;
        }
        .empty-state {
          text-align: center;
          padding: 40px;
          color: #64748b;
        }
        .admin-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 20px;
        }
        .admin-card {
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 20px;
          background: white;
        }
        .admin-card h4 {
          margin: 0 0 10px 0;
          color: #1e293b;
        }
        .admin-card p {
          margin: 5px 0;
          color: #64748b;
        }
        .status-pill {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 0.875em;
          font-weight: 500;
          margin-top: 10px;
        }
        .status-pill.active {
          background: #dcfce7;
          color: #166534;
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
          border-radius: 12px;
          max-width: 500px;
          width: 90%;
          max-height: 80vh;
          overflow-y: auto;
        }
        .modal-content h3 {
          margin-top: 0;
          color: #1e293b;
        }
        .form-group {
          margin-bottom: 20px;
        }
        .form-group label {
          display: block;
          margin-bottom: 8px;
          font-weight: 500;
          color: #374151;
        }
        .form-group input {
          width: 100%;
          padding: 12px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 1em;
        }
        .form-group input:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }
        .modal-buttons {
          display: flex;
          gap: 12px;
          margin-top: 24px;
        }
        .btn-primary {
          background: #3b82f6;
          color: white;
          padding: 12px 24px;
          border: none;
          border-radius: 6px;
          font-weight: 500;
          cursor: pointer;
        }
        .btn-primary:hover:not(:disabled) {
          background: #2563eb;
        }
        .btn-primary:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .btn-secondary {
          background: #6b7280;
          color: white;
          padding: 12px 24px;
          border: none;
          border-radius: 6px;
          font-weight: 500;
          cursor: pointer;
        }
        .btn-secondary:hover {
          background: #4b5563;
        }
        .error-message {
          background: #fef2f2;
          border: 1px solid #fecaca;
          color: #dc2626;
          padding: 12px 16px;
          border-radius: 6px;
          margin-bottom: 20px;
        }
      `}</style>
    </div>
  );
};

export default AdminUserManagement;