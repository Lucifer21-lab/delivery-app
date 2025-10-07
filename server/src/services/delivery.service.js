const Delivery = require('../models/Delivery');
const User = require('../models/User');
const { ErrorHandler } = require('../utils/errorHandler');
const { emitToUser } = require('../socket/socketHandler');
const { createNotification } = require('../controllers/notification.controller');
const { sendDeliveryAcceptedEmail, sendDeliveryCompletedEmail } = require('./email.service');

class DeliveryService {
    async createDeliveryRequest(userId, deliveryData) {
        const now = new Date();
        const acceptDeadline = new Date(deliveryData.acceptDeadline);
        const deliveryDeadline = new Date(deliveryData.deliveryDeadline);

        if (acceptDeadline <= now) {
            throw new ErrorHandler('Accept deadline must be in the future', 400);
        }

        if (deliveryDeadline <= acceptDeadline) {
            throw new ErrorHandler('Delivery deadline must be after accept deadline', 400);
        }

        const delivery = await Delivery.create({
            ...deliveryData,
            requester: userId
        });

        return delivery;
    }

    async getAvailableDeliveries(userId, filters = {}) {
        const { page = 1, limit = 10, search, minPrice, maxPrice, sortBy = '-createdAt' } = filters;

        const query = {
            status: 'pending',
            acceptDeadline: { $gt: new Date() },
            requester: { $ne: userId } // Exclude own deliveries
        };

        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        if (minPrice) query.price = { ...query.price, $gte: parseFloat(minPrice) };
        if (maxPrice) query.price = { ...query.price, $lte: parseFloat(maxPrice) };

        const deliveries = await Delivery.find(query)
            .populate('requester', 'name avatar rating completedDeliveries')
            .sort(sortBy)
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const count = await Delivery.countDocuments(query);

        return {
            deliveries,
            totalPages: Math.ceil(count / limit),
            currentPage: parseInt(page),
            totalDeliveries: count
        };
    }

    async acceptDeliveryRequest(deliveryId, userId) {
        const delivery = await Delivery.findById(deliveryId)
            .populate('requester', 'name email');

        if (!delivery) {
            throw new ErrorHandler('Delivery not found', 404);
        }

        // Critical: Prevent self-acceptance
        if (delivery.requester._id.toString() === userId) {
            throw new ErrorHandler('You cannot accept your own delivery request', 403);
        }

        if (delivery.status !== 'pending') {
            throw new ErrorHandler('This delivery is not available for acceptance', 400);
        }

        if (new Date() > delivery.acceptDeadline) {
            delivery.status = 'expired';
            await delivery.save();
            throw new ErrorHandler('Accept deadline has passed', 400);
        }

        // Check for conflicting deliveries
        const conflictingDelivery = await Delivery.findOne({
            deliveryPerson: userId,
            status: { $in: ['accepted', 'in_progress'] },
            deliveryDeadline: {
                $gte: delivery.acceptDeadline,
                $lte: delivery.deliveryDeadline
            }
        });

        if (conflictingDelivery) {
            throw new ErrorHandler('You have a conflicting delivery at this time', 400);
        }

        const deliveryPerson = await User.findById(userId);

        delivery.deliveryPerson = userId;
        delivery.status = 'accepted';
        delivery.acceptedAt = new Date();
        await delivery.save();

        // Send notifications
        emitToUser(delivery.requester._id, 'deliveryAccepted', {
            deliveryId: delivery._id,
            deliveryPersonName: deliveryPerson.name,
            deliveryPersonAvatar: deliveryPerson.avatar
        });

        await createNotification(
            delivery.requester._id,
            'delivery_accepted',
            'Delivery Accepted',
            `${deliveryPerson.name} accepted your delivery request`,
            delivery._id
        );

        // Send email notification
        sendDeliveryAcceptedEmail(delivery.requester, deliveryPerson, delivery)
            .catch(err => console.error('Failed to send email:', err));

        return delivery;
    }

    async updateDeliveryStatus(deliveryId, userId, newStatus) {
        const delivery = await Delivery.findById(deliveryId);

        if (!delivery) {
            throw new ErrorHandler('Delivery not found', 404);
        }

        if (delivery.deliveryPerson.toString() !== userId) {
            throw new ErrorHandler('Not authorized to update this delivery', 403);
        }

        delivery.status = newStatus;

        if (newStatus === 'completed') {
            delivery.completedAt = new Date();

            // Update delivery person stats
            const deliveryPerson = await User.findById(userId);
            deliveryPerson.completedDeliveries += 1;
            await deliveryPerson.save();

            // Send completion notification
            const requester = await User.findById(delivery.requester);

            emitToUser(delivery.requester, 'deliveryCompleted', {
                deliveryId: delivery._id
            });

            await createNotification(
                delivery.requester,
                'delivery_completed',
                'Delivery Completed',
                `Your delivery "${delivery.title}" has been completed`,
                delivery._id
            );

            sendDeliveryCompletedEmail(requester, delivery)
                .catch(err => console.error('Failed to send email:', err));
        }

        await delivery.save();

        emitToUser(delivery.requester, 'deliveryStatusUpdated', {
            deliveryId: delivery._id,
            status: newStatus
        });

        return delivery;
    }

    async cancelDelivery(deliveryId, userId, reason) {
        const delivery = await Delivery.findById(deliveryId);

        if (!delivery) {
            throw new ErrorHandler('Delivery not found', 404);
        }

        if (delivery.requester.toString() !== userId) {
            throw new ErrorHandler('Not authorized to cancel this delivery', 403);
        }

        if (delivery.status !== 'pending') {
            throw new ErrorHandler('Cannot cancel this delivery', 400);
        }

        delivery.status = 'cancelled';
        delivery.cancelledAt = new Date();
        delivery.cancellationReason = reason || 'Cancelled by requester';
        await delivery.save();

        return delivery;
    }

    async getMyDeliveries(userId, type) {
        let query = {};

        if (type === 'requested') {
            query.requester = userId;
        } else if (type === 'delivering') {
            query.deliveryPerson = userId;
        } else {
            query = {
                $or: [
                    { requester: userId },
                    { deliveryPerson: userId }
                ]
            };
        }

        const deliveries = await Delivery.find(query)
            .populate('requester', 'name avatar email')
            .populate('deliveryPerson', 'name avatar email rating')
            .sort({ createdAt: -1 });

        return deliveries;
    }
}

module.exports = new DeliveryService();
