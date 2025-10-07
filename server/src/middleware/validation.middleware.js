const { validationResult } = require('express-validator');
const { ApiError } = require('../utils/apiResponse');

exports.validate = (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        const errorMessages = errors.array().map(err => ({
            field: err.param,
            message: err.msg
        }));

        return next(new ApiError('Validation failed', 400, errorMessages));
    }

    next();
};
