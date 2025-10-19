import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import * as XLSX from 'xlsx';

const AdminClaims = () => {
  const [claims, setClaims] = useState([]);
  const [filter, setFilter] = useState('pending');
  const [dateFilter, setDateFilter] = useState('all');
  const [viewClaim, setViewClaim] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClaims();
  }, []);

  const fetchClaims = async () => {
    try {
      const response = await adminAPI.getClaims();
      const claims = Array.isArray(response.data) ? response.data : [];
      setClaims(claims);
    } catch (err) {
      console.error('Error fetching claims:', err);
      setClaims([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id, action, notes = '') => {
    try {
      if (action === 'approved') {
        await adminAPI.approveClaim(id);
      } else if (action === 'rejected') {
        await adminAPI.rejectClaim(id);
      }
      fetchClaims(); // Refresh claims list
    } catch (err) {
      console.error('Error updating claim:', err);
      alert('Error updating claim. Please try again.');
    }
  };

  const getDateFilteredClaims = (claims) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    switch (dateFilter) {
      case 'today':
        return claims.filter(claim => new Date(claim.created_at) >= today);
      case 'this_week':
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        return claims.filter(claim => new Date(claim.created_at) >= weekStart);
      case 'last_week':
        const lastWeekStart = new Date(today);
        lastWeekStart.setDate(today.getDate() - today.getDay() - 7);
        const lastWeekEnd = new Date(today);
        lastWeekEnd.setDate(today.getDate() - today.getDay());
        return claims.filter(claim => {
          const claimDate = new Date(claim.created_at);
          return claimDate >= lastWeekStart && claimDate < lastWeekEnd;
        });
      case 'this_month':
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        return claims.filter(claim => new Date(claim.created_at) >= monthStart);
      case 'last_month':
        const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 1);
        return claims.filter(claim => {
          const claimDate = new Date(claim.created_at);
          return claimDate >= lastMonthStart && claimDate < lastMonthEnd;
        });
      default:
        return claims;
    }
  };

  const statusFilteredClaims = claims.filter(claim => 
    filter === 'all' || claim.status === filter
  );
  
  const filteredClaims = getDateFilteredClaims(statusFilteredClaims);

  const getClaimTypeLabel = (type) => {
    const types = {
      death: 'Death Benefit',
      medical: 'Medical Emergency',
      education: 'Education Support',
      emergency: 'Emergency Assistance'
    };
    return types[type] || type;
  };

  const exportToExcel = () => {
    const exportData = filteredClaims.map(claim => ({
      'Claimant': claim.user_name,
      'Member Name': claim.member_name,
      'Claim Type': getClaimTypeLabel(claim.claim_type),
      'Amount Requested': claim.amount_requested,
      'Status': claim.status,
      'Relationship': claim.relationship,
      'Incident Date': new Date(claim.incident_date).toLocaleDateString(),
      'Submitted Date': new Date(claim.created_at).toLocaleDateString(),
      'Description': claim.description,
      'Admin Notes': claim.admin_notes || ''
    }));
    
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Claims');
    XLSX.writeFile(wb, `Claims_${filter}_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const printClaims = () => {
    const printContent = `
      <html>
        <head>
          <title>Claims Report - ${filter}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            .header { text-align: center; margin-bottom: 20px; }
            .summary { margin-bottom: 20px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Pamoja Kenya MN - Claims Report</h1>
            <p>Filter: ${filter.charAt(0).toUpperCase() + filter.slice(1)} Claims</p>
            <p>Generated on: ${new Date().toLocaleDateString()}</p>
          </div>
          <div class="summary">
            <p><strong>Total Claims: ${filteredClaims.length}</strong></p>
            <p><strong>Total Amount: $${filteredClaims.reduce((sum, claim) => sum + claim.amount_requested, 0).toLocaleString()}</strong></p>
          </div>
          <table>
            <thead>
              <tr>
                <th>Claimant</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              ${filteredClaims.map(claim => `
                <tr>
                  <td>${claim.user_name}</td>
                  <td>${getClaimTypeLabel(claim.claim_type)}</td>
                  <td>$${claim.amount_requested.toLocaleString()}</td>
                  <td>${claim.status}</td>
                  <td>${new Date(claim.created_at).toLocaleDateString()}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `;
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3>🎯 Claims Management</h3>
        <div className="d-flex gap-2">
          <select 
            className="form-select" 
            style={{width: '150px'}}
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
          <button className="btn btn-outline-success" onClick={exportToExcel}>
            <i className="bi bi-file-earmark-excel"></i> Export Excel
          </button>
          <button className="btn btn-outline-primary" onClick={printClaims}>
            <i className="bi bi-printer"></i> Print
          </button>
          <select className="form-select" value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="pending">Pending Claims</option>
            <option value="approved">Approved Claims</option>
            <option value="rejected">Rejected Claims</option>
            <option value="all">All Claims</option>
          </select>
        </div>
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
              <th>Claimant</th>
              <th>Type</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredClaims.map(claim => (
              <tr key={claim.id}>
                <td>
                  <strong>{claim.user_name}</strong>
                  <small className="d-block text-muted">For: {claim.member_name}</small>
                </td>
                <td>
                  <span className="badge bg-secondary">{getClaimTypeLabel(claim.claim_type)}</span>
                </td>
                <td>
                  <strong className="text-success">${claim.amount_requested.toLocaleString()}</strong>
                </td>
                <td>
                  <span className={`badge ${
                    claim.status === 'approved' ? 'bg-success' :
                    claim.status === 'rejected' ? 'bg-danger' : 'bg-warning'
                  }`}>
                    {claim.status.charAt(0).toUpperCase() + claim.status.slice(1)}
                  </span>
                </td>
                <td>{new Date(claim.created_at).toLocaleDateString()}</td>
                <td>
                  <div className="btn-group btn-group-sm">
                    <button 
                      className="btn btn-outline-primary"
                      onClick={() => setViewClaim(claim)}
                      title="View Details"
                    >
                      <i className="bi bi-eye me-1"></i>View
                    </button>
                    {claim.status === 'pending' && (
                      <>
                        <button 
                          className="btn btn-outline-success"
                          onClick={() => {
                            if (window.confirm(`✅ Approve claim for ${claim.user_name}?\nAmount: $${claim.amount_requested.toLocaleString()}\nType: ${getClaimTypeLabel(claim.claim_type)}`)) {
                              handleAction(claim.id, 'approved');
                              alert(`✅ SUCCESS: Claim for ${claim.user_name} has been APPROVED!\nAmount: $${claim.amount_requested.toLocaleString()}\nType: ${getClaimTypeLabel(claim.claim_type)}`);
                            }
                          }}
                          title="Approve Claim"
                        >
                          <i className="bi bi-check me-1"></i>Approve
                        </button>
                        <button 
                          className="btn btn-outline-danger"
                          onClick={() => {
                            const notes = prompt(`❌ Rejection reason for ${claim.user_name}'s claim:\n(Amount: $${claim.amount_requested.toLocaleString()})`);
                            if (notes && notes.trim()) {
                              handleAction(claim.id, 'rejected', notes);
                              alert(`❌ REJECTED: Claim for ${claim.user_name} has been REJECTED.\nAmount: $${claim.amount_requested.toLocaleString()}\nReason: ${notes}`);
                            }
                          }}
                          title="Reject Claim"
                        >
                          <i className="bi bi-x me-1"></i>Reject
                        </button>
                      </>
                    )}
                    {claim.status !== 'pending' && (
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

      {/* View Claim Modal */}
      {viewClaim && (
        <div className="modal show d-block" style={{background: 'rgba(0,0,0,0.5)'}}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5>Claim Details - {viewClaim.user_name}</h5>
                <button className="btn-close" onClick={() => setViewClaim(null)}></button>
              </div>
              <div className="modal-body">
                <div className="row g-3">
                  <div className="col-md-6">
                    <strong>Claim Type:</strong> {getClaimTypeLabel(viewClaim.claim_type)}
                  </div>
                  <div className="col-md-6">
                    <strong>Amount:</strong> ${viewClaim.amount_requested.toLocaleString()}
                  </div>
                  <div className="col-md-6">
                    <strong>Member:</strong> {viewClaim.member_name}
                  </div>
                  <div className="col-md-6">
                    <strong>Relationship:</strong> {viewClaim.relationship}
                  </div>
                  <div className="col-md-6">
                    <strong>Incident Date:</strong> {new Date(viewClaim.incident_date).toLocaleDateString()}
                  </div>
                  <div className="col-md-6">
                    <strong>Status:</strong> 
                    <span className={`badge ms-2 ${
                      viewClaim.status === 'approved' ? 'bg-success' :
                      viewClaim.status === 'rejected' ? 'bg-danger' : 'bg-warning'
                    }`}>
                      {viewClaim.status.charAt(0).toUpperCase() + viewClaim.status.slice(1)}
                    </span>
                  </div>
                  <div className="col-12">
                    <strong>Description:</strong>
                    <p className="mt-2">{viewClaim.description}</p>
                  </div>
                  {viewClaim.admin_notes && (
                    <div className="col-12">
                      <strong>Admin Notes:</strong>
                      <p className="mt-2 text-muted">{viewClaim.admin_notes}</p>
                    </div>
                  )}
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setViewClaim(null)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminClaims;