import axiosInstance from './axios.conf';

export const createPaymentOrder = (deliveryId) =>
    axiosInstance.post('/payments/create-order', { deliveryId });

export const verifyPayment = (data) =>
    axiosInstance.post('/payments/verify', data);

export const getPaymentHistory = (params) =>
    axiosInstance.get('/payments/history', { params });

export const getPaymentDetails = (paymentId) =>
    axiosInstance.get(`/payments/${paymentId}`);

export const refundPayment = (paymentId, data) =>
    axiosInstance.post(`/payments/${paymentId}/refund`, data);
