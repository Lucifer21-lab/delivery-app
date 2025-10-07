const Notification = require('../models/Notification');
const { ApiResponse, ApiError } = require('../utils/apiResponse');
const emitToUser = require('../socket/socketHandler');

exports.getNotifications = async (req, res, next) => {
    try {
        const { page = 1, limit = 20, read } = req.query;

        const query = { user: req.user.id };
        if (read !== undefined) query.read = read === 'true';

        const notifications = await Notification.find(query)
            .populate('delivery', 'title status')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const count = await Notification.countDocuments(query);
        const unreadCount = await Notification.countDocuments({
            user: req.user.id,
            read: false
        });

        res.json(new ApiResponse({
            notifications,
            totalPages: Math.ceil(count / limit),
            currentPage: parseInt(page),
            unreadCount
        }));
    } catch (error) {
        next(error);
    }
};

exports.markAsRead = async (req, res, next) => {
    try {
        const { notificationId } = req.params;

        const notification = await Notification.findById(notificationId);
        if (!notification) {
            return next(new ApiError('Notification not found', 404));
        }

        if (notification.user.toString() !== req.user.id) {
            return next(new ApiError('Not authorized', 403));
        }

        notification.read = true;
        await notification.save();

        res.json(new ApiResponse(notification, 'Notification marked as read'));
    } catch (error) {
        next(error);
    }
};

exports.markAllAsRead = async (req, res, next) => {
    try {
        await Notification.updateMany(
            { user: req.user.id, read: false },
            { read: true }
        );

        res.json(new ApiResponse(null, 'All notifications marked as read'));
    } catch (error) {
        next(error);
    }
};

exports.deleteNotification = async (req, res, next) => {
    try {
        const { notificationId } = req.params;

        const notification = await Notification.findById(notificationId);
        if (!notification) {
            return next(new ApiError('Notification not found', 404));
        }

        if (notification.user.toString() !== req.user.id) {
            return next(new ApiError('Not authorized', 403));
        }

        await Notification.findByIdAndDelete(notificationId);

        res.json(new ApiResponse(null, 'Notification deleted'));
    } catch (error) {
        next(error);
    }
};

exports.createNotification = async (userId, type, title, message, deliveryId = null) => {
    try {
        const notification = await Notification.create({
            user: userId,
            type,
            title,
            message,
            delivery: deliveryId
        });

        // Emit real-time notification
        emitToUser(userId, 'newNotification', notification);

        return notification;
    } catch (error) {
        console.error('Error creating notification:', error);
    }
};
