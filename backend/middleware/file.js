// For file uploads, multer is a package that helps express
const multer = require('multer');

const MIME_TYPE_MAP = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg'
};

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const isValidMimeType = MIME_TYPE_MAP[file.mimetype];
    let error = new Error('Invalid mime type');
    if (isValidMimeType) {
      error = null;
    }
    // Path provided should be relative to server.js file
    cb(error, 'backend/images');

    // Uncomment line 21 for server deployment
    // cb(error, 'images');
  },
  filename: (req, file, cb) => {
    const name = file.originalname.toLowerCase().split(' ').join('-');
    const fileExt = MIME_TYPE_MAP[file.mimetype];
    cb(null, name + '-' + Date.now() + '.' + fileExt);
  }
});

module.exports = multer({ storage: fileStorage }).single('image');
