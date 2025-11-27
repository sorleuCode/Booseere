import React, { createContext, useState, useEffect, useContext } from 'react';
import { getMembers, addMember, updateMember, deleteMember } from '../api/members';
import { useAuth } from './AuthContext'; // make sure you import useAuth

// Create the Members Context
const MembersContext = createContext();

// Custom hook to use the Members Context
export const useMembers = () => {
  const context = useContext(MembersContext);
  if (!context) {
    throw new Error('useMembers must be used within a MembersProvider');
  }
  return context;
};

// Members Provider Component
export const MembersProvider = ({ children }) => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { isAuthenticated } = useAuth();

  // Load members **only if authenticated**
  useEffect(() => {
    if (isAuthenticated) {
      loadMembers();
    } else {
      setMembers([]); // clear members if logged out
    }
  }, [isAuthenticated]);

  const loadMembers = async () => {
    try {
      setLoading(true);
      setError(null);
      const membersData = await getMembers(); // API call
      setMembers(membersData.data);
    } catch (err) {
      setError(err.message || 'Failed to load members');
      console.error('Error loading members:', err);
      setMembers([]); // clear members on error
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = async (memberData) => {
    if (!isAuthenticated) return null; // safety check
    try {
      const newMember = await addMember(memberData);
      setMembers(prev => [...prev, newMember]);
      return newMember;
    } catch (err) {
      setError(err.message || 'Failed to add member');
      throw err;
    }
  };

  const handleUpdateMember = async (id, memberData) => {
    if (!isAuthenticated) return null;
    try {
      const updatedMember = await updateMember(id, memberData);
      setMembers(prev => prev.map(member => (member._id || member.id) === id ? updatedMember : member));
      return updatedMember;
    } catch (err) {
      setError(err.message || 'Failed to update member');
      throw err;
    }
  };

  const handleDeleteMember = async (id) => {
    if (!isAuthenticated) return;
    try {
      await deleteMember(id);
      setMembers(prev => prev.filter(member => (member._id || member.id) !== id));
    } catch (err) {
      setError(err.message || 'Failed to delete member');
      throw err;
    }
  };

  const refreshMembers = () => {
    if (isAuthenticated) loadMembers();
  };

  const clearError = () => setError(null);

  const value = {
    members,
    loading,
    error,
    loadMembers,
    handleAddMember,
    handleUpdateMember,
    handleDeleteMember,
    refreshMembers,
    clearError,
  };

  return (
    <MembersContext.Provider value={value}>
      {children}
    </MembersContext.Provider>
  );
};
