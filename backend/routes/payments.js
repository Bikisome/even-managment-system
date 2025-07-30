const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { authenticateToken } = require('../middlewares/auth');

// Protected routes - specific routes first
router.post('/process', authenticateToken, paymentController.processPayment);
router.get('/history', authenticateToken, paymentController.getPaymentHistory);
router.post('/refund/:registrationId', authenticateToken, paymentController.processRefund);
router.get('/:registrationId', authenticateToken, paymentController.getPaymentDetails);

module.exports = router; 