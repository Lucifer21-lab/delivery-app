const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { Server } = require("socket.io");

let io;
const userSockets = new Map(); // Maps userId to socketId
const socketUsers = new Map(); // Maps socketId to userId

/**
 * Initializes the Socket.IO server and sets up event listeners.
 * @param {http.Server} server The HTTP server to attach Socket.IO to.
 */
const initializeSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: process.env.CLIENT_URL || 'http://localhost:3000',
            methods: ['GET', 'POST', 'PUT', 'DELETE'],
            credentials: true
        }
    });

    // Middleware for authenticating socket connections using JWT
    io.use(async (socket, next) => {
        try {
            const token = socket.handshake.auth.token;

            if (!token) {
                return next(new Error('Authentication error: No token provided'));
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findById(decoded.id);

            if (!user || !user.isActive) {
                return next(new Error('Authentication error: User not found or inactive'));
            }

            socket.userId = user._id.toString();
            socket.user = {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            };
            next();
        } catch (error) {
            console.error('Socket authentication error:', error.message);
            next(new Error('Authentication error: Invalid token'));
        }
    });

    io.on('connection', (socket) => {
        console.log(`✅ User connected: ${socket.userId} (${socket.user.name})`);

        // Store user's socket connection
        userSockets.set(socket.userId, socket.id);
        socketUsers.set(socket.id, socket.userId);

        // Join a room specific to the user for private notifications
        socket.join(`user:${socket.userId}`);

        // Send connection confirmation
        socket.emit('connected', {
            message: 'Successfully connected to delivery app',
            userId: socket.userId,
            timestamp: new Date()
        });

        // Handle delivery tracking events
        socket.on('trackDelivery', (deliveryId) => {
            socket.join(`delivery:${deliveryId}`);
            console.log(`User ${socket.userId} is now tracking delivery ${deliveryId}`);
            socket.emit('trackingStarted', { deliveryId });
        });

        socket.on('stopTrackingDelivery', (deliveryId) => {
            socket.leave(`delivery:${deliveryId}`);
            console.log(`User ${socket.userId} stopped tracking delivery ${deliveryId}`);
            socket.emit('trackingStopped', { deliveryId });
        });

        // Handle real-time location updates from delivery person
        socket.on('updateLocation', (data) => {
            const { deliveryId, coordinates, speed, heading } = data;
            // Broadcast location to everyone tracking this delivery
            io.to(`delivery:${deliveryId}`).emit('locationUpdate', {
                deliveryId,
                coordinates,
                speed: speed || null,
                heading: heading || null,
                timestamp: new Date(),
                userId: socket.userId
            });
        });

        // Handle disconnection
        socket.on('disconnect', (reason) => {
            console.log(`❌ User disconnected: ${socket.userId} (${socket.user.name}) - Reason: ${reason}`);
            userSockets.delete(socket.userId);
            socketUsers.delete(socket.id);
        });
    });
};

/**
 * Emits an event to a specific user if they are connected.
 * @param {string} userId The ID of the user to send the event to.
 * @param {string} event The name of the event.
 * @param {object} data The data to send with the event.
 */
const emitToUser = (userId, event, data) => {
    if (!io) {
        console.error('Socket.IO not initialized');
        return false;
    }
    const socketId = userSockets.get(userId.toString());
    if (socketId) {
        io.to(socketId).emit(event, data);
        console.log(`📤 Emitted '${event}' to user ${userId}`);
        return true;
    } else {
        console.log(`⚠️ User ${userId} not connected, could not emit '${event}'`);
        return false;
    }
};

/**
 * Emits an event to all clients in a specific delivery room.
 * @param {string} deliveryId The ID of the delivery.
 * @param {string} event The name of the event.
 * @param {object} data The data to send with the event.
 */
const emitToDelivery = (deliveryId, event, data) => {
    if (!io) {
        console.error('Socket.IO not initialized');
        return false;
    }
    io.to(`delivery:${deliveryId.toString()}`).emit(event, data);
    console.log(`📤 Emitted '${event}' to delivery room ${deliveryId}`);
    return true;
};

const broadcast = (event, data) => {
    if (!io) {
        console.error('Socket.IO not initialized');
        return false;
    }
    io.emit(event, data);
    console.log(`📡 Broadcasted ${event} to all users`);
    return true;
};

const getOnlineUsersCount = () => {
    return userSockets.size;
};

const isUserOnline = (userId) => {
    return userSockets.has(userId.toString());
};

const getOnlineUsers = () => {
    return Array.from(userSockets.keys());
};

const disconnectUser = (userId) => {
    const socketId = userSockets.get(userId.toString());
    if (socketId && io) {
        const socket = io.sockets.sockets.get(socketId);
        if (socket) {
            socket.disconnect(true);
            return true;
        }
    }
    return false;
};

module.exports = {
    initializeSocket,
    emitToUser,
    emitToDelivery,
    broadcast,
    getIO: () => io,
    getOnlineUsersCount,
    isUserOnline,
    getOnlineUsers,
    disconnectUser
};

