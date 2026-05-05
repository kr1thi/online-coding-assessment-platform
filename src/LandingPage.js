import React from 'react';
import { useNavigate } from 'react-router-dom';

function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="landing-container">
      <nav className="landing-nav">
        <div className="logo">FAME<span>HUB</span></div>
        <div className="nav-links">
          <span>Premium</span>
          <span>Explore</span>
          <span>Product</span>
          <span>Developer</span>
          <button className="sign-in-btn" onClick={() => navigate('/signup')}>Sign In</button>
        </div>
      </nav>

      <main className="landing-main">
        <div className="hero-section">
          <div className="hero-content">
            <img src="https://img.freepik.com/free-vector/digital-device-mockup_53876-89512.jpg" alt="Platform Preview" className="hero-image" />
            <div className="hero-text">
              <h1>A New Way to Learn</h1>
              <p>
                FameHub is the best platform to help you enhance your skills, expand
                your knowledge and prepare for technical interviews.
              </p>
              <button className="create-acc-btn" onClick={() => navigate('/signup')}>
                Create Account &gt;
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default LandingPage;
