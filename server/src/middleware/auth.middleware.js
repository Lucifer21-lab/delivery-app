const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { ApiError } = require('../utils/apiResponse');

exports.protect = async (req, res, next) => {
    try {
        let token;

        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return next(new ApiError('Not authorized, no token provided', 401));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id).select('-password');

        if (!req.user) {
            return next(new ApiError('User not found', 401));
        }

        if (!req.user.isActive) {
            return next(new ApiError('User account is deactivated', 403));
        }

        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return next(new ApiError('Invalid token', 401));
        }
        if (error.name === 'TokenExpiredError') {
            return next(new ApiError('Token expired', 401));
        }
        next(error);
    }
};

