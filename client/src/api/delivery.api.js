import axiosInstance from './axios.conf';

export const createDelivery = (data) =>
    axiosInstance.post('/deliveries', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });

export const getAvailableDeliveries = (params) =>
    axiosInstance.get('/deliveries/available', { params });

export const getMyDeliveries = (type) =>
    axiosInstance.get('/deliveries/my', { params: { type } });

export const getDeliveryById = (id) =>
    axiosInstance.get(`/deliveries/${id}`);

export const acceptDelivery = (id) =>
    axiosInstance.post(`/deliveries/${id}/accept`);

export const updateDeliveryStatus = (id, status) =>
    axiosInstance.patch(`/deliveries/${id}/status`, { status });

export const deleteMyRequest = (id) =>
    axiosInstance.delete(`/deliveries/${id}`);