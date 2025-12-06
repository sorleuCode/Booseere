// pages/FullAdminDashboard.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useMembers } from '../../context/MembersContext';
import DashboardOverview from './DashboardOverview';
import MembersManagement from './MembersManagement';
import MessagesManagement from './MessagesManagement';
import AdminNotesManagement from './AdminNotesManagement';
import './Admindash.css';

function FullAdminDashboard() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { members } = useMembers();
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedMember, setSelectedMember] = useState(null);


  // Save members to localStorage for homepage
  useEffect(() => {
    localStorage.setItem('cooperativeMembers', JSON.stringify(members));
  }, [members]);

  // Handle logout with navigation
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="full-admin-dashboard">
      
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="sidebar-brand">
          <div className="brand-icon">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2"/>
              <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2"/>
              <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2"/>
            </svg>
          </div>
          <div>
            <h3>Booseere Multipurpose</h3>
            <p>Admin Panel</p>
          </div>
        </div>
<nav className="sidebar-menu">
  <button className={`menu-item ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => { setActiveTab('overview'); setSelectedMember(null); }}>
    <span className="item-icon">📊</span>
    <span>Overview</span>
  </button>
  <button className={`menu-item ${activeTab === 'members' ? 'active' : ''}`} onClick={() => { setActiveTab('members'); setSelectedMember(null); }}>
    <span className="item-icon">👥</span>
    <span>Members</span>
  </button>

  <button className="menu-item" onClick={() => navigate('/contributions')}>
    <span className="item-icon">💰</span>
    <span>Contributions</span>
  </button>
  <button className="menu-item" onClick={() => navigate('/loans')}>
    <span className="item-icon">📋</span>
    <span>Loans</span>
  </button>
  <button className={`menu-item ${activeTab === 'messages' ? 'active' : ''}`} onClick={() => { setActiveTab('messages'); setSelectedMember(null); }}>
    <span className="item-icon">📬</span>
    <span>Messages</span>
  </button>
  <button className={`menu-item ${activeTab === 'admin-notes' ? 'active' : ''}`} onClick={() => { setActiveTab('admin-notes'); setSelectedMember(null); }}>
    <span className="item-icon">📝</span>
    <span>Admin Notes</span>
  </button>

  <button className="menu-item logout" onClick={handleLogout}>
    <span className="item-icon">🚪</span>
    <span>Logout</span>
  </button>
</nav>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        
        {/* Top Bar */}
        <header className="top-bar">
          <h1>
            {activeTab === 'overview' ? 'Dashboard Overview' :
             activeTab === 'members' ? 'Members Management' :
             activeTab === 'messages' ? 'Contact Messages' :
             activeTab === 'admin-notes' ? 'Admin Notes Management' : 'Settings'}
          </h1>
          <div className="top-actions">
            <span className="admin-user">Admin</span>
          </div>
        </header>

        {/* Render appropriate component based on active tab */}
        {activeTab === 'overview' && <DashboardOverview />}
        {activeTab === 'members' && <MembersManagement selectedMember={selectedMember} setSelectedMember={setSelectedMember} />}
        {activeTab === 'messages' && <MessagesManagement />}
        {activeTab === 'admin-notes' && <AdminNotesManagement />}

      </main>


    </div>
  );
}

export default FullAdminDashboard;
