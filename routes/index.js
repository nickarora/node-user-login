var express = require('express');
var router = express.Router();

/* GET Members page. */
router.get('/', ensureAuthentication, function(req, res, next) {
  res.render('index', { title: 'Members' });
});

function ensureAuthentication(req, res, next) {
  if (req.isAuthenticated()) {
    next();
  }

  res.redirect('/users/login');
}

module.exports = router;
