require('dotenv').config(); // Load environment variables from .env

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');
const axios = require('axios');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}
app.use('/uploads', express.static(uploadDir));

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ MongoDB connected'))
.catch(err => console.error('❌ MongoDB connection error:', err));

// Models
const User = mongoose.model('User', {
  empId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const Attendance = mongoose.model('Attendance', {
  empId: { type: String, required: true },
  name: { type: String, required: true },
  location: { type: String, required: true },
  dateTime: { type: Date, required: true },
  photo: { type: String, required: true }
});

// Multer setup for image upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

// Routes

// Register user (admin only)
app.post('/api/register', async (req, res) => {
  try {
    const { empId, name } = req.body;

    if (!empId || !name) {
      return res.status(400).json({ error: 'Employee ID and Name are required' });
    }

    const existingUser = await User.findOne({ empId });
    if (existingUser) {
      return res.status(400).json({ error: 'Employee ID already exists' });
    }

    const user = new User({ empId, name });
    await user.save();
    res.status(201).json({ message: 'User registered successfully', user });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Check if employee exists
app.get('/api/check-employee/:empId', async (req, res) => {
  try {
    const user = await User.findOne({ empId: req.params.empId });
    if (!user) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    res.json({ name: user.name });
  } catch (error) {
    console.error('Check employee error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get location from IP
app.get('/api/location', async (req, res) => {
  try {
    const ip =
      req.headers['x-forwarded-for']?.split(',')[0] ||
      req.connection.remoteAddress ||
      req.socket.remoteAddress;

    const response = await axios.get(`http://ip-api.com/json/${ip}`);
    const city = response.data.city || '';
    const country = response.data.country || '';

    res.json({ location: `${city}, ${country}`.trim() });
  } catch (error) {
    console.error('Location fetch error:', error);
    res.json({ location: 'Location unavailable' });
  }
});

// Submit attendance
app.post('/api/attendance', upload.single('photo'), async (req, res) => {
  try {
    const { empId, name, location } = req.body;

    if (!empId || !name || !location || !req.file) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const user = await User.findOne({ empId });
    if (!user) {
      return res.status(400).json({ error: 'Employee not registered' });
    }

    const attendance = new Attendance({
      empId,
      name,
      location,
      dateTime: new Date(),
      photo: `/uploads/${req.file.filename}`
    });

    await attendance.save();
    res.status(201).json({ message: 'Attendance recorded successfully' });
  } catch (error) {
    console.error('Attendance error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get attendance records
app.get('/api/attendance', async (req, res) => {
  try {
    const { period } = req.query;
    let filter = {};
    const now = new Date();

    switch (period) {
      case 'day':
        filter.dateTime = { $gte: new Date(now.setHours(0, 0, 0, 0)) };
        break;
      case 'week':
        const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
        startOfWeek.setHours(0, 0, 0, 0);
        filter.dateTime = { $gte: startOfWeek };
        break;
      case 'month':
        filter.dateTime = { $gte: new Date(now.getFullYear(), now.getMonth(), 1) };
        break;
      case 'year':
        filter.dateTime = { $gte: new Date(now.getFullYear(), 0, 1) };
        break;
    }

    const records = await Attendance.find(filter).sort({ dateTime: -1 });
    res.json(records);
  } catch (error) {
    console.error('Attendance fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Error middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Something went wrong' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});