const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const { authenticateToken, isOrganizer } = require('../middlewares/auth');
const { validateEventCreation, validateEventUpdate, validateSearchQuery } = require('../middlewares/validation');

// Public routes
router.get('/', validateSearchQuery, eventController.getEvents);

// Protected routes - specific routes first
router.get('/my-events', authenticateToken, eventController.getMyEvents);
router.get('/:id/attendees', authenticateToken, eventController.getEventAttendees);
router.get('/:id', eventController.getEventById);

router.post('/', authenticateToken, isOrganizer, validateEventCreation, eventController.createEvent);
router.put('/:id', authenticateToken, validateEventUpdate, eventController.updateEvent);
router.delete('/:id', authenticateToken, eventController.deleteEvent);

module.exports = router; 