const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { generateToken, generateRefreshToken } = require('../utils/jwt');
const { ApiResponse, ApiError } = require('../utils/apiResponse');
const crypto = require('crypto');
const { sendPasswordResetEmail } = require('../services/email.service');

// @desc    Register user
// @route   POST /api/auth/registers
// @access  Public
exports.register = async (req, res, next) => {
    console.log("Register API called");
    try {
        const { name, email, password, phone } = req.body;

        // Check if user exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return next(new ApiError('User already exists with this email', 400));
        }

        // Create user
        const user = await User.create({
            name,
            email,
            password,
            phone
        });

        // Generate tokens
        const accessToken = generateToken(user._id);
        const refreshToken = generateRefreshToken(user._id);

        // Store refresh token
        user.refreshToken = refreshToken;
        await user.save();

        res.status(201).json(new ApiResponse({
            accessToken,
            refreshToken,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                phone: user.phone
            }
        }, 'User registered successfully'));
    } catch (error) {
        next(error);
    }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return next(new ApiError('Please provide email and password', 400));
        }

        // Check user and get password
        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return next(new ApiError('Invalid email or password', 401));
        }

        // Check password
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return next(new ApiError('Invalid email or password', 401));
        }

        // Check if user is active
        if (!user.isActive) {
            return next(new ApiError('Your account has been deactivated', 403));
        }

        // Generate tokens
        const accessToken = generateToken(user._id);
        const refreshToken = generateRefreshToken(user._id);

        // Store refresh token
        user.refreshToken = refreshToken;
        await user.save();

        res.json(new ApiResponse({
            accessToken,
            refreshToken,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                avatar: user.avatar,
                phone: user.phone
            }
        }, 'Login successful'));
    } catch (error) {
        next(error);
    }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);

        if (!user) {
            return next(new ApiError('User not found', 404));
        }

        res.json(new ApiResponse({
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                avatar: user.avatar,
                phone: user.phone,
                completedDeliveries: user.completedDeliveries,
                rating: user.rating,
                isEmailVerified: user.isEmailVerified,
                createdAt: user.createdAt
            }
        }));
    } catch (error) {
        next(error);
    }
};

// @desc    Update user profile
// @route   PUT /api/auth/update-profile
// @access  Private
exports.updateProfile = async (req, res, next) => {
    try {
        const { name, phone, avatar } = req.body;

        const user = await User.findById(req.user.id);

        if (!user) {
            return next(new ApiError('User not found', 404));
        }

        // Update only provided fields
        if (name) user.name = name;
        if (phone) user.phone = phone;
        if (avatar) user.avatar = avatar;

        await user.save();

        res.json(new ApiResponse({
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                avatar: user.avatar,
                role: user.role
            }
        }, 'Profile updated successfully'));
    } catch (error) {
        next(error);
    }
};

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
exports.changePassword = async (req, res, next) => {
    try {
        const { currentPassword, newPassword } = req.body;

        // Get user with password field
        const user = await User.findById(req.user.id).select('+password');

        if (!user) {
            return next(new ApiError('User not found', 404));
        }

        // Verify current password
        const isPasswordValid = await user.comparePassword(currentPassword);
        if (!isPasswordValid) {
            return next(new ApiError('Current password is incorrect', 401));
        }

        // Check if new password is same as current
        const isSamePassword = await user.comparePassword(newPassword);
        if (isSamePassword) {
            return next(new ApiError('New password must be different from current password', 400));
        }

        // Update password
        user.password = newPassword;
        await user.save();

        res.json(new ApiResponse(null, 'Password changed successfully'));
    } catch (error) {
        next(error);
    }
};

// @desc    Refresh access token
// @route   POST /api/auth/refresh-token
// @access  Public
exports.refreshToken = async (req, res, next) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return next(new ApiError('Refresh token is required', 400));
        }

        // Verify refresh token
        let decoded;
        try {
            decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
        } catch (error) {
            return next(new ApiError('Invalid or expired refresh token', 401));
        }

        // Check if user exists and is active
        const user = await User.findById(decoded.id).select('+refreshToken');

        if (!user) {
            return next(new ApiError('User not found', 404));
        }

        if (!user.isActive) {
            return next(new ApiError('User account is deactivated', 403));
        }

        // Verify stored refresh token matches
        if (user.refreshToken && user.refreshToken !== refreshToken) {
            return next(new ApiError('Invalid refresh token', 401));
        }

        // Generate new tokens
        const newAccessToken = generateToken(user._id);
        const newRefreshToken = generateRefreshToken(user._id);

        // Update stored refresh token
        user.refreshToken = newRefreshToken;
        await user.save();

        res.json(new ApiResponse({
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        }, 'Token refreshed successfully'));
    } catch (error) {
        next(error);
    }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
exports.logout = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id).select('+refreshToken');

        if (user) {
            // Clear refresh token
            user.refreshToken = null;
            await user.save();
        }

        res.json(new ApiResponse(null, 'Logged out successfully'));
    } catch (error) {
        next(error);
    }
};

// @desc    Google OAuth callback
// @route   GET /api/auth/google/callback
// @access  Public
exports.googleCallback = async (req, res, next) => {
    try {
        const accessToken = generateToken(req.user._id);
        const refreshToken = generateRefreshToken(req.user._id);

        // Store refresh token
        req.user.refreshToken = refreshToken;
        await req.user.save();

        // Redirect to frontend with tokens
        res.redirect(
            `${process.env.CLIENT_URL}/auth/success?accessToken=${accessToken}&refreshToken=${refreshToken}`
        );
    } catch (error) {
        next(error);
    }
};

// @desc    Forgot password - Send reset email
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res, next) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            // Don't reveal if user exists for security
            return res.json(new ApiResponse(
                null,
                'If an account exists with this email, you will receive a password reset link'
            ));
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const hashedToken = crypto
            .createHash('sha256')
            .update(resetToken)
            .digest('hex');

        user.resetPasswordToken = hashedToken;
        user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes
        await user.save();

        // Create reset URL
        const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

        try {
            // Send email
            await sendPasswordResetEmail(user.email, user.name, resetUrl);

            res.json(new ApiResponse(
                null,
                'Password reset link sent to your email'
            ));
        } catch (emailError) {
            console.error('Email sending failed:', emailError);

            // Clear reset token if email fails
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;
            await user.save();

            return next(new ApiError('Email could not be sent. Please try again later', 500));
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Reset password
// @route   POST /api/auth/reset-password/:token
// @access  Public
exports.resetPassword = async (req, res, next) => {
    try {
        const { token } = req.params;
        const { newPassword } = req.body;

        if (!newPassword) {
            return next(new ApiError('New password is required', 400));
        }

        // Hash the token from URL
        const hashedToken = crypto
            .createHash('sha256')
            .update(token)
            .digest('hex');

        // Find user with valid token
        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpire: { $gt: Date.now() }
        }).select('+password');

        if (!user) {
            return next(new ApiError('Invalid or expired reset token', 400));
        }

        // Check if new password is same as old password
        const isSamePassword = await user.comparePassword(newPassword);
        if (isSamePassword) {
            return next(new ApiError('New password must be different from old password', 400));
        }

        // Set new password
        user.password = newPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();

        res.json(new ApiResponse(null, 'Password reset successful. You can now login with your new password'));
    } catch (error) {
        next(error);
    }
};

// @desc    Verify reset token
// @route   GET /api/auth/verify-reset-token/:token
// @access  Public
exports.verifyResetToken = async (req, res, next) => {
    try {
        const { token } = req.params;

        const hashedToken = crypto
            .createHash('sha256')
            .update(token)
            .digest('hex');

        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpire: { $gt: Date.now() }
        });

        if (!user) {
            return next(new ApiError('Invalid or expired reset token', 400));
        }

        res.json(new ApiResponse({ valid: true }, 'Token is valid'));
    } catch (error) {
        next(error);
    }
};





