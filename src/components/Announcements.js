import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { announcementsAPI, eventsAPI } from '../services/api';

const Announcements = () => {
  const { isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [announcements, setAnnouncements] = useState([]);
  const [events, setEvents] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [announcementsRes, eventsRes] = await Promise.all([
          announcementsAPI.getAnnouncements(),
          eventsAPI.getEvents()
        ]);
        const announcements = announcementsRes.data?.results || announcementsRes.data || [];
        const events = eventsRes.data?.results || eventsRes.data || [];
        setAnnouncements(announcements);
        setEvents(events);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load announcements and events');
        setAnnouncements([]);
        setEvents([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPriorityClass = (priority) => {
    switch (priority) {
      case 'urgent': return 'bg-danger';
      case 'high': return 'bg-warning text-dark';
      case 'medium': return 'bg-info';
      default: return 'bg-secondary';
    }
  };

  return (
    <div className="container py-5">
      <h2 className="text-center mb-4">📢 Announcements & Events</h2>
      
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
          <p className="text-muted">Loading announcements and events...</p>
        </div>
      ) : (
        <div className="row g-4">
          {/* Announcements Section */}
          <div className="col-lg-6">
            <div className="card h-100">
              <div className="card-header bg-primary text-white">
                <h3 className="mb-0">📋 Latest Announcements</h3>
              </div>
              <div className="card-body">
                {announcements.length === 0 ? (
                  <div className="text-center py-4">
                    <i className="bi bi-megaphone display-1 text-muted"></i>
                    <p className="text-muted mt-3">No announcements at this time.</p>
                  </div>
                ) : (
                  <div className="announcements-list">
                    {announcements.map(announcement => (
                      <div key={announcement.id} className={`card mb-3 ${announcement.is_pinned ? 'border-warning' : ''}`}>
                        <div className="card-body">
                          <div className="d-flex justify-content-between align-items-start mb-2">
                            <h5 className="mb-0">{announcement.title}</h5>
                            <div>
                              <span className={`badge ${getPriorityClass(announcement.priority)}`}>
                                {announcement.priority.charAt(0).toUpperCase() + announcement.priority.slice(1)}
                              </span>
                              {announcement.is_pinned && (
                                <span className="badge bg-warning text-dark ms-1">
                                  <i className="bi bi-pin-fill"></i> Pinned
                                </span>
                              )}
                            </div>
                          </div>
                          <p className="mb-2">{announcement.content}</p>
                          <small className="text-muted">
                            <i className="bi bi-clock me-1"></i>
                            {formatDate(announcement.created_at)}
                          </small>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Events Section */}
          <div className="col-lg-6">
            <div className="card h-100">
              <div className="card-header bg-success text-white">
                <h3 className="mb-0">📅 Upcoming Events</h3>
              </div>
              <div className="card-body">
                {events.length === 0 ? (
                  <div className="text-center py-4">
                    <i className="bi bi-calendar-event display-1 text-muted"></i>
                    <p className="text-muted mt-3">No upcoming events scheduled.</p>
                  </div>
                ) : (
                  <div className="events-list">
                    {events.map(event => (
                      <div key={event.id} className="card mb-3">
                        <div className="card-body">
                          <div className="d-flex justify-content-between align-items-start mb-2">
                            <h5 className="mb-0">{event.title}</h5>
                            <div>
                              {event.is_featured && (
                                <span className="badge bg-warning text-dark me-1">
                                  <i className="bi bi-star-fill"></i> Featured
                                </span>
                              )}
                              {event.registration_required && (
                                <span className="badge bg-info">
                                  <i className="bi bi-person-check"></i> Registration Required
                                </span>
                              )}
                            </div>
                          </div>
                          <p className="mb-2">{event.description}</p>
                          <div className="row g-2 mb-2">
                            <div className="col-6">
                              <small className="text-muted d-block">
                                <i className="bi bi-calendar3 me-1"></i>Date & Time
                              </small>
                              <strong>{formatDate(event.date)}</strong>
                            </div>
                            <div className="col-6">
                              <small className="text-muted d-block">
                                <i className="bi bi-geo-alt me-1"></i>Location
                              </small>
                              <strong>{event.location || 'TBA'}</strong>
                            </div>
                          </div>
                          <small className="text-muted">
                            <i className="bi bi-clock me-1"></i>
                            Posted {formatDate(event.created_at)}
                          </small>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Call to Action */}
      <div className="row mt-5">
        <div className="col-12">
          <div className="card bg-light">
            <div className="card-body text-center py-4">
              <h3 className="mb-3">Stay Connected</h3>
              <p className="mb-3">Don't miss important updates! Make sure you're logged in to receive notifications about new announcements and events.</p>
              <div className="d-flex justify-content-center gap-3">
                {!isAuthenticated ? (
                  <Link to="/login" className="btn btn-primary">Login</Link>
                ) : (
                  <Link to="/user-dashboard" className="btn btn-outline-primary">Go to Dashboard</Link>
                )}
                <Link to="/contact" className="btn btn-outline-secondary">Contact Us</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Announcements;