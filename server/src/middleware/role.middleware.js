const { ApiError } = require('../utils/apiResponse');

exports.authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return next(new ApiError('Not authenticated', 401));
        }

        if (!roles.includes(req.user.role)) {
            return next(new ApiError(`Role ${req.user.role} is not authorized to access this resource`, 403));
        }

        next();
    };
};