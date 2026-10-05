import 'dotenv/config'; // Loads environment variables from the .env file
import express from 'express';
import cors from 'cors';
import connectDB from './config/db.js'; // Note the .js extension in ES6 modules!
import authRoutes from './routes/authRoutes.js';
import projectRoutes from './routes/projectRoutes.js';
import issueRoutes from './routes/issueRoutes.js';

// 1. Connect to our Database
connectDB();

// 2. Initialize the Express application
const app = express();

// 3. Setup Middleware
app.use(cors()); // Allows our frontend to make requests to this backend without CORS errors
app.use(express.json()); // Parses incoming requests with JSON payloads (e.g., req.body)

// 4. Setup Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/issues', issueRoutes);
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
