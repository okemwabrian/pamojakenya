import React from 'react';

const DocumentViewer = ({ document, onClose }) => {
  if (!document) return null;

  const isImage = document.is_image || document.file_url?.match(/\.(jpg|jpeg|png|gif|bmp)$/i);
  const isPdf = document.file_url?.match(/\.pdf$/i);

  return (
    <div className="modal show d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              <i className="bi bi-file-earmark me-2"></i>
              {document.name}
            </h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            <div className="mb-3">
              <strong>Type:</strong> {document.document_type || 'Document'}
              <br />
              <strong>Uploaded by:</strong> {document.user_name}
              <br />
              <strong>Date:</strong> {new Date(document.created_at).toLocaleDateString()}
            </div>
            
            {document.description && (
              <div className="mb-3">
                <strong>Description:</strong>
                <p className="text-muted">{document.description}</p>
              </div>
            )}

            {document.file_url && (
              <div className="text-center">
                {isImage ? (
                  <img 
                    src={document.file_url} 
                    alt={document.name}
                    className="img-fluid rounded"
                    style={{maxHeight: '400px'}}
                  />
                ) : isPdf ? (
                  <iframe
                    src={document.file_url}
                    width="100%"
                    height="400px"
                    className="border rounded"
                    title={document.name}
                  />
                ) : (
                  <div className="alert alert-info">
                    <i className="bi bi-download me-2"></i>
                    <a href={document.file_url} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
                      Download {document.name}
                    </a>
                  </div>
                )}
              </div>
            )}

            {document.admin_notes && (
              <div className="mt-3 alert alert-warning">
                <strong>Admin Notes:</strong> {document.admin_notes}
              </div>
            )}
          </div>
          <div className="modal-footer">
            {document.file_url && (
              <a 
                href={document.file_url} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="btn btn-outline-primary"
              >
                <i className="bi bi-download me-1"></i>Download
              </a>
            )}
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentViewer;