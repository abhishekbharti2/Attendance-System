import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './AttendanceForm.css';

const AttendanceForm = () => {
  const [empId, setEmpId] = useState('');
  const [name, setName] = useState('');
  const [location, setLocation] = useState('Fetching location...');
  const [photo, setPhoto] = useState(null);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);

  const [stream, setStream] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setMessage({ text: 'Geolocation not supported by your browser', type: 'error' });
      return;
    }

    setIsLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const data = await response.json();
          const cityName =
            data.address.city || data.address.town || data.address.village || 'Bhopal';
          setLocation(cityName);
        } catch (err) {
          setMessage({ text: 'Failed to fetch city name', type: 'warning' });
          setLocation('Location detected but name unavailable');
        } finally {
          setIsLoading(false);
        }
      },
      (err) => {
        setMessage({ text: 'Location access denied. Using default location.', type: 'warning' });
        setLocation('Bhopal');
        setIsLoading(false);
      }
    );
  }, []);

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [stream]);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
      videoRef.current.play()
        .catch((err) => console.error('Autoplay error:', err));
    }
  }, [stream]);

  const checkEmployee = async () => {
    if (!empId) return;

    try {
      setIsLoading(true);
      const res = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/check-employee/${empId}`);
      setName(res.data.name);
      setMessage({ text: '', type: '' });
    } catch {
      setName('');
      setMessage({ text: 'Employee not found', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' },
      });
      setStream(mediaStream);
      setCameraActive(true);
    } catch (error) {
      setMessage({ text: 'Camera access denied or unavailable', type: 'error' });
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      setCameraActive(false);
    }
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
      setPhoto(blob);
      setPhotoPreview(URL.createObjectURL(blob));
      stopCamera();
    }, 'image/jpeg');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name) {
      setMessage({ text: 'Invalid employee. Please check ID.', type: 'error' });
      return;
    }

    const formData = new FormData();
    formData.append('empId', empId);
    formData.append('name', name);
    formData.append('location', location);
    formData.append('photo', photo);

    try {
      setIsLoading(true);
      await axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/attendance`, formData);
      setMessage({ text: 'Attendance submitted successfully!', type: 'success' });
      setEmpId('');
      setName('');
      setPhoto(null);
      setPhotoPreview(null);
    } catch (err) {
      setMessage({ text: err.response?.data?.error || 'Error submitting attendance', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="attendance-container">
      <div className="attendance-card">
        <div className="attendance-header">
          <h2 className="attendance-title">Mark Your Attendance</h2>
          <p className="attendance-subtitle">Please fill the details to record your attendance</p>
        </div>

        <form className="attendance-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="empId" className="form-label">Employee ID</label>
            <input
              type="text"
              id="empId"
              className="form-input"
              placeholder="Enter your employee ID"
              value={empId}
              onChange={(e) => setEmpId(e.target.value)}
              onBlur={checkEmployee}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="name" className="form-label">Employee Name</label>
            <input
              type="text"
              id="name"
              className="form-input"
              value={name}
              readOnly
              placeholder="Will auto-fill after ID verification"
            />
          </div>

          <div className="form-group">
            <label htmlFor="location" className="form-label">Current Location</label>
            <input
              type="text"
              id="location"
              className="form-input"
              value={isLoading ? 'Detecting location...' : location}
              readOnly
            />
          </div>

          <div className="form-group">
            <label className="form-label">Employee Photo</label>
            <div className="photo-container">
              {photoPreview ? (
                <div className="photo-preview">
                  <img src={photoPreview} alt="Captured" className="preview-image" />
                  <button 
                    type="button" 
                    className="photo-action-button retake-button"
                    onClick={() => {
                      setPhotoPreview(null);
                      setPhoto(null);
                      startCamera();
                    }}
                  >
                    Retake Photo
                  </button>
                </div>
              ) : (
                <div className="camera-container">
                  {cameraActive ? (
                    <>
                      <video 
                        ref={videoRef} 
                        className="camera-preview" 
                        autoPlay 
                        muted 
                        playsInline 
                      />
                      <button 
                        type="button" 
                        className="photo-action-button capture-button"
                        onClick={capturePhoto}
                      >
                        Capture Photo
                      </button>
                    </>
                  ) : (
                    <button 
                      type="button" 
                      className="photo-action-button start-camera-button"
                      onClick={startCamera}
                    >
                      Start Camera
                    </button>
                  )}
                  <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>
                </div>
              )}
            </div>
          </div>

          <button 
            type="submit" 
            className="submit-button" 
            disabled={isLoading || !photo}
          >
            {isLoading ? (
              <>
                <span className="button-spinner"></span>
                Processing...
              </>
            ) : (
              'Submit Attendance'
            )}
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

export default AttendanceForm;