var express = require('express');
var router = express.Router();

var crypto = require('crypto');
var path = require('path');
var multer  = require('multer');

var passport = require('passport');
var localStrategy = require('passport-local').Strategy;

var User = require('../models/user');


// Initialization work we are doing for image file uploads using multer

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


// serialization is for session (saving current user and reloading user on subsequent sessions)

passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    User.getUserById(id, function(err, user) {
        done(err, user);
    });
});


// GET requests

router.get('/register', function(req, res, next) {
  res.render('register', { title: 'Register' });
});

router.get('/login', function(req, res, next) {
  res.render('Login', { title: 'Login' });
});


// Registration Post request.  Validates form input then creates a new user in the database.

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
    var newUser = new User({
      name: name,
      email: email,
      username: username,
      password: password,
      profileImage: profileImageName
    });

     //create user
    User.createUser(newUser, function(err, user) {
      if (err) throw err;
      console.log(user);
    });

    req.flash('success', 'You are now registered and may log in.');
    res.location('/');
    res.redirect('/');
  }

});


// Local Authentication

passport.use(new localStrategy(
    function(username, password, done) {
        User.getUserByUsername(username, function(err, user){
            if (err) throw err;

            if (!user) {
                console.log("Unknown user");
                return done(null, false, {message: 'Unknown user'});
            }

            User.comparePassword(password, user.password, function(err, isMatch) {
                if (err) throw err;
                if (isMatch) {
                    return done(null, user);
                } else {
                    console.log("Invalid password!")
                    return done(null, false, {message: 'Invalid password'});
                }
            });
        });
    }
));


// POST request for logins.  Relies on local authentication to make sure we only login the right user!

router.post('/login',
    passport.authenticate('local', {failureRedirect: '/users/login', failureFlash: 'Invalid username or password'}),
    function(req, res, next) {
        console.log("Authentication successful!");
        req.flash('success', 'You are now logged in.');
        res.redirect('/');
    }
);

module.exports = router;
