const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const connectDB = require('./config/db');

const app = express();

// Connect to MongoDB Database
connectDB();

// Global Middlewares
app.use(cors());
app.use(express.json());

// Serve PDF Uploads folder statically so frontend can open them
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes Setup
app.use('/api/auth', require('./routes/auth'));
app.use('/api/documents', require('./routes/documents'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server securely running on port ${PORT}`);
});