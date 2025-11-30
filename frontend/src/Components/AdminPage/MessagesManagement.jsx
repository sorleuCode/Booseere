import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../api/admin';
import { formatDateTime, formatRelativeTime } from '../../utils/dateUtils';
import { useConfirm } from '../../hooks';
import LoadingSpinner from '../UI/LoadingSpinner';
import ConfirmModal from '../UI/ConfirmModal';
import './MessagesManagement.css';

function MessagesManagement() {
  const [contacts, setContacts] = useState([]);
  const [contactsLoading, setContactsLoading] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);
  const { confirm, confirmState } = useConfirm();

  // Load contact messages
  const loadContacts = async () => {
    try {
      setContactsLoading(true);
      const response = await adminAPI.getContacts();
      if (response.success) {
        setContacts(response.data);
      }
    } catch (error) {
      console.error('Error loading contacts:', error);
    } finally {
      setContactsLoading(false);
    }
  };

  useEffect(() => {
    loadContacts();
  }, []);

  return (
    <>
      {!selectedContact ? (
        <div className="messages-content">
          <div className="messages-header">
            <h2>Contact Messages</h2>
            <button onClick={loadContacts} className="btn-refresh" disabled={contactsLoading}>
              {contactsLoading ? '🔄 Loading...' : '🔄 Refresh'}
            </button>
          </div>

          {contactsLoading ? (
            <LoadingSpinner size="large" text="Loading messages..." />
          ) : contacts.length === 0 ? (
            <div className="empty-state">
              <p>No contact messages yet.</p>
            </div>
          ) : (
            <div className="messages-list">
              {contacts.map(message => (
                <div key={message._id} className="message-card" onClick={() => setSelectedContact(message)}>
                  <div className="message-header">
                    <div className="message-info">
                      <h3>{message.name}</h3>
                      <p className="message-email">{message.email}</p>
                      <p className="message-subject">{message.subject}</p>
                    </div>
                    <div className="message-meta">
                      <span className={`status-pill ${message.status}`}>{message.status}</span>
                      <span className="message-date">{formatRelativeTime(message.createdAt)}</span>
                    </div>
                  </div>
                  <div className="message-preview">
                    <p>{message.message.length > 100 ? message.message.substring(0, 100) + '...' : message.message}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="contact-detail-view">
          <button className="btn-back" onClick={() => setSelectedContact(null)}>← Back to Messages</button>

          <div className="detail-container">
            <div className="contact-header">
              <h2>{selectedContact.subject}</h2>
              <div className="contact-meta">
                <span className={`status-pill ${selectedContact.status}`}>{selectedContact.status}</span>
                <span className="contact-date">{formatDateTime(selectedContact.createdAt)}</span>
              </div>
            </div>

            <div className="contact-info-grid">
              <div className="info-box">
                <span className="info-label">From</span>
                <span className="info-value">{selectedContact.name}</span>
              </div>
              <div className="info-box">
                <span className="info-label">Email</span>
                <span className="info-value">
                  <a href={`mailto:${selectedContact.email}`}>{selectedContact.email}</a>
                </span>
              </div>
              {selectedContact.phone && (
                <div className="info-box">
                  <span className="info-label">Phone</span>
                  <span className="info-value">
                    <a href={`tel:${selectedContact.phone}`}>{selectedContact.phone}</a>
                  </span>
                </div>
              )}
              <div className="info-box">
                <span className="info-label">Subject</span>
                <span className="info-value">{selectedContact.subject}</span>
              </div>
            </div>

            <div className="message-content">
              <h3>Message</h3>
              <div className="message-body">
                <p style={{ whiteSpace: 'pre-wrap' }}>{selectedContact.message}</p>
              </div>
            </div>

            <div className="contact-actions">
              {selectedContact.status === 'new' && (
                <button
                  onClick={async () => {
                    try {
                      await adminAPI.updateContactStatus(selectedContact._id, 'read');
                      setSelectedContact({...selectedContact, status: 'read'});
                      setContacts(contacts.map(c => c._id === selectedContact._id ? {...c, status: 'read'} : c));
                    } catch (error) {
                      console.error('Error updating status:', error);
                    }
                  }}
                  className="btn-mark-read"
                >
                  <span>✓</span>
                  Mark as Read
                </button>
              )}
              {selectedContact.status === 'read' && (
                <button
                  onClick={async () => {
                    try {
                      await adminAPI.updateContactStatus(selectedContact._id, 'replied');
                      setSelectedContact({...selectedContact, status: 'replied'});
                      setContacts(contacts.map(c => c._id === selectedContact._id ? {...c, status: 'replied'} : c));
                    } catch (error) {
                      console.error('Error updating status:', error);
                    }
                  }}
                  className="btn-mark-replied"
                >
                  <span>↩️</span>
                  Mark as Replied
                </button>
              )}
              <button
                onClick={async () => {
                  const confirmed = await confirm({
                    title: 'Delete Message',
                    message: 'Are you sure you want to delete this message? This action cannot be undone.',
                    confirmText: 'Delete',
                    cancelText: 'Cancel',
                    confirmButtonClass: 'btn-danger'
                  });

                  if (confirmed) {
                    try {
                      await adminAPI.deleteContact(selectedContact._id);
                      setContacts(contacts.filter(c => c._id !== selectedContact._id));
                      setSelectedContact(null);
                    } catch (error) {
                      console.error('Error deleting contact:', error);
                    }
                  }
                }}
                className="btn-delete"
              >
                <span>🗑️</span>
                Delete Message
              </button>
            </div>
          </div>
        </div>
      )}

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
    </>
  );
}

export default MessagesManagement;