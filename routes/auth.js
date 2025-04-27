const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

// Get JWT configuration from environment variables
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRY = process.env.JWT_EXPIRY || '24h';

// For simplicity, we're using static credentials
// In a real app, you'd verify against a database
const VALID_USERS = [
  { id: 1, username: 'admin', password: 'admin123' }
];

// Login route to get authentication token
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  
  // Validate request body
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }
  
  // Find user with matching credentials
  const user = VALID_USERS.find(
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