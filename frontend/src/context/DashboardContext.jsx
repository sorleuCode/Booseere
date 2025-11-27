import React, { createContext, useState, useEffect, useContext } from 'react';
import { adminAPI } from '../api/admin';

// Create the Dashboard Context
const DashboardContext = createContext();

// Custom hook to use the Dashboard Context
export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
};

// Dashboard Provider Component
export const DashboardProvider = ({ children }) => {
  const [stats, setStats] = useState(null);
  const [activities, setActivities] = useState(null);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState({
    stats: false,
    activities: false,
    notes: false,
  });
  const [error, setError] = useState(null);

  // Load dashboard statistics
  const loadStats = async () => {
    try {
      setLoading(prev => ({ ...prev, stats: true }));
      setError(null);
      const response = await adminAPI.getDashboard();
      if (response.success) {
        setStats(response.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load dashboard statistics');
      console.error('Error loading dashboard stats:', err);
    } finally {
      setLoading(prev => ({ ...prev, stats: false }));
    }
  };

  // Load recent activities
  const loadActivities = async () => {
    try {
      setLoading(prev => ({ ...prev, activities: true }));
      const response = await adminAPI.getActivities();
      if (response.success) {
        setActivities(response.data);
      }
    } catch (err) {
      console.error('Error loading activities:', err);
    } finally {
      setLoading(prev => ({ ...prev, activities: false }));
    }
  };

  // Load admin notes
  const loadNotes = async () => {
    try {
      setLoading(prev => ({ ...prev, notes: true }));
      const response = await adminAPI.getNotes();
      if (response.success) {
        setNotes(response.data);
      }
    } catch (err) {
      console.error('Error loading notes:', err);
    } finally {
      setLoading(prev => ({ ...prev, notes: false }));
    }
  };

  // Add new note
  const addNote = async (content) => {
    try {
      const response = await adminAPI.addNote(content);
      if (response.success) {
        setNotes(prev => [response.data, ...prev]);
        return { success: true };
      }
      return { success: false, message: response.message };
    } catch (err) {
      console.error('Error adding note:', err);
      return { success: false, message: err.response?.data?.message || 'Failed to add note' };
    }
  };

  // Update note
  const updateNote = async (noteId, content) => {
    try {
      const response = await adminAPI.updateNote(noteId, content);
      if (response.success) {
        setNotes(prev => prev.map(note =>
          note.id === noteId ? response.data : note
        ));
        return { success: true };
      }
      return { success: false, message: response.message };
    } catch (err) {
      console.error('Error updating note:', err);
      return { success: false, message: err.response?.data?.message || 'Failed to update note' };
    }
  };

  // Delete note
  const deleteNote = async (noteId) => {
    try {
      const response = await adminAPI.deleteNote(noteId);
      if (response.success) {
        setNotes(prev => prev.filter(note => note.id !== noteId));
        return { success: true };
      }
      return { success: false, message: response.message };
    } catch (err) {
      console.error('Error deleting note:', err);
      return { success: false, message: err.response?.data?.message || 'Failed to delete note' };
    }
  };

  // Refresh all dashboard data
  const refreshDashboard = async () => {
    await Promise.all([
      loadStats(),
      loadActivities(),
      loadNotes(),
    ]);
  };

  // Get financial report
  const getFinancialReport = async (startDate, endDate) => {
    try {
      const response = await adminAPI.getFinancialReport(startDate, endDate);
      return response;
    } catch (err) {
      console.error('Error getting financial report:', err);
      return { success: false, message: err.response?.data?.message || 'Failed to get report' };
    }
  };

  // Export data
  const exportData = async (type) => {
    try {
      const response = await adminAPI.exportData(type);
      return response;
    } catch (err) {
      console.error('Error exporting data:', err);
      return { success: false, message: 'Failed to export data' };
    }
  };

  // Initialize dashboard data
  useEffect(() => {
    loadStats();
    loadActivities();
    loadNotes();
  }, []);

  const value = {
    stats,
    activities,
    notes,
    loading,
    error,
    loadStats,
    loadActivities,
    loadNotes,
    addNote,
    updateNote,
    deleteNote,
    refreshDashboard,
    getFinancialReport,
    exportData,
  };

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
};