// const Razorpay = require('razorpay');
// const crypto = require('crypto');
// const Payment = require('../models/Payment');
// const Delivery = require('../models/Delivery');
// const { ApiResponse, ApiError } = require('../utils/apiResponse');

// const razorpayInstance = new Razorpay({
//     key_id: process.env.RAZORPAY_KEY_ID,
//     key_secret: process.env.RAZORPAY_KEY_SECRET
// });

// // @desc    Create Razorpay order
// // @route   POST /api/payments/create-order
// // @access  Private
// exports.createPaymentOrder = async (req, res, next) => {
//     try {
//         const { deliveryId } = req.body;

//         const delivery = await Delivery.findById(deliveryId);
//         if (!delivery) {
//             return next(new ApiError('Delivery not found', 404));
//         }

//         if (delivery.requester.toString() !== req.user.id) {
//             return next(new ApiError('Not authorized', 403));
//         }

//         if (delivery.paymentStatus === 'paid') {
//             return next(new ApiError('Payment already completed', 400));
//         }

//         // Create Razorpay order
//         const options = {
//             amount: Math.round(delivery.price * 100), // amount in paise (INR)
//             currency: 'INR',
//             receipt: `order_${deliveryId}_${Date.now()}`,
//             notes: {
//                 deliveryId: delivery._id.toString(),
//                 userId: req.user.id,
//                 deliveryTitle: delivery.title
//             }
//         };

//         const order = await razorpayInstance.orders.create(options);

//         // Create payment record
//         const payment = await Payment.create({
//             delivery: deliveryId,
//             user: req.user.id,
//             amount: delivery.price,
//             currency: 'INR',
//             paymentMethod: 'razorpay',
//             razorpayOrderId: order.id,
//             status: 'pending'
//         });

//         res.json(new ApiResponse({
//             orderId: order.id,
//             amount: order.amount,
//             currency: order.currency,
//             paymentId: payment._id,
//             razorpayKeyId: process.env.RAZORPAY_KEY_ID
//         }, 'Razorpay order created successfully'));
//     } catch (error) {
//         console.error('Razorpay order creation error:', error);
//         next(error);
//     }
// };

// // @desc    Verify Razorpay payment
// // @route   POST /api/payments/verify
// // @access  Private
// exports.verifyPayment = async (req, res, next) => {
//     try {
//         const {
//             razorpay_order_id,
//             razorpay_payment_id,
//             razorpay_signature
//         } = req.body;

//         // Verify signature
//         const body = razorpay_order_id + '|' + razorpay_payment_id;
//         const expectedSignature = crypto
//             .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
//             .update(body.toString())
//             .digest('hex');

//         const isAuthentic = expectedSignature === razorpay_signature;

//         if (!isAuthentic) {
//             return next(new ApiError('Payment verification failed', 400));
//         }

//         // Update payment record
//         const payment = await Payment.findOne({ razorpayOrderId: razorpay_order_id });

//         if (!payment) {
//             return next(new ApiError('Payment not found', 404));
//         }

//         payment.razorpayPaymentId = razorpay_payment_id;
//         payment.razorpaySignature = razorpay_signature;
//         payment.status = 'succeeded';
//         await payment.save();

//         // Update delivery payment status
//         const delivery = await Delivery.findById(payment.delivery);
//         if (delivery) {
//             delivery.paymentStatus = 'paid';
//             await delivery.save();
//         }

//         res.json(new ApiResponse({
//             payment,
//             delivery
//         }, 'Payment verified successfully'));
//     } catch (error) {
//         next(error);
//     }
// };

// // @desc    Get Razorpay payment details
// // @route   GET /api/payments/:paymentId
// // @access  Private
// exports.getPaymentDetails = async (req, res, next) => {
//     try {
//         const { paymentId } = req.params;

//         const payment = await Payment.findOne({ razorpayPaymentId: paymentId });

//         if (!payment) {
//             return next(new ApiError('Payment not found', 404));
//         }

//         // Fetch from Razorpay
//         const razorpayPayment = await razorpayInstance.payments.fetch(paymentId);

//         res.json(new ApiResponse({
//             payment,
//             razorpayPayment
//         }));
//     } catch (error) {
//         next(error);
//     }
// };

// // @desc    Refund payment
// // @route   POST /api/payments/:paymentId/refund
// // @access  Private (Admin)
// exports.refundPayment = async (req, res, next) => {
//     try {
//         const { paymentId } = req.params;
//         const { amount, reason } = req.body;

//         const payment = await Payment.findById(paymentId);

//         if (!payment) {
//             return next(new ApiError('Payment not found', 404));
//         }

//         if (payment.status !== 'succeeded') {
//             return next(new ApiError('Cannot refund this payment', 400));
//         }

//         // Create refund in Razorpay
//         const refundAmount = amount ? Math.round(amount * 100) : Math.round(payment.amount * 100);

//         const refund = await razorpayInstance.payments.refund(
//             payment.razorpayPaymentId,
//             {
//                 amount: refundAmount,
//                 notes: {
//                     reason: reason || 'Refund requested',
//                     refundedBy: req.user.id
//                 }
//             }
//         );

//         payment.status = 'refunded';
//         payment.refundId = refund.id;
//         payment.refundAmount = refundAmount / 100;
//         await payment.save();

//         // Update delivery
//         const delivery = await Delivery.findById(payment.delivery);
//         if (delivery) {
//             delivery.paymentStatus = 'refunded';
//             await delivery.save();
//         }

//         res.json(new ApiResponse({
//             payment,
//             refund
//         }, 'Payment refunded successfully'));
//     } catch (error) {
//         next(error);
//     }
// };

// // @desc    Get payment history
// // @route   GET /api/payments/history
// // @access  Private
// exports.getPaymentHistory = async (req, res, next) => {
//     try {
//         const { page = 1, limit = 20 } = req.query;

//         const payments = await Payment.find({ user: req.user.id })
//             .populate('delivery', 'title price status')
//             .sort({ createdAt: -1 })
//             .limit(limit * 1)
//             .skip((page - 1) * limit);

//         const count = await Payment.countDocuments({ user: req.user.id });

//         res.json(new ApiResponse({
//             payments,
//             totalPages: Math.ceil(count / limit),
//             currentPage: parseInt(page),
//             totalPayments: count
//         }));
//     } catch (error) {
//         next(error);
//     }
// };

// // @desc    Razorpay webhook handler
// // @route   POST /api/payments/webhook
// // @access  Public
// exports.webhookHandler = async (req, res, next) => {
//     try {
//         const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
//         const signature = req.headers['x-razorpay-signature'];

//         // Verify webhook signature
//         const expectedSignature = crypto
//             .createHmac('sha256', secret)
//             .update(JSON.stringify(req.body))
//             .digest('hex');

//         if (signature !== expectedSignature) {
//             return res.status(400).json({ error: 'Invalid signature' });
//         }

//         const event = req.body.event;
//         const paymentEntity = req.body.payload.payment.entity;

//         // Handle different events
//         switch (event) {
//             case 'payment.captured':
//                 const payment = await Payment.findOne({
//                     razorpayPaymentId: paymentEntity.id
//                 });

//                 if (payment && payment.status === 'pending') {
//                     payment.status = 'succeeded';
//                     await payment.save();

//                     const delivery = await Delivery.findById(payment.delivery);
//                     if (delivery) {
//                         delivery.paymentStatus = 'paid';
//                         await delivery.save();
//                     }
//                 }
//                 break;

//             case 'payment.failed':
//                 const failedPayment = await Payment.findOne({
//                     razorpayPaymentId: paymentEntity.id
//                 });

//                 if (failedPayment) {
//                     failedPayment.status = 'failed';
//                     await failedPayment.save();
//                 }
//                 break;

//             case 'refund.processed':
//                 // Handle refund processed
//                 break;
//         }

//         res.json({ received: true });
//     } catch (error) {
//         console.error('Webhook error:', error);
//         res.status(500).json({ error: 'Webhook processing failed' });
//     }
// };
