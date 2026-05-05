const jwt = require('jsonwebtoken');

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }

    // Check if this is a guest user (guest IDs start with 'guest_')
    const isGuest = decoded.userId.startsWith('guest_');
    
    req.user = {
      userId: decoded.userId,
      isGuest
    };

    // For guest users, we need to extract username from a different source
    // This will be handled in the specific routes that need guest usernames
    next();
  });
};

module.exports = { authenticateToken };
