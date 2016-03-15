var BearerStrategy = require('passport-http-bearer').Strategy;
var passport = require('passport');
var jwt = require('jwt-simple');
var conf = require('../config/config').getConfig();
var User = require('../users/model');
var mongoose = require('mongoose');
var Directory = mongoose.model('Directory');
var reporter = require('../services/statusReporter');

var strategy = new BearerStrategy(function(token, done) {
  var user = jwt.decode(token, conf.jwtsecret);
  User.findById(user.id).exec(function(err, userReturn) {
    if (err) {
      //impossible
      return done(err);
    }
    if (!userReturn) {
      return done({
        //impossible
        message: 'user not existed'
      });
    }
    if (!userReturn.rootDirectory) {
      var userRoot = new Directory({
        name: 'root',
        user: userReturn,
        depth: 0
      });
      userRoot.save(function(err, retDir) {
        if (err) {
          //impossible
          return done(err);
        }
        User.update({
          _id: user.id
        }, {
          $set: {
            rootDirectory: retDir._id
          }
        }).exec(function(err, rawResponse) {
          User.findById(user.id).exec(function(err, userUpdated) {
            if (err) {
              //impossible
              return done(err);
            }
            return done(null, userUpdated);
          });
        });
      });
    } else {
      return done(null, userReturn);
    }
  });
});

module.exports = function() {
  passport.use('bearer', strategy);
  console.log('Strategy bearer initialized');
};
