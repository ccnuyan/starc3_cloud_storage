var passport = require('passport');
var diskPolicy = require('../policies/disk.server.policy.js');

module.exports = function(app) {
  app.use('/disk/',
    passport.authenticate('bearer', {
      session: false
    }),
    diskPolicy.isAllowed,
    require('./disk.server.router'));
};
