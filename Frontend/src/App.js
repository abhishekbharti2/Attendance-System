import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import AttendanceForm from './components/AttendanceForm';
import RegisterForm from './components/RegisterForm';
import Dashboard from './components/Dashboard';
import Home from './components/Home';

function App() {
  return (
    <Router>
      <div className="container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<RegisterForm />} />
          <Route path="/attendance" element={<AttendanceForm />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </div>
      <footer>
        <p>
          Developed by <strong>Abhishek Bharti</strong> &nbsp;|&nbsp;
          <span className="company-name">Tryidol Technologies Pvt. Ltd.</span>
        </p>
      </footer>
    </Router>
  );
}

export default App;
