const express = require('express');
const { body } = require('express-validator');
const {
    createDelivery,
    getAvailableDeliveries,
    acceptDelivery,
    updateDeliveryStatus,
    getMyDeliveries,
    getDeliveryById,
    cancelDelivery
} = require('../controllers/delivery.controller');
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');
const { validate } = require('../middleware/validation.middleware');
const { upload } = require('../middleware/upload.middleware');
const { deliveryCreationLimiter } = require('../middleware/rateLimiter.middleware');

const router = express.Router();

router.use(protect);

// Create delivery with rate limiting
router.post('/', deliveryCreationLimiter, upload.array('images', 5), [
    body('title').trim().notEmpty().withMessage('Title is required')
        .isLength({ max: 100 }).withMessage('Title must not exceed 100 characters'),
    body('description').trim().notEmpty().withMessage('Description is required')
        .isLength({ max: 1000 }).withMessage('Description must not exceed 1000 characters'),
    body('acceptDeadline').isISO8601().withMessage('Valid accept deadline is required'),
    body('deliveryDeadline').isISO8601().withMessage('Valid delivery deadline is required'),
    body('price').isFloat({ min: 0.01 }).withMessage('Price must be greater than 0'),
    validate
], createDelivery);

// Get available deliveries (excluding user's own)
router.get('/available', getAvailableDeliveries);

// Get my deliveries
router.get('/my', getMyDeliveries);

// Get single delivery
router.get('/:id', getDeliveryById);

// Accept delivery (anyone except requester)
router.post('/:id/accept', acceptDelivery);

// Update delivery status
router.patch('/:id/status', [
    body('status')
        .isIn(['in_progress', 'completed', 'cancelled'])
        .withMessage('Invalid status'),
    validate
], updateDeliveryStatus);

// Cancel delivery
router.delete('/:id', cancelDelivery);

module.exports = router;
