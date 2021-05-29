const express = require('express');
const router = express.Router();
// For file uploads, multer is a package that helps express
const multer = require('multer');
const checkAuth = require('../middleware/check-auth');

const Post = require('../models/post');

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

router.post('', checkAuth, multer({ storage: fileStorage }).single('image'), (req, res, next) => {
  const url = req.protocol + '://' + req.get('host');
  const post = new Post({
    title: req.body.title,
    content: req.body.content,
    imagePath: url + '/images/' + req.file.filename,
    // This userData key is coming from previous middleware checkAuth
    creator: req.userData.userId
  });
  post.save().then((createdPost) => {
    res.status(201).json({
      message: 'Post added successfully.',
      post: {
        ...createdPost,
        id: createdPost._id
      }
    })
    .catch((error) => {
      res.status(500).json({ message: 'Creating a post failed!' });
    });
  });
});

router.get('', (req, res, next) => {
  const pageSize = Number(req.query.pagesize);
  const currentPage = Number(req.query.page);
  const postQuery = Post.find();
  let fetchedPosts;
  if (pageSize && currentPage) {
    postQuery
      .skip(pageSize * (currentPage - 1))
      .limit(pageSize);
  }
  postQuery
    .then((documents) => {
      fetchedPosts = documents;
      return Post.countDocuments();
    })
    .then((count) => {
      res.status(200).json({
        message: 'Posts fetched successfully.',
        posts: fetchedPosts,
        maxPosts: count
      });
    }).catch(error => {
      res.status(500).json({ message: 'Fetching posts failed!' });
    });
});

// Get a single post
router.get('/:id', (req, res, next) => {
  Post.findById(req.params.id).then((post) => {
    if (post) {
      res.status(200).json(post);
    } else {
      res.status(404).json({ message: 'Post not found!' });
    }
  }).catch(error => {
    res.status(500).json({ message: 'Fetching post failed!' });
  });
})

router.delete('/:id', checkAuth, (req, res, next) => {
  Post.deleteOne({ _id: req.params.id, creator: req.userData.userId }).then((result) => {
    // If the user is the creator of the post, then n will have value > 0, in this case 1. If not, then he is not the creator of the post, so he should not be able to delete it.
    if (result?.n > 0) {
      res.status(200).json({ message: 'Post deleted successfully.' });
    } else {
      res.status(401).json({ message: 'Not authorized.' });
    }
  }).catch(error => {
    res.status(500).json({ message: 'Error occurred while deleting the post!' });
  })
});

router.put('/:id', checkAuth, multer({ storage: fileStorage }).single('image'), (req, res, next) => {
  let imagePath = req.body.imagePath;
  if (req.file) {
    const url = req.protocol + '://' + req.get('host');
    imagePath = url + '/images/' + req.file.filename;
  }
  const post = new Post({
    _id: req.body.id,
    title: req.body.title,
    content: req.body.content,
    imagePath: imagePath,
    creator: req.userData.userId
  });
  Post.updateOne({ _id: req.params.id, creator: req.userData.userId }, post).then((result) => {
    // If the user is the creator of the post, then nModified will have value > 0, in this case 1. If not, then he is not the creator of the post, so he should not be able to edit it.
    if (result?.nModified > 0) {
      res.status(200).json({ message: 'Post updated successfully.' });
    } else {
      res.status(401).json({ message: 'Not authorized.' });
    }
  }).catch((error) => {
    res.status(500).json({ message: 'Couldn\'\t update post!' });
  });
});

module.exports = router;
