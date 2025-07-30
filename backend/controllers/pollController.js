const { Poll, Event, User } = require('../models');

/**
 * @swagger
 * /polls:
 *   post:
 *     summary: Create a new poll
 *     tags: [Polls]
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
 *               - options
 *             properties:
 *               eventId:
 *                 type: integer
 *                 description: Event ID
 *               question:
 *                 type: string
 *                 description: Poll question
 *               options:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Poll options
 *     responses:
 *       201:
 *         description: Poll created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Event not found
 */
const createPoll = async (req, res) => {
  try {
    const { eventId, question, options } = req.body;

    // Check if event exists
    const event = await Event.findByPk(eventId);
    if (!event) {
      return res.status(404).json({
        error: 'Event not found',
        message: 'The specified event does not exist'
      });
    }

    // Check if user is the organizer or admin
    if (event.organizerId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        error: 'Access denied',
        message: 'Only event organizers can create polls'
      });
    }

    const poll = await Poll.create({
      eventId,
      userId: req.user.id,
      question,
      options: JSON.stringify(options),
      isActive: true
    });

    res.status(201).json({
      message: 'Poll created successfully',
      poll: {
        ...poll.toJSON(),
        options: JSON.parse(poll.options)
      }
    });
  } catch (error) {
    console.error('Create poll error:', error);
    res.status(500).json({
      error: 'Failed to create poll',
      message: 'An error occurred while creating the poll'
    });
  }
};

/**
 * @swagger
 * /polls/event/{eventId}:
 *   get:
 *     summary: Get all polls for an event
 *     tags: [Polls]
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Event ID
 *     responses:
 *       200:
 *         description: Polls retrieved successfully
 *       404:
 *         description: Event not found
 */
const getEventPolls = async (req, res) => {
  try {
    const { eventId } = req.params;

    // Check if event exists
    const event = await Event.findByPk(eventId);
    if (!event) {
      return res.status(404).json({
        error: 'Event not found',
        message: 'The specified event does not exist'
      });
    }

    const polls = await Poll.findAll({
      where: { eventId },
      include: [
        {
          model: User,
          attributes: ['id', 'name']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    // Parse options for each poll
    const pollsWithParsedOptions = polls.map(poll => ({
      ...poll.toJSON(),
      options: JSON.parse(poll.options)
    }));

    res.json({
      message: 'Polls retrieved successfully',
      polls: pollsWithParsedOptions
    });
  } catch (error) {
    console.error('Get event polls error:', error);
    res.status(500).json({
      error: 'Failed to retrieve polls',
      message: 'An error occurred while retrieving polls'
    });
  }
};

/**
 * @swagger
 * /polls/{id}:
 *   get:
 *     summary: Get poll by ID
 *     tags: [Polls]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Poll ID
 *     responses:
 *       200:
 *         description: Poll retrieved successfully
 *       404:
 *         description: Poll not found
 */
const getPollById = async (req, res) => {
  try {
    const { id } = req.params;

    const poll = await Poll.findByPk(id, {
      include: [
        {
          model: User,
          attributes: ['id', 'name']
        },
        {
          model: Event,
          attributes: ['id', 'title', 'date']
        }
      ]
    });

    if (!poll) {
      return res.status(404).json({
        error: 'Poll not found',
        message: 'The specified poll does not exist'
      });
    }

    res.json({
      message: 'Poll retrieved successfully',
      poll: {
        ...poll.toJSON(),
        options: JSON.parse(poll.options)
      }
    });
  } catch (error) {
    console.error('Get poll by ID error:', error);
    res.status(500).json({
      error: 'Failed to retrieve poll',
      message: 'An error occurred while retrieving the poll'
    });
  }
};

/**
 * @swagger
 * /polls/{id}/vote:
 *   post:
 *     summary: Vote on a poll
 *     tags: [Polls]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Poll ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - selectedOption
 *             properties:
 *               selectedOption:
 *                 type: string
 *                 description: Selected option
 *     responses:
 *       200:
 *         description: Vote recorded successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Poll not found
 *       409:
 *         description: Already voted
 */
const voteOnPoll = async (req, res) => {
  try {
    const { id } = req.params;
    const { selectedOption } = req.body;

    const poll = await Poll.findByPk(id);
    if (!poll) {
      return res.status(404).json({
        error: 'Poll not found',
        message: 'The specified poll does not exist'
      });
    }

    if (!poll.isActive) {
      return res.status(400).json({
        error: 'Poll is not active',
        message: 'This poll is no longer accepting votes'
      });
    }

    const options = JSON.parse(poll.options);
    if (!options.includes(selectedOption)) {
      return res.status(400).json({
        error: 'Invalid option',
        message: 'The selected option is not valid for this poll'
      });
    }

    // Check if user has already voted (this would need a separate votes table)
    // For now, we'll just record the vote in the poll
    const votes = JSON.parse(poll.votes || '{}');
    if (votes[req.user.id]) {
      return res.status(409).json({
        error: 'Already voted',
        message: 'You have already voted on this poll'
      });
    }

    // Record the vote
    votes[req.user.id] = selectedOption;
    await poll.update({ votes: JSON.stringify(votes) });

    res.json({
      message: 'Vote recorded successfully',
      poll: {
        ...poll.toJSON(),
        options: JSON.parse(poll.options),
        votes: JSON.parse(poll.votes)
      }
    });
  } catch (error) {
    console.error('Vote on poll error:', error);
    res.status(500).json({
      error: 'Failed to record vote',
      message: 'An error occurred while recording the vote'
    });
  }
};

/**
 * @swagger
 * /polls/{id}:
 *   put:
 *     summary: Update poll
 *     tags: [Polls]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Poll ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               question:
 *                 type: string
 *               options:
 *                 type: array
 *                 items:
 *                   type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Poll updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 *       404:
 *         description: Poll not found
 */
const updatePoll = async (req, res) => {
  try {
    const { id } = req.params;
    const { question, options, isActive } = req.body;

    const poll = await Poll.findByPk(id);

    if (!poll) {
      return res.status(404).json({
        error: 'Poll not found',
        message: 'The specified poll does not exist'
      });
    }

    // Check if user can update this poll
    if (poll.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You can only update your own polls'
      });
    }

    const updateData = {};
    if (question) updateData.question = question;
    if (options) updateData.options = JSON.stringify(options);
    if (typeof isActive === 'boolean') updateData.isActive = isActive;

    await poll.update(updateData);

    res.json({
      message: 'Poll updated successfully',
      poll: {
        ...poll.toJSON(),
        options: JSON.parse(poll.options)
      }
    });
  } catch (error) {
    console.error('Update poll error:', error);
    res.status(500).json({
      error: 'Failed to update poll',
      message: 'An error occurred while updating the poll'
    });
  }
};

/**
 * @swagger
 * /polls/{id}:
 *   delete:
 *     summary: Delete poll
 *     tags: [Polls]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Poll ID
 *     responses:
 *       200:
 *         description: Poll deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 *       404:
 *         description: Poll not found
 */
const deletePoll = async (req, res) => {
  try {
    const { id } = req.params;

    const poll = await Poll.findByPk(id);

    if (!poll) {
      return res.status(404).json({
        error: 'Poll not found',
        message: 'The specified poll does not exist'
      });
    }

    // Check if user can delete this poll
    if (poll.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You can only delete your own polls'
      });
    }

    await poll.destroy();

    res.json({
      message: 'Poll deleted successfully'
    });
  } catch (error) {
    console.error('Delete poll error:', error);
    res.status(500).json({
      error: 'Failed to delete poll',
      message: 'An error occurred while deleting the poll'
    });
  }
};

module.exports = {
  createPoll,
  getEventPolls,
  getPollById,
  voteOnPoll,
  updatePoll,
  deletePoll
}; 