import React from 'react';
import { Link } from 'react-router-dom';

const About = () => {
  return (
    <div>
      {/* Hero / About Header */}
      <div className="hero-section text-center text-white py-5" style={{background: 'linear-gradient(135deg, #0f2027, #203a43, #2c5364)'}}>
        <div className="container">
          <h1 className="display-4 fw-bold mb-3">
            <i className="fas fa-hands-helping me-2"></i> Pamoja Kenya MN
          </h1>
          <p className="lead text-light">
            <span className="text-warning">Taking the Lead at the Time of Need</span><br />
            Supporting families with funeral, burial, and other unforeseen expenses—regardless of where your loved ones live.
          </p>
        </div>
      </div>

      {/* Who We Are Section */}
      <div className="section-content py-5 bg-light">
        <div className="container">
          <div className="row justify-content-center mb-5">
            <div className="col-lg-8 text-center">
              <h2 className="fw-bold mb-3 text-primary">
                <i className="fas fa-users me-2"></i> Who We Are
              </h2>
              <p className="lead text-secondary">
                Pamoja Kenya MN is a nonprofit initiative supporting the Kenyan diaspora and their families during times of loss.
                We help ease the financial burden of unexpected funerals and related emergencies—because no one should face tragedy alone.
              </p>
            </div>
          </div>

          {/* Mission and Why Us */}
          <div className="row g-5">
            <div className="col-md-6">
              <div className="card border-start border-5 border-success rounded-4 p-4 shadow-lg">
                <h5 className="fw-bold text-success mb-2">
                  <i className="fas fa-bullseye me-2"></i> Our Mission
                </h5>
                <p className="mb-0 text-dark">
                  To provide timely, reliable, and compassionate financial support for funeral arrangements and related costs to Kenyan families living in Minnesota and beyond.
                </p>
              </div>
            </div>
            <div className="col-md-6">
              <div className="card border-start border-5 border-danger rounded-4 p-4 shadow-lg">
                <h5 className="fw-bold text-danger mb-2">
                  <i className="fas fa-hands-holding me-2"></i> Why Pamoja Kenya?
                </h5>
                <p className="mb-0 text-dark">
                  No family should face a crisis alone. We unite the community to support one another in the most difficult times—because unity is strength.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="py-5 text-white text-center bg-primary">
        <div className="container">
          <h3 className="mb-4">
            <i className="fas fa-user-plus me-2 text-light"></i>
            <span className="fw-semibold">Ready to Join the Pamoja Kenya Community?</span>
          </h3>
          <Link to="/membership" className="btn btn-light btn-lg px-5 fw-bold shadow">Join Now</Link>
        </div>
      </div>
    </div>
  );
};

export default About;