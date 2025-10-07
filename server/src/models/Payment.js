// const mongoose = require('mongoose');

// const paymentSchema = new mongoose.Schema({
//     delivery: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: 'Delivery',
//         required: true
//     },
//     user: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: 'User',
//         required: true
//     },
//     amount: {
//         type: Number,
//         required: true
//     },
//     currency: {
//         type: String,
//         default: 'INR'
//     },
//     paymentMethod: {
//         type: String,
//         enum: ['razorpay', 'card', 'upi', 'wallet', 'netbanking'],
//         default: 'razorpay'
//     },
//     razorpayOrderId: String,
//     razorpayPaymentId: String,
//     razorpaySignature: String,
//     refundId: String,
//     refundAmount: Number,
//     status: {
//         type: String,
//         enum: ['pending', 'succeeded', 'failed', 'refunded'],
//         default: 'pending'
//     },
//     metadata: {
//         type: Map,
//         of: String
//     }
// }, {
//     timestamps: true
// });

// module.exports = mongoose.model('Payment', paymentSchema);

