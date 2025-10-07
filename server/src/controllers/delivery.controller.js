const Delivery = require('../models/Delivery');
const { ApiResponse, ApiError } = require('../utils/apiResponse');
const emitToUser = require('../socket/socketHandler');
const cloudinary = require('../config/cloudinary');

exports.createDelivery = async (req, res, next) => {
    try {
        const {
            title,
            description,
            pickupLocation,
            deliveryLocation,
            packageDetails,
            acceptDeadline,
            deliveryDeadline,
            price
        } = req.body;

        const now = new Date();
        const acceptDL = new Date(acceptDeadline);
        const deliveryDL = new Date(deliveryDeadline);

        if (acceptDL <= now) {
            return next(new ApiError('Accept deadline must be in the future', 400));
        }

        if (deliveryDL <= acceptDL) {
            return next(new ApiError('Delivery deadline must be after accept deadline', 400));
        }

        let imageUrls = [];
        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                const result = await cloudinary.uploader.upload(file.path);
                imageUrls.push(result.secure_url);
            }
        }

        const delivery = await Delivery.create({
            requester: req.user.id,
            title,
            description,
            pickupLocation: typeof pickupLocation === 'string' ? JSON.parse(pickupLocation) : pickupLocation,
            deliveryLocation: typeof deliveryLocation === 'string' ? JSON.parse(deliveryLocation) : deliveryLocation,
            packageDetails: typeof packageDetails === 'string' ? JSON.parse(packageDetails) : packageDetails,
            acceptDeadline,
            deliveryDeadline,
            price,
            images: imageUrls
        });

        res.status(201).json(new ApiResponse(delivery, 'Delivery request created successfully'));
    } catch (error) {
        next(error);
    }
};

exports.getAvailableDeliveries = async (req, res, next) => {
    try {
        const { page = 1, limit = 10, search, minPrice, maxPrice } = req.query;

        const query = {
            status: 'pending',
            acceptDeadline: { $gt: new Date() },
            requester: { $ne: req.user.id }
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
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const count = await Delivery.countDocuments(query);

        res.json(new ApiResponse({
            deliveries,
            totalPages: Math.ceil(count / limit),
            currentPage: parseInt(page),
            totalDeliveries: count
        }, 'Available deliveries fetched successfully'));
    } catch (error) {
        next(error);
    }
};

exports.acceptDelivery = async (req, res, next) => {
    try {
        const delivery = await Delivery.findById(req.params.id).populate('requester', 'name email');

        if (!delivery) {
            return next(new ApiError('Delivery not found', 404));
        }

        if (delivery.requester._id.toString() === req.user.id) {
            return next(new ApiError('You cannot accept your own delivery request', 403));
        }

        if (delivery.status !== 'pending') {
            return next(new ApiError('This delivery is not available for acceptance', 400));
        }

        if (new Date() > delivery.acceptDeadline) {
            delivery.status = 'expired';
            await delivery.save();
            return next(new ApiError('Accept deadline has passed for this delivery', 400));
        }

        const conflictingDelivery = await Delivery.findOne({
            deliveryPerson: req.user.id,
            status: { $in: ['accepted', 'in_progress'] },
            deliveryDeadline: {
                $gte: delivery.acceptDeadline,
                $lte: delivery.deliveryDeadline
            }
        });

        if (conflictingDelivery) {
            return next(new ApiError('You have a conflicting delivery scheduled at this time', 400));
        }

        delivery.deliveryPerson = req.user.id;
        delivery.status = 'accepted';
        delivery.acceptedAt = new Date();

        await delivery.save();

        emitToUser(delivery.requester._id, 'deliveryAccepted', {
            deliveryId: delivery._id,
            deliveryPersonName: req.user.name,
            deliveryPersonAvatar: req.user.avatar,
            acceptedAt: delivery.acceptedAt
        });

        res.json(new ApiResponse(delivery, 'Delivery accepted successfully! The requester has been notified.'));
    } catch (error) {
        next(error);
    }
};

exports.updateDeliveryStatus = async (req, res, next) => {
    try {
        const { status } = req.body;
        const delivery = await Delivery.findById(req.params.id);

        if (!delivery) {
            return next(new ApiError('Delivery not found', 404));
        }

        if (delivery.deliveryPerson.toString() !== req.user.id) {
            return next(new ApiError('Not authorized', 403));
        }

        delivery.status = status;

        if (status === 'completed') {
            delivery.completedAt = new Date();
        }

        await delivery.save();

        emitToUser(delivery.requester, 'deliveryStatusUpdated', {
            deliveryId: delivery._id,
            status
        });

        res.json(new ApiResponse(delivery, 'Status updated successfully'));
    } catch (error) {
        next(error);
    }
};

exports.getMyDeliveries = async (req, res, next) => {
    try {
        const { type } = req.query;

        let query = {};
        if (type === 'requested') {
            query.requester = req.user.id;
        } else if (type === 'delivering') {
            query.deliveryPerson = req.user.id;
        } else {
            query = {
                $or: [
                    { requester: req.user.id },
                    { deliveryPerson: req.user.id }
                ]
            };
        }

        const deliveries = await Delivery.find(query)
            .populate('requester', 'name avatar')
            .populate('deliveryPerson', 'name avatar rating')
            .sort({ createdAt: -1 });

        res.json(new ApiResponse({ deliveries }));
    } catch (error) {
        next(error);
    }
};

exports.getDeliveryById = async (req, res, next) => {
    try {
        const delivery = await Delivery.findById(req.params.id)
            .populate('requester', 'name avatar email phone rating')
            .populate('deliveryPerson', 'name avatar email phone rating');

        if (!delivery) {
            return next(new ApiError('Delivery not found', 404));
        }

        res.json(new ApiResponse(delivery));
    } catch (error) {
        next(error);
    }
};

exports.cancelDelivery = async (req, res, next) => {
    try {
        const delivery = await Delivery.findById(req.params.id);

        if (!delivery) {
            return next(new ApiError('Delivery not found', 404));
        }

        if (delivery.requester.toString() !== req.user.id) {
            return next(new ApiError('Not authorized', 403));
        }

        if (delivery.status !== 'pending') {
            return next(new ApiError('Cannot cancel this delivery', 400));
        }

        delivery.status = 'cancelled';
        delivery.cancelledAt = new Date();
        delivery.cancellationReason = req.body.reason || 'Cancelled by requester';

        await delivery.save();

        res.json(new ApiResponse(delivery, 'Delivery cancelled successfully'));
    } catch (error) {
        next(error);
    }
};
