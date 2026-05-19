const express = require('express');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./config/db');

const app = express();

// Connect to MongoDB
connectDB();

// Global Middlewares
app.use(cors());
app.use(express.json());

// API Base Root Route
app.get('/', (req, res) => {
    res.send('📁 Office-Home Share Backend API is running perfectly!');
});

// API Routes Setup
app.use('/api/auth', require('./routes/auth'));
app.use('/api/documents', require('./routes/documents'));

// Export app for Vercel / Render runtime compatibility
module.exports = app;

const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => console.log(`🚀 Server securely running on port ${PORT}`));
}