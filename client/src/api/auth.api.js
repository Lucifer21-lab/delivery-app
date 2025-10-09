import axiosInstance from './axios.conf.js';

export const register = (data) => {
    console.log("Register API called in Frontend (auth.api)");
    return axiosInstance.post('/auth/register', data);
}

export const verifyEmail = (data) => axiosInstance.post('/auth/verify-email', data);

export const resendOtp = (data) => axiosInstance.post('/auth/resend-otp', data);

export const login = (data) => axiosInstance.post('/auth/login', data);

export const getCurrentUser = () => axiosInstance.get('/auth/me');

export const updateProfile = (data) => axiosInstance.put('/auth/update-profile', data);

export const changePassword = (data) => axiosInstance.put('/auth/change-password', data);

export const forgotPassword = (data) => axiosInstance.post('/auth/forgot-password', data);

export const resetPassword = (token, data) =>
    axiosInstance.post(`/auth/reset-password/${token}`, data);

export const verifyResetToken = (token) =>
    axiosInstance.get(`/auth/verify-reset-token/${token}`);

export const refreshToken = (refreshToken) =>
    axiosInstance.post('/auth/refresh-token', { refreshToken });

export const logout = () => axiosInstance.post('/auth/logout');

export const googleAuth = () => {
    window.location.href = `${import.meta.env.VITE_API_URL}/auth/google`;
};