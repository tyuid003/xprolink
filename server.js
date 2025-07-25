// server/server.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors'); // ตรวจสอบว่ามี cors
const apiRoutes = require('./routes/apiRoutes');
const goRoutes = require('./routes/goRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
// *** แก้ไขการตั้งค่า CORS ตรงนี้ ***
app.use(cors({
  origin: 'https://xprolink.netlify.app' // อนุญาตเฉพาะ Frontend ของคุณบน Netlify
}));
app.use(express.json());

console.log('DB_CONNECTION_STRING:', process.env.DB_CONNECTION_STRING);

// Connect to MongoDB
mongoose.connect(process.env.DB_CONNECTION_STRING)
  .then(() => console.log('MongoDB connected successfully!'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/redirects', apiRoutes);
app.use('/go', goRoutes);

app.get('/', (req, res) => {
    res.send('Redirect Link Manager Backend API is running!');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});