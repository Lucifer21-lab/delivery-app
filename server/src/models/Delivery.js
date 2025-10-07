const mongoose = require('mongoose');

const deliverySchema = new mongoose.Schema({
    requester: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    deliveryPerson: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    title: {
        type: String,
        required: [true, 'Title is required'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Description is required']
    },
    pickupLocation: {
        address: { type: String, required: true },
        coordinates: {
            lat: Number,
            lng: Number
        }
    },
    deliveryLocation: {
        address: { type: String, required: true },
        coordinates: {
            lat: Number,
            lng: Number
        }
    },
    packageDetails: {
        weight: Number,
        dimensions: String,
        fragile: { type: Boolean, default: false }
    },
    images: [{
        type: String
    }],
    acceptDeadline: {
        type: Date,
        required: [true, 'Accept deadline is required']
    },
    deliveryDeadline: {
        type: Date,
        required: [true, 'Delivery deadline is required']
    },
    price: {
        type: Number,
        required: [true, 'Price is required'],
        min: 0
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'in_progress', 'completed', 'cancelled', 'expired'],
        default: 'pending'
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'refunded'],
        default: 'pending'
    },
    acceptedAt: Date,
    completedAt: Date,
    cancelledAt: Date,
    cancellationReason: String
}, {
    timestamps: true
});

deliverySchema.index({ status: 1, acceptDeadline: 1 });
deliverySchema.index({ requester: 1 });
deliverySchema.index({ deliveryPerson: 1 });

deliverySchema.methods.checkExpiration = function () {
    if (this.status === 'pending' && new Date() > this.acceptDeadline) {
        this.status = 'expired';
        return true;
    }
    return false;
};

module.exports = mongoose.model('Delivery', deliverySchema);
