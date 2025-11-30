import React, { useState } from 'react';
import { useDashboard } from '../../context/DashboardContext';
import { useConfirm } from '../../hooks';
import { formatDate, formatRelativeTime } from '../../utils/dateUtils';

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

      <style jsx>{`
        .sidebar-notes-header {
          border-top: 1px solid #e2e8f0;
          margin-top: 10px;
          padding-top: 10px;
        }

        .notes-toggle-btn {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 16px;
          background: none;
          border: none;
          color: #64748b;
          cursor: pointer;
          border-radius: 6px;
          transition: all 0.2s ease;
          font-size: 14px;
        }

        .notes-toggle-btn:hover {
          background: #f8fafc;
          color: #334155;
        }

        .notes-count {
          margin-left: auto;
          font-size: 12px;
          background: #e2e8f0;
          padding: 2px 6px;
          border-radius: 10px;
          color: #64748b;
        }

        .toggle-icon {
          font-size: 12px;
          transition: transform 0.2s ease;
        }

        .sidebar-notes-content {
          padding: 0 16px 16px 16px;
          animation: slideDown 0.2s ease;
        }

        @keyframes slideDown {
          from { opacity: 0; max-height: 0; }
          to { opacity: 1; max-height: 500px; }
        }

        .sidebar-add-note {
          display: flex;
          gap: 8px;
          margin-bottom: 12px;
        }

        .sidebar-note-input {
          flex: 1;
          padding: 8px;
          border: 1px solid #d1d5db;
          border-radius: 4px;
          font-size: 12px;
          resize: none;
          font-family: inherit;
        }

        .sidebar-note-input:focus {
          outline: none;
          border-color: #4f9cf9;
        }

        .sidebar-btn-add {
          padding: 8px 12px;
          background: #4f9cf9;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 600;
          transition: background 0.2s ease;
        }

        .sidebar-btn-add:hover:not(:disabled) {
          background: #3b82f6;
        }

        .sidebar-btn-add:disabled {
          background: #d1d5db;
          cursor: not-allowed;
        }

        .sidebar-notes-controls {
          display: flex;
          gap: 6px;
          margin-bottom: 10px;
        }

        .sidebar-search-input {
          flex: 1;
          padding: 6px 8px;
          border: 1px solid #d1d5db;
          border-radius: 4px;
          font-size: 11px;
          font-family: inherit;
        }

        .sidebar-search-input:focus {
          outline: none;
          border-color: #4f9cf9;
        }

        .sidebar-sort-select {
          padding: 6px 8px;
          border: 1px solid #d1d5db;
          border-radius: 4px;
          font-size: 11px;
          background: white;
          font-family: inherit;
        }

        .sidebar-notes-list {
          max-height: 300px;
          overflow-y: auto;
        }

        .sidebar-note-item {
          padding: 10px;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          margin-bottom: 8px;
          background: #fafbfc;
        }

        .sidebar-note-text {
          margin: 0 0 6px 0;
          font-size: 13px;
          line-height: 1.4;
          color: #334155;
        }

        .sidebar-note-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 11px;
          color: #64748b;
        }

        .sidebar-note-actions {
          display: flex;
          gap: 4px;
        }

        .sidebar-btn-edit,
        .sidebar-btn-delete {
          padding: 2px 6px;
          border: none;
          background: none;
          cursor: pointer;
          border-radius: 3px;
          font-size: 12px;
          transition: background 0.2s ease;
        }

        .sidebar-btn-edit:hover {
          background: #e2e8f0;
        }

        .sidebar-btn-delete:hover {
          background: #fecaca;
          color: #dc2626;
        }

        .sidebar-edit-section {
          width: 100%;
        }

        .sidebar-edit-input {
          width: 100%;
          padding: 6px;
          border: 1px solid #d1d5db;
          border-radius: 4px;
          font-size: 12px;
          resize: none;
          font-family: inherit;
          margin-bottom: 6px;
        }

        .sidebar-edit-actions {
          display: flex;
          gap: 4px;
          justify-content: flex-end;
        }

        .sidebar-btn-save,
        .sidebar-btn-cancel {
          padding: 4px 8px;
          border: none;
          border-radius: 3px;
          cursor: pointer;
          font-size: 12px;
          font-weight: 600;
          transition: background 0.2s ease;
        }

        .sidebar-btn-save {
          background: #10b981;
          color: white;
        }

        .sidebar-btn-save:hover:not(:disabled) {
          background: #059669;
        }

        .sidebar-btn-cancel {
          background: #6b7280;
          color: white;
        }

        .sidebar-btn-cancel:hover:not(:disabled) {
          background: #4b5563;
        }

        .sidebar-loading,
        .sidebar-no-notes {
          text-align: center;
          color: #64748b;
          font-size: 12px;
          padding: 20px;
          margin: 0;
        }

        .sidebar-notes-footer {
          text-align: center;
          padding: 8px 0;
          border-top: 1px solid #e2e8f0;
          margin-top: 8px;
        }

        .more-notes {
          font-size: 11px;
          color: #64748b;
          background: #f1f5f9;
          padding: 4px 8px;
          border-radius: 12px;
        }
      `}</style>
    </>
  );
}

export default AdminNotesSidebar;