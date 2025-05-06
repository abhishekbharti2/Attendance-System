import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './Dashboard.css';

const Dashboard = () => {
  const [records, setRecords] = useState([]);
  const [period, setPeriod] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError('');
      const res = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/attendance`, {
        params: period ? { period } : {},
      });
      setRecords(res.data);
    } catch (err) {
      setError('Failed to fetch attendance records');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [period]);

  useEffect(() => {
    fetchData();
  }, [period, fetchData]);

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h2 className="dashboard-title">Attendance Dashboard</h2>
        <p className="dashboard-subtitle">View and manage employee attendance records</p>
      </div>

      <div className="dashboard-controls">
        <div className="filter-group">
          <label htmlFor="period-filter" className="filter-label">
            Filter by Period:
          </label>
          <select
            id="period-filter"
            className="filter-select"
            onChange={(e) => setPeriod(e.target.value)}
            value={period}
            disabled={isLoading}
          >
            <option value="">All Records</option>
            <option value="day">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
          </select>
        </div>
      </div>

      {isLoading && (
        <div className="loading-indicator">
          <div className="spinner"></div>
          <span>Loading records...</span>
        </div>
      )}

      {error && <div className="error-message">{error}</div>}

      <div className="records-container">
        {records.length === 0 && !isLoading ? (
          <div className="empty-state">
            <svg className="empty-icon" viewBox="0 0 24 24">
              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14z" />
              <path d="M12 18c3.31 0 6-2.69 6-6s-2.69-6-6-6-6 2.69-6 6 2.69 6 6 6zm0-10c2.21 0 4 1.79 4 4s-1.79 4-4 4-4-1.79-4-4 1.79-4 4-4z" />
            </svg>
            <h3>No records found</h3>
            <p>Try adjusting your filters or check back later</p>
          </div>
        ) : (
          <div className="records-grid">
            {records.map((record) => (
              <div key={record._id} className="record-card">
                <div className="record-photo">
                  <img
                    src={`${process.env.REACT_APP_API_BASE_URL}${record.photo}`}
                    alt={`${record.name}'s attendance`}
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/150?text=Photo+Not+Available';
                    }}
                  />
                </div>
                <div className="record-details">
                  <h3 className="record-name">{record.name}</h3>
                  <p className="record-id">ID: {record.empId}</p>
                  <p className="record-time">
                    <svg className="time-icon" viewBox="0 0 24 24">
                      <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z" />
                      <path d="M12.5 7H11v6l5.25 3.15.75-1.23-4.5-2.67z" />
                    </svg>
                    {new Date(record.dateTime).toLocaleString()}
                  </p>
                  <p className="record-location">
                    <svg className="location-icon" viewBox="0 0 24 24">
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                    </svg>
                    {record.location}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;