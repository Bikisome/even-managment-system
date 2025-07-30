const jwt = require('jsonwebtoken');
const { User } = require('../models');

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

/**
 * Middleware to verify JWT token and authenticate user
 */
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ 
        error: 'Access token required',
        message: 'Please provide a valid authentication token' 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const user = await User.findByPk(decoded.userId);

    if (!user) {
      return res.status(401).json({ 
        error: 'Invalid token',
        message: 'User not found or token is invalid' 
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        error: 'Invalid token',
        message: 'The provided token is invalid' 
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        error: 'Token expired',
        message: 'The authentication token has expired' 
      });
    }
    return res.status(500).json({ 
      error: 'Authentication error',
      message: 'An error occurred during authentication' 
    });
  }
};

/**
 * Middleware to check if user is an event organizer
 */
const isOrganizer = async (req, res, next) => {
  try {
    if (req.user.role !== 'organizer' && req.user.role !== 'admin') {
      return res.status(403).json({ 
        error: 'Access denied',
        message: 'Only event organizers can perform this action' 
      });
    }
    next();
  } catch (error) {
    return res.status(500).json({ 
      error: 'Authorization error',
      message: 'An error occurred during authorization' 
    });
  }
};

/**
 * Middleware to check if user is an admin
 */
const isAdmin = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ 
        error: 'Access denied',
        message: 'Only administrators can perform this action' 
      });
    }
    next();
  } catch (error) {
    return res.status(500).json({ 
      error: 'Authorization error',
      message: 'An error occurred during authorization' 
    });
  }
};

/**
 * Middleware to check if user owns the resource or is admin
 */
const isOwnerOrAdmin = async (req, res, next) => {
  try {
    const resourceUserId = parseInt(req.params.userId || req.body.userId);
    
    if (req.user.role === 'admin' || req.user.id === resourceUserId) {
      return next();
    }
    
    return res.status(403).json({ 
      error: 'Access denied',
      message: 'You can only access your own resources' 
    });
  } catch (error) {
    return res.status(500).json({ 
      error: 'Authorization error',
      message: 'An error occurred during authorization' 
    });
  }
};

module.exports = {
  authenticateToken,
  isOrganizer,
  isAdmin,
  isOwnerOrAdmin
}; 