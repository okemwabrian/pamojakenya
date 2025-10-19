import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { announcementsAPI, meetingsAPI } from '../services/api';

const Home = () => {
  const [latestAnnouncements, setLatestAnnouncements] = useState([]);
  const [latestEvents, setLatestEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [announcementsRes, meetingsRes] = await Promise.all([
          announcementsAPI.getAnnouncements().catch(() => ({ data: [] })),
          meetingsAPI.getMeetings().catch(() => ({ data: [] }))
        ]);
        
        const announcements = announcementsRes.data?.results || announcementsRes.data || [];
        const meetings = meetingsRes.data?.results || meetingsRes.data || [];
        
        setLatestAnnouncements(Array.isArray(announcements) ? announcements.slice(0, 3) : []);
        setLatestEvents(Array.isArray(meetings) ? meetings.filter(meeting => new Date(meeting.date) > new Date()).slice(0, 3) : []);
      } catch (err) {
        console.error('Error fetching data:', err);
        setLatestAnnouncements([]);
        setLatestEvents([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="container py-5">
      {/* Banner Section */}
      <section className="home-banner text-center p-5 rounded mb-5" style={{background: 'linear-gradient(135deg, #0f2027, #203a43, #2c5364)'}}>
        <h1 className="display-4 fw-bold text-white">Pamoja Kenya MN taking the lead at the time of need.</h1>
        <p className="lead mt-3 text-light">
          Pamoja Kenya supports your family when you or a loved one passes away by providing funds for the cost of a funeral, burial, and other related unexpected expenses irrespective of where your family member lives.
        </p>
      </section>

      {/* Latest News Section */}
      <section className="latest-news my-5">
        <h2 className="text-center fw-bold mb-4">Latest News & Events</h2>
        
        <div className="row g-4">
          {/* Latest Announcements */}
          <div className="col-md-6">
            <h3 className="h5 mb-3">📢 Recent Announcements</h3>
            {loading ? (
              <div className="text-center">
                <div className="spinner-border spinner-border-sm" role="status"></div>
              </div>
            ) : latestAnnouncements.length === 0 ? (
              <div className="text-muted">
                <p>No recent announcements</p>
              </div>
            ) : (
              latestAnnouncements.map((announcement) => (
                <div key={announcement.id} className="card mb-3">
                  <div className="card-body">
                    <h5 className="card-title">{announcement.title}</h5>
                    <p className="card-text">
                      {announcement.content.slice(0, 100)}
                      {announcement.content.length > 100 ? '...' : ''}
                    </p>
                    <small className="text-muted">{formatDate(announcement.created_at)}</small>
                  </div>
                </div>
              ))
            )}
            <Link to="/announcements" className="btn btn-outline-primary btn-sm">View All Announcements</Link>
          </div>
          
          {/* Latest Events */}
          <div className="col-md-6">
            <h3 className="h5 mb-3">📅 Upcoming Events</h3>
            {loading ? (
              <div className="text-center">
                <div className="spinner-border spinner-border-sm" role="status"></div>
              </div>
            ) : latestEvents.length === 0 ? (
              <div className="text-muted">
                <p>No upcoming events</p>
              </div>
            ) : (
              latestEvents.map((meeting) => (
                <div key={meeting.id} className="card mb-3">
                  <div className="card-body">
                    <h5 className="card-title">{meeting.title}</h5>
                    <p className="card-text">
                      {meeting.description?.slice(0, 100) || ''}
                      {meeting.description?.length > 100 ? '...' : ''}
                    </p>
                    <div className="d-flex justify-content-between align-items-center">
                      <small className="text-muted">{formatDate(meeting.date)}</small>
                      {meeting.type === 'virtual' && (
                        <span className="badge bg-primary">Virtual</span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
            <Link to="/meetings" className="btn btn-outline-primary btn-sm">View All Meetings</Link>
          </div>
        </div>
      </section>

      {/* Shares Information Section */}
      <section className="shares-info mb-5">
        <div className="text-center">
          <h2 className="fw-bold mb-4">💰 Build Your Financial Security with Shares</h2>
          <p className="lead mb-4">
            Invest in your future and strengthen our community by purchasing shares. Your investment helps us provide better benefits and support to all members.
          </p>
          
          <div className="row g-3 mb-4">
            <div className="col-md-3">
              <div className="d-flex flex-column align-items-center">
                <div className="bg-primary text-white rounded-circle p-3 mb-2">
                  <i className="bi bi-piggy-bank"></i>
                </div>
                <h6 className="mb-1">Affordable Investment</h6>
                <small className="text-muted">Start with as little as $50</small>
              </div>
            </div>
            <div className="col-md-3">
              <div className="d-flex flex-column align-items-center">
                <div className="bg-success text-white rounded-circle p-3 mb-2">
                  <i className="bi bi-graph-up"></i>
                </div>
                <h6 className="mb-1">Growing Returns</h6>
                <small className="text-muted">Watch your investment grow</small>
              </div>
            </div>
            <div className="col-md-3">
              <div className="d-flex flex-column align-items-center">
                <div className="bg-info text-white rounded-circle p-3 mb-2">
                  <i className="bi bi-shield-check"></i>
                </div>
                <h6 className="mb-1">Secure Investment</h6>
                <small className="text-muted">Safe and reliable returns</small>
              </div>
            </div>
            <div className="col-md-3">
              <div className="d-flex flex-column align-items-center">
                <div className="bg-warning text-white rounded-circle p-3 mb-2">
                  <i className="bi bi-people"></i>
                </div>
                <h6 className="mb-1">Community Impact</h6>
                <small className="text-muted">Strengthen our collective support</small>
              </div>
            </div>
          </div>
          
          <div className="d-flex justify-content-center">
            <Link to="/membership" className="btn btn-primary btn-lg">
              <i className="bi bi-person-plus me-2"></i>Become a Member
            </Link>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="why-choose-us text-center bg-white p-5 rounded shadow-sm mb-5">
        <h2 className="fw-bold mb-4">Why Choose Pamoja Kenya MN?</h2>
        <div className="row g-4">
          <div className="col-md-4">
            <h5 className="text-primary">Trusted by Families</h5>
            <p className="text-muted">We've helped hundreds of families navigate tough times with dignity and support.</p>
          </div>
          <div className="col-md-4">
            <h5 className="text-primary">Transparent & Affordable</h5>
            <p className="text-muted">No hidden fees, no surprises — just real help when it matters most.</p>
          </div>
          <div className="col-md-4">
            <h5 className="text-primary">Nationwide Reach</h5>
            <p className="text-muted">Support available whether your loved ones are in Kenya, the US, or beyond.</p>
          </div>
        </div>
      </section>

      {/* Upgrade Section */}
      <section className="upgrade-info text-center p-4 rounded mb-5 border">
        <h2 className="fw-bold mb-3">Upgrade To Double Family Membership</h2>
        <p className="mb-4">Current members can upgrade their single family membership at any time.</p>
        <Link to="/upgrade" className="btn btn-primary btn-lg">Upgrade Here</Link>
      </section>

      {/* Testimonial Section */}
      <section className="testimonial p-4 rounded shadow-sm mb-5">
        <blockquote className="blockquote text-center fst-italic mb-3">
          "A testimonial from a client who benefited from your product or service. Testimonials can be a highly effective way of establishing credibility and increasing your company's reputation."
        </blockquote>
        <footer className="blockquote-footer text-center text-muted">Client Name – Location</footer>
      </section>

      {/* Footer Section */}
      <footer className="footer text-center small">
        <h3 className="mb-3">Contact Us</h3>
        <p>P.O. Box 473 Shakopee, MN 55379</p>
        <p>Phone: (612) 261-5786 / (612) 483‑2041 / (612) 644‑3222</p>
        <p>Mon‑Fri By Appointment</p>
        <p><Link to="/contact" className="text-decoration-none">Privacy Policy</Link></p>
        <small className="d-block mt-3">&copy; 2025 All Rights Reserved.</small>
      </footer>
    </div>
  );
};

export default Home;