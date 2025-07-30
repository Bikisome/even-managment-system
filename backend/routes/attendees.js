const express = require('express');
const router = express.Router();
const attendeeController = require('../controllers/attendeeController');
const { authenticateToken } = require('../middlewares/auth');
const { validateAttendeeRegistration } = require('../middlewares/validation');

// Protected routes - specific routes first
router.post('/register', authenticateToken, validateAttendeeRegistration, attendeeController.registerForEvent);
router.get('/my-registrations', authenticateToken, attendeeController.getMyRegistrations);
router.get('/event/:eventId', authenticateToken, attendeeController.getEventAttendees);
router.get('/:id', authenticateToken, attendeeController.getRegistrationById);
router.put('/:id', authenticateToken, attendeeController.updateRegistration);
router.delete('/:id', authenticateToken, attendeeController.cancelRegistration);

module.exports = router; 