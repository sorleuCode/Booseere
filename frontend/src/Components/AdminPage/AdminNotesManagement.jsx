import React, { useState } from 'react';
import { useDashboard } from '../../context/DashboardContext';
import { useConfirm } from '../../hooks';
import { formatDate, formatRelativeTime } from '../../utils/dateUtils';
import ConfirmModal from '../UI/ConfirmModal';
import './AdminNotesManagement.css';

function AdminNotesManagement() {
  const { notes: noteHistory, loading: dashboardLoading, deleteNote, addNote, updateNote } = useDashboard();
  const { confirm, confirmState } = useConfirm();
  const [newNote, setNewNote] = useState("");
  const [noteLoading, setNoteLoading] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [editContent, setEditContent] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  const handleAddNote = async () => {
    if (newNote.trim() === '') return;

    setNoteLoading(true);
    try {
      const result = await addNote(newNote);
      if (result.success) {
        setNewNote('');
      }
    } catch (error) {
      console.error('Error adding note:', error);
    } finally {
      setNoteLoading(false);
    }
  };

  const handleEditNote = (note) => {
    setEditingNote(note.id);
    setEditContent(note.content);
  };

  const handleSaveEdit = async () => {
    if (editContent.trim() === '') return;

    setNoteLoading(true);
    try {
      const result = await updateNote(editingNote, editContent);
      if (result.success) {
        setEditingNote(null);
        setEditContent('');
      }
    } catch (error) {
      console.error('Error updating note:', error);
    } finally {
      setNoteLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingNote(null);
    setEditContent('');
  };

  // Filter and sort notes
  const filteredAndSortedNotes = React.useMemo(() => {
    if (!noteHistory) return [];

    let filtered = noteHistory.filter(note =>
      note.content.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Sort notes
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'oldest':
          return new Date(a.createdAt) - new Date(b.createdAt);
        case 'alphabetical':
          return a.content.localeCompare(b.content);
        default:
          return 0;
      }
    });

    return filtered;
  }, [noteHistory, searchTerm, sortBy]);

  return (
    <div className="admin-notes-management">
      <div className="notes-header">
        <h2>📝 Admin Notes</h2>
        <div className="notes-stats">
          <span className="stat-item">
            Total Notes: <strong>{noteHistory?.length || 0}</strong>
          </span>
        </div>
      </div>

      {/* Add New Note Section */}
      <div className="add-note-section">
        <h3>Add New Note</h3>
        <div className="add-note-form">
          <textarea
            className="note-input"
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="Enter your note here..."
            rows="4"
          />
          <button
            className="btn-add-note"
            onClick={handleAddNote}
            disabled={noteLoading || !newNote.trim()}
          >
            {noteLoading ? 'Adding...' : 'Add Note'}
          </button>
        </div>
      </div>

      {/* Search and Sort Controls */}
      <div className="notes-controls">
        <div className="search-box">
          <input
            type="text"
            className="search-input"
            placeholder="Search notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="sort-controls">
          <select
            className="sort-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="alphabetical">A-Z</option>
          </select>
        </div>
      </div>

      {/* Notes List */}
      <div className="notes-content">
        {dashboardLoading.notes ? (
          <div className="loading-state">
            <p>Loading notes...</p>
          </div>
        ) : filteredAndSortedNotes && filteredAndSortedNotes.length > 0 ? (
          <div className="notes-grid">
            {filteredAndSortedNotes.map((note) => (
              <div key={note.id} className="note-card">
                {editingNote === note.id ? (
                  <div className="edit-section">
                    <textarea
                      className="edit-input"
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      rows="3"
                    />
                    <div className="edit-actions">
                      <button
                        className="btn-save"
                        onClick={handleSaveEdit}
                        disabled={noteLoading}
                      >
                        ✓ Save
                      </button>
                      <button
                        className="btn-cancel"
                        onClick={handleCancelEdit}
                        disabled={noteLoading}
                      >
                        ✕ Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="note-content">
                      <p>{note.content}</p>
                    </div>
                    <div className="note-meta">
                      <span className="note-date">
                        {formatRelativeTime(note.createdAt)}
                      </span>
                      <div className="note-actions">
                        <button
                          className="btn-edit"
                          onClick={() => handleEditNote(note)}
                          title="Edit Note"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          className="btn-delete"
                          onClick={async () => {
                            const confirmed = await confirm({
                              title: 'Delete Note',
                              message: 'Are you sure you want to delete this note?',
                              confirmText: 'Delete',
                              cancelText: 'Cancel',
                              confirmButtonClass: 'btn-danger'
                            });

                            if (confirmed) {
                              await deleteNote(note.id);
                            }
                          }}
                          title="Delete Note"
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <p>📝 No notes yet. Add your first note above!</p>
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

export default AdminNotesManagement;