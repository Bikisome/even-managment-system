const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { authenticateToken, isOrganizer } = require('../middlewares/auth');

// Protected routes - specific routes first
router.post('/', authenticateToken, isOrganizer, notificationController.createNotification);
router.get('/', authenticateToken, notificationController.getMyNotifications);
router.get('/unread-count', authenticateToken, notificationController.getUnreadCount);
router.put('/read-all', authenticateToken, notificationController.markAllAsRead);
router.get('/:id', authenticateToken, notificationController.getNotificationById);
router.put('/:id/read', authenticateToken, notificationController.markAsRead);
router.delete('/:id', authenticateToken, notificationController.deleteNotification);

module.exports = router; 