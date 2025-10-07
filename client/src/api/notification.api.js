import axiosInstance from './axios.conf';

export const getNotifications = (params) =>
    axiosInstance.get('/notifications', { params });

export const markAsRead = (id) =>
    axiosInstance.patch(`/notifications/${id}/read`);

export const markAllAsRead = () =>
    axiosInstance.patch('/notifications/mark-all-read');

export const deleteNotification = (id) =>
    axiosInstance.delete(`/notifications/${id}`);