const cloudinary = require('../config/cloudinary');
const asyncHandler = require('../utils/asyncHandler');

function uploadBufferToCloudinary(buffer) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'a2pex-kits/products', resource_type: 'image' },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    stream.end(buffer);
  });
}

// POST /api/upload  (admin) — field name: "images" (1 to 6 files)
const uploadImages = asyncHandler(async (req, res) => {
  const files = req.files || (req.file ? [req.file] : []);
  if (files.length === 0) {
    return res.status(400).json({ message: 'No image file(s) received.' });
  }

  const results = await Promise.all(files.map((f) => uploadBufferToCloudinary(f.buffer)));
  const urls = results.map((r) => r.secure_url);

  res.status(201).json({ urls });
});

module.exports = { uploadImages };
