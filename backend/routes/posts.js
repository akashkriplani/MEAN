const express = require('express');
const router = express.Router();
// For file uploads, multer is a package that helps express
const multer = require('multer');

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

router.post('', multer({ storage: fileStorage }).single('image'), (req, res, next) => {
  const url = req.protocol + '://' + req.get('host');
  const post = new Post({
    title: req.body.title,
    content: req.body.content,
    imagePath: url + '/images/' + req.file.filename
  });
  post.save().then((createdPost) => {
    res.status(201).json({
      message: 'Post added successfully.',
      post: {
        ...createdPost,
        id: createdPost._id
      }
    });
  });
});

router.get('', (req, res, next) => {
  Post.find().then((documents) => {
    res.status(200).json({
      message: 'Posts fetched successfully.',
      posts: documents
    });
  });
});

router.delete('/:id', (req, res, next) => {
  Post.deleteOne({ _id: req.params.id }).then((result) => {
    res.status(200).json({ message: 'Post deleted successfully.' });
  })
});

router.put('/:id', multer({ storage: fileStorage }).single('image'), (req, res, next) => {
  let imagePath = req.body.imagePath;
  if (req.file) {
    const url = req.protocol + '://' + req.get('host');
    imagePath = url + '/images/' + req.file.filename;
  }
  const post = new Post({
    _id: req.body.id,
    title: req.body.title,
    content: req.body.content,
    imagePath: imagePath
  });
  Post.updateOne({ _id: req.params.id }, post).then(() => {
    res.status(200).json({ message: 'Post updated successfully.' });
  });
});

router.get('/:id', (req, res, next) => {
  Post.findById(req.params.id).then((post) => {
    if (post) {
      res.status(200).json(post);
    } else {
      res.status(404).json({ message: 'Post not found!' });
    }
  })
});

module.exports = router;
