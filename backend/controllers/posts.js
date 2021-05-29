const Post = require('../models/post');

exports.getPosts = (req, res, next) => {
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
};

exports.getPost = (req, res, next) => {
  Post.findById(req.params.id).then((post) => {
    if (post) {
      res.status(200).json(post);
    } else {
      res.status(404).json({ message: 'Post not found!' });
    }
  }).catch(error => {
    res.status(500).json({ message: 'Fetching post failed!' });
  });
};

exports.createPost = (req, res, next) => {
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
  })
  .catch((error) => {
    res.status(500).json({ message: 'Creating a post failed!' });
  });
};

exports.deletePost = (req, res, next) => {
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
};

exports.updatePost = (req, res, next) => {
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
    if (result?.n > 0) {
      res.status(200).json({ message: 'Post updated successfully.' });
    } else {
      res.status(401).json({ message: 'Not authorized.' });
    }
  }).catch((error) => {
    res.status(500).json({ message: 'Could not update post!' });
  });
};
