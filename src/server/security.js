const env = require('./env/' + (process.env.NODE_ENV || 'development'));
const passport = require('passport');
const session = require('express-session');
const csrf = require('csurf');
const helmet = require('helmet');

require('./config/passport');

module.exports = function() {
  const middleware = [
    helmet(),
    session({
      secret: env.sessionSecret,
      resave: true,
      saveUninitialized: true
    }),
    passport.initialize(),
    passport.session(),
    csrf(),
    (req, res, next) => {
      res.cookie('XSRF-TOKEN', req.csrfToken());
      return next();
    }
  ];
  return middleware;
};
