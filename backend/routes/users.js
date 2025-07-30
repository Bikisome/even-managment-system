const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateToken, isAdmin } = require('../middlewares/auth');

// Admin only routes
router.get('/', authenticateToken, isAdmin, userController.getAllUsers);

// Protected routes - specific routes first
router.get('/:id/events', authenticateToken, userController.getUserEvents);
router.get('/:id/registrations', authenticateToken, userController.getUserRegistrations);
router.get('/:id', authenticateToken, userController.getUserById);
router.put('/:id', authenticateToken, userController.updateUser);
router.delete('/:id', authenticateToken, userController.deleteUser);

module.exports = router; 