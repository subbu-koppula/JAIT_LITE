require('dotenv').config(); // Loads environment variables from the .env file
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// 1. Connect to our Database
connectDB();

// 2. Initialize the Express application
const app = express();

// 3. Setup Middleware
app.use(cors()); // Allows our frontend to make requests to this backend without CORS errors
app.use(express.json()); // Parses incoming requests with JSON payloads (e.g., req.body)

// 4. Setup Basic Routes
// A simple health check route to verify our API is up and running
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'JAIT Backend is running successfully!' 
  });
});

// 5. Start the Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
