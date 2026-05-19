const mongoose = require('mongoose');

const connectDB = async () => {
    if (!process.env.MONGO_URI) {
        console.error('❌ CRITICAL ERROR: process.env.MONGO_URI is undefined!');
        process.exit(1);
    }
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ MongoDB Database Connected Successfully');
    } catch (err) {
        console.error('❌ Database Connection Error:', err.message);
        process.exit(1); 
    }
};

module.exports = connectDB;