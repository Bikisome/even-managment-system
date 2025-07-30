const { body, param, query, validationResult } = require('express-validator');

/**
 * Middleware to handle validation errors
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      message: 'Please check your input data',
      details: errors.array()
    });
  }
  next();
};

/**
 * Validation rules for user registration
 */
const validateUserRegistration = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  handleValidationErrors
];

/**
 * Validation rules for user login
 */
const validateUserLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  handleValidationErrors
];

/**
 * Validation rules for event creation
 */
const validateEventCreation = [
  body('title')
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Event title must be between 3 and 100 characters'),
  body('description')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Event description must be between 10 and 1000 characters'),
  body('date')
    .isISO8601()
    .withMessage('Please provide a valid date'),
  body('time')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Please provide a valid time in HH:MM format'),
  body('location')
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage('Location must be between 3 and 200 characters'),
  body('category')
    .isIn(['conference', 'workshop', 'seminar', 'concert', 'sports', 'other'])
    .withMessage('Please select a valid category'),
  body('privacy')
    .isIn(['public', 'private', 'invite-only'])
    .withMessage('Please select a valid privacy setting'),
  handleValidationErrors
];

/**
 * Validation rules for event updates
 */
const validateEventUpdate = [
  param('id')
    .isInt()
    .withMessage('Event ID must be a valid integer'),
  body('title')
    .optional()
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Event title must be between 3 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Event description must be between 10 and 1000 characters'),
  body('date')
    .optional()
    .isISO8601()
    .withMessage('Please provide a valid date'),
  body('time')
    .optional()
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Please provide a valid time in HH:MM format'),
  body('location')
    .optional()
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage('Location must be between 3 and 200 characters'),
  body('category')
    .optional()
    .isIn(['conference', 'workshop', 'seminar', 'concert', 'sports', 'other'])
    .withMessage('Please select a valid category'),
  body('privacy')
    .optional()
    .isIn(['public', 'private', 'invite-only'])
    .withMessage('Please select a valid privacy setting'),
  handleValidationErrors
];

/**
 * Validation rules for ticket creation
 */
const validateTicketCreation = [
  body('eventId')
    .isInt()
    .withMessage('Event ID must be a valid integer'),
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Ticket name must be between 2 and 50 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Description must not exceed 200 characters'),
  body('price')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  body('quantity')
    .isInt({ min: 1 })
    .withMessage('Quantity must be a positive integer'),
  body('type')
    .isIn(['regular', 'vip', 'early-bird', 'student', 'senior'])
    .withMessage('Please select a valid ticket type'),
  handleValidationErrors
];

/**
 * Validation rules for attendee registration
 */
const validateAttendeeRegistration = [
  body('eventId')
    .isInt()
    .withMessage('Event ID must be a valid integer'),
  body('ticketId')
    .isInt()
    .withMessage('Ticket ID must be a valid integer'),
  body('quantity')
    .isInt({ min: 1, max: 10 })
    .withMessage('Quantity must be between 1 and 10'),
  handleValidationErrors
];

/**
 * Validation rules for forum post creation
 */
const validateForumPost = [
  body('eventId')
    .isInt()
    .withMessage('Event ID must be a valid integer'),
  body('title')
    .trim()
    .isLength({ min: 5, max: 100 })
    .withMessage('Post title must be between 5 and 100 characters'),
  body('content')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Post content must be between 10 and 1000 characters'),
  handleValidationErrors
];

/**
 * Validation rules for poll creation
 */
const validatePollCreation = [
  body('eventId')
    .isInt()
    .withMessage('Event ID must be a valid integer'),
  body('question')
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Poll question must be between 5 and 200 characters'),
  body('options')
    .isArray({ min: 2, max: 10 })
    .withMessage('Poll must have between 2 and 10 options'),
  body('options.*')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Each poll option must be between 1 and 100 characters'),
  handleValidationErrors
];

/**
 * Validation rules for Q&A creation
 */
const validateQACreation = [
  body('eventId')
    .isInt()
    .withMessage('Event ID must be a valid integer'),
  body('question')
    .trim()
    .isLength({ min: 5, max: 500 })
    .withMessage('Question must be between 5 and 500 characters'),
  handleValidationErrors
];

/**
 * Validation rules for search queries
 */
const validateSearchQuery = [
  query('q')
    .optional()
    .trim()
    .isLength({ min: 2 })
    .withMessage('Search query must be at least 2 characters long'),
  query('category')
    .optional()
    .isIn(['conference', 'workshop', 'seminar', 'concert', 'sports', 'other'])
    .withMessage('Please select a valid category'),
  query('location')
    .optional()
    .trim()
    .isLength({ min: 2 })
    .withMessage('Location must be at least 2 characters long'),
  query('date')
    .optional()
    .isISO8601()
    .withMessage('Please provide a valid date'),
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Limit must be between 1 and 50'),
  handleValidationErrors
];

module.exports = {
  handleValidationErrors,
  validateUserRegistration,
  validateUserLogin,
  validateEventCreation,
  validateEventUpdate,
  validateTicketCreation,
  validateAttendeeRegistration,
  validateForumPost,
  validatePollCreation,
  validateQACreation,
  validateSearchQuery
}; 