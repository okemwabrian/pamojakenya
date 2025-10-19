import React, { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';

const AdminDocuments = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [dateFilter, setDateFilter] = useState('all');

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const response = await adminAPI.getDocuments();
      const documents = Array.isArray(response.data) ? response.data : [];
      setDocuments(documents);
    } catch (err) {
      console.error('Error fetching documents:', err);
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (id, status, notes = '') => {
    try {
      if (status === 'approved') {
        await adminAPI.approveDocument(id);
      } else {
        await adminAPI.rejectDocument(id);
      }
      setDocuments(prev => prev.map(doc => 
        doc.id === id ? { ...doc, status, admin_notes: notes } : doc
      ));
    } catch (err) {
      console.error('Error reviewing document:', err);
    }
  };

  const getDateFilteredDocs = (docs) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    switch (dateFilter) {
      case 'today':
        return docs.filter(doc => new Date(doc.created_at) >= today);
      case 'this_week':
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        return docs.filter(doc => new Date(doc.created_at) >= weekStart);
      case 'last_week':
        const lastWeekStart = new Date(today);
        lastWeekStart.setDate(today.getDate() - today.getDay() - 7);
        const lastWeekEnd = new Date(today);
        lastWeekEnd.setDate(today.getDate() - today.getDay());
        return docs.filter(doc => {
          const docDate = new Date(doc.created_at);
          return docDate >= lastWeekStart && docDate < lastWeekEnd;
        });
      case 'this_month':
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        return docs.filter(doc => new Date(doc.created_at) >= monthStart);
      case 'last_month':
        const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 1);
        return docs.filter(doc => {
          const docDate = new Date(doc.created_at);
          return docDate >= lastMonthStart && docDate < lastMonthEnd;
        });
      default:
        return docs;
    }
  };

  const statusFilteredDocs = documents.filter(doc => 
    filter === 'all' ? true : doc.status === filter
  );
  
  const filteredDocs = getDateFilteredDocs(statusFilteredDocs);

  const getStatusCount = (status) => 
    documents.filter(doc => doc.status === status).length;

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="mb-0">📋 Document Review</h3>
        <select 
          className="form-select" 
          style={{width: 'auto'}}
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
        >
          <option value="all">All Time</option>
          <option value="today">Today</option>
          <option value="this_week">This Week</option>
          <option value="last_week">Last Week</option>
          <option value="this_month">This Month</option>
          <option value="last_month">Last Month</option>
        </select>
      </div>
      
      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button 
            className={`nav-link ${filter === 'pending' ? 'active' : ''}`}
            onClick={() => setFilter('pending')}
          >
            Pending Review ({getStatusCount('pending')})
          </button>
        </li>
        <li className="nav-item">
          <button 
            className={`nav-link ${filter === 'approved' ? 'active' : ''}`}
            onClick={() => setFilter('approved')}
          >
            Approved ({getStatusCount('approved')})
          </button>
        </li>
        <li className="nav-item">
          <button 
            className={`nav-link ${filter === 'rejected' ? 'active' : ''}`}
            onClick={() => setFilter('rejected')}
          >
            Rejected ({getStatusCount('rejected')})
          </button>
        </li>
        <li className="nav-item">
          <button 
            className={`nav-link ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All Documents ({documents.length})
          </button>
        </li>
      </ul>

      {loading ? (
        <div className="text-center py-4">
          <div className="spinner-border" role="status"></div>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover">
            <thead>
              <tr>
                <th>User</th>
                <th>Document</th>
                <th>Type</th>
                <th>Status</th>
                <th>Uploaded</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDocs.map(doc => (
                <tr key={doc.id}>
                  <td>
                    <strong>{doc.user_name || 'Unknown User'}</strong>
                    <small className="d-block text-muted">{doc.user_email}</small>
                  </td>
                  <td>
                    <i className="bi bi-file-earmark me-2"></i>
                    {doc.name}
                    {doc.description && <small className="d-block text-muted">{doc.description}</small>}
                  </td>
                  <td>
                    <span className="badge bg-secondary">{doc.document_type || 'Other'}</span>
                  </td>
                  <td>
                    <span className={`badge ${
                      doc.status === 'approved' ? 'bg-success' :
                      doc.status === 'rejected' ? 'bg-danger' : 'bg-warning'
                    }`}>
                      {doc.status === 'pending' ? 'Pending' :
                       doc.status === 'approved' ? 'Approved' : 'Rejected'}
                    </span>
                    {doc.admin_notes && (
                      <small className="d-block text-muted mt-1">{doc.admin_notes}</small>
                    )}
                  </td>
                  <td>{new Date(doc.created_at).toLocaleDateString()}</td>
                  <td>
                    <div className="btn-group btn-group-sm">
                      <button 
                        className="btn btn-outline-primary"
                        onClick={() => window.open(doc.file_url, '_blank')}
                        title="View Document"
                      >
                        <i className="bi bi-eye me-1"></i>View
                      </button>
                      {doc.status === 'pending' && (
                        <>
                          <button 
                            className="btn btn-outline-success"
                            onClick={() => {
                              if (window.confirm(`✅ Approve document for ${doc.user_name || 'Unknown User'}?\nDocument: ${doc.name}\nType: ${doc.document_type || 'Other'}`)) {
                                handleReview(doc.id, 'approved');
                              }
                            }}
                            title="Approve Document"
                          >
                            <i className="bi bi-check me-1"></i>Approve
                          </button>
                          <button 
                            className="btn btn-outline-danger"
                            onClick={() => {
                              const notes = prompt(`❌ Rejection reason for ${doc.user_name || 'Unknown User'}'s document:\n"${doc.name}"`);
                              if (notes && notes.trim()) {
                                handleReview(doc.id, 'rejected', notes);
                              }
                            }}
                            title="Reject Document"
                          >
                            <i className="bi bi-x me-1"></i>Reject
                          </button>
                        </>
                      )}
                      {doc.status !== 'pending' && (
                        <span className="badge bg-secondary">Processed</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminDocuments;