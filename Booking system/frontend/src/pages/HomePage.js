import React from 'react';
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="container">
      {/* Hero Section */}
      <div className="row align-items-center py-5">
        <div className="col-lg-6">
          <h1 className="display-4 fw-bold mb-4">Professional Booking System</h1>
          <p className="lead mb-4">
            Book appointments easily and efficiently with our online booking platform
          </p>
          <div className="d-flex flex-wrap gap-3">
            <button
              className="btn btn-primary btn-lg px-4 py-2"
              onClick={() => navigate('/services')}
            >
              View Services
            </button>
            <button
              className="btn btn-outline-primary btn-lg px-4 py-2"
              onClick={() => navigate('/appointment/new')}
            >
              Book Appointment
            </button>
          </div>
        </div>
        <div className="col-lg-6 mt-4 mt-lg-0">
          <div className="text-center">
            <div className="bg-primary bg-opacity-10 rounded-circle d-inline-flex p-4">
              <span className="display-3 text-primary">📅</span>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="row g-4 mb-5">
        <div className="col-md-4">
          <div className="card h-100 text-center border-0 shadow-sm">
            <div className="card-body p-4">
              <div className="bg-primary bg-opacity-10 rounded-circle d-inline-flex p-3 mb-3">
                <span className="h3 text-primary mb-0">⏱️</span>
              </div>
              <h5 className="card-title fw-bold">Easy Scheduling</h5>
              <p className="card-text text-muted">
                Book appointments at your convenience with our user-friendly interface.
                View available time slots and select the one that works best for you.
              </p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card h-100 text-center border-0 shadow-sm">
            <div className="card-body p-4">
              <div className="bg-success bg-opacity-10 rounded-circle d-inline-flex p-3 mb-3">
                <span className="h3 text-success mb-0">🔒</span>
              </div>
              <h5 className="card-title fw-bold">Secure Payments</h5>
              <p className="card-text text-muted">
                Pay securely online with our integrated payment system.
                Multiple payment options available for your convenience.
              </p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card h-100 text-center border-0 shadow-sm">
            <div className="card-body p-4">
              <div className="bg-info bg-opacity-10 rounded-circle d-inline-flex p-3 mb-3">
                <span className="h3 text-info mb-0">🔔</span>
              </div>
              <h5 className="card-title fw-bold">Instant Notifications</h5>
              <p className="card-text text-muted">
                Receive email and SMS reminders for your appointments.
                Never miss an important appointment again.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="row g-4 mb-5">
        <div className="col-md-3 col-6 text-center">
          <div className="display-4 text-primary fw-bold">500+</div>
          <p className="text-muted">Appointments Booked</p>
        </div>
        <div className="col-md-3 col-6 text-center">
          <div className="display-4 text-success fw-bold">100+</div>
          <p className="text-muted">Happy Customers</p>
        </div>
        <div className="col-md-3 col-6 text-center">
          <div className="display-4 text-info fw-bold">20+</div>
          <p className="text-muted">Services Offered</p>
        </div>
        <div className="col-md-3 col-6 text-center">
          <div className="display-4 text-warning fw-bold">24/7</div>
          <p className="text-muted">Support Available</p>
        </div>
      </div>

      {/* Services Preview */}
      <div className="row mt-5">
        <div className="col-12 text-center">
          <h2 className="mb-4">Our Popular Services</h2>
          <p className="text-muted mb-4">
            We offer a wide range of services to meet your needs
          </p>
          <button
            className="btn btn-primary px-4 py-2"
            onClick={() => navigate('/services')}
          >
            View All Services
          </button>
        </div>
      </div>
    </div>
  );
};

export default HomePage;