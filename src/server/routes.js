const express = require('express');
const passport = require('passport');
const router = express.Router();

const heroService = require('./hero.service');

router.get('/heroes', (req, res) => {
  heroService.getHeroes(req, res);
});

router.post('/hero', /* isLoggedIn, */ (req, res) => {
  heroService.postHero(req, res);
});

router.put('/hero/:id', /* isLoggedIn, */ (req, res) => {
  heroService.putHero(req, res);
});

router.delete('/hero/:id', /* isLoggedIn, */ (req, res) => {
  heroService.deleteHero(req, res);
});

function isLoggedIn(req, res, next) {
  // If user is authenticated in the session
  // carry on to the next middleware function
  if (req.isAuthenticated() && isValidAdmin(req.user)) {
    return next();
  } else {
    res.status(401).send({ message: 'unauthorized. please log in and try again' });
  }
}

function isValidAdmin(requestUser) {
  const validUsers = ['john_papa', '_clarkio'];
  return validUsers.find(user => requestUser.username.toLowerCase() === user.toLowerCase());
}

// Starts the login/authentication flow indicating to use Twitter
router.get('/login', passport.authenticate('twitter'));

// The route to which Twitter will send the authentication result
router.get(
  '/auth/twitter/callback',
  passport.authenticate('twitter', {
    successRedirect: '/',
    failureRedirect: '/login'
  })
);

router.get('/logout', (req, res) => {
  // The .logout() function is added by passport
  req.logout();
  res.status(200).send({
    message: `Hey, you should really reconsider and log back in. It's fun in here`
  });
});

router.get('/profile', (req, res) => {
  let body = {};
  // The .isAuthenticated() function is added by passport
  if (req.isAuthenticated()) {
    body = req.user;
  }
  res.status(200).send(body);
});

module.exports = router;
