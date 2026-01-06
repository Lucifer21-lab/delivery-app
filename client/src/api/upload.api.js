import axiosInstance from './axios.conf';

export const uploadSingleFile = (file) => {
    const formData = new FormData();
    formData.append('file', file);

    return axiosInstance.post('/upload/single', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
};

export const uploadMultipleFiles = (files) => {
    const formData = new FormData();
    files.forEach(file => {
        formData.append('files', file);
    });

    return axiosInstance.post('/upload/multiple', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
};

export const deleteFile = (publicId) =>
    axiosInstance.delete('/upload', { data: { publicId } });