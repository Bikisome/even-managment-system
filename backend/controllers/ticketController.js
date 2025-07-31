const { Ticket, Event, User } = require('../models');

/**
 * @swagger
 * /tickets:
 *   post:
 *     summary: Create a new ticket type for an event
 *     tags: [Tickets]
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
 *               - name
 *               - price
 *               - quantity
 *               - type
 *             properties:
 *               eventId:
 *                 type: integer
 *                 description: Event ID
 *               name:
 *                 type: string
 *                 description: Ticket name
 *               description:
 *                 type: string
 *                 description: Ticket description
 *               price:
 *                 type: number
 *                 description: Ticket price
 *               quantity:
 *                 type: integer
 *                 description: Available quantity
 *               type:
 *                 type: string
 *                 enum: [regular, vip, early-bird, student, senior]
 *                 description: Ticket type
 *     responses:
 *       201:
 *         description: Ticket created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 *       404:
 *         description: Event not found
 */
const createTicket = async (req, res) => {
  try {
    const { eventId, name, description, price, quantity, type } = req.body;

    // Check if event exists and user is the organizer
    const event = await Event.findByPk(eventId);
    if (!event) {
      return res.status(404).json({
        error: 'Event not found',
        message: 'The specified event does not exist'
      });
    }

    if (event.organizerId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You can only create tickets for your own events'
      });
    }

    const ticket = await Ticket.create({
      eventId,
      name,
      description,
      price,
      quantity,
      type
    });

    res.status(201).json({
      message: 'Ticket created successfully',
      ticket
    });
  } catch (error) {
    console.error('Create ticket error:', error);
    res.status(500).json({
      error: 'Failed to create ticket',
      message: 'An error occurred while creating the ticket'
    });
  }
};

/**
 * @swagger
 * /tickets/event/{eventId}:
 *   get:
 *     summary: Get all tickets for an event
 *     tags: [Tickets]
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Event ID
 *     responses:
 *       200:
 *         description: Tickets retrieved successfully
 *       404:
 *         description: Event not found
 */
const getEventTickets = async (req, res) => {
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

    const tickets = await Ticket.findAll({
      where: { eventId },
      order: [['price', 'ASC']]
    });

    res.json({
      message: 'Tickets retrieved successfully',
      tickets
    });
  } catch (error) {
    console.error('Get event tickets error:', error);
    res.status(500).json({
      error: 'Failed to retrieve tickets',
      message: 'An error occurred while retrieving tickets'
    });
  }
};

/**
 * @swagger
 * /tickets/{id}:
 *   get:
 *     summary: Get ticket by ID
 *     tags: [Tickets]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Ticket ID
 *     responses:
 *       200:
 *         description: Ticket retrieved successfully
 *       404:
 *         description: Ticket not found
 */
const getTicketById = async (req, res) => {
  try {
    const { id } = req.params;

    const ticket = await Ticket.findByPk(id, {
      include: [
        {
          model: Event,
          as: 'event',
          attributes: ['id', 'title', 'date', 'time', 'location']
        }
      ]
    });

    if (!ticket) {
      return res.status(404).json({
        error: 'Ticket not found',
        message: 'The specified ticket does not exist'
      });
    }

    res.json({
      message: 'Ticket retrieved successfully',
      ticket
    });
  } catch (error) {
    console.error('Get ticket by ID error:', error);
    res.status(500).json({
      error: 'Failed to retrieve ticket',
      message: 'An error occurred while retrieving the ticket'
    });
  }
};

/**
 * @swagger
 * /tickets/{id}:
 *   put:
 *     summary: Update ticket
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Ticket ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               quantity:
 *                 type: integer
 *               type:
 *                 type: string
 *                 enum: [regular, vip, early-bird, student, senior]
 *     responses:
 *       200:
 *         description: Ticket updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 *       404:
 *         description: Ticket not found
 */
const updateTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const ticket = await Ticket.findByPk(id, {
      include: [{ model: Event, as: 'event' }]
    });

    if (!ticket) {
      return res.status(404).json({
        error: 'Ticket not found',
        message: 'The specified ticket does not exist'
      });
    }

    // Check if user can update this ticket
    if (ticket.event.organizerId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You can only update tickets for your own events'
      });
    }

    await ticket.update(req.body);

    res.json({
      message: 'Ticket updated successfully',
      ticket
    });
  } catch (error) {
    console.error('Update ticket error:', error);
    res.status(500).json({
      error: 'Failed to update ticket',
      message: 'An error occurred while updating the ticket'
    });
  }
};

/**
 * @swagger
 * /tickets/{id}:
 *   delete:
 *     summary: Delete ticket
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Ticket ID
 *     responses:
 *       200:
 *         description: Ticket deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 *       404:
 *         description: Ticket not found
 */
const deleteTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const ticket = await Ticket.findByPk(id, {
      include: [{ model: Event, as: 'event' }]
    });

    if (!ticket) {
      return res.status(404).json({
        error: 'Ticket not found',
        message: 'The specified ticket does not exist'
      });
    }

    // Check if user can delete this ticket
    if (ticket.event.organizerId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You can only delete tickets for your own events'
      });
    }

    await ticket.destroy();

    res.json({
      message: 'Ticket deleted successfully'
    });
  } catch (error) {
    console.error('Delete ticket error:', error);
    res.status(500).json({
      error: 'Failed to delete ticket',
      message: 'An error occurred while deleting the ticket'
    });
  }
};

/**
 * @swagger
 * /tickets/check-availability/{id}:
 *   get:
 *     summary: Check ticket availability
 *     tags: [Tickets]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Ticket ID
 *     responses:
 *       200:
 *         description: Ticket availability checked successfully
 *       404:
 *         description: Ticket not found
 */
const checkTicketAvailability = async (req, res) => {
  try {
    const { id } = req.params;

    const ticket = await Ticket.findByPk(id);
    if (!ticket) {
      return res.status(404).json({
        error: 'Ticket not found',
        message: 'The specified ticket does not exist'
      });
    }

    // Calculate sold tickets (this would need to be implemented based on your attendee model)
    const soldTickets = 0; // Placeholder - implement based on your attendee model
    const availableTickets = ticket.quantity - soldTickets;

    res.json({
      message: 'Ticket availability checked successfully',
      ticket: {
        id: ticket.id,
        name: ticket.name,
        price: ticket.price,
        type: ticket.type,
        totalQuantity: ticket.quantity,
        soldTickets,
        availableTickets,
        isAvailable: availableTickets > 0
      }
    });
  } catch (error) {
    console.error('Check ticket availability error:', error);
    res.status(500).json({
      error: 'Failed to check ticket availability',
      message: 'An error occurred while checking ticket availability'
    });
  }
};

module.exports = {
  createTicket,
  getEventTickets,
  getTicketById,
  updateTicket,
  deleteTicket,
  checkTicketAvailability
}; 