const Notification = require('../models/Notification');
const { emitToUser } = require('../socket/socketHandler');

class NotificationService {
    async createNotification(userId, type, title, message, deliveryId = null) {
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
            throw error;
        }
    }

    async getUserNotifications(userId, options = {}) {
        const { page = 1, limit = 20, read } = options;

        const query = { user: userId };
        if (read !== undefined) query.read = read;

        const notifications = await Notification.find(query)
            .populate('delivery', 'title status')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const count = await Notification.countDocuments(query);
        const unreadCount = await Notification.countDocuments({
            user: userId,
            read: false
        });

        return {
            notifications,
            totalPages: Math.ceil(count / limit),
            currentPage: parseInt(page),
            unreadCount
        };
    }

    async markAsRead(notificationId, userId) {
        const notification = await Notification.findOne({
            _id: notificationId,
            user: userId
        });

        if (!notification) {
            throw new Error('Notification not found');
        }

        notification.read = true;
        await notification.save();

        return notification;
    }

    async markAllAsRead(userId) {
        await Notification.updateMany(
            { user: userId, read: false },
            { read: true }
        );
    }

    async deleteNotification(notificationId, userId) {
        const notification = await Notification.findOne({
            _id: notificationId,
            user: userId
        });

        if (!notification) {
            throw new Error('Notification not found');
        }

        await Notification.findByIdAndDelete(notificationId);
    }
}

module.exports = new NotificationService();
