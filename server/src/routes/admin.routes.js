const express = require('express');
const {
    getDashboardStats,
    getAllUsers,
    getUserById,
    updateUserStatus,
    updateUserRole,
    deleteUser,
    getAllDeliveriesAdmin,
    deleteDelivery,
    getAllPayments
} = require('../controllers/admin.controller');
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');

const router = express.Router();

// Protect all routes and authorize only admin
router.use(protect);
router.use(authorize('admin'));

// Dashboard
router.get('/dashboard', getDashboardStats);

// User management
router.get('/users', getAllUsers);
router.get('/users/:userId', getUserById);
router.patch('/users/:userId/status', updateUserStatus);
router.patch('/users/:userId/role', updateUserRole);
router.delete('/users/:userId', deleteUser);

// Delivery management
router.get('/deliveries', getAllDeliveriesAdmin);
router.delete('/deliveries/:deliveryId', deleteDelivery);

// Payment management
router.get('/payments', getAllPayments);

module.exports = router;
