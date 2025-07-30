const { Attendee, Ticket, Event, User } = require('../models');

/**
 * @swagger
 * /payments/process:
 *   post:
 *     summary: Process payment for event registration
 *     tags: [Payments]
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
 *               - paymentMethod
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
 *                 description: Number of tickets
 *               paymentMethod:
 *                 type: string
 *                 enum: [stripe, paypal, credit_card]
 *                 description: Payment method
 *               paymentToken:
 *                 type: string
 *                 description: Payment token from payment provider
 *     responses:
 *       200:
 *         description: Payment processed successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Event or ticket not found
 *       409:
 *         description: Insufficient tickets or already registered
 */
const processPayment = async (req, res) => {
  try {
    const { eventId, ticketId, quantity, paymentMethod, paymentToken } = req.body;

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

    // Calculate total amount
    const totalAmount = ticket.price * quantity;

    // Process payment (this would integrate with Stripe, PayPal, etc.)
    // For now, we'll simulate a successful payment
    const paymentResult = await simulatePaymentProcess(paymentMethod, paymentToken, totalAmount);

    if (!paymentResult.success) {
      return res.status(400).json({
        error: 'Payment failed',
        message: paymentResult.message
      });
    }

    // Create registration
    const registration = await Attendee.create({
      eventId,
      ticketId,
      userId: req.user.id,
      quantity,
      totalAmount,
      status: 'confirmed',
      paymentMethod,
      paymentId: paymentResult.paymentId
    });

    res.json({
      message: 'Payment processed successfully',
      registration: {
        id: registration.id,
        eventId: registration.eventId,
        ticketId: registration.ticketId,
        quantity: registration.quantity,
        totalAmount: registration.totalAmount,
        status: registration.status,
        paymentMethod: registration.paymentMethod,
        paymentId: registration.paymentId,
        createdAt: registration.createdAt
      },
      payment: {
        id: paymentResult.paymentId,
        amount: totalAmount,
        method: paymentMethod,
        status: 'completed'
      }
    });
  } catch (error) {
    console.error('Process payment error:', error);
    res.status(500).json({
      error: 'Payment processing failed',
      message: 'An error occurred while processing the payment'
    });
  }
};

/**
 * @swagger
 * /payments/refund/{registrationId}:
 *   post:
 *     summary: Process refund for registration
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: registrationId
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
 *             required:
 *               - reason
 *             properties:
 *               reason:
 *                 type: string
 *                 description: Refund reason
 *     responses:
 *       200:
 *         description: Refund processed successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 *       404:
 *         description: Registration not found
 */
const processRefund = async (req, res) => {
  try {
    const { registrationId } = req.params;
    const { reason } = req.body;

    const registration = await Attendee.findByPk(registrationId, {
      include: [{ model: Event }]
    });

    if (!registration) {
      return res.status(404).json({
        error: 'Registration not found',
        message: 'The specified registration does not exist'
      });
    }

    // Check if user can request refund
    if (registration.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You can only request refunds for your own registrations'
      });
    }

    // Check if registration is eligible for refund
    if (registration.status !== 'confirmed') {
      return res.status(400).json({
        error: 'Refund not eligible',
        message: 'This registration is not eligible for refund'
      });
    }

    // Process refund (this would integrate with payment providers)
    const refundResult = await simulateRefundProcess(registration.paymentId, registration.totalAmount);

    if (!refundResult.success) {
      return res.status(400).json({
        error: 'Refund failed',
        message: refundResult.message
      });
    }

    // Update registration status
    await registration.update({
      status: 'refunded',
      refundReason: reason,
      refundedAt: new Date()
    });

    res.json({
      message: 'Refund processed successfully',
      refund: {
        id: refundResult.refundId,
        amount: registration.totalAmount,
        reason,
        status: 'completed'
      },
      registration
    });
  } catch (error) {
    console.error('Process refund error:', error);
    res.status(500).json({
      error: 'Refund processing failed',
      message: 'An error occurred while processing the refund'
    });
  }
};

/**
 * @swagger
 * /payments/history:
 *   get:
 *     summary: Get user's payment history
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [confirmed, refunded, cancelled]
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
 *         description: Payment history retrieved successfully
 *       401:
 *         description: Unauthorized
 */
const getPaymentHistory = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    const offset = (page - 1) * limit;
    const whereClause = { userId: req.user.id };

    if (status) {
      whereClause.status = status;
    }

    const { count, rows: payments } = await Attendee.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Event,
          attributes: ['id', 'title', 'date']
        },
        {
          model: Ticket,
          attributes: ['name', 'type', 'price']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    const totalPages = Math.ceil(count / limit);

    res.json({
      message: 'Payment history retrieved successfully',
      payments,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalItems: count,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get payment history error:', error);
    res.status(500).json({
      error: 'Failed to retrieve payment history',
      message: 'An error occurred while retrieving payment history'
    });
  }
};

/**
 * @swagger
 * /payments/{registrationId}:
 *   get:
 *     summary: Get payment details by registration ID
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: registrationId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Registration ID
 *     responses:
 *       200:
 *         description: Payment details retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 *       404:
 *         description: Registration not found
 */
const getPaymentDetails = async (req, res) => {
  try {
    const { registrationId } = req.params;

    const registration = await Attendee.findByPk(registrationId, {
      include: [
        {
          model: Event,
          attributes: ['id', 'title', 'date', 'time', 'location']
        },
        {
          model: Ticket,
          attributes: ['name', 'type', 'price']
        }
      ]
    });

    if (!registration) {
      return res.status(404).json({
        error: 'Registration not found',
        message: 'The specified registration does not exist'
      });
    }

    // Check if user can view this payment
    if (registration.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You can only view your own payment details'
      });
    }

    res.json({
      message: 'Payment details retrieved successfully',
      payment: {
        id: registration.id,
        event: registration.Event,
        ticket: registration.Ticket,
        quantity: registration.quantity,
        totalAmount: registration.totalAmount,
        status: registration.status,
        paymentMethod: registration.paymentMethod,
        paymentId: registration.paymentId,
        refundReason: registration.refundReason,
        refundedAt: registration.refundedAt,
        createdAt: registration.createdAt
      }
    });
  } catch (error) {
    console.error('Get payment details error:', error);
    res.status(500).json({
      error: 'Failed to retrieve payment details',
      message: 'An error occurred while retrieving payment details'
    });
  }
};

// Helper functions for payment simulation
const simulatePaymentProcess = async (paymentMethod, paymentToken, amount) => {
  // This would integrate with actual payment providers
  // For now, we'll simulate a successful payment
  return {
    success: true,
    paymentId: `pay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    message: 'Payment processed successfully'
  };
};

const simulateRefundProcess = async (paymentId, amount) => {
  // This would integrate with actual payment providers
  // For now, we'll simulate a successful refund
  return {
    success: true,
    refundId: `ref_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    message: 'Refund processed successfully'
  };
};

module.exports = {
  processPayment,
  processRefund,
  getPaymentHistory,
  getPaymentDetails
}; 