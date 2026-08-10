const express = require('express');
const router = express.Router();
const { uploadImages } = require('../controllers/uploadController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.post('/', protect, upload.array('images', 6), uploadImages);

module.exports = router;
