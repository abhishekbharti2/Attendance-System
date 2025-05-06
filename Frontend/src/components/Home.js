import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

const Home = () => {
  return (
    <div className="home-container">
      <div className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">Attendance System</h1>
          <p className="hero-subtitle">Tryidol Technologies Pvt. Ltd.</p>

          <div className="cta-buttons">
            <Link to="/register" className="cta-button primary">
              Register Employee
            </Link>
            <Link to="/attendance" className="cta-button secondary">
              Mark Attendance
            </Link>
          </div>
          <Link to="/dashboard" className="dashboard-button">
            View Attendance
          </Link>
        </div>

        <div className="hero-image">
          <div className="image-placeholder">
            <img 
              src="https://ci3.googleusercontent.com/meips/ADKq_NYHlkehaIONlBscnV3nLcfdVSq26QM1vSexe__Zy-jC8EqVaRtm1GBCdeYXuOrhsoqZCntokHAaj1WsRHeFDZCRL8_FIfyASp-iRVICUU3EnQ=s0-d-e1-ft#https://tryidoltech.com/wp-content/uploads/2025/01/Logo.png" 
              alt="Tryidol Technologies Logo" 
              className="company-logo"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;