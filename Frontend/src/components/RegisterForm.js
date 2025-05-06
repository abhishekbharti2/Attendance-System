import React, { useState } from 'react';
import axios from 'axios';
import './RegisterForm.css'; // We'll create this CSS file

const RegisterForm = () => {
  const [empId, setEmpId] = useState('');
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/register`, { empId, name });
      setMessage({ text: res.data.message, type: 'success' });
      setEmpId('');
      setName('');
    } catch (err) {
      setMessage({ text: err.response?.data?.error || 'Error occurred', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="register-container">
      <div className="register-form">
        <h2 className="register-title">Register Employee</h2>
        <p className="register-subtitle">Admin Portal</p>
        
        <form onSubmit={handleRegister} className="form">
          <div className="form-group">
            <label htmlFor="empId" className="form-label">Employee ID</label>
            <input 
              type="text" 
              id="empId"
              placeholder="Enter employee ID" 
              value={empId} 
              onChange={e => setEmpId(e.target.value)} 
              className="form-input"
              required 
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="name" className="form-label">Full Name</label>
            <input 
              type="text" 
              id="name"
              placeholder="Enter employee name" 
              value={name} 
              onChange={e => setName(e.target.value)} 
              className="form-input"
              required 
            />
          </div>
          
          <button 
            type="submit" 
            className="submit-button"
            disabled={isLoading}
          >
            {isLoading ? 'Registering...' : 'Register'}
          </button>
          
          {message.text && (
            <div className={`message ${message.type}`}>
              {message.text}
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default RegisterForm;