var path = require('path');
var mongoose = require('mongoose');
var Directory = mongoose.model('Directory');
var File = mongoose.model('File');
var FileObject = mongoose.model('FileObject');
var _ = require('lodash');
var populateParentToSubfiles = require('./populator').populateParentToSubfiles;

var reporter = require('../services/statusReporter');

var findDirectoryAndPopulate = function(id, next) {
  Directory.findById(id)
    .populate({
      path: 'subDirectories',
      match: null,
      options: {
        sort: {
          created: 1
        }
      }
    })
    .populate({
      path: 'subFiles',
      match: null,
      options: {
        sort: {
          created: 1
        }
      }
    })
    .exec(function(err, directory) {
      if (err) {
        return next(err);
      }
      if (!directory) {
        return next({
          message: 'directory specified does not exist'
        });
      }

      FileObject.populate(directory, {
        path: 'subFiles.fileObject'
      }, function(err, directoryPopulated) {
        if (err) {
          return next(err);
        }
        return next(null, directoryPopulated);
      });
    });
};

exports.root = function(req, res, next) {
  var callback = function(err, directory) {
    if (err) {
      return next(err);
    } else {
      res.status(200).json(populateParentToSubfiles(directory));
    }
  };
  findDirectoryAndPopulate(req.user.rootDirectory, callback);
};

exports.create = function(req, res, next) {
  var parentDirectory = req.parent;

  if (parentDirectory.depth >= 2) {
    return reporter.notAllowedToCreateDeeperDirectory(res);
  }

  var directoryToCreate = new Directory({
    name: req.body.name,
    parent: parentDirectory.id,
    depth: parentDirectory.depth + 1,
    user: req.user.id
  });

  var err = directoryToCreate.validateSync();
  if (err) {
    return reporter.directoryNameIlligal(res);
  }

  parentDirectory.subDirectories.push(directoryToCreate._id);
  directoryToCreate.save(function(outerError, retDir) {
    if (outerError) {
      return next(outerError);
    } else {
      parentDirectory.save(function(err) {
        if (err) {
          return next(err);
        } else {
          // no need to populate here
          return res.status(201).json(retDir);
        }
      });
    }
  });
};

exports.read = function(req, res) {
  return res.status(200).json(populateParentToSubfiles(req.directory));
};

exports.update = function(req, res, next) {
  var directory = req.directory;

  if (directory.depth === 0) {
    return next({
      message: 'not allowed to update the root directory'
    });
  }

  directory.name = req.body.name;
  directory.save(function(err, retDir) {
    if (err) {
      return next(err);
    } else {
      // no need to populate here
      return res.status(200).json(retDir);
    }
  });
};

exports.delete = function(req, res, next) {
  var directory = req.directory;

  if (directory.depth === 0) {
    return next({
      message: 'not allowed to remove the root directory'
    });
  }

  if ((!directory.subDirectories || directory.subDirectories.length === 0) &&
    (!directory.subFiles || directory.subFiles.length === 0)) {
    Directory.findByIdAndUpdate(directory.parent, {
        $pull: {
          subDirectories: directory._id
        }
      })
      .exec(function(outerError) {
        if (outerError) {
          return next(outerError);
        }
        directory.remove(function(err, retDir) {
          if (err) {
            return next(err);
          } else {
            // no need to populate here
            return res.status(200).json(retDir);
          }
        });
      });
  } else {
    return next({
      message: 'you must clear the directory first'
    });
  }
};

exports.parentCheck = function(req, res, next) {
  if (req.parent._id.equals(req.directory.parent)) {
    return next();
  } else {
    return next({
      status: 'failure',
      message: 'parentCheck failed'
    });
  }
};

exports.dirByID = function(req, res, next, id) {
  var callback = function(err, directory) {
    if (err) {
      return reporter.directoryNotExisted(res);
    } else {
      req.directory = directory;
      next();
    }
  };
  findDirectoryAndPopulate(id, callback);
};

exports.parentByID = function(req, res, next, id) {
  var callback = function(err, directory) {
    if (err) {
      return reporter.parentNotExisted(res);
    } else {
      req.parent = directory;
      next();
    }
  };
  findDirectoryAndPopulate(id, callback);
};

exports.sourceByID = function(req, res, next, id) {
  var callback = function(err, directory) {
    if (err) {
      return reporter.sourceNotExisted(res);
    } else {
      req.sourceDirectory = directory;
      next();
    }
  };
  findDirectoryAndPopulate(id, callback);
};

exports.targetByID = function(req, res, next, id) {
  var callback = function(err, directory) {
    if (err) {
      return reporter.targetNotExisted(res);
    } else {
      req.targetDirectory = directory;
      next();
    }
  };
  findDirectoryAndPopulate(id, callback);
};
