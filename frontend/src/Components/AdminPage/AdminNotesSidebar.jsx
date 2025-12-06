import React, { useState } from 'react';
import { useDashboard } from '../../context/DashboardContext';
import { useConfirm } from '../../hooks';
import { formatDate, formatRelativeTime } from '../../utils/dateUtils';
import './AdminNotesSidebar.css';

function AdminNotesSidebar({ isExpanded, onToggle }) {
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
    <>
      <div className="sidebar-notes-header">
        <button className="notes-toggle-btn" onClick={onToggle}>
          <span className="item-icon">📝</span>
          <span>Admin Notes</span>
          <span className="notes-count">({noteHistory?.length || 0})</span>
          <span className="toggle-icon">{isExpanded ? '▼' : '▶'}</span>
        </button>
      </div>

      {isExpanded && (
        <div className="sidebar-notes-content">
          {/* Add New Note */}
          <div className="sidebar-add-note">
            <textarea
              className="sidebar-note-input"
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Quick note..."
              rows="2"
            />
            <button
              className="sidebar-btn-add"
              onClick={handleAddNote}
              disabled={noteLoading || !newNote.trim()}
            >
              {noteLoading ? '...' : '+'}
            </button>
          </div>

          {/* Search and Sort Controls */}
          <div className="sidebar-notes-controls">
            <input
              type="text"
              className="sidebar-search-input"
              placeholder="Search notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <select
              className="sidebar-sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="alphabetical">A-Z</option>
            </select>
          </div>

          {/* Notes List */}
          <div className="sidebar-notes-list">
            {dashboardLoading.notes ? (
              <p className="sidebar-loading">Loading...</p>
            ) : filteredAndSortedNotes && filteredAndSortedNotes.length > 0 ? (
              filteredAndSortedNotes.slice(0, 5).map((note) => (
                <div key={note.id} className="sidebar-note-item">
                  {editingNote === note.id ? (
                    <div className="sidebar-edit-section">
                      <textarea
                        className="sidebar-edit-input"
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        rows="2"
                      />
                      <div className="sidebar-edit-actions">
                        <button
                          className="sidebar-btn-save"
                          onClick={handleSaveEdit}
                          disabled={noteLoading}
                        >
                          ✓
                        </button>
                        <button
                          className="sidebar-btn-cancel"
                          onClick={handleCancelEdit}
                          disabled={noteLoading}
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="sidebar-note-text">{note.content}</p>
                      <div className="sidebar-note-meta">
                        <span>{formatRelativeTime(note.createdAt)}</span>
                        <div className="sidebar-note-actions">
                          <button
                            className="sidebar-btn-edit"
                            onClick={() => handleEditNote(note)}
                            title="Edit"
                          >
                            ✏
                          </button>
                          <button
                            className="sidebar-btn-delete"
                            onClick={async () => {
                              const confirmed = await confirm({
                                title: 'Delete Note',
                                message: 'Delete this note?',
                                confirmText: 'Delete',
                                cancelText: 'Cancel',
                                confirmButtonClass: 'btn-danger'
                              });

                              if (confirmed) {
                                await deleteNote(note.id);
                              }
                            }}
                            title="Delete"
                          >
                            🗑
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ))
            ) : (
              <p className="sidebar-no-notes">No notes yet</p>
            )}
          </div>

          {filteredAndSortedNotes && filteredAndSortedNotes.length > 5 && (
            <div className="sidebar-notes-footer">
              <span className="more-notes">+{filteredAndSortedNotes.length - 5} more notes</span>
            </div>
          )}
        </div>
      )}


    </>
  );
}

export default AdminNotesSidebar;