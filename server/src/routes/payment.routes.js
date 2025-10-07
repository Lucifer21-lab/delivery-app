// const express = require('express');
// const {
//     createPaymentOrder,
//     verifyPayment,
//     getPaymentDetails,
//     refundPayment,
//     getPaymentHistory,
//     webhookHandler
// } = require('../controllers/payment.controller');
// const { protect } = require('../middleware/auth.middleware');
// const { authorize } = require('../middleware/role.middleware');
// const { paymentLimiter } = require('../middleware/rateLimiter.middleware');

// const router = express.Router();

// // Webhook (must be before other routes and without JSON parsing)
// router.post('/webhook', express.raw({ type: 'application/json' }), webhookHandler);

// // Protected routes
// router.use(protect);
// router.use(paymentLimiter);

// router.post('/create-order', createPaymentOrder);
// router.post('/verify', verifyPayment);
// router.get('/history', getPaymentHistory);
// router.get('/:paymentId', getPaymentDetails);
// router.post('/:paymentId/refund', authorize('admin'), refundPayment);

// module.exports = router;
