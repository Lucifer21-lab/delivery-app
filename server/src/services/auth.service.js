const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { ErrorHandler } = require('../utils/errorHandler');
const { sendWelcomeEmail } = require('./email.service');

class AuthService {
    async registerUser(userData) {
        const { name, email, password, phone } = userData;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            throw new ErrorHandler('Email already in use', 400);
        }

        const user = await User.create({
            name,
            email,
            password,
            phone
        });

        // Send welcome email (async, don't wait)
        sendWelcomeEmail(user).catch(err =>
            console.error('Failed to send welcome email:', err)
        );

        return user;
    }

    async loginUser(email, password) {
        const user = await User.findOne({ email }).select('+password');

        if (!user || !(await user.comparePassword(password))) {
            throw new ErrorHandler('Invalid email or password', 401);
        }

        if (!user.isActive) {
            throw new ErrorHandler('Your account has been deactivated', 403);
        }

        return user;
    }

    generateTokens(userId) {
        const accessToken = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRE || '7d'
        });

        const refreshToken = jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, {
            expiresIn: process.env.JWT_REFRESH_EXPIRE || '30d'
        });

        return { accessToken, refreshToken };
    }

    async updateUserProfile(userId, updateData) {
        const user = await User.findById(userId);

        if (!user) {
            throw new ErrorHandler('User not found', 404);
        }
        console.log('User found')

        const allowedUpdates = ['name', 'avatar', 'gender', 'dob', 'description'];
        const updates = {};

        for (const key of allowedUpdates) {
            if (updateData[key] !== undefined) {
                updates[key] = updateData[key];
            }
        }

        Object.assign(user, updates);
        await user.save();

        return user;
    }

    async changeUserPassword(userId, currentPassword, newPassword) {
        const user = await User.findById(userId).select('+password');

        if (!user) {
            throw new ErrorHandler('User not found', 404);
        }

        const isPasswordValid = await user.comparePassword(currentPassword);
        if (!isPasswordValid) {
            throw new ErrorHandler('Current password is incorrect', 401);
        }

        user.password = newPassword;
        await user.save();

        return user;
    }

    verifyRefreshToken(token) {
        try {
            return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
        } catch (error) {
            throw new ErrorHandler('Invalid refresh token', 401);
        }
    }
}

module.exports = new AuthService();
