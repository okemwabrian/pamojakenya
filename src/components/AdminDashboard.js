import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import AdminDocuments from './AdminDocuments';
import AdminUsers from './admin/AdminUsers';
import AdminContent from './admin/AdminContent';
import AdminPayments from './admin/AdminPayments';
import AdminApplications from './admin/AdminApplications';
import AdminClaims from './admin/AdminClaims';
import AdminContact from './admin/AdminContact';
import AdminDebug from './admin/AdminDebug';
import AdminOverview from './admin/AdminOverview';
import RegisteredUsers from './admin/RegisteredUsers';

import UserManagement from './admin/UserManagement';
import AdminShares from './AdminShares';
import AdminMeetings from './admin/AdminMeetings';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
    }
  };

  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h1 className="display-6 mb-1">Admin Dashboard</h1>
                  <p className="text-muted mb-0">Manage users, applications, and content</p>
                </div>
                <div className="d-flex align-items-center gap-3">
                  <div className="text-end">
                    <div className="fw-semibold">Welcome, {user?.username}</div>
                    <small className="text-muted">Administrator</small>
                  </div>
                  <button className="btn btn-outline-danger btn-sm" onClick={handleLogout}>
                    <i className="bi bi-box-arrow-right me-1"></i>Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="row mb-4">
        <div className="col-12">
          <ul className="nav nav-pills nav-fill gap-2">
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'overview' ? 'active' : ''}`} 
                onClick={() => setActiveTab('overview')}
              >
                <i className="bi bi-graph-up me-2"></i>Overview
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'users' ? 'active' : ''}`} 
                onClick={() => setActiveTab('users')}
              >
                <i className="bi bi-people-fill me-2"></i>Users
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'registered' ? 'active' : ''}`} 
                onClick={() => setActiveTab('registered')}
              >
                <i className="bi bi-person-check me-2"></i>Registered
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'management' ? 'active' : ''}`} 
                onClick={() => setActiveTab('management')}
              >
                <i className="bi bi-gear me-2"></i>Management
              </button>
            </li>

            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'shares' ? 'active' : ''}`} 
                onClick={() => setActiveTab('shares')}
              >
                <i className="bi bi-piggy-bank me-2"></i>Shares
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'payments' ? 'active' : ''}`} 
                onClick={() => setActiveTab('payments')}
              >
                <i className="bi bi-credit-card me-2"></i>Payments
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'applications' ? 'active' : ''}`} 
                onClick={() => setActiveTab('applications')}
              >
                <i className="bi bi-file-text-fill me-2"></i>Applications
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'claims' ? 'active' : ''}`} 
                onClick={() => setActiveTab('claims')}
              >
                <i className="bi bi-heart-pulse me-2"></i>Claims
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'documents' ? 'active' : ''}`} 
                onClick={() => setActiveTab('documents')}
              >
                <i className="bi bi-file-earmark-check me-2"></i>Documents
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'contact' ? 'active' : ''}`} 
                onClick={() => setActiveTab('contact')}
              >
                <i className="bi bi-envelope me-2"></i>Contact
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'debug' ? 'active' : ''}`} 
                onClick={() => setActiveTab('debug')}
              >
                <i className="bi bi-bug me-2"></i>Debug
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'meetings' ? 'active' : ''}`} 
                onClick={() => setActiveTab('meetings')}
              >
                <i className="bi bi-camera-video me-2"></i>Meetings
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'content' ? 'active' : ''}`} 
                onClick={() => setActiveTab('content')}
              >
                <i className="bi bi-file-earmark-text me-2"></i>Content
              </button>
            </li>
          </ul>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <AdminOverview setActiveTab={setActiveTab} />
      )}

      {activeTab === 'users' && <AdminUsers />}
      {activeTab === 'registered' && <RegisteredUsers />}
      {activeTab === 'management' && <UserManagement />}

      {activeTab === 'shares' && <AdminShares />}
      {activeTab === 'payments' && <AdminPayments />}
      {activeTab === 'applications' && <AdminApplications />}
      {activeTab === 'claims' && <AdminClaims />}
      {activeTab === 'contact' && <AdminContact />}
      {activeTab === 'documents' && <AdminDocuments />}
      {activeTab === 'meetings' && <AdminMeetings />}
      {activeTab === 'debug' && <AdminDebug />}
      {activeTab === 'content' && <AdminContent />}
    </div>
  );
};

export default AdminDashboard;