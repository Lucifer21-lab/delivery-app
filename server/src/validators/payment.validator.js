const { body, param } = require('express-validator');

exports.createPaymentIntentValidator = [
    body('deliveryId')
        .notEmpty()
        .withMessage('Delivery ID is required')
        .isMongoId()
        .withMessage('Invalid delivery ID')
];

exports.confirmPaymentValidator = [
    body('paymentIntentId')
        .notEmpty()
        .withMessage('Payment intent ID is required')
        .isString()
        .withMessage('Payment intent ID must be a string')
];

exports.paymentIdValidator = [
    param('paymentId')
        .notEmpty()
        .withMessage('Payment ID is required')
        .isMongoId()
        .withMessage('Invalid payment ID')
];

