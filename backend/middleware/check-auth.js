const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  try {
    // Authorization token is generally in the form of string with Bearer eyaodjakjdklajdla
    // attached to it before the token value, hence on receiving we are splitting it and
    // taking the value from the first position in the array
    // jwt.verify() checks for the validity of the token and throws error and goes to the
    // catch block when the token is invalid.
    const token = req.headers.authorization.split('')[1];
    jwt.verify(token, 'secret_key_this_should_be_a_longer_string_for_dev_purposes_this_is_a_dummy_text');
    next();
  } catch(error) {
    res.status(401).json({ message: 'Authentication failed.' });
  }
};
