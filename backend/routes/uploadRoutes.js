
const express = require('express');
const router = express.Router();
const { uploadImage } = require('../controllers/admin/uploadController');
const { adminAuth } = require('../middleware/adminAuth');

router.post('/', adminAuth, uploadImage);

module.exports = router;