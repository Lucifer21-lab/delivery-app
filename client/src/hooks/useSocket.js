import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { io } from 'socket.io-client';
import { toast } from 'react-toastify';
import { addNotification } from '../redux/slices/notificationSlice';

const useSocket = () => {
    const dispatch = useDispatch();
    const { token, isAuthenticated } = useSelector((state) => state.auth);
    const socketRef = useRef(null);

    useEffect(() => {
        if (isAuthenticated && token && !socketRef.current) {
            const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

            try {
                const socket = io(SOCKET_URL, {
                    auth: { token },
                    transports: ['websocket', 'polling'],
                    reconnectionAttempts: 5,
                    reconnectionDelay: 2000,
                });

                socketRef.current = socket;

                socket.on('connect', () => console.log('✅ Socket connected:', socket.id));
                socket.on('disconnect', (reason) => console.warn('❌ Socket disconnected:', reason));
                socket.on('connect_error', (err) => console.error('⚠️ Socket connection error:', err.message));

                socket.on('deliveryAccepted', (data) => {
                    toast.success(`${data.deliveryPersonName} accepted your delivery!`);
                    dispatch(addNotification({
                        type: 'delivery_accepted',
                        title: 'Delivery Accepted',
                        message: `${data.deliveryPersonName} accepted your delivery`,
                        read: false,
                    }));
                });

                socket.on('deliveryStatusUpdated', (data) => {
                    toast.info(`Delivery status updated: ${data.status}`);
                });

                socket.on('newNotification', (data) => {
                    dispatch(addNotification(data.notification));
                    toast.info(data.notification.title);
                });

            } catch (err) {
                console.error('🔥 Error initializing socket:', err);
            }
        }

        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
                console.log('🔌 Socket cleaned up');
            }
        };
    }, [isAuthenticated, token, dispatch]);

    return socketRef.current;
};

export default useSocket;
