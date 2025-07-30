const { Attendee, Event, User, Ticket } = require('../models');

/**
 * @swagger
 * /attendees/register:
 *   post:
 *     summary: Register for an event
 *     tags: [Attendees]
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
 *               - ticketId
 *               - quantity
 *             properties:
 *               eventId:
 *                 type: integer
 *                 description: Event ID
 *               ticketId:
 *                 type: integer
 *                 description: Ticket ID
 *               quantity:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 10
 *                 description: Number of tickets to purchase
 *     responses:
 *       201:
 *         description: Registration successful
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Event or ticket not found
 *       409:
 *         description: Already registered or insufficient tickets
 */
const registerForEvent = async (req, res) => {
  try {
    const { eventId, ticketId, quantity } = req.body;

    // Check if event exists
    const event = await Event.findByPk(eventId);
    if (!event) {
      return res.status(404).json({
        error: 'Event not found',
        message: 'The specified event does not exist'
      });
    }

    // Check if ticket exists and belongs to the event
    const ticket = await Ticket.findOne({
      where: { id: ticketId, eventId }
    });
    if (!ticket) {
      return res.status(404).json({
        error: 'Ticket not found',
        message: 'The specified ticket does not exist for this event'
      });
    }

    // Check if user is already registered for this event
    const existingRegistration = await Attendee.findOne({
      where: { eventId, userId: req.user.id }
    });
    if (existingRegistration) {
      return res.status(409).json({
        error: 'Already registered',
        message: 'You are already registered for this event'
      });
    }

    // Check ticket availability
    const soldTickets = await Attendee.sum('quantity', {
      where: { ticketId }
    }) || 0;
    
    const availableTickets = ticket.quantity - soldTickets;
    if (quantity > availableTickets) {
      return res.status(409).json({
        error: 'Insufficient tickets',
        message: `Only ${availableTickets} tickets available`
      });
    }

    // Create registration
    const registration = await Attendee.create({
      eventId,
      ticketId,
      userId: req.user.id,
      quantity,
      totalAmount: ticket.price * quantity,
      status: 'confirmed'
    });

    res.status(201).json({
      message: 'Registration successful',
      registration: {
        id: registration.id,
        eventId: registration.eventId,
        ticketId: registration.ticketId,
        quantity: registration.quantity,
        totalAmount: registration.totalAmount,
        status: registration.status,
        createdAt: registration.createdAt
      }
    });
  } catch (error) {
    console.error('Register for event error:', error);
    res.status(500).json({
      error: 'Registration failed',
      message: 'An error occurred during registration'
    });
  }
};

/**
 * @swagger
 * /attendees/my-registrations:
 *   get:
 *     summary: Get user's event registrations
 *     tags: [Attendees]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Registrations retrieved successfully
 *       401:
 *         description: Unauthorized
 */
const getMyRegistrations = async (req, res) => {
  try {
    const registrations = await Attendee.findAll({
      where: { userId: req.user.id },
      include: [
        {
          model: Event,
          attributes: ['id', 'title', 'date', 'time', 'location', 'category']
        },
        {
          model: Ticket,
          attributes: ['name', 'type', 'price']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json({
      message: 'Registrations retrieved successfully',
      registrations
    });
  } catch (error) {
    console.error('Get my registrations error:', error);
    res.status(500).json({
      error: 'Failed to retrieve registrations',
      message: 'An error occurred while retrieving registrations'
    });
  }
};

/**
 * @swagger
 * /attendees/{id}:
 *   get:
 *     summary: Get registration by ID
 *     tags: [Attendees]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Registration ID
 *     responses:
 *       200:
 *         description: Registration retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 *       404:
 *         description: Registration not found
 */
const getRegistrationById = async (req, res) => {
  try {
    const { id } = req.params;

    const registration = await Attendee.findByPk(id, {
      include: [
        {
          model: Event,
          attributes: ['id', 'title', 'date', 'time', 'location', 'category']
        },
        {
          model: Ticket,
          attributes: ['name', 'type', 'price']
        },
        {
          model: User,
          attributes: ['id', 'name', 'email']
        }
      ]
    });

    if (!registration) {
      return res.status(404).json({
        error: 'Registration not found',
        message: 'The specified registration does not exist'
      });
    }

    // Check if user can view this registration
    if (registration.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You can only view your own registrations'
      });
    }

    res.json({
      message: 'Registration retrieved successfully',
      registration
    });
  } catch (error) {
    console.error('Get registration by ID error:', error);
    res.status(500).json({
      error: 'Failed to retrieve registration',
      message: 'An error occurred while retrieving the registration'
    });
  }
};

/**
 * @swagger
 * /attendees/{id}:
 *   put:
 *     summary: Update registration
 *     tags: [Attendees]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Registration ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               quantity:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 10
 *               status:
 *                 type: string
 *                 enum: [confirmed, cancelled, pending]
 *     responses:
 *       200:
 *         description: Registration updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 *       404:
 *         description: Registration not found
 */
const updateRegistration = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity, status } = req.body;

    const registration = await Attendee.findByPk(id, {
      include: [{ model: Ticket }]
    });

    if (!registration) {
      return res.status(404).json({
        error: 'Registration not found',
        message: 'The specified registration does not exist'
      });
    }

    // Check if user can update this registration
    if (registration.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You can only update your own registrations'
      });
    }

    // If updating quantity, check availability
    if (quantity && quantity !== registration.quantity) {
      const soldTickets = await Attendee.sum('quantity', {
        where: { ticketId: registration.ticketId }
      }) || 0;
      
      const availableTickets = registration.Ticket.quantity - soldTickets + registration.quantity;
      if (quantity > availableTickets) {
        return res.status(409).json({
          error: 'Insufficient tickets',
          message: `Only ${availableTickets} tickets available`
        });
      }

      // Update total amount
      req.body.totalAmount = registration.Ticket.price * quantity;
    }

    await registration.update(req.body);

    res.json({
      message: 'Registration updated successfully',
      registration
    });
  } catch (error) {
    console.error('Update registration error:', error);
    res.status(500).json({
      error: 'Failed to update registration',
      message: 'An error occurred while updating the registration'
    });
  }
};

/**
 * @swagger
 * /attendees/{id}:
 *   delete:
 *     summary: Cancel registration
 *     tags: [Attendees]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Registration ID
 *     responses:
 *       200:
 *         description: Registration cancelled successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 *       404:
 *         description: Registration not found
 */
const cancelRegistration = async (req, res) => {
  try {
    const { id } = req.params;

    const registration = await Attendee.findByPk(id);

    if (!registration) {
      return res.status(404).json({
        error: 'Registration not found',
        message: 'The specified registration does not exist'
      });
    }

    // Check if user can cancel this registration
    if (registration.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You can only cancel your own registrations'
      });
    }

    // Update status to cancelled instead of deleting
    await registration.update({ status: 'cancelled' });

    res.json({
      message: 'Registration cancelled successfully'
    });
  } catch (error) {
    console.error('Cancel registration error:', error);
    res.status(500).json({
      error: 'Failed to cancel registration',
      message: 'An error occurred while cancelling the registration'
    });
  }
};

/**
 * @swagger
 * /attendees/event/{eventId}:
 *   get:
 *     summary: Get all attendees for an event (organizer only)
 *     tags: [Attendees]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
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
    const { eventId } = req.params;

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
        message: 'You can only view attendees for your own events'
      });
    }

    const attendees = await Attendee.findAll({
      where: { eventId },
      include: [
        {
          model: User,
          attributes: ['id', 'name', 'email']
        },
        {
          model: Ticket,
          attributes: ['name', 'type', 'price']
        }
      ],
      order: [['createdAt', 'ASC']]
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

module.exports = {
  registerForEvent,
  getMyRegistrations,
  getRegistrationById,
  updateRegistration,
  cancelRegistration,
  getEventAttendees
};