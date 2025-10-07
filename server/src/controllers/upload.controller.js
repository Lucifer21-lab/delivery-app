const cloudinary = require('../config/cloudinary');
const { ApiResponse, ApiError } = require('../utils/apiResponse');
const fs = require('fs');
const path = require('path');

exports.uploadFile = async (req, res, next) => {
    try {
        if (!req.file) {
            return next(new ApiError('No file uploaded', 400));
        }

        // Upload to Cloudinary
        const result = await cloudinary.uploader.upload(req.file.path, {
            folder: 'delivery-app',
            resource_type: 'auto'
        });

        // Delete local file after upload
        fs.unlinkSync(req.file.path);

        res.json(new ApiResponse({
            url: result.secure_url,
            publicId: result.public_id,
            format: result.format,
            size: result.bytes
        }, 'File uploaded successfully'));
    } catch (error) {
        // Clean up file on error
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        next(error);
    }
};

exports.uploadMultipleFiles = async (req, res, next) => {
    try {
        if (!req.files || req.files.length === 0) {
            return next(new ApiError('No files uploaded', 400));
        }

        const uploadPromises = req.files.map(file =>
            cloudinary.uploader.upload(file.path, {
                folder: 'delivery-app',
                resource_type: 'auto'
            })
        );

        const results = await Promise.all(uploadPromises);

        // Delete local files
        req.files.forEach(file => {
            if (fs.existsSync(file.path)) {
                fs.unlinkSync(file.path);
            }
        });

        const uploadedFiles = results.map(result => ({
            url: result.secure_url,
            publicId: result.public_id,
            format: result.format,
            size: result.bytes
        }));

        res.json(new ApiResponse(uploadedFiles, 'Files uploaded successfully'));
    } catch (error) {
        // Clean up files on error
        if (req.files) {
            req.files.forEach(file => {
                if (fs.existsSync(file.path)) {
                    fs.unlinkSync(file.path);
                }
            });
        }
        next(error);
    }
};

exports.deleteFile = async (req, res, next) => {
    try {
        const { publicId } = req.body;

        if (!publicId) {
            return next(new ApiError('Public ID is required', 400));
        }

        await cloudinary.uploader.destroy(publicId);

        res.json(new ApiResponse(null, 'File deleted successfully'));
    } catch (error) {
        next(error);
    }
};
