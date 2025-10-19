import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { meetingsAPI } from '../services/api';

const Meetings = () => {
  const { isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [meetings, setMeetings] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMeetings = async () => {
      try {
        setIsLoading(true);
        const response = await meetingsAPI.getMeetings();
        const meetings = response.data?.results || response.data || [];
        setMeetings(meetings);
      } catch (err) {
        console.error('Error fetching meetings:', err);
        setError('Failed to load meetings');
        setMeetings([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchMeetings();
  }, []);

  const isMeetingPast = (dateString) => {
    return new Date(dateString) < new Date();
  };

  const getMeetingStatus = (meeting) => {
    if (isMeetingExpired(meeting)) return 'expired';
    if (isMeetingPast(meeting.date)) return 'ended';
    return 'upcoming';
  };

  const registerForMeeting = async (meetingId) => {
    try {
      await meetingsAPI.registerForMeeting(meetingId);
      setMeetings(prev => prev.map(meeting => 
        meeting.id === meetingId 
          ? { ...meeting, registered: true }
          : meeting
      ));
      alert('✅ Successfully registered for meeting! You will receive a confirmation email.');
    } catch (err) {
      console.error('Error registering for meeting:', err);
      alert('❌ Failed to register for meeting. Please try again.');
    }
  };

  const isMeetingExpired = (meeting) => {
    if (!meeting.auto_expire) return false;
    const endTime = new Date(meeting.date);
    endTime.setMinutes(endTime.getMinutes() + (meeting.duration_minutes || 60));
    return new Date() > endTime;
  };

  const joinMeeting = (meetingLink) => {
    if (meetingLink) {
      window.open(meetingLink, '_blank');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="container-fluid py-5">
      <div className="row justify-content-center">
        <div className="col-lg-10">
          
          {/* Header */}
          <div className="text-center mb-5">
            <h1 className="display-4 fw-bold text-primary mb-3">🎥 Community Meetings</h1>
            <p className="lead text-muted">Join our virtual and in-person community meetings</p>
          </div>

          {/* Error State */}
          {error && (
            <div className="alert alert-warning text-center mb-4">
              <i className="bi bi-exclamation-triangle me-2"></i>
              {error}
            </div>
          )}
          
          {/* Loading State */}
          {isLoading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary mb-3" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="text-muted">Loading meetings...</p>
            </div>
          ) : (
            <>
              {/* No Meetings */}
              {meetings.length === 0 ? (
                <div className="text-center py-5">
                  <div className="card border-0 shadow-sm">
                    <div className="card-body p-5">
                      <i className="bi bi-camera-video display-1 text-muted mb-3"></i>
                      <h3 className="text-muted">No Meetings Scheduled</h3>
                      <p className="text-muted">Check back later for upcoming community meetings.</p>
                    </div>
                  </div>
                </div>
              ) : (
                /* Meetings List */
                <div className="row g-4">
                  {meetings.map(meeting => (
                    <div key={meeting.id} className="col-lg-6">
                      <div className="card border-0 shadow-sm h-100">
                        <div className="card-header d-flex justify-content-between align-items-center">
                          <div className="d-flex align-items-center">
                            <i className="bi bi-camera-video text-primary me-2"></i>
                            <h5 className="mb-0">{meeting.title}</h5>
                          </div>
                          <div className="d-flex align-items-center gap-2">
                            {(() => {
                              const status = getMeetingStatus(meeting);
                              if (status === 'expired') {
                                return <span className="badge bg-danger">Expired</span>;
                              } else if (status === 'ended') {
                                return <span className="badge bg-secondary">Ended</span>;
                              } else {
                                return <span className="badge bg-success">Upcoming</span>;
                              }
                            })()} 
                          </div>
                        </div>
                        <div className="card-body">
                          <p className="card-text">{meeting.description}</p>
                          
                          <div className="meeting-details mb-3">
                            <div className="row g-2">
                              <div className="col-6">
                                <small className="text-muted d-block">
                                  <i className="bi bi-calendar3 me-1"></i>Date & Time
                                </small>
                                <strong>{formatDate(meeting.date)}</strong>
                              </div>
                              <div className="col-6">
                                <small className="text-muted d-block">
                                  <i className="bi bi-hourglass me-1"></i>Duration
                                </small>
                                <strong>{meeting.duration} minutes</strong>
                              </div>
                              <div className="col-6">
                                <small className="text-muted d-block">
                                  <i className="bi bi-laptop me-1"></i>Type
                                </small>
                                <strong>{meeting.type.charAt(0).toUpperCase() + meeting.type.slice(1)}</strong>
                              </div>
                              <div className="col-6">
                                <small className="text-muted d-block">
                                  <i className="bi bi-people me-1"></i>Max Participants
                                </small>
                                <strong>{meeting.max_participants || 'Unlimited'}</strong>
                              </div>
                            </div>
                          </div>

                          <div className="d-flex justify-content-between align-items-center">
                            <small className="text-muted">
                              <i className="bi bi-clock me-1"></i>
                              Scheduled {formatDate(meeting.created_at)}
                            </small>
                            
                            {!isMeetingPast(meeting.date) ? (
                              <div>
                                {meeting.require_registration && !meeting.registered ? (
                                  <button 
                                    className="btn btn-primary btn-sm me-2"
                                    onClick={() => registerForMeeting(meeting.id)}
                                  >
                                    <i className="bi bi-person-plus me-1"></i>Register
                                  </button>
                                ) : null}
                                
                                {meeting.meeting_link && (meeting.registered || !meeting.require_registration) ? (
                                  <button 
                                    className="btn btn-success btn-sm"
                                    onClick={() => joinMeeting(meeting.meeting_link)}
                                  >
                                    <i className="bi bi-camera-video me-1"></i>Join Meeting
                                  </button>
                                ) : null}
                                
                                {meeting.registered && !meeting.meeting_link ? (
                                  <span className="badge bg-success">
                                    <i className="bi bi-check-circle me-1"></i>Registered
                                  </span>
                                ) : null}
                                
                                {!meeting.require_registration && !meeting.meeting_link ? (
                                  <span className="badge bg-info">
                                    <i className="bi bi-info-circle me-1"></i>Link will be shared
                                  </span>
                                ) : null}
                              </div>
                            ) : (
                              <div>
                                <span className="badge bg-secondary">
                                  <i className="bi bi-clock-history me-1"></i>Meeting Ended
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Info Section */}
          {!isLoading && meetings.length > 0 && (
            <div className="row mt-5">
              <div className="col-12">
                <div className="card bg-light">
                  <div className="card-body text-center py-4">
                    <h4 className="mb-3">Meeting Information</h4>
                    <div className="row g-3">
                      <div className="col-md-4">
                        <i className="bi bi-camera-video text-primary display-6"></i>
                        <h6 className="mt-2">Virtual Meetings</h6>
                        <p className="text-muted small">Join from anywhere with internet access</p>
                      </div>
                      <div className="col-md-4">
                        <i className="bi bi-person-check text-success display-6"></i>
                        <h6 className="mt-2">Registration</h6>
                        <p className="text-muted small">Some meetings require advance registration</p>
                      </div>
                      <div className="col-md-4">
                        <i className="bi bi-bell text-warning display-6"></i>
                        <h6 className="mt-2">Notifications</h6>
                        <p className="text-muted small">{isAuthenticated ? 'You\'ll receive meeting reminders' : 'Login to receive meeting reminders'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default Meetings;