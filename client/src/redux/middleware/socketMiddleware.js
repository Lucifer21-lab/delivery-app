import { io } from 'socket.io-client';
import { addNotification } from '../slices/notificationSlice';

let socket = null;

const socketMiddleware = (store) => (next) => (action) => {
    if (action.type === 'auth/login/fulfilled' || action.type === 'auth/loadUser/fulfilled') {
        const token = localStorage.getItem('token');

        if (token && !socket) {
            socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000', {
                auth: { token }
            });

            socket.on('connect', () => {
                console.log('Socket connected via middleware');
            });

            socket.on('newNotification', (data) => {
                store.dispatch(addNotification(data.notification));
            });

            socket.on('deliveryAccepted', (data) => {
                store.dispatch(addNotification({
                    type: 'delivery_accepted',
                    title: 'Delivery Accepted',
                    message: `${data.deliveryPersonName} accepted your delivery`,
                    read: false
                }));
            });
        }
    }

    if (action.type === 'auth/logout') {
        if (socket) {
            socket.disconnect();
            socket = null;
        }
    }

    return next(action);
};

export default socketMiddleware;
