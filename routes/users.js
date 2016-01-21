var express = require('express');
var router = express.Router();

var crypto = require('crypto');
var path = require('path');
var multer  = require('multer');

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads')
  },
  filename: function (req, file, cb) {
    crypto.pseudoRandomBytes(16, function (err, raw) {
      if (err) return cb(err)
      cb(null, raw.toString('hex') + path.extname(file.originalname));
    })
  }
});

var upload = multer({ storage: storage });

router.get('/register', function(req, res, next) {
  res.render('register', { title: 'Register' });
});

router.get('/login', function(req, res, next) {
  res.render('Login', { title: 'Login' });
});

router.post('/register', upload.single('profileimage'), function(req, res, next) {

  var name = req.body.name;
  var username = req.body.username;
  var email = req.body.email;
  var password = req.body.password;
  var password2 = req.body.password2;

  if (req.file) {
    console.log('uploading file...');
    var profileImageName = req.file.filename;
  } else {
    var profileImageName = 'noimage.png';
  }

  // form validation
  req.checkBody('name', 'Name field is required').notEmpty();
  req.checkBody('username', 'Username field is required').notEmpty();
  req.checkBody('email', 'Email field is required').notEmpty();
  req.checkBody('email', 'Email is not valid').isEmail();
  req.checkBody('password', 'Password field is required').notEmpty();
  req.checkBody('password2', 'Passwords do not match').equals(req.body.password);

  var errors = req.validationErrors();

  if (errors) {
    res.render('register', {
      errors: errors,
      name: name,
      email: email,
      username: username,
      password: password,
      password2: password2
    });
  } else {
    //var newUser = new User({
    //  name: name,
    //  email: email,
    //  username: username,
    //  password: password,
    //  profileImage: profileImageName
    //});

    // create user
    //User.createUser(newUser, function(err, user) {
    //  if (err) throw err;
    //  console.log(user);
    //});

    req.flash('success', 'You are now registered and may log in.');
    res.location('/');
    res.redirect('/');
  }

});

module.exports = router;
