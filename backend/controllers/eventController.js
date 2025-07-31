const { Event, User, Ticket, Attendee } = require('../models');
const { Op } = require('sequelize');

/**
 * @swagger
 * /events:
 *   post:
 *     summary: Create a new event
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - date
 *               - time
 *               - location
 *               - category
 *               - privacy
 *             properties:
 *               title:
 *                 type: string
 *                 description: Event title
 *               description:
 *                 type: string
 *                 description: Event description
 *               date:
 *                 type: string
 *                 format: date
 *                 description: Event date
 *               time:
 *                 type: string
 *                 description: Event time (HH:MM)
 *               location:
 *                 type: string
 *                 description: Event location
 *               category:
 *                 type: string
 *                 enum: [conference, workshop, seminar, concert, sports, other]
 *                 description: Event category
 *               privacy:
 *                 type: string
 *                 enum: [public, private, invite-only]
 *                 description: Event privacy setting
 *     responses:
 *       201:
 *         description: Event created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
const createEvent = async (req, res) => {
  try {
    const {
      title,
      description,
      date,
      time,
      location,
      category,
      privacy
    } = req.body;

    const event = await Event.create({
      title,
      description,
      date,
      time,
      location,
      category,
      privacy,
      organizerId: req.user.id
    });

    res.status(201).json({
      message: 'Event created successfully',
      event
    });
  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({
      error: 'Failed to create event',
      message: 'An error occurred while creating the event'
    });
  }
};

/**
 * @swagger
 * /events:
 *   get:
 *     summary: Get all events with filtering and search
 *     tags: [Events]
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Search query
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [conference, workshop, seminar, concert, sports, other]
 *         description: Filter by category
 *       - in: query
 *         name: location
 *         schema:
 *           type: string
 *         description: Filter by location
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by date
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
 *         description: Events retrieved successfully
 */
const getEvents = async (req, res) => {
  try {
    const {
      q,
      category,
      location,
      date,
      page = 1,
      limit = 10
    } = req.query;

    const offset = (page - 1) * limit;
    const whereClause = {};

    // Search by query
    if (q) {
      whereClause[Op.or] = [
        { title: { [Op.like]: `%${q}%` } },
        { description: { [Op.like]: `%${q}%` } },
        { location: { [Op.like]: `%${q}%` } }
      ];
    }

    // Filter by category
    if (category) {
      whereClause.category = category;
    }

    // Filter by location
    if (location) {
      whereClause.location = { [Op.like]: `%${location}%` };
    }

    // Filter by date
    if (date) {
      whereClause.date = { [Op.gte]: new Date(date) };
    }

    // Only show public events for non-authenticated users
    if (!req.user) {
      whereClause.privacy = 'public';
    } else if (req.user.role !== 'admin') {
      // Show public events and user's own events
      whereClause[Op.or] = [
        { privacy: 'public' },
        { organizerId: req.user.id }
      ];
    }

    const { count, rows: events } = await Event.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'organizer',
          attributes: ['id', 'name', 'email']
        }
      ],
      order: [['date', 'ASC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    const totalPages = Math.ceil(count / limit);

    res.json({
      message: 'Events retrieved successfully',
      events,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalItems: count,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({
      error: 'Failed to retrieve events',
      message: 'An error occurred while retrieving events'
    });
  }
};

/**
 * @swagger
 * /events/{id}:
 *   get:
 *     summary: Get event by ID
 *     tags: [Events]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Event ID
 *     responses:
 *       200:
 *         description: Event retrieved successfully
 *       404:
 *         description: Event not found
 */
const getEventById = async (req, res) => {
  try {
    const { id } = req.params;

    const event = await Event.findByPk(id, {
      include: [
        {
          model: Ticket,
          as: 'tickets',
          include: [
            {
              model: Attendee,
              as: 'attendees',
              include: [
                {
                  model: User,
                  as: 'user',
                  attributes: ['id', 'name', 'email']
                }
              ]
            }
          ]
        }
      ]
    });

    if (!event) {
      return res.status(404).json({
        error: 'Event not found',
        message: 'The requested event does not exist'
      });
    }

    // Check if user can access this event
    if (event.privacy !== 'public' && req.user && req.user.role !== 'admin') {
      if (event.organizerId !== req.user.id) {
        return res.status(403).json({
          error: 'Access denied',
          message: 'You do not have permission to view this event'
        });
      }
    }

    res.json({
      message: 'Event retrieved successfully',
      event
    });
  } catch (error) {
    console.error('Get event by ID error:', error);
    res.status(500).json({
      error: 'Failed to retrieve event',
      message: 'An error occurred while retrieving the event'
    });
  }
};

/**
 * @swagger
 * /events/{id}:
 *   put:
 *     summary: Update event
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Event ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date
 *               time:
 *                 type: string
 *               location:
 *                 type: string
 *               category:
 *                 type: string
 *                 enum: [conference, workshop, seminar, concert, sports, other]
 *               privacy:
 *                 type: string
 *                 enum: [public, private, invite-only]
 *     responses:
 *       200:
 *         description: Event updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 *       404:
 *         description: Event not found
 */
const updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const event = await Event.findByPk(id);

    if (!event) {
      return res.status(404).json({
        error: 'Event not found',
        message: 'The requested event does not exist'
      });
    }

    // Check if user can update this event
    if (event.organizerId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You can only update your own events'
      });
    }

    await event.update(req.body);

    res.json({
      message: 'Event updated successfully',
      event
    });
  } catch (error) {
    console.error('Update event error:', error);
    res.status(500).json({
      error: 'Failed to update event',
      message: 'An error occurred while updating the event'
    });
  }
};

/**
 * @swagger
 * /events/{id}:
 *   delete:
 *     summary: Delete event
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Event ID
 *     responses:
 *       200:
 *         description: Event deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 *       404:
 *         description: Event not found
 */
const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const event = await Event.findByPk(id);

    if (!event) {
      return res.status(404).json({
        error: 'Event not found',
        message: 'The requested event does not exist'
      });
    }

    // Check if user can delete this event
    if (event.organizerId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You can only delete your own events'
      });
    }

    await event.destroy();

    res.json({
      message: 'Event deleted successfully'
    });
  } catch (error) {
    console.error('Delete event error:', error);
    res.status(500).json({
      error: 'Failed to delete event',
      message: 'An error occurred while deleting the event'
    });
  }
};

/**
 * @swagger
 * /events/{id}/attendees:
 *   get:
 *     summary: Get event attendees
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Event ID
 *     responses:
 *       200:
 *         description: Attendees retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 *       404:
 *         description: Event not found
 */
const getEventAttendees = async (req, res) => {
  try {
    const { id } = req.params;
    const event = await Event.findByPk(id);

    if (!event) {
      return res.status(404).json({
        error: 'Event not found',
        message: 'The requested event does not exist'
      });
    }

    // Check if user can view attendees
    if (event.organizerId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You can only view attendees for your own events'
      });
    }

    const attendees = await Attendee.findAll({
      where: { eventId: id },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email']
        },
        {
          model: Ticket,
          as: 'ticket',
          attributes: ['type', 'price']
        }
      ]
    });

    res.json({
      message: 'Attendees retrieved successfully',
      attendees
    });
  } catch (error) {
    console.error('Get event attendees error:', error);
    res.status(500).json({
      error: 'Failed to retrieve attendees',
      message: 'An error occurred while retrieving attendees'
    });
  }
};

/**
 * @swagger
 * /events/my-events:
 *   get:
 *     summary: Get user's events
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User's events retrieved successfully
 *       401:
 *         description: Unauthorized
 */
const getMyEvents = async (req, res) => {
  try {

    const  organizerId= req.user.id;

    console.log("organizerId:", organizerId);
    const events = await Event.findAll({
      where: { organizerId: req.user.id },
      include: [
        {
          model: Ticket,
          as: 'tickets',
          attributes: ['id', 'type', 'price', 'quantity']
        }
      ],
      order: [['date', 'ASC']]
    });

    console.log("Events:", events);

    res.json({
      message: 'Your events retrieved successfully',
      events
    });
  } catch (error) {
    console.error('Get my events error:', error);
    res.status(500).json({
      error: 'Failed to retrieve your events',
      message: 'An error occurred while retrieving your events'
    });
  }
};

module.exports = {
  createEvent,
  getEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  getEventAttendees,
  getMyEvents
}; 