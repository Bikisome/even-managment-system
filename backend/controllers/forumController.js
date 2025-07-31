const { Forum, Event, User } = require('../models');

/**
 * @swagger
 * /forums:
 *   post:
 *     summary: Create a new forum post
 *     tags: [Forums]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - eventId
 *               - content
 *             properties:
 *               eventId:
 *                 type: integer
 *                 description: Event ID
 *               content:
 *                 type: string
 *                 description: Post content
 *     responses:
 *       201:
 *         description: Forum post created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Event not found
 */
const createForumPost = async (req, res) => {
  try {
    const { eventId, content } = req.body;

    // Check if event exists
    const event = await Event.findByPk(eventId);
    if (!event) {
      return res.status(404).json({
        error: 'Event not found',
        message: 'The specified event does not exist'
      });
    }

    const forumPost = await Forum.create({
      eventId,
      userId: req.user.id,
      content
    });

    res.status(201).json({
      message: 'Forum post created successfully',
      forumPost
    });
  } catch (error) {
    console.error('Create forum post error:', error);
    res.status(500).json({
      error: 'Failed to create forum post',
      message: 'An error occurred while creating the forum post'
    });
  }
};

/**
 * @swagger
 * /forums/event/{eventId}:
 *   get:
 *     summary: Get all forum posts for an event
 *     tags: [Forums]
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Event ID
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: Forum posts retrieved successfully
 *       404:
 *         description: Event not found
 */
const getEventForumPosts = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    // Check if event exists
    const event = await Event.findByPk(eventId);
    if (!event) {
      return res.status(404).json({
        error: 'Event not found',
        message: 'The specified event does not exist'
      });
    }

    const offset = (page - 1) * limit;

    const { count, rows: forumPosts } = await Forum.findAndCountAll({
      where: { eventId },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    const totalPages = Math.ceil(count / limit);

    res.json({
      message: 'Forum posts retrieved successfully',
      forumPosts,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalItems: count,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get event forum posts error:', error);
    res.status(500).json({
      error: 'Failed to retrieve forum posts',
      message: 'An error occurred while retrieving forum posts'
    });
  }
};

/**
 * @swagger
 * /forums/{id}:
 *   get:
 *     summary: Get forum post by ID
 *     tags: [Forums]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Forum post ID
 *     responses:
 *       200:
 *         description: Forum post retrieved successfully
 *       404:
 *         description: Forum post not found
 */
const getForumPostById = async (req, res) => {
  try {
    const { id } = req.params;

    const forumPost = await Forum.findByPk(id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name']
        },
        {
          model: Event,
          as: 'event',
          attributes: ['id', 'title', 'date']
        }
      ]
    });

    if (!forumPost) {
      return res.status(404).json({
        error: 'Forum post not found',
        message: 'The specified forum post does not exist'
      });
    }

    res.json({
      message: 'Forum post retrieved successfully',
      forumPost
    });
  } catch (error) {
    console.error('Get forum post by ID error:', error);
    res.status(500).json({
      error: 'Failed to retrieve forum post',
      message: 'An error occurred while retrieving the forum post'
    });
  }
};

/**
 * @swagger
 * /forums/{id}:
 *   put:
 *     summary: Update forum post
 *     tags: [Forums]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Forum post ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *     responses:
 *       200:
 *         description: Forum post updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 *       404:
 *         description: Forum post not found
 */
const updateForumPost = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    const forumPost = await Forum.findByPk(id);

    if (!forumPost) {
      return res.status(404).json({
        error: 'Forum post not found',
        message: 'The specified forum post does not exist'
      });
    }

    // Check if user can update this post
    if (forumPost.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You can only update your own forum posts'
      });
    }

    await forumPost.update({ content });

    res.json({
      message: 'Forum post updated successfully',
      forumPost
    });
  } catch (error) {
    console.error('Update forum post error:', error);
    res.status(500).json({
      error: 'Failed to update forum post',
      message: 'An error occurred while updating the forum post'
    });
  }
};

/**
 * @swagger
 * /forums/{id}:
 *   delete:
 *     summary: Delete forum post
 *     tags: [Forums]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Forum post ID
 *     responses:
 *       200:
 *         description: Forum post deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 *       404:
 *         description: Forum post not found
 */
const deleteForumPost = async (req, res) => {
  try {
    const { id } = req.params;

    const forumPost = await Forum.findByPk(id);

    if (!forumPost) {
      return res.status(404).json({
        error: 'Forum post not found',
        message: 'The specified forum post does not exist'
      });
    }

    // Check if user can delete this post
    if (forumPost.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You can only delete your own forum posts'
      });
    }

    await forumPost.destroy();

    res.json({
      message: 'Forum post deleted successfully'
    });
  } catch (error) {
    console.error('Delete forum post error:', error);
    res.status(500).json({
      error: 'Failed to delete forum post',
      message: 'An error occurred while deleting the forum post'
    });
  }
};

/**
 * @swagger
 * /forums/my-posts:
 *   get:
 *     summary: Get user's forum posts
 *     tags: [Forums]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User's forum posts retrieved successfully
 *       401:
 *         description: Unauthorized
 */
const getMyForumPosts = async (req, res) => {
  try {
    const forumPosts = await Forum.findAll({
      where: { userId: req.user.id },
      include: [
        {
          model: Event,
          as: 'event',
          attributes: ['id', 'title', 'date']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json({
      message: 'Your forum posts retrieved successfully',
      forumPosts
    });
  } catch (error) {
    console.error('Get my forum posts error:', error);
    res.status(500).json({
      error: 'Failed to retrieve your forum posts',
      message: 'An error occurred while retrieving your forum posts'
    });
  }
};

/**
 * @swagger
 * /forums/{id}/reply:
 *   post:
 *     summary: Reply to a forum post
 *     tags: [Forums]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Parent forum post ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *                 description: Reply content
 *     responses:
 *       201:
 *         description: Reply created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Parent post not found
 */
const createReply = async (req, res) => {
  try {
    const { id: parentId } = req.params;
    const { content } = req.body;

    // Check if parent post exists
    const parentPost = await Forum.findByPk(parentId);
    if (!parentPost) {
      return res.status(404).json({
        error: 'Parent post not found',
        message: 'The forum post you are trying to reply to does not exist'
      });
    }

    // Create reply with same eventId as parent
    // Note: This assumes you will add parentId to the Forum model
    const reply = await Forum.create({
      eventId: parentPost.eventId,
      userId: req.user.id,
      content,
      parentId: parentId
    });

    res.status(201).json({
      message: 'Reply created successfully',
      reply: {
        id: reply.id,
        content: reply.content,
        parentId: reply.parentId,
        createdAt: reply.createdAt
      }
    });
  } catch (error) {
    console.error('Create reply error:', error);
    res.status(500).json({
      error: 'Failed to create reply',
      message: 'An error occurred while creating the reply'
    });
  }
};

module.exports = {
  createForumPost,
  getEventForumPosts,
  getForumPostById,
  updateForumPost,
  deleteForumPost,
  getMyForumPosts,
  createReply
}; 