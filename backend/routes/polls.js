const express = require('express');
const router = express.Router();
const pollController = require('../controllers/pollController');
const { authenticateToken, isOrganizer } = require('../middlewares/auth');
const { validatePollCreation } = require('../middlewares/validation');

// Public routes
router.get('/event/:eventId', pollController.getEventPolls);
router.get('/:id', pollController.getPollById);
router.get('/:id/results', pollController.getPollResults);

// Protected routes
router.post('/', authenticateToken, isOrganizer, validatePollCreation, pollController.createPoll);
router.put('/:id', authenticateToken, pollController.updatePoll);
router.delete('/:id', authenticateToken, pollController.deletePoll);
router.post('/:id/vote', authenticateToken, pollController.voteOnPoll);

module.exports = router; 