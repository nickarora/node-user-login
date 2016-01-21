var mongoose = require('mongoose');
var bcrypt = require('bcrypt');

mongoose.connect('mongodb://localhost/nodeauth');

var db = mongoose.connection;

var UserSchema = mongoose.Schema({
    username: {
        type: String,
        index: true
    },

    password: {
        type: String,
        required: true,
        bcrypt: true
    },

    email: {
        type: String
    },

    profileImage: {
        type: String
    }

});

var User = module.exports = mongoose.model('User', UserSchema);

module.exports.createUser = function(newUser, callback) {
    bcrypt.hash(newUser.password, 10, function(err, hash) {
        if (err) throw err;
        //set hash password
        newUser.password = hash;
        // create user
        newUser.save(callback);
    });
}