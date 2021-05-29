const express = require('express');
const router = express.Router();
// For file uploads, multer is a package that helps express
const multer = require('multer');
const checkAuth = require('../middleware/check-auth');
const PostController = require('../controllers/posts');

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
  },
  filename: (req, file, cb) => {
    const name = file.originalname.toLowerCase().split(' ').join('-');
    const fileExt = MIME_TYPE_MAP[file.mimetype];
    cb(null, name + '-' + Date.now() + '.' + fileExt);
  }
});

// Create post
router.post(
  '',
  checkAuth,
  multer({ storage: fileStorage }).single('image'),
  PostController.createPost
);

// Get posts
router.get('', PostController.getPosts);

// Get a single post
router.get('/:id', PostController.getPost);

// Delete post
router.delete('/:id', checkAuth, PostController.deletePost);

// Update post
router.put(
  '/:id',
  checkAuth,
  multer({ storage: fileStorage }).single('image'),
  PostController.updatePost
);

module.exports = router;
