import React from 'react';
import { useNavigate } from 'react-router-dom';

const Membership = () => {
  const navigate = useNavigate();

  const onSingleApplication = () => {
    navigate('/single-application');
  };

  const onDoubleApplication = () => {
    navigate('/double-application');
  };

  return (
    <div className="container py-5">
      {/* Header */}
      <div className="text-center mb-5">
        <h2 className="fw-bold text-gradient display-5 mb-3">
          <i className="fas fa-id-card-alt me-2"></i> 2025 Membership Registration
        </h2>
        <p className="lead text-dark">Pamoja Kenya is more than just giving — it's building a united community.</p>
        <p className="text-muted">
          Enrollment opens on <span className="fw-semibold text-gradient">January 1st</span> and closes at
          <span className="fw-semibold text-danger"> midnight on January 24th</span>.
        </p>
      </div>

      {/* Process Card */}
      <div className="card p-4 rounded-4 shadow">
        <h3 className="fw-bold mb-4 text-primary">
          <i className="fas fa-stream me-2"></i> Two-Step Membership Process
        </h3>

        <ol className="ps-3">
          {/* Step 1 */}
          <li className="mb-4">
            <strong className="text-primary">Step 1:</strong> Read the By-laws / Constitution
            <a
              href="/assets/docs/PAMOJA-KENYA-BY-LAW-online.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline-success btn-sm ms-2"
            >
              <i className="fas fa-book-open me-1"></i> View Document
            </a>
          </li>

          {/* Step 2 */}
          <li className="mb-3">
            <strong className="text-primary">Step 2:</strong> Choose your membership type and submit your application:
            <div className="mt-3">
              <button className="btn btn-primary me-3 shadow-sm" onClick={onSingleApplication}>
                <i className="fas fa-user me-2"></i> Single Family Application
              </button>
              <button className="btn btn-outline-primary shadow-sm" onClick={onDoubleApplication}>
                <i className="fas fa-users me-2"></i> Double Family Application
              </button>
            </div>
          </li>
        </ol>

        {/* Info Alert */}
        <div className="alert alert-info mt-5 shadow-sm" role="alert">
          <i className="fas fa-info-circle me-2"></i>
          Once your application and initial payment are received, you'll get a confirmation email. Your membership will be activated upon approval.
        </div>
      </div>
    </div>
  );
};

export default Membership;