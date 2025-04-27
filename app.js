// Load environment variables from .env file
require('dotenv').config();

const express = require('express');
const app = express();

// Import routes
const followersRouter = require('./routes/followers');
const authRouter = require('./routes/auth');

// Apply middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Set up routes
app.use('/api/auth', authRouter);
app.use('/api/followers', followersRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
