import React, { useState, useEffect } from 'react';
import { announcementsAPI, adminAPI } from '../../services/api';

const AdminContent = () => {
  const [activeTab, setActiveTab] = useState('announcements');
  const [announcements, setAnnouncements] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [showRegistrations, setShowRegistrations] = useState(false);
  const [registrations, setRegistrations] = useState([]);
  const [formData, setFormData] = useState({
    title: '', content: '', description: '', date: '', location: '', priority: 'medium', 
    duration: 60, type: 'virtual', max_participants: 100, require_registration: false, meeting_link: ''
  });

  useEffect(() => {
    fetchData();
  }, [activeTab]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'announcements') {
        const response = await announcementsAPI.getAnnouncements();
        setAnnouncements(response.data?.results || response.data || []);
      } else if (activeTab === 'meetings') {
        const response = await adminAPI.getMeetings();
        setMeetings(response.data?.results || response.data || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      // Fallback to mock data for announcements
      if (activeTab === 'announcements') {
        setAnnouncements([
          {id: 1, title: 'Welcome Message', content: 'Welcome to Pamoja Kenya MN', priority: 'high', created_at: '2024-01-15T10:00:00Z'},
          {id: 2, title: 'Meeting Reminder', content: 'Monthly meeting this Saturday', priority: 'medium', created_at: '2024-01-14T09:00:00Z'}
        ]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (activeTab === 'announcements') {
        if (editItem) {
          await announcementsAPI.updateAnnouncement(editItem.id, formData);
        } else {
          await announcementsAPI.createAnnouncement(formData);
        }
      } else if (activeTab === 'meetings') {
        const meetingData = {
          ...formData,
          date: new Date(formData.date).toISOString()
        };
        if (editItem) {
          await adminAPI.updateMeeting(editItem.id, meetingData);
        } else {
          await adminAPI.createMeeting(meetingData);
        }
      }
      
      setShowForm(false);
      setEditItem(null);
      setFormData({
        title: '', content: '', description: '', date: '', location: '', priority: 'medium',
        duration: 60, type: 'virtual', max_participants: 100, require_registration: false, meeting_link: ''
      });
      fetchData(); // Refresh data
      alert(`${activeTab === 'announcements' ? 'Announcement' : 'Meeting'} ${editItem ? 'updated' : 'created'} successfully!`);
    } catch (err) {
      console.error('Error saving content:', err);
      alert('Error saving content. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this item?')) return;
    setLoading(true);
    try {
      if (activeTab === 'announcements') {
        await announcementsAPI.deleteAnnouncement(id);
      } else if (activeTab === 'meetings') {
        await adminAPI.deleteMeeting(id);
      }
      fetchData(); // Refresh data
      alert('Item deleted successfully!');
    } catch (err) {
      console.error('Error deleting content:', err);
      alert('Error deleting item. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item) => {
    setEditItem(item);
    setFormData(item);
    setShowForm(true);
  };

  const viewRegistrations = async (meetingId) => {
    setLoading(true);
    try {
      await adminAPI.getMeeting(meetingId);
      // Get registrations for this meeting
      await adminAPI.getMeetings(); // This would need a specific endpoint
      // For now, we'll show a simple modal
      setRegistrations([]);
      setShowRegistrations(true);
      alert('Registrations feature will be implemented with a dedicated endpoint');
    } catch (error) {
      console.error('Error fetching registrations:', error);
      alert('Error fetching registrations');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3>📝 Content Management</h3>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
          <i className="bi bi-plus"></i> Create New
        </button>
      </div>

      {/* Tabs */}
      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'announcements' ? 'active' : ''}`}
            onClick={() => setActiveTab('announcements')}
          >
            📢 Announcements ({announcements.length})
          </button>
        </li>
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'meetings' ? 'active' : ''}`}
            onClick={() => setActiveTab('meetings')}
          >
            🎥 Meetings ({meetings.length})
          </button>
        </li>
      </ul>

      {/* Content List */}
      {loading ? (
        <div className="text-center py-4">
          <div className="spinner-border" role="status"></div>
          <p className="mt-2">Loading...</p>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover">
            <thead>
              <tr>
                <th>Title</th>
                <th>{activeTab === 'announcements' ? 'Priority' : activeTab === 'meetings' ? 'Date & Time' : 'Date'}</th>
                {activeTab === 'meetings' && <th>Type</th>}
                {activeTab === 'meetings' && <th>Participants</th>}
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {(activeTab === 'announcements' ? announcements : meetings).map(item => (
                <tr key={item.id}>
                  <td>
                    <strong>{item.title}</strong>
                    <small className="d-block text-muted">
                      {item.content?.slice(0, 100) || item.description?.slice(0, 100)}...
                    </small>
                  </td>
                  <td>
                    {activeTab === 'announcements' ? (
                      <span className={`badge ${
                        item.priority === 'urgent' ? 'bg-danger' :
                        item.priority === 'high' ? 'bg-warning' : 'bg-info'
                      }`}>
                        {item.priority}
                      </span>
                    ) : activeTab === 'meetings' ? (
                      <div>
                        <div>{new Date(item.date).toLocaleDateString()}</div>
                        <small className="text-muted">{new Date(item.date).toLocaleTimeString()}</small>
                      </div>
                    ) : (
                      new Date(item.date).toLocaleDateString()
                    )}
                  </td>
                  {activeTab === 'meetings' && (
                    <td>
                      <span className={`badge ${item.type === 'virtual' ? 'bg-primary' : 'bg-success'}`}>
                        {item.type === 'virtual' ? '🎥 Virtual' : '🏢 In Person'}
                      </span>
                    </td>
                  )}
                  {activeTab === 'meetings' && (
                    <td>
                      <div>
                        <small>{item.max_participants || 'Unlimited'} max</small>
                        <div><small className="text-success">{item.registration_count || 0} registered</small></div>
                      </div>
                      {item.require_registration && (
                        <div><span className="badge bg-info">Registration Required</span></div>
                      )}
                    </td>
                  )}
                  <td>{new Date(item.created_at).toLocaleDateString()}</td>
                  <td>
                    <div className="btn-group btn-group-sm">
                      {activeTab === 'meetings' && item.registration_count > 0 && (
                        <button 
                          className="btn btn-outline-info" 
                          onClick={() => viewRegistrations(item.id)}
                          title="View Registrations"
                          disabled={loading}
                        >
                          <i className="bi bi-people"></i>
                        </button>
                      )}
                      <button className="btn btn-outline-primary" onClick={() => handleEdit(item)} disabled={loading}>
                        <i className="bi bi-pencil"></i>
                      </button>
                      <button className="btn btn-outline-danger" onClick={() => handleDelete(item.id)} disabled={loading}>
                        <i className="bi bi-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {(activeTab === 'announcements' ? announcements : meetings).length === 0 && (
                <tr>
                  <td colSpan={activeTab === 'meetings' ? '6' : '4'} className="text-center py-4">
                    <p className="text-muted">No {activeTab} found. Create your first one!</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="modal show d-block" style={{background: 'rgba(0,0,0,0.5)'}}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5>{editItem ? 'Edit' : 'Create'} {activeTab === 'announcements' ? 'Announcement' : 'Meeting'}</h5>
                <button className="btn-close" onClick={() => {setShowForm(false); setEditItem(null);}}></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Title *</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      value={formData.title} 
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      required 
                    />
                  </div>
                  
                  {activeTab === 'announcements' ? (
                    <>
                      <div className="mb-3">
                        <label className="form-label">Content *</label>
                        <textarea 
                          className="form-control" 
                          rows="4"
                          value={formData.content} 
                          onChange={(e) => setFormData({...formData, content: e.target.value})}
                          required 
                        />
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Priority</label>
                        <select 
                          className="form-select" 
                          value={formData.priority} 
                          onChange={(e) => setFormData({...formData, priority: e.target.value})}
                        >
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                          <option value="urgent">Urgent</option>
                        </select>
                      </div>
                    </>
                  ) : activeTab === 'meetings' ? (
                    <>
                      <div className="mb-3">
                        <label className="form-label">Description *</label>
                        <textarea 
                          className="form-control" 
                          rows="4"
                          value={formData.description} 
                          onChange={(e) => setFormData({...formData, description: e.target.value})}
                          required 
                        />
                      </div>
                      <div className="row mb-3">
                        <div className="col-md-6">
                          <label className="form-label">Date & Time *</label>
                          <input 
                            type="datetime-local" 
                            className="form-control" 
                            value={formData.date} 
                            onChange={(e) => setFormData({...formData, date: e.target.value})}
                            required 
                          />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label">Duration (minutes) *</label>
                          <input 
                            type="number" 
                            className="form-control" 
                            value={formData.duration} 
                            onChange={(e) => setFormData({...formData, duration: parseInt(e.target.value)})}
                            min="15"
                            required
                          />
                        </div>
                      </div>
                      <div className="row mb-3">
                        <div className="col-md-6">
                          <label className="form-label">Meeting Type *</label>
                          <select 
                            className="form-select" 
                            value={formData.type} 
                            onChange={(e) => setFormData({...formData, type: e.target.value})}
                            required
                          >
                            <option value="virtual">Virtual Meeting</option>
                            <option value="in_person">In Person Meeting</option>
                          </select>
                        </div>
                        <div className="col-md-6">
                          <label className="form-label">Max Participants</label>
                          <input 
                            type="number" 
                            className="form-control" 
                            value={formData.max_participants} 
                            onChange={(e) => setFormData({...formData, max_participants: parseInt(e.target.value) || null})}
                            min="1"
                            placeholder="Leave empty for unlimited"
                          />
                        </div>
                      </div>
                      {formData.type === 'virtual' ? (
                        <div className="mb-3">
                          <label className="form-label">Meeting Link *</label>
                          <input 
                            type="url" 
                            className="form-control" 
                            value={formData.meeting_link} 
                            onChange={(e) => setFormData({...formData, meeting_link: e.target.value})}
                            placeholder="https://zoom.us/j/... or https://meet.google.com/..."
                            required={formData.type === 'virtual'}
                          />
                        </div>
                      ) : (
                        <div className="mb-3">
                          <label className="form-label">Location *</label>
                          <input 
                            type="text" 
                            className="form-control" 
                            value={formData.location} 
                            onChange={(e) => setFormData({...formData, location: e.target.value})}
                            placeholder="Meeting venue address"
                            required={formData.type === 'in_person'}
                          />
                        </div>
                      )}
                      <div className="mb-3">
                        <div className="form-check">
                          <input 
                            type="checkbox" 
                            className="form-check-input" 
                            checked={formData.require_registration} 
                            onChange={(e) => setFormData({...formData, require_registration: e.target.checked})}
                          />
                          <label className="form-check-label">Require Registration</label>
                          <small className="form-text text-muted">Users must register to attend this meeting</small>
                        </div>
                      </div>
                    </>
                  ) : null}
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => {setShowForm(false); setEditItem(null);}} disabled={loading}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        {editItem ? 'Updating...' : 'Creating...'}
                      </>
                    ) : (
                      editItem ? 'Update' : 'Create'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Registrations Modal */}
      {showRegistrations && (
        <div className="modal show d-block" style={{background: 'rgba(0,0,0,0.5)'}}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5>Meeting Registrations</h5>
                <button className="btn-close" onClick={() => setShowRegistrations(false)}></button>
              </div>
              <div className="modal-body">
                {registrations.length === 0 ? (
                  <p className="text-muted text-center">No registrations found for this meeting.</p>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-hover">
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Email</th>
                          <th>Registered At</th>
                        </tr>
                      </thead>
                      <tbody>
                        {registrations.map(reg => (
                          <tr key={reg.id}>
                            <td>{reg.first_name} {reg.last_name}</td>
                            <td>{reg.email}</td>
                            <td>{new Date(reg.registered_at).toLocaleDateString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowRegistrations(false)}>
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

export default AdminContent;