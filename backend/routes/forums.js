const express = require('express');
const router = express.Router();
const forumController = require('../controllers/forumController');
const { authenticateToken } = require('../middlewares/auth');
const { validateForumPost } = require('../middlewares/validation');

// Public routes
router.get('/event/:eventId', forumController.getEventForumPosts);

// Protected routes - specific routes first
router.get('/my-posts', authenticateToken, forumController.getMyForumPosts);
router.get('/:id', forumController.getForumPostById);
router.post('/', authenticateToken, validateForumPost, forumController.createForumPost);
router.put('/:id', authenticateToken, forumController.updateForumPost);
router.delete('/:id', authenticateToken, forumController.deleteForumPost);

module.exports = router; 