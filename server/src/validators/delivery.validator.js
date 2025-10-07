const { body, param, query } = require('express-validator');

exports.createDeliveryValidator = [
    body('title')
        .trim()
        .notEmpty()
        .withMessage('Title is required')
        .isLength({ min: 5, max: 100 })
        .withMessage('Title must be between 5 and 100 characters'),

    body('description')
        .trim()
        .notEmpty()
        .withMessage('Description is required')
        .isLength({ min: 10, max: 1000 })
        .withMessage('Description must be between 10 and 1000 characters'),

    body('pickupLocation.address')
        .trim()
        .notEmpty()
        .withMessage('Pickup address is required'),

    body('deliveryLocation.address')
        .trim()
        .notEmpty()
        .withMessage('Delivery address is required'),

    body('acceptDeadline')
        .notEmpty()
        .withMessage('Accept deadline is required')
        .isISO8601()
        .withMessage('Accept deadline must be a valid date')
        .custom((value) => {
            const deadline = new Date(value);
            const now = new Date();
            if (deadline <= now) {
                throw new Error('Accept deadline must be in the future');
            }
            return true;
        }),

    body('deliveryDeadline')
        .notEmpty()
        .withMessage('Delivery deadline is required')
        .isISO8601()
        .withMessage('Delivery deadline must be a valid date')
        .custom((value, { req }) => {
            const deliveryDeadline = new Date(value);
            const acceptDeadline = new Date(req.body.acceptDeadline);
            if (deliveryDeadline <= acceptDeadline) {
                throw new Error('Delivery deadline must be after accept deadline');
            }
            return true;
        }),

    body('price')
        .notEmpty()
        .withMessage('Price is required')
        .isFloat({ min: 0.01 })
        .withMessage('Price must be greater than 0'),

    body('packageDetails.weight')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Weight must be a positive number'),

    body('packageDetails.fragile')
        .optional()
        .isBoolean()
        .withMessage('Fragile must be a boolean value')
];

exports.updateDeliveryStatusValidator = [
    body('status')
        .notEmpty()
        .withMessage('Status is required')
        .isIn(['in_progress', 'completed', 'cancelled'])
        .withMessage('Invalid status value')
];

exports.deliveryIdValidator = [
    param('id')
        .notEmpty()
        .withMessage('Delivery ID is required')
        .isMongoId()
        .withMessage('Invalid delivery ID')
];

exports.getDeliveriesQueryValidator = [
    query('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Page must be a positive integer'),

    query('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('Limit must be between 1 and 100'),

    query('minPrice')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Minimum price must be a positive number'),

    query('maxPrice')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Maximum price must be a positive number')
];
