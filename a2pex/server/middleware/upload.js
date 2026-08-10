const multer = require('multer');

const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
const MAX_SIZE_BYTES = (Number(process.env.MAX_UPLOAD_SIZE_MB) || 5) * 1024 * 1024;

function fileFilter(req, file, cb) {
  if (!ALLOWED_MIME.includes(file.mimetype)) {
    return cb(new Error('Only JPEG, PNG, WEBP or AVIF images are allowed.'));
  }
  cb(null, true);
}

// Files land in memory as a Buffer (req.file.buffer / req.files[].buffer)
// and are streamed straight to Cloudinary — never written to local disk.
const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter,
  limits: { fileSize: MAX_SIZE_BYTES },
});

module.exports = upload;
