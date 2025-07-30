const express = require('express');
const router = express.Router();
const ticketController = require('../controllers/ticketController');
const { authenticateToken, isOrganizer } = require('../middlewares/auth');
const { validateTicketCreation } = require('../middlewares/validation');

// Public routes - specific routes first
router.get('/check-availability/:id', ticketController.checkTicketAvailability);
router.get('/event/:eventId', ticketController.getEventTickets);
router.get('/:id', ticketController.getTicketById);

// Protected routes
router.post('/', authenticateToken, isOrganizer, validateTicketCreation, ticketController.createTicket);
router.put('/:id', authenticateToken, ticketController.updateTicket);
router.delete('/:id', authenticateToken, ticketController.deleteTicket);

module.exports = router; 