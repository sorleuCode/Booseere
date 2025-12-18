import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

const ProfileManagement = () => {
  const { user, updateUser, changePassword, refreshUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const [editForm, setEditForm] = useState({
    username: user?.username || '',
    email: user?.email || '',
    fullName: user?.fullName || '',
    phone: user?.phone || '',
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const result = await updateUser(editForm);
      if (result.success) {
        setMessage('Profile updated successfully!');
        setIsEditing(false);
      } else {
        toast.error(result.message);
      }
    } catch (err) {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New passwords do not match');
      setLoading(false);
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      setLoading(false);
      return;
    }

    try {
      const result = await changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      if (result.success) {
        setMessage('Password changed successfully!');
        setIsChangingPassword(false);
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
      } else {
        toast.error(result.message);
      }
    } catch (err) {
      toast.error('Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setLoading(true);
    try {
      const result = await refreshUser();
      if (result.success) {
        setMessage('Profile refreshed from server!');
        setEditForm({
          username: user?.username || '',
          email: user?.email || '',
          fullName: user?.fullName || '',
          phone: user?.phone || '',
        });
      }
    } catch (err) {
      toast.error('Failed to refresh profile');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="profile-management">
        <div className="loading-state">
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-management">
      <div className="profile-header">
        <h2>Profile Management</h2>
        <button onClick={handleRefresh} className="btn-refresh" disabled={loading}>
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
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

      <div className="profile-content">
        <div className="profile-card">
          <div className="profile-info">
            <div className="avatar-section">
              <div className="avatar">
                {user.fullName?.charAt(0)?.toUpperCase() || user.username?.charAt(0)?.toUpperCase()}
              </div>
              <div className="user-details">
                <h3>{user.fullName || user.username}</h3>
                <p className="role">{user.role}</p>
              </div>
            </div>

            {!isEditing ? (
              <div className="profile-details">
                <div className="detail-row">
                  <span className="label">Username:</span>
                  <span className="value">{user.username}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Email:</span>
                  <span className="value">{user.email}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Full Name:</span>
                  <span className="value">{user.fullName || 'Not set'}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Phone:</span>
                  <span className="value">{user.phone || 'Not set'}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Account Status:</span>
                  <span className="value">
                    <span className={`status-pill ${user.isActive ? 'active' : 'inactive'}`}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </span>
                </div>
              </div>
            ) : (
              <form onSubmit={handleProfileUpdate} className="edit-form">
                <div className="form-group">
                  <label>Username:</label>
                  <input
                    type="text"
                    value={editForm.username}
                    onChange={(e) => setEditForm({...editForm, username: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Email:</label>
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Full Name:</label>
                  <input
                    type="text"
                    value={editForm.fullName}
                    onChange={(e) => setEditForm({...editForm, fullName: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Phone:</label>
                  <input
                    type="tel"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                  />
                </div>
                <div className="form-actions">
                  <button type="submit" className="btn-save" disabled={loading}>
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button 
                    type="button" 
                    onClick={() => {
                      setIsEditing(false);
                      setEditForm({
                        username: user?.username || '',
                        email: user?.email || '',
                        fullName: user?.fullName || '',
                        phone: user?.phone || '',
                      });
                    }}
                    className="btn-cancel"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            <div className="profile-actions">
              {!isEditing && (
                <button 
                  onClick={() => setIsEditing(true)}
                  className="btn-edit"
                >
                  Edit Profile
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="password-card">
          <h3>Change Password</h3>
          
          {!isChangingPassword ? (
            <div className="password-info">
              <p>For security reasons, you can change your password regularly.</p>
              <button 
                onClick={() => setIsChangingPassword(true)}
                className="btn-change-password"
              >
                Change Password
              </button>
            </div>
          ) : (
            <form onSubmit={handlePasswordChange} className="password-form">
              <div className="form-group">
                <label>Current Password:</label>
                <input
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({
                    ...passwordForm, 
                    currentPassword: e.target.value
                  })}
                  required
                />
              </div>
              <div className="form-group">
                <label>New Password:</label>
                <input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({
                    ...passwordForm, 
                    newPassword: e.target.value
                  })}
                  required
                  minLength="6"
                />
              </div>
              <div className="form-group">
                <label>Confirm New Password:</label>
                <input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({
                    ...passwordForm, 
                    confirmPassword: e.target.value
                  })}
                  required
                  minLength="6"
                />
              </div>
              <div className="form-actions">
                <button type="submit" className="btn-save" disabled={loading}>
                  {loading ? 'Changing...' : 'Change Password'}
                </button>
                <button 
                  type="button" 
                  onClick={() => {
                    setIsChangingPassword(false);
                    setPasswordForm({
                      currentPassword: '',
                      newPassword: '',
                      confirmPassword: '',
                    });
                  }}
                  className="btn-cancel"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      <style jsx>{`
        .profile-management {
          padding: 20px;
          max-width: 800px;
          margin: 0 auto;
          overflow-y: auto;
        }
        .profile-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
        }
        .profile-content {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 30px;
        }
        .profile-card, .password-card {
          background: white;
          border-radius: 12px;
          padding: 30px;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        .avatar-section {
          display: flex;
          align-items: center;
          margin-bottom: 30px;
        }
        .avatar {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: #3b82f6;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2em;
          font-weight: bold;
          margin-right: 20px;
        }
        .user-details h3 {
          margin: 0 0 5px 0;
          font-size: 1.5em;
        }
        .role {
          margin: 0;
          color: #6b7280;
          font-size: 0.9em;
        }
        .detail-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 0;
          border-bottom: 1px solid #f3f4f6;
        }
        .detail-row:last-child {
          border-bottom: none;
        }
        .label {
          font-weight: 600;
          color: #374151;
        }
        .value {
          color: #6b7280;
        }
        .status-pill {
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 0.875em;
          font-weight: 500;
        }
        .status-pill.active {
          background: #10b981;
          color: white;
        }
        .status-pill.inactive {
          background: #ef4444;
          color: white;
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
        .form-actions {
          display: flex;
          gap: 12px;
          margin-top: 24px;
        }
        .profile-actions {
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #f3f4f6;
        }
        button {
          padding: 12px 24px;
          border: none;
          border-radius: 6px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-refresh {
          background: #3b82f6;
          color: white;
        }
        .btn-edit {
          background: #3b82f6;
          color: white;
        }
        .btn-change-password {
          background: #8b5cf6;
          color: white;
        }
        .btn-save {
          background: #10b981;
          color: white;
        }
        .btn-cancel {
          background: #6b7280;
          color: white;
        }
        button:hover {
          transform: translateY(-1px);
        }
        button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }
        .success-message, .error-message {
          padding: 12px 20px;
          border-radius: 6px;
          margin-bottom: 20px;
        }
        .success-message {
          background: #10b981;
          color: white;
        }
        .error-message {
          background: #ef4444;
          color: white;
        }
        .loading-state {
          text-align: center;
          padding: 40px;
        }
        @media (max-width: 768px) {
          .profile-content {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default ProfileManagement;