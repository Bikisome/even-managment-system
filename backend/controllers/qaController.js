const { QA, Event, User } = require('../models');

/**
 * @swagger
 * /qa:
 *   post:
 *     summary: Ask a question
 *     tags: [Q&A]
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
 *               - question
 *             properties:
 *               eventId:
 *                 type: integer
 *                 description: Event ID
 *               question:
 *                 type: string
 *                 description: Question text
 *     responses:
 *       201:
 *         description: Question asked successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Event not found
 */
const askQuestion = async (req, res) => {
  try {
    const { eventId, question } = req.body;

    // Check if event exists
    const event = await Event.findByPk(eventId);
    if (!event) {
      return res.status(404).json({
        error: 'Event not found',
        message: 'The specified event does not exist'
      });
    }

    const qa = await QA.create({
      eventId,
      userId: req.user.id,
      question,
      status: 'pending'
    });

    res.status(201).json({
      message: 'Question asked successfully',
      qa
    });
  } catch (error) {
    console.error('Ask question error:', error);
    res.status(500).json({
      error: 'Failed to ask question',
      message: 'An error occurred while asking the question'
    });
  }
};

/**
 * @swagger
 * /qa/event/{eventId}:
 *   get:
 *     summary: Get all Q&A for an event
 *     tags: [Q&A]
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Event ID
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, answered, rejected]
 *         description: Filter by status
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
 *         description: Q&A retrieved successfully
 *       404:
 *         description: Event not found
 */
const getEventQA = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { status, page = 1, limit = 10 } = req.query;

    // Check if event exists
    const event = await Event.findByPk(eventId);
    if (!event) {
      return res.status(404).json({
        error: 'Event not found',
        message: 'The specified event does not exist'
      });
    }

    const offset = (page - 1) * limit;
    const whereClause = { eventId };

    if (status) {
      whereClause.status = status;
    }

    const { count, rows: qaList } = await QA.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'questioner',
          attributes: ['id', 'name']
        },
        {
          model: User,
          as: 'answerer',
          attributes: ['id', 'name']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    const totalPages = Math.ceil(count / limit);

    res.json({
      message: 'Q&A retrieved successfully',
      qaList,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalItems: count,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get event Q&A error:', error);
    res.status(500).json({
      error: 'Failed to retrieve Q&A',
      message: 'An error occurred while retrieving Q&A'
    });
  }
};

/**
 * @swagger
 * /qa/{id}:
 *   get:
 *     summary: Get Q&A by ID
 *     tags: [Q&A]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Q&A ID
 *     responses:
 *       200:
 *         description: Q&A retrieved successfully
 *       404:
 *         description: Q&A not found
 */
const getQAById = async (req, res) => {
  try {
    const { id } = req.params;

    const qa = await QA.findByPk(id, {
      include: [
        {
          model: User,
          as: 'questioner',
          attributes: ['id', 'name']
        },
        {
          model: User,
          as: 'answerer',
          attributes: ['id', 'name']
        },
        {
          model: Event,
          attributes: ['id', 'title', 'date']
        }
      ]
    });

    if (!qa) {
      return res.status(404).json({
        error: 'Q&A not found',
        message: 'The specified Q&A does not exist'
      });
    }

    res.json({
      message: 'Q&A retrieved successfully',
      qa
    });
  } catch (error) {
    console.error('Get Q&A by ID error:', error);
    res.status(500).json({
      error: 'Failed to retrieve Q&A',
      message: 'An error occurred while retrieving the Q&A'
    });
  }
};

/**
 * @swagger
 * /qa/{id}/answer:
 *   post:
 *     summary: Answer a question
 *     tags: [Q&A]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Q&A ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - answer
 *             properties:
 *               answer:
 *                 type: string
 *                 description: Answer text
 *     responses:
 *       200:
 *         description: Question answered successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 *       404:
 *         description: Q&A not found
 */
const answerQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const { answer } = req.body;

    const qa = await QA.findByPk(id, {
      include: [{ model: Event }]
    });

    if (!qa) {
      return res.status(404).json({
        error: 'Q&A not found',
        message: 'The specified Q&A does not exist'
      });
    }

    // Check if user is the organizer or admin
    if (qa.Event.organizerId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        error: 'Access denied',
        message: 'Only event organizers can answer questions'
      });
    }

    await qa.update({
      answer,
      answererId: req.user.id,
      status: 'answered',
      answeredAt: new Date()
    });

    res.json({
      message: 'Question answered successfully',
      qa
    });
  } catch (error) {
    console.error('Answer question error:', error);
    res.status(500).json({
      error: 'Failed to answer question',
      message: 'An error occurred while answering the question'
    });
  }
};

/**
 * @swagger
 * /qa/{id}:
 *   put:
 *     summary: Update Q&A
 *     tags: [Q&A]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Q&A ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               question:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [pending, answered, rejected]
 *     responses:
 *       200:
 *         description: Q&A updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 *       404:
 *         description: Q&A not found
 */
const updateQA = async (req, res) => {
  try {
    const { id } = req.params;
    const { question, status } = req.body;

    const qa = await QA.findByPk(id);

    if (!qa) {
      return res.status(404).json({
        error: 'Q&A not found',
        message: 'The specified Q&A does not exist'
      });
    }

    // Check if user can update this Q&A
    if (qa.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You can only update your own questions'
      });
    }

    await qa.update({ question, status });

    res.json({
      message: 'Q&A updated successfully',
      qa
    });
  } catch (error) {
    console.error('Update Q&A error:', error);
    res.status(500).json({
      error: 'Failed to update Q&A',
      message: 'An error occurred while updating the Q&A'
    });
  }
};

/**
 * @swagger
 * /qa/{id}:
 *   delete:
 *     summary: Delete Q&A
 *     tags: [Q&A]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Q&A ID
 *     responses:
 *       200:
 *         description: Q&A deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 *       404:
 *         description: Q&A not found
 */
const deleteQA = async (req, res) => {
  try {
    const { id } = req.params;

    const qa = await QA.findByPk(id);

    if (!qa) {
      return res.status(404).json({
        error: 'Q&A not found',
        message: 'The specified Q&A does not exist'
      });
    }

    // Check if user can delete this Q&A
    if (qa.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You can only delete your own questions'
      });
    }

    await qa.destroy();

    res.json({
      message: 'Q&A deleted successfully'
    });
  } catch (error) {
    console.error('Delete Q&A error:', error);
    res.status(500).json({
      error: 'Failed to delete Q&A',
      message: 'An error occurred while deleting the Q&A'
    });
  }
};

/**
 * @swagger
 * /qa/my-questions:
 *   get:
 *     summary: Get user's questions
 *     tags: [Q&A]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User's questions retrieved successfully
 *       401:
 *         description: Unauthorized
 */
const getMyQuestions = async (req, res) => {
  try {
    const questions = await QA.findAll({
      where: { userId: req.user.id },
      include: [
        {
          model: Event,
          attributes: ['id', 'title', 'date']
        },
        {
          model: User,
          as: 'answerer',
          attributes: ['id', 'name']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json({
      message: 'Your questions retrieved successfully',
      questions
    });
  } catch (error) {
    console.error('Get my questions error:', error);
    res.status(500).json({
      error: 'Failed to retrieve your questions',
      message: 'An error occurred while retrieving your questions'
    });
  }
};

module.exports = {
  askQuestion,
  getEventQA,
  getQAById,
  answerQuestion,
  updateQA,
  deleteQA,
  getMyQuestions
}; 