const User = require('../models/User');
const TempUser = require('../models/TempUser');
const jwt = require('jsonwebtoken');
const { generateToken, generateRefreshToken } = require('../utils/jwt');
const { ApiResponse, ApiError } = require('../utils/apiResponse');
const crypto = require('crypto');
// FIX: Added the missing 'sendOtpEmail' import
const { sendPasswordResetEmail, sendOtpEmail } = require('../services/email.service');
const { generateOTP } = require('../utils/encyption');

/**
 * @desc    Handles the initial registration request by saving data to a temporary collection and sending an OTP.
 * @route   POST /api/auth/register
 * @access  Public
 */
exports.register = async (req, res, next) => {
    try {
        const { name, email, password, phone } = req.body;

        const existingVerifiedUser = await User.findOne({ email });
        if (existingVerifiedUser) {
            return next(new ApiError('An account with this email already exists.', 400));
        }

        const otp = generateOTP();
        const otpExpire = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        await TempUser.findOneAndUpdate(
            { email },
            { name, password, phone, otp, otpExpire },
            { upsert: true, new: true, setDefaultsOnInsert: true, runValidators: true }
        );

        await sendOtpEmail(email, name, otp);

        res.status(200).json(new ApiResponse({ email }, 'OTP sent to your email. Please verify to complete registration.'));
    } catch (error) {
        // This will now catch email sending errors properly
        console.error('Registration Error:', error);
        return next(new ApiError('Could not process registration. Please ensure server email configuration is correct.', 500));
    }
};

/**
 * @desc    Login user - with a check for unverified emails
 * @route   POST /api/auth/login
 * @access  Public
 */
exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return next(new ApiError('Please provide email and password', 400));
        }

        const user = await User.findOne({ email }).select('+password');

        // IMPROVEMENT: Handle users who exist but are not verified
        if (!user) {
            // Check if it's an unverified user trying to log in
            const tempUser = await TempUser.findOne({ email });
            if (tempUser) {
                const otp = generateOTP();
                tempUser.otp = otp;
                tempUser.otpExpire = new Date(Date.now() + 10 * 60 * 1000);
                await tempUser.save();
                await sendOtpEmail(tempUser.email, tempUser.name, otp);
                // Send a specific error code or message for the frontend to handle
                return next(new ApiError('Email not verified. A new OTP has been sent to your email.', 403));
            }
            return next(new ApiError('Invalid email or password', 401));
        }

        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return next(new ApiError('Invalid email or password', 401));
        }

        if (!user.isEmailVerified) {
            return next(new ApiError('Your email is not verified. Please complete the registration process.', 403));
        }

        if (!user.isActive) {
            return next(new ApiError('Your account has been deactivated', 403));
        }

        const accessToken = generateToken(user._id);
        const refreshToken = generateRefreshToken(user._id);

        user.refreshToken = refreshToken;
        await user.save();

        res.json(new ApiResponse({
            accessToken,
            refreshToken,
            user: { id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar, phone: user.phone }
        }, 'Login successful'));
    } catch (error) {
        next(error);
    }
};


// --- PASTE THE REST OF YOUR CONTROLLER FUNCTIONS BELOW ---
// (verifyEmail, resendOtp, getMe, etc. are correct from the previous steps)

/**
 * @desc    Verifies the OTP, creates a permanent user, and logs them in.
 * @route   POST /api/auth/verify-email
 * @access  Public
 */
exports.verifyEmail = async (req, res, next) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return next(new ApiError('Please provide email and OTP', 400));
        }

        const tempUser = await TempUser.findOne({
            email,
            otp,
            otpExpire: { $gt: Date.now() }
        });

        if (!tempUser) {
            return next(new ApiError('Invalid or expired OTP. Please try registering again.', 400));
        }

        const user = new User({
            name: tempUser.name,
            email: tempUser.email,
            password: tempUser.password,
            phone: tempUser.phone,
            isEmailVerified: true
        });
        await user.save();

        await TempUser.deleteOne({ email: tempUser.email });

        const accessToken = generateToken(user._id);
        const refreshToken = generateRefreshToken(user._id);

        user.refreshToken = refreshToken;
        await user.save();

        res.status(201).json(new ApiResponse({
            accessToken,
            refreshToken,
            user: { id: user._id, name: user.name, email: user.email, role: user.role, phone: user.phone }
        }, 'Registration successful! Welcome.'));
    } catch (error) {
        if (error.code === 11000) {
            return next(new ApiError('An account with this email already exists.', 400));
        }
        next(error);
    }
};

/**
 * @desc    Resends the OTP for an unverified registration.
 * @route   POST /api/auth/resend-otp
 * @access  Public
 */
exports.resendOtp = async (req, res, next) => {
    try {
        const { email } = req.body;

        if (!email) {
            return next(new ApiError('Email is required', 400));
        }

        const tempUser = await TempUser.findOne({ email });

        if (!tempUser) {
            return next(new ApiError('No registration attempt found for this email. Please register first.', 404));
        }

        const otp = generateOTP();
        tempUser.otp = otp;
        tempUser.otpExpire = new Date(Date.now() + 10 * 60 * 1000);
        await tempUser.save();

        await sendOtpEmail(tempUser.email, tempUser.name, otp);

        res.status(200).json(new ApiResponse(null, 'A new OTP has been sent to your email.'));
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

        const user = await User.findById(req.user.id).select('+password');

        if (!user) {
            return next(new ApiError('User not found', 404));
        }

        const isPasswordValid = await user.comparePassword(currentPassword);
        if (!isPasswordValid) {
            return next(new ApiError('Current password is incorrect', 401));
        }

        const isSamePassword = await user.comparePassword(newPassword);
        if (isSamePassword) {
            return next(new ApiError('New password must be different from current password', 400));
        }

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

        let decoded;
        try {
            decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
        } catch (error) {
            return next(new ApiError('Invalid or expired refresh token', 401));
        }

        const user = await User.findById(decoded.id).select('+refreshToken');

        if (!user) {
            return next(new ApiError('User not found', 404));
        }

        if (!user.isActive) {
            return next(new ApiError('User account is deactivated', 403));
        }

        if (user.refreshToken && user.refreshToken !== refreshToken) {
            return next(new ApiError('Invalid refresh token', 401));
        }

        const newAccessToken = generateToken(user._id);
        const newRefreshToken = generateRefreshToken(user._id);

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

        req.user.refreshToken = refreshToken;
        await req.user.save();

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
            return res.json(new ApiResponse(
                null,
                'If an account exists with this email, you will receive a password reset link'
            ));
        }

        const resetToken = crypto.randomBytes(32).toString('hex');
        const hashedToken = crypto
            .createHash('sha256')
            .update(resetToken)
            .digest('hex');

        user.resetPasswordToken = hashedToken;
        user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;
        await user.save();

        const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

        try {
            await sendPasswordResetEmail(user.email, user.name, resetUrl);

            res.json(new ApiResponse(
                null,
                'Password reset link sent to your email'
            ));
        } catch (emailError) {
            console.error('Email sending failed:', emailError);

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

        const hashedToken = crypto
            .createHash('sha256')
            .update(token)
            .digest('hex');

        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpire: { $gt: Date.now() }
        }).select('+password');

        if (!user) {
            return next(new ApiError('Invalid or expired reset token', 400));
        }

        const isSamePassword = await user.comparePassword(newPassword);
        if (isSamePassword) {
            return next(new ApiError('New password must be different from old password', 400));
        }

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