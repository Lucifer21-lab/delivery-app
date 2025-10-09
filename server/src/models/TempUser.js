const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const tempUserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
    },
    phone: String,
    otp: String,
    otpExpire: Date,
    createdAt: {
        type: Date,
        default: Date.now,
        expires: '15m' // Automatically delete after 15 minutes
    }
});

// Hash password before saving
tempUserSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    if (this.password) {
        this.password = await bcrypt.hash(this.password, 12);
    }
    next();
});

module.exports = mongoose.model('TempUser', tempUserSchema);