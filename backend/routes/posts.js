const express = require('express');
const router = express.Router();
const checkAuth = require('../middleware/check-auth');
const extractFile = require('../middleware/file');
const PostController = require('../controllers/posts');

// Create post
router.post('', checkAuth, extractFile, PostController.createPost);

// Get posts
router.get('', PostController.getPosts);

// Get a single post
router.get('/:id', PostController.getPost);

// Delete post
router.delete('/:id', checkAuth, PostController.deletePost);

// Update post
router.put('/:id', checkAuth, extractFile, PostController.updatePost);

module.exports = router;
