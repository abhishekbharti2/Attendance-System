import React, { useEffect, useRef, useState } from 'react';
import Webcam from 'react-webcam';
import axios from 'axios';

const AttendanceForm = () => {
  const webcamRef = useRef(null);
  const [location, setLocation] = useState('');
  const [empId, setEmpId] = useState('');
  const [name, setName] = useState('');
  const [photo, setPhoto] = useState(null);
  const [message, setMessage] = useState('');
  const [cameraError, setCameraError] = useState('');

  const capturePhoto = () => { 
    if (!webcamRef.current) return;
    const screenshot = webcamRef.current.getScreenshot();
    const blob = dataURItoBlob(screenshot);
    setPhoto(new File([blob], 'photo.jpg', { type: 'image/jpeg' }));
  };

  const dataURItoBlob = (dataURI) => {
    const byteString = atob(dataURI.split(',')[1]);
    const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) ia[i] = byteString.charCodeAt(i);
    return new Blob([ab], { type: mimeString });
  };

  const fetchLocation = async () => {
    try {
      const res = await axios.get('https://ipapi.co/json/');
      setLocation(`${res.data.city}, ${res.data.region}`);
    } catch {
      setLocation('Unknown');
    }
  };

  useEffect(() => {
    fetchLocation();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!photo) return setMessage('Please capture a photo first.');

    try {
      const validateRes = await axios.get(`http://localhost:5000/api/users/validate/${empId}`);
      if (!validateRes.data.exists) return setMessage('Emp ID not registered.');

      const formData = new FormData();
      formData.append('empId', empId);
      formData.append('name', name);
      formData.append('location', location);
      formData.append('photo', photo);

      await axios.post('http://localhost:5000/api/attendance', formData);
      setMessage('Attendance submitted successfully!');
    } catch (err) {
      console.error(err);
      setMessage('Submission failed.');
    }
  };

  return (
    <div className="container">
      <h2>Employee Attendance</h2>
      <form onSubmit={handleSubmit}>
        <input placeholder="Emp ID" value={empId} onChange={e => setEmpId(e.target.value)} required />
        <input placeholder="Name" value={name} onChange={e => setName(e.target.value)} required />
        <input value={location} readOnly />
        <input value={new Date().toLocaleString()} readOnly />

        {cameraError ? (
          <p style={{ color: 'red' }}>Error accessing camera: {cameraError}</p>
        ) : (
          <Webcam
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            width="100%"
            onUserMediaError={(err) => setCameraError(err.message)}
          />
        )}

        <button type="button" onClick={capturePhoto} disabled={cameraError}>
          Capture Photo
        </button>

        <button type="submit">Submit Attendance</button>
      </form>
      <p>{message}</p>
    </div>
  );
};

export default AttendanceForm;
