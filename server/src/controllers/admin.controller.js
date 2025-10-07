const User = require('../models/User');
const Delivery = require('../models/Delivery');
const Payment = require('../models/Payment');
const { ApiResponse, ApiError } = require('../utils/apiResponse');

exports.getDashboardStats = async (req, res, next) => {
    console.log("Admin Dashboard Requested !")
    try {
        const totalUsers = await User.countDocuments();
        const activeUsers = await User.countDocuments({ isActive: true });
        const totalDeliveries = await Delivery.countDocuments();
        const pendingDeliveries = await Delivery.countDocuments({ status: 'pending' });
        const acceptedDeliveries = await Delivery.countDocuments({ status: 'accepted' });
        const completedDeliveries = await Delivery.countDocuments({ status: 'completed' });
        const cancelledDeliveries = await Delivery.countDocuments({ status: 'cancelled' });

        const totalRevenue = await Payment.aggregate([
            { $match: { status: 'succeeded' } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);

        const recentUsers = await User.find()
            .select('name email role createdAt isActive')
            .sort({ createdAt: -1 })
            .limit(5);

        const recentDeliveries = await Delivery.find()
            .populate('requester', 'name email')
            .populate('deliveryPerson', 'name email')
            .sort({ createdAt: -1 })
            .limit(10);

        const recentPayments = await Payment.find()
            .populate('user', 'name email')
            .populate('delivery', 'title')
            .sort({ createdAt: -1 })
            .limit(10);

        res.json(new ApiResponse({
            stats: {
                totalUsers,
                activeUsers,
                totalDeliveries,
                pendingDeliveries,
                acceptedDeliveries,
                completedDeliveries,
                cancelledDeliveries,
                totalRevenue: totalRevenue[0]?.total || 0
            },
            recentUsers,
            recentDeliveries,
            recentPayments
        }, 'Dashboard stats fetched'));
    } catch (error) {
        next(error);
    }
};

exports.getAllUsers = async (req, res, next) => {
    try {
        const { page = 1, limit = 20, search, role, isActive } = req.query;

        const query = {};

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        if (role) query.role = role;
        if (isActive !== undefined) query.isActive = isActive === 'true';

        const users = await User.find(query)
            .select('-password -refreshToken')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const count = await User.countDocuments(query);

        res.json(new ApiResponse({
            users,
            totalPages: Math.ceil(count / limit),
            currentPage: parseInt(page),
            totalUsers: count
        }, 'Users fetched successfully'));
    } catch (error) {
        next(error);
    }
};

exports.getUserById = async (req, res, next) => {
    try {
        const { userId } = req.params;

        const user = await User.findById(userId).select('-password -refreshToken');
        if (!user) {
            return next(new ApiError('User not found', 404));
        }

        const deliveriesRequested = await Delivery.countDocuments({ requester: userId });
        const deliveriesCompleted = await Delivery.countDocuments({
            deliveryPerson: userId,
            status: 'completed'
        });

        res.json(new ApiResponse({
            user,
            stats: {
                deliveriesRequested,
                deliveriesCompleted
            }
        }));
    } catch (error) {
        next(error);
    }
};

exports.updateUserStatus = async (req, res, next) => {
    try {
        const { userId } = req.params;
        const { isActive } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return next(new ApiError('User not found', 404));
        }

        user.isActive = isActive;
        await user.save();

        res.json(new ApiResponse(user, `User ${isActive ? 'activated' : 'deactivated'} successfully`));
    } catch (error) {
        next(error);
    }
};

exports.updateUserRole = async (req, res, next) => {
    try {
        const { userId } = req.params;
        const { role } = req.body;

        if (!['client', 'admin'].includes(role)) {
            return next(new ApiError('Invalid role', 400));
        }

        const user = await User.findById(userId);
        if (!user) {
            return next(new ApiError('User not found', 404));
        }

        user.role = role;
        await user.save();

        res.json(new ApiResponse(user, 'User role updated successfully'));
    } catch (error) {
        next(error);
    }
};

exports.deleteUser = async (req, res, next) => {
    try {
        const { userId } = req.params;

        const user = await User.findById(userId);
        if (!user) {
            return next(new ApiError('User not found', 404));
        }

        // Check if user has active deliveries
        const activeDeliveries = await Delivery.countDocuments({
            $or: [
                { requester: userId, status: { $in: ['pending', 'accepted', 'in_progress'] } },
                { deliveryPerson: userId, status: { $in: ['accepted', 'in_progress'] } }
            ]
        });

        if (activeDeliveries > 0) {
            return next(new ApiError('Cannot delete user with active deliveries', 400));
        }

        await User.findByIdAndDelete(userId);

        res.json(new ApiResponse(null, 'User deleted successfully'));
    } catch (error) {
        next(error);
    }
};

exports.getAllDeliveriesAdmin = async (req, res, next) => {
    try {
        const { status, page = 1, limit = 20, search } = req.query;

        const query = {};
        if (status) query.status = status;

        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        const deliveries = await Delivery.find(query)
            .populate('requester', 'name email avatar')
            .populate('deliveryPerson', 'name email avatar')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const count = await Delivery.countDocuments(query);

        res.json(new ApiResponse({
            deliveries,
            totalPages: Math.ceil(count / limit),
            currentPage: parseInt(page),
            totalDeliveries: count
        }, 'Deliveries fetched successfully'));
    } catch (error) {
        next(error);
    }
};

exports.deleteDelivery = async (req, res, next) => {
    try {
        const { deliveryId } = req.params;

        const delivery = await Delivery.findById(deliveryId);
        if (!delivery) {
            return next(new ApiError('Delivery not found', 404));
        }

        await Delivery.findByIdAndDelete(deliveryId);

        res.json(new ApiResponse(null, 'Delivery deleted successfully'));
    } catch (error) {
        next(error);
    }
};

exports.getAllPayments = async (req, res, next) => {
    try {
        const { status, page = 1, limit = 20 } = req.query;

        const query = status ? { status } : {};

        const payments = await Payment.find(query)
            .populate('user', 'name email')
            .populate('delivery', 'title price')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const count = await Payment.countDocuments(query);

        res.json(new ApiResponse({
            payments,
            totalPages: Math.ceil(count / limit),
            currentPage: parseInt(page),
            totalPayments: count
        }));
    } catch (error) {
        next(error);
    }
};
