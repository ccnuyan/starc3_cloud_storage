var path = require('path');
var mongoose = require('mongoose');

var reporter = require('../services/statusReporter');

exports.isAllowed = function(err, req, res, next) {
  if (req.route && req.route.path === '/root') {
    return next();
  }

  if ((req.file && req.directory) && req.file.user.toString() === req.user.id && req.directory.user.toString() === req.user.id) {
    return next();
  }

  if ((req.file && !req.directory) && req.file.user.toString() === req.user.id) {
    return next();
  }

  if ((!req.file && req.directory) && req.directory.user.toString() === req.user.id) {
    return next();
  }

  return reporter.notAllowed(res);
};
