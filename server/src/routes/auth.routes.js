const express = require('express');
const passport = require('passport');
const { body } = require('express-validator');
const {
    register,
    login,
    getMe,
    updateProfile,
    changePassword,
    googleCallback,
    logout,
    refreshToken,
    forgotPassword,
    resetPassword,
    verifyResetToken
} = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validation.middleware');
const { authLimiter } = require('../middleware/rateLimiter.middleware');

const router = express.Router();

// ============================================
// PUBLIC ROUTES
// ============================================

// Register
router.post('/register', authLimiter, [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters')
        .matches(/\d/)
        .withMessage('Password must contain a number'),
    body('phone').optional().isMobilePhone().withMessage('Valid phone number required'),
    validate
], register);

// Login
router.post('/login', authLimiter, [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
    validate
], login);

// Refresh token
router.post('/refresh-token', authLimiter, [
    body('refreshToken').notEmpty().withMessage('Refresh token is required'),
    validate
], refreshToken);

// Forgot password
router.post('/forgot-password', authLimiter, [
    body('email').isEmail().withMessage('Valid email is required'),
    validate
], forgotPassword);

// Verify reset token
router.get('/verify-reset-token/:token', verifyResetToken);

// Reset password
router.post('/reset-password/:token', authLimiter, [
    body('newPassword')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters')
        .matches(/\d/)
        .withMessage('Password must contain a number'),
    validate
], resetPassword);

// Google OAuth
router.get('/google', passport.authenticate('google', {
    scope: ['profile', 'email']
}));

router.get('/google/callback',
    passport.authenticate('google', { failureRedirect: '/login', session: false }),
    googleCallback
);

// ============================================
// PROTECTED ROUTES
// ============================================

router.use(protect);

router.get('/me', getMe);

router.put('/update-profile', [
    body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
    body('phone').optional().isMobilePhone().withMessage('Valid phone number required'),
    validate
], updateProfile);

router.put('/change-password', [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword')
        .isLength({ min: 6 })
        .withMessage('New password must be at least 6 characters')
        .matches(/\d/)
        .withMessage('New password must contain a number'),
    validate
], changePassword);

router.post('/logout', logout);

module.exports = router;

