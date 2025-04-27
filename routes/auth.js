const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

// Get JWT configuration from environment variables
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRY = process.env.JWT_EXPIRY || '24h';

// Get user credentials from environment variables
const getValidUsers = () => {
  // Make sure we have the required environment variables
  if (!process.env.ADMIN_USERNAME || !process.env.ADMIN_PASSWORD) {
    console.error('Admin credentials are not defined in environment variables');
    return [];
  }
  
  return [
    { 
      id: 1, 
      username: process.env.ADMIN_USERNAME, 
      password: process.env.ADMIN_PASSWORD 
    }
  ];
};

// Login route to get authentication token
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  
  // Validate request body
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }
  
  // Get valid users from environment variables
  const validUsers = getValidUsers();
  
  if (validUsers.length === 0) {
    return res.status(500).json({ error: 'Server configuration error' });
  }
  
  // Find user with matching credentials
  const user = validUsers.find(
    u => u.username === username && u.password === password
  );
  
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  
  // Ensure JWT_SECRET is set
  if (!JWT_SECRET) {
    console.error('JWT_SECRET is not defined in environment variables');
    return res.status(500).json({ error: 'Server configuration error' });
  }
  
  // Generate JWT token with expiry from environment variables
  const token = jwt.sign(
    { id: user.id, username: user.username },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRY }
  );
  
  // Return the token
  res.json({ token });
});

module.exports = router;