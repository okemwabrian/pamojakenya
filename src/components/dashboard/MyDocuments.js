import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { documentsAPI } from '../../services/api';

const MyDocuments = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    document_type: 'other'
  });
  const [file, setFile] = useState(null);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const response = await documentsAPI.getDocuments();
      const documents = Array.isArray(response.data) ? response.data : [];
      setDocuments(documents);
    } catch (error) {
      console.error('Error fetching documents:', error);
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      alert('Please select a file to upload');
      return;
    }

    try {
      const submitData = new FormData();
      Object.keys(formData).forEach(key => {
        submitData.append(key, formData[key]);
      });
      submitData.append('file', file);

      await documentsAPI.uploadDocument(submitData);
      setShowForm(false);
      setFormData({ name: '', description: '', document_type: 'other' });
      setFile(null);
      fetchDocuments();
      alert('Document uploaded successfully!');
    } catch (error) {
      console.error('Error uploading document:', error);
      alert('Error uploading document. Please try again.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      try {
        await documentsAPI.deleteDocument(id);
        fetchDocuments();
        alert('Document deleted successfully!');
      } catch (error) {
        console.error('Error deleting document:', error);
        alert('Error deleting document. Please try again.');
      }
    }
  };

  return (
    <div className="card">
      <div className="card-header d-flex justify-content-between align-items-center">
        <h4 className="mb-0">📄 My Documents</h4>
        <div>
          <button 
            className="btn btn-primary btn-sm" 
            onClick={() => setShowForm(!showForm)}
          >
            <i className="bi bi-plus-circle me-1"></i>
            {showForm ? 'Cancel' : 'Upload Document'}
          </button>
        </div>
      </div>
      <div className="card-body">
        {showForm && (
          <div className="card mb-4">
            <div className="card-header">
              <h5 className="mb-0">Upload New Document</h5>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="row mb-3">
                  <div className="col-md-6">
                    <label className="form-label">Document Name *</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Document Type *</label>
                    <select 
                      className="form-select" 
                      name="document_type"
                      value={formData.document_type}
                      onChange={handleChange}
                      required
                    >
                      <option value="id">Identification</option>
                      <option value="proof_income">Proof of Income</option>
                      <option value="bank_statement">Bank Statement</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
                <div className="mb-3">
                  <label className="form-label">Description</label>
                  <textarea 
                    className="form-control" 
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows="3"
                    placeholder="Optional description..."
                  ></textarea>
                </div>
                <div className="mb-3">
                  <label className="form-label">File *</label>
                  <input 
                    type="file" 
                    className="form-control" 
                    onChange={handleFileChange}
                    accept=".pdf,.jpg,.jpeg,.png"
                    required
                  />
                  <div className="form-text">
                    Accepted formats: PDF, JPG, PNG (Max size: 5MB)
                  </div>
                </div>
                <button type="submit" className="btn btn-primary">
                  <i className="bi bi-upload me-1"></i>Upload Document
                </button>
              </form>
            </div>
          </div>
        )}

        {loading ? (
          <div className="text-center py-4">
            <div className="spinner-border" role="status"></div>
          </div>
        ) : documents.length === 0 ? (
          <div className="text-center py-4">
            <i className="bi bi-file-earmark display-1 text-muted"></i>
            <h5 className="mt-3">No Documents Uploaded</h5>
            <p className="text-muted">You haven't uploaded any documents yet.</p>
            <button className="btn btn-primary" onClick={() => setShowForm(true)}>
              Upload Your First Document
            </button>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>Document</th>
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
                      <strong>{doc.name}</strong>
                      {doc.description && (
                        <small className="d-block text-muted">{doc.description}</small>
                      )}
                    </td>
                    <td>
                      <span className="badge bg-secondary">
                        {doc.document_type === 'id' ? 'Identification' :
                         doc.document_type === 'proof_income' ? 'Proof of Income' :
                         doc.document_type === 'bank_statement' ? 'Bank Statement' : 'Other'}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${
                        doc.status === 'approved' ? 'bg-success' :
                        doc.status === 'rejected' ? 'bg-danger' : 'bg-warning'
                      }`}>
                        {doc.status === 'pending' ? 'Pending Review' :
                         doc.status === 'approved' ? 'Approved' : 'Rejected'}
                      </span>
                      {doc.admin_notes && doc.status === 'rejected' && (
                        <small className="d-block text-danger mt-1">
                          Reason: {doc.admin_notes}
                        </small>
                      )}
                    </td>
                    <td>{new Date(doc.created_at).toLocaleDateString()}</td>
                    <td>
                      <div className="btn-group btn-group-sm">
                        <button 
                          className="btn btn-outline-primary"
                          onClick={() => window.open(doc.file, '_blank')}
                          title="View Document"
                        >
                          <i className="bi bi-eye me-1"></i>View
                        </button>
                        {doc.status === 'pending' && (
                          <button 
                            className="btn btn-outline-danger"
                            onClick={() => handleDelete(doc.id)}
                            title="Delete Document"
                          >
                            <i className="bi bi-trash me-1"></i>Delete
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
      </div>
    </div>
  );
};

export default MyDocuments;