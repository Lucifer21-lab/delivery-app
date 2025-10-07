const express = require('express');
const {
    uploadFile,
    uploadMultipleFiles,
    deleteFile
} = require('../controllers/upload.controller');
const { protect } = require('../middleware/auth.middleware');
const { upload } = require('../middleware/upload.middleware');
const { uploadLimiter } = require('../middleware/rateLimiter.middleware');

const router = express.Router();

router.use(protect);
router.use(uploadLimiter);

router.post('/single', upload.single('file'), uploadFile);
router.post('/multiple', upload.array('files', 5), uploadMultipleFiles);
router.delete('/', deleteFile);

module.exports = router;
