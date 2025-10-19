import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';

const AdminMeetings = () => {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [showRegistrations, setShowRegistrations] = useState(false);

  useEffect(() => {
    fetchMeetings();
  }, []);

  const fetchMeetings = async () => {
    try {
      const response = await adminAPI.getMeetings();
      const meetingsData = Array.isArray(response.data) ? response.data : [];
      setMeetings(meetingsData);
    } catch (err) {
      console.error('Error fetching meetings:', err);
      setMeetings([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchRegistrations = async (meetingId) => {
    try {
      const response = await adminAPI.getMeetingRegistrations(meetingId);
      setRegistrations(response.data || []);
      setShowRegistrations(true);
    } catch (err) {
      console.error('Error fetching registrations:', err);
      alert('❌ Error fetching meeting registrations');
    }
  };

  const createMeeting = async () => {
    const title = prompt('Meeting Title:');
    if (!title) return;
    
    const description = prompt('Meeting Description:');
    if (!description) return;
    
    const date = prompt('Meeting Date (YYYY-MM-DD HH:MM):');
    if (!date) return;
    
    const duration = prompt('Duration in minutes:', '60');
    if (!duration) return;

    try {
      const meetingData = {
        title,
        description,
        date,
        duration_minutes: parseInt(duration),
        auto_expire: true,
        require_registration: true
      };
      
      await adminAPI.createMeeting(meetingData);
      fetchMeetings();
      alert('✅ Meeting created successfully!');
    } catch (err) {
      alert('❌ Error creating meeting');
    }
  };

  const deleteMeeting = async (id, title) => {
    if (window.confirm(`❌ Delete meeting "${title}"?`)) {
      try {
        await adminAPI.deleteMeeting(id);
        setMeetings(prev => prev.filter(meeting => meeting.id !== id));
        alert('✅ Meeting deleted successfully!');
      } catch (err) {
        alert('❌ Error deleting meeting');
      }
    }
  };

  const getMeetingStatus = (meeting) => {
    const now = new Date();
    const meetingDate = new Date(meeting.date);
    const endTime = new Date(meetingDate.getTime() + (meeting.duration_minutes || 60) * 60000);
    
    if (meeting.auto_expire && now > endTime) return 'expired';
    if (now > meetingDate) return 'ongoing';
    return 'upcoming';
  };

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="mb-0">🎥 Meeting Management</h3>
        <button className="btn btn-primary" onClick={createMeeting}>
          <i className="bi bi-plus me-1"></i>Create Meeting
        </button>
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
                <th>Meeting Details</th>
                <th>Schedule</th>
                <th>Status</th>
                <th>Registrations</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(meetings) && meetings.map(meeting => {
                const status = getMeetingStatus(meeting);
                return (
                  <tr key={meeting.id}>
                    <td>
                      <strong>{meeting.title}</strong>
                      <small className="d-block text-muted">{meeting.description}</small>
                    </td>
                    <td>
                      <div>{new Date(meeting.date).toLocaleDateString()}</div>
                      <small className="text-muted">
                        {new Date(meeting.date).toLocaleTimeString()} 
                        ({meeting.duration_minutes || 60} min)
                      </small>
                    </td>
                    <td>
                      <span className={`badge ${
                        status === 'expired' ? 'bg-danger' :
                        status === 'ongoing' ? 'bg-warning' : 'bg-success'
                      }`}>
                        {status === 'expired' ? 'Expired' :
                         status === 'ongoing' ? 'Ongoing' : 'Upcoming'}
                      </span>
                      {meeting.auto_expire && (
                        <small className="d-block text-muted">Auto-expires</small>
                      )}
                    </td>
                    <td>
                      <button 
                        className="btn btn-outline-info btn-sm"
                        onClick={() => {
                          setSelectedMeeting(meeting);
                          fetchRegistrations(meeting.id);
                        }}
                      >
                        <i className="bi bi-people me-1"></i>
                        View ({meeting.registration_count || 0})
                      </button>
                    </td>
                    <td>
                      <div className="btn-group btn-group-sm">
                        <button 
                          className="btn btn-outline-primary"
                          onClick={() => {
                            const link = prompt('Meeting Link:', meeting.meeting_link || '');
                            if (link !== null) {
                              // Update meeting link
                              console.log('Update meeting link:', link);
                            }
                          }}
                        >
                          <i className="bi bi-link me-1"></i>Link
                        </button>
                        <button 
                          className="btn btn-outline-danger"
                          onClick={() => deleteMeeting(meeting.id, meeting.title)}
                        >
                          <i className="bi bi-trash me-1"></i>Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Meeting Registrations Modal */}
      {showRegistrations && selectedMeeting && (
        <div className="modal show d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  Registrations - {selectedMeeting.title}
                </h5>
                <button 
                  className="btn-close" 
                  onClick={() => setShowRegistrations(false)}
                ></button>
              </div>
              <div className="modal-body">
                {registrations.length === 0 ? (
                  <div className="text-center py-4">
                    <i className="bi bi-people display-4 text-muted"></i>
                    <h5 className="text-muted mt-3">No Registrations</h5>
                    <p className="text-muted">No one has registered for this meeting yet.</p>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-sm">
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Email</th>
                          <th>Registration Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {registrations.map(reg => (
                          <tr key={reg.id}>
                            <td><strong>{reg.user_name}</strong></td>
                            <td>{reg.user_email}</td>
                            <td>
                              {new Date(reg.registered_at).toLocaleDateString()}
                              <small className="d-block text-muted">
                                {new Date(reg.registered_at).toLocaleTimeString()}
                              </small>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button 
                  className="btn btn-secondary" 
                  onClick={() => setShowRegistrations(false)}
                >
                  Close
                </button>
                <button 
                  className="btn btn-primary"
                  onClick={() => {
                    const emails = registrations.map(r => r.user_email).join(', ');
                    navigator.clipboard.writeText(emails);
                    alert('📧 Email addresses copied to clipboard!');
                  }}
                >
                  <i className="bi bi-clipboard me-1"></i>Copy Emails
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {(!Array.isArray(meetings) || meetings.length === 0) && !loading && (
        <div className="text-center py-5">
          <i className="bi bi-camera-video display-1 text-muted"></i>
          <h4 className="text-muted mt-3">No Meetings</h4>
          <p className="text-muted">No meetings have been created yet.</p>
        </div>
      )}
    </div>
  );
};

export default AdminMeetings;