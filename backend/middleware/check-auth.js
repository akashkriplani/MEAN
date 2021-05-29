const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  try {
    // Authorization token is generally in the form of string something like - Bearer
    // eyaodjakjdklajdlaaiodaisuyfsuiydfoiusydfiousyfiuysfiudysaiufysoiuyfiusayfdoiuyasiufy
    // attached to it before the token value, hence on receiving we are splitting it and
    // taking the value from the first position in the array.
    // Accessing the authorization from the request is case insensitive so
    // req.headers.authorization or req.headers.Authorization would work the same.
    // jwt.verify() checks for the validity of the token and throws error and goes to the
    // catch block when the token is invalid.
    const token = req.headers.authorization.split(' ')[1];
    const decodedToken = jwt.verify(token, 'secret_key_this_should_be_longer');
    // The userData property can be explicitly added to the request object and then this
    // userData property will be accessible to every other middleware that uses checkAuth
    // after the next() is called.
    req.userData = { email: decodedToken.email, userId: decodedToken.userId };
    next();
  } catch(error) {
    res.status(401).json({ message: 'Authentication failed.' });
  }
};
