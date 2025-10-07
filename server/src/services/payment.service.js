const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Payment = require('../models/Payment');
const Delivery = require('../models/Delivery');
const { ErrorHandler } = require('../utils/errorHandler');

class PaymentService {
    async createPaymentIntent(deliveryId, userId) {
        const delivery = await Delivery.findById(deliveryId);

        if (!delivery) {
            throw new ErrorHandler('Delivery not found', 404);
        }

        if (delivery.requester.toString() !== userId) {
            throw new ErrorHandler('Not authorized', 403);
        }

        if (delivery.paymentStatus === 'paid') {
            throw new ErrorHandler('Payment already completed', 400);
        }

        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(delivery.price * 100),
            currency: 'usd',
            metadata: {
                deliveryId: delivery._id.toString(),
                userId: userId
            }
        });

        const payment = await Payment.create({
            delivery: deliveryId,
            user: userId,
            amount: delivery.price,
            paymentMethod: 'card',
            stripePaymentIntentId: paymentIntent.id,
            status: 'pending'
        });

        return {
            clientSecret: paymentIntent.client_secret,
            paymentId: payment._id,
            amount: delivery.price
        };
    }

    async confirmPayment(paymentIntentId) {
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

        if (paymentIntent.status !== 'succeeded') {
            throw new ErrorHandler('Payment not successful', 400);
        }

        const payment = await Payment.findOne({
            stripePaymentIntentId: paymentIntentId
        });

        if (!payment) {
            throw new ErrorHandler('Payment not found', 404);
        }

        payment.status = 'succeeded';
        await payment.save();

        const delivery = await Delivery.findById(payment.delivery);
        if (delivery) {
            delivery.paymentStatus = 'paid';
            await delivery.save();
        }

        return { payment, delivery };
    }

    async refundPayment(paymentId) {
        const payment = await Payment.findById(paymentId);

        if (!payment) {
            throw new ErrorHandler('Payment not found', 404);
        }

        if (payment.status !== 'succeeded') {
            throw new ErrorHandler('Cannot refund this payment', 400);
        }

        const refund = await stripe.refunds.create({
            payment_intent: payment.stripePaymentIntentId
        });

        payment.status = 'refunded';
        await payment.save();

        const delivery = await Delivery.findById(payment.delivery);
        if (delivery) {
            delivery.paymentStatus = 'refunded';
            await delivery.save();
        }

        return { payment, refund };
    }

    async getPaymentHistory(userId, options = {}) {
        const { page = 1, limit = 20 } = options;

        const payments = await Payment.find({ user: userId })
            .populate('delivery', 'title price status')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const count = await Payment.countDocuments({ user: userId });

        return {
            payments,
            totalPages: Math.ceil(count / limit),
            currentPage: parseInt(page)
        };
    }
}

module.exports = new PaymentService();
