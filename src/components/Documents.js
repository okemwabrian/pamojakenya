import React, { useState, useEffect } from 'react';
import { documentsAPI } from '../services/api';

const Documents = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const response = await documentsAPI.getDocuments();
      const documents = Array.isArray(response.data) ? response.data : [];
      setDocuments(documents);
    } catch (err) {
      console.error('Error fetching documents:', err);
      setDocuments([]);
      setMessage('Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('name', file.name);
    formData.append('document_type', document.getElementById('docType').value);
    formData.append('description', document.getElementById('docDesc').value);

    setUploading(true);
    try {
      await documentsAPI.uploadDocument(formData);
      setMessage('Document uploaded successfully and sent for admin review!');
      fetchDocuments();
      e.target.value = '';
      document.getElementById('docType').value = '';
      document.getElementById('docDesc').value = '';
    } catch (err) {
      console.error('Error uploading document:', err);
      setMessage('Failed to upload document');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this document?')) return;
    
    try {
      await documentsAPI.deleteDocument(id);
      setMessage('Document deleted successfully!');
      fetchDocuments();
    } catch (err) {
      console.error('Error deleting document:', err);
      setMessage('Failed to delete document');
    }
  };

  const handleDownload = async (id, filename) => {
    try {
      const response = await documentsAPI.downloadDocument(id);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Error downloading document:', err);
      setMessage('Failed to download document');
    }
  };



  return (
    <div className="container py-5">
      <h2 className="text-center mb-4">📁 My Documents</h2>
      
      {message && (
        <div className={`alert ${message.includes('success') ? 'alert-success' : 'alert-danger'}`}>
          {message}
        </div>
      )}

      {/* Upload Section */}
      <div className="card mb-4">
        <div className="card-body">
          <h5 className="card-title">Upload Document</h5>
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label">Document Type</label>
              <select className="form-select" id="docType" required>
                <option value="">Select type...</option>
                <option value="membership">Membership Application</option>
                <option value="claim">Claim Document</option>
                <option value="payment">Payment Proof</option>
                <option value="identity">ID Document</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="col-md-6">
              <label className="form-label">Description</label>
              <input type="text" className="form-control" id="docDesc" placeholder="Brief description" />
            </div>
            <div className="col-12">
              <label className="form-label">Choose File</label>
              <input
                type="file"
                className="form-control"
                onChange={handleFileUpload}
                disabled={uploading}
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt"
              />
              <div className="form-text">
                Supported formats: PDF, DOC, DOCX, JPG, JPEG, PNG, TXT (Max 10MB)
              </div>
            </div>
          </div>
          {uploading && (
            <div className="text-center">
              <div className="spinner-border spinner-border-sm me-2" role="status"></div>
              Uploading...
            </div>
          )}
        </div>
      </div>

      {/* Documents List */}
      <div className="card">
        <div className="card-header">
          <h5 className="mb-0">My Documents ({documents.length})</h5>
        </div>
        <div className="card-body">
          {loading ? (
            <div className="text-center py-4">
              <div className="spinner-border" role="status"></div>
              <p className="mt-2">Loading documents...</p>
            </div>
          ) : documents.length === 0 ? (
            <div className="text-center py-4">
              <i className="bi bi-folder2-open display-1 text-muted"></i>
              <p className="text-muted mt-3">No documents uploaded yet</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Uploaded</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {documents.map(doc => (
                    <tr key={doc.id}>
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
                          {doc.status === 'pending' ? 'Under Review' :
                           doc.status === 'approved' ? 'Approved' : 'Rejected'}
                        </span>
                        {doc.admin_notes && (
                          <small className="d-block text-muted mt-1">{doc.admin_notes}</small>
                        )}
                      </td>
                      <td>{new Date(doc.created_at).toLocaleDateString()}</td>
                      <td>
                        <button
                          className="btn btn-sm btn-outline-primary me-2"
                          onClick={() => handleDownload(doc.id, doc.name)}
                        >
                          <i className="bi bi-download"></i>
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleDelete(doc.id)}
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Documents;