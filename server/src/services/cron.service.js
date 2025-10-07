const cron = require('node-cron');
const Delivery = require('../models/Delivery');
const { createNotification } = require('../controllers/notification.controller');

// Check for expired deliveries every 5 minutes
exports.startCronJobs = () => {
    cron.schedule('*/5 * * * *', async () => {
        try {
            console.log('Running expired deliveries check...');

            const expiredDeliveries = await Delivery.find({
                status: 'pending',
                acceptDeadline: { $lt: new Date() }
            }).populate('requester');

            for (const delivery of expiredDeliveries) {
                delivery.status = 'expired';
                await delivery.save();

                // Notify requester
                await createNotification(
                    delivery.requester._id,
                    'request_expired',
                    'Delivery Request Expired',
                    `Your delivery request "${delivery.title}" has expired as no one accepted it within the deadline.`,
                    delivery._id
                );
            }

            if (expiredDeliveries.length > 0) {
                console.log(`Expired ${expiredDeliveries.length} deliveries`);
            }
        } catch (error) {
            console.error('Error in cron job:', error);
        }
    });

    // Check for approaching deadlines (24 hours before)
    cron.schedule('0 */6 * * *', async () => {
        try {
            console.log('Checking for approaching deadlines...');

            const tomorrow = new Date();
            tomorrow.setHours(tomorrow.getHours() + 24);

            const approachingDeadlines = await Delivery.find({
                status: { $in: ['accepted', 'in_progress'] },
                deliveryDeadline: { $lte: tomorrow, $gt: new Date() }
            }).populate('deliveryPerson requester');

            for (const delivery of approachingDeadlines) {
                // Notify delivery person
                await createNotification(
                    delivery.deliveryPerson._id,
                    'deadline_approaching',
                    'Delivery Deadline Approaching',
                    `The delivery "${delivery.title}" is due within 24 hours!`,
                    delivery._id
                );

                // Notify requester
                await createNotification(
                    delivery.requester._id,
                    'deadline_approaching',
                    'Delivery Deadline Approaching',
                    `Your delivery "${delivery.title}" is expected within 24 hours.`,
                    delivery._id
                );
            }

            if (approachingDeadlines.length > 0) {
                console.log(`Sent reminders for ${approachingDeadlines.length} deliveries`);
            }
        } catch (error) {
            console.error('Error in deadline reminder job:', error);
        }
    });

    console.log('Cron jobs started');
};
