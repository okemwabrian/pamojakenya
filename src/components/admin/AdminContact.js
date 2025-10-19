import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';

const AdminContact = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('new');
  const [viewMessage, setViewMessage] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [replying, setReplying] = useState(false);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const response = await adminAPI.getContactMessages();
      const messages = Array.isArray(response.data) ? response.data : [];
      setMessages(messages);
    } catch (err) {
      console.error('Error fetching messages:', err);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkRead = async (id) => {
    try {
      await adminAPI.markRead(id);
      setMessages(prev => prev.map(msg => 
        msg.id === id ? { ...msg, status: 'read' } : msg
      ));
    } catch (err) {
      console.error('Error marking message as read:', err);
    }
  };

  const handleReply = async (id, reply) => {
    setReplying(true);
    try {
      await adminAPI.replyToMessage(id, reply);
      setMessages(prev => prev.map(msg => 
        msg.id === id ? { ...msg, status: 'replied', admin_reply: reply } : msg
      ));
      setReplyText('');
      if (viewMessage && viewMessage.id === id) {
        setViewMessage({...viewMessage, status: 'replied', admin_reply: reply});
      }
    } catch (err) {
      console.error('Error replying to message:', err);
      alert('Error sending reply. Please try again.');
    } finally {
      setReplying(false);
    }
  };



  const filteredMessages = messages.filter(msg => 
    filter === 'all' || msg.status === filter
  );

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3>📧 Contact Messages</h3>
        <select 
          className="form-select" 
          value={filter} 
          onChange={(e) => setFilter(e.target.value)}
          style={{width: '200px'}}
        >
          <option value="new">New Messages</option>
          <option value="read">Read Messages</option>
          <option value="replied">Replied Messages</option>
          <option value="all">All Messages</option>
        </select>
      </div>

      {loading ? (
        <div className="text-center py-4">
          <div className="spinner-border" role="status"></div>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover">
            <thead>
              <tr>
                <th>From</th>
                <th>Subject</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredMessages.map(message => (
                <tr key={message.id}>
                  <td>
                    <strong>{message.name}</strong>
                    <small className="d-block text-muted">{message.email}</small>
                    {message.phone && <small className="d-block text-muted">{message.phone}</small>}
                  </td>
                  <td>
                    <strong>{message.subject}</strong>
                    <small className="d-block text-muted">
                      {message.message.substring(0, 50)}...
                    </small>
                  </td>
                  <td>
                    <span className={`badge ${
                      message.status === 'new' ? 'bg-primary' :
                      message.status === 'read' ? 'bg-warning' : 'bg-success'
                    }`}>
                      {message.status.charAt(0).toUpperCase() + message.status.slice(1)}
                    </span>
                  </td>
                  <td>{new Date(message.created_at).toLocaleDateString()}</td>
                  <td>
                    <div className="btn-group btn-group-sm">
                      <button 
                        className="btn btn-outline-primary"
                        onClick={() => setViewMessage(message)}
                        title="View Message"
                      >
                        <i className="bi bi-eye me-1"></i>View
                      </button>
                      {message.status === 'new' && (
                        <button 
                          className="btn btn-outline-warning"
                          onClick={() => handleMarkRead(message.id)}
                          title="Mark as Read"
                        >
                          <i className="bi bi-check me-1"></i>Mark Read
                        </button>
                      )}
                      {(message.status === 'read' || message.status === 'new') && (
                        <button 
                          className="btn btn-outline-success"
                          onClick={() => {
                            setViewMessage(message);
                            setReplyText('');
                          }}
                          title="Reply to Message"
                        >
                          <i className="bi bi-reply me-1"></i>Reply
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* View Message Modal */}
      {viewMessage && (
        <div className="modal show d-block" style={{background: 'rgba(0,0,0,0.5)'}}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5>Message from {viewMessage.name}</h5>
                <button className="btn-close" onClick={() => setViewMessage(null)}></button>
              </div>
              <div className="modal-body">
                <div className="row g-3">
                  <div className="col-md-6">
                    <strong>Name:</strong> {viewMessage.name}
                  </div>
                  <div className="col-md-6">
                    <strong>Email:</strong> {viewMessage.email}
                  </div>
                  {viewMessage.phone && (
                    <div className="col-md-6">
                      <strong>Phone:</strong> {viewMessage.phone}
                    </div>
                  )}
                  <div className="col-md-6">
                    <strong>Status:</strong> 
                    <span className={`badge ms-2 ${
                      viewMessage.status === 'new' ? 'bg-primary' :
                      viewMessage.status === 'read' ? 'bg-warning' : 'bg-success'
                    }`}>
                      {viewMessage.status.charAt(0).toUpperCase() + viewMessage.status.slice(1)}
                    </span>
                  </div>
                  <div className="col-12">
                    <strong>Subject:</strong> {viewMessage.subject}
                  </div>
                  <div className="col-12">
                    <strong>Message:</strong>
                    <div className="mt-2 p-3 bg-light rounded">
                      {viewMessage.message}
                    </div>
                  </div>
                  <div className="col-12">
                    <strong>Date:</strong> {new Date(viewMessage.created_at).toLocaleString()}
                  </div>
                  {viewMessage.admin_reply && (
                    <div className="col-12">
                      <strong>Admin Reply:</strong>
                      <div className="mt-2 p-3 bg-success bg-opacity-10 rounded border-start border-success border-3">
                        {viewMessage.admin_reply}
                      </div>
                      {viewMessage.replied_at && (
                        <small className="text-muted">Replied on: {new Date(viewMessage.replied_at).toLocaleString()}</small>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <div className="modal-footer">
                {viewMessage.status === 'new' && (
                  <button 
                    className="btn btn-warning"
                    onClick={() => {
                      handleMarkRead(viewMessage.id);
                      setViewMessage({...viewMessage, status: 'read'});
                    }}
                  >
                    Mark as Read
                  </button>
                )}
                {(viewMessage.status === 'read' || viewMessage.status === 'new') && !viewMessage.admin_reply && (
                  <div className="d-flex gap-2 flex-grow-1">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Type your reply..."
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && replyText.trim()) {
                          handleReply(viewMessage.id, replyText.trim());
                        }
                      }}
                    />
                    <button 
                      className="btn btn-success"
                      onClick={() => {
                        if (replyText.trim()) {
                          handleReply(viewMessage.id, replyText.trim());
                        }
                      }}
                      disabled={!replyText.trim() || replying}
                    >
                      {replying ? 'Sending...' : 'Send Reply'}
                    </button>
                  </div>
                )}
                <button className="btn btn-secondary" onClick={() => setViewMessage(null)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminContact;