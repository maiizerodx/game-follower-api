const jwt = require('jsonwebtoken');

// Get JWT configuration from environment variables
const JWT_SECRET = process.env.JWT_SECRET;

/**
 * Middleware to authenticate API requests using JWT tokens
 */
const authenticateToken = (req, res, next) => {
  // Get the authorization header
  const authHeader = req.headers['authorization'];
  
  // Extract the token (typically in format "Bearer TOKEN")
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Authentication token required' });
  }

  // Ensure JWT_SECRET is set
  if (!JWT_SECRET) {
    console.error('JWT_SECRET is not defined in environment variables');
    return res.status(500).json({ error: 'Server configuration error' });
  }

  try {
    // Verify the token
    const user = jwt.verify(token, JWT_SECRET);
    
    // Attach user info to request object for use in route handlers
    req.user = user;
    
    // Proceed to the next middleware or route handler
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

module.exports = { authenticateToken };