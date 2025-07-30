const express = require('express');
const router = express.Router();
const qaController = require('../controllers/qaController');
const { authenticateToken, isOrganizer } = require('../middlewares/auth');
const { validateQACreation } = require('../middlewares/validation');

// Public routes
router.get('/event/:eventId', qaController.getEventQA);

// Protected routes - specific routes first
router.get('/my-questions', authenticateToken, qaController.getMyQuestions);
router.get('/:id', qaController.getQAById);
router.post('/', authenticateToken, validateQACreation, qaController.askQuestion);
router.put('/:id', authenticateToken, qaController.updateQA);
router.delete('/:id', authenticateToken, qaController.deleteQA);
router.post('/:id/answer', authenticateToken, isOrganizer, qaController.answerQuestion);

module.exports = router; 