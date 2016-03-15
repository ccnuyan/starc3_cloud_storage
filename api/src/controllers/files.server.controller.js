var path = require('path');
var conf = require('../config/config').getConfig();
var mongoose = require('mongoose');
var Directory = mongoose.model('Directory');
var File = mongoose.model('File');
var _ = require('lodash');

var FileObject = mongoose.model('FileObject');
var TempFileObject = mongoose.model('TempFileObject');
var RemovedFileObject = mongoose.model('RemovedFileObject');

var storageRequest = require('../services/storageRequest.js');

var populateParentToSubfiles = require('./populator').populateParentToSubfiles;
var populateParentToFile = require('./populator').populateParentToFile;

var reporter = require('../services/statusReporter');

exports.read = function(req, res) {
  return res.status(200).json(populateParentToFile(req.file, req.parent));
};

exports.update = function(req, res, next) {
  var file = req.file;
  var fileObject = req.file.fileObject;

  var newName = req.body.name;
  var idx = newName.indexOf(fileObject.extension);

  if (idx < 0 || idx !== (newName.length - fileObject.extension.length)) {
    return reporter.notAllowedToModifyFileExtension(res);
  }

  file.name = newName;
  var err = file.validateSync();
  if (err) {
    return reporter.fileNameIlligal(res);
  }
  file.save(function(err, retDiskFile) {
    if (err) {
      return next(err);
    } else {
      return res.status(200).json(populateParentToFile(retDiskFile, req.parent));
    }
  });
};

exports.delete = function(req, res, next) {
  var parent = req.parent;
  var file = req.file;
  var fileObject = req.file.fileObject;

  Directory.findByIdAndUpdate(parent._id, {
      $pull: {
        subFiles: file._id
      }
    }, {
      new: true
    })
    .exec(function(outerError) {
      if (outerError) {
        return next(outerError);
      }
      file.remove();
      fileObject.remove();
      //this is an async operation
      var removedFileObject = new RemovedFileObject(fileObject.toObject());
      removedFileObject.save();

      return res.status(200).json(populateParentToFile(file, req.parent));
    });
};

exports.create = function(req, res, next) {
  var parent = req.parent;
  var tfObj = req.body.file;
  tfObj.user = req.user.id;

  var fileObject = new FileObject(tfObj);
  var file = new File({
    user: req.user.id
  });
  fileObject.save(function(outerError, fileObjectRet) {
    if (outerError) {
      return next(outerError);
    }
    file.fileObject = fileObjectRet;
    file.name = fileObjectRet.name;
    file.save(function(err, fileRet) {
      if (err) {
        return next(err);
      }

      parent.subFiles.push(fileRet._id);

      parent.save(function(innerError) {
        if (innerError) {
          return next(innerError);
        }
        return res.status(201).json(populateParentToFile(fileRet, req.parent));
      });
    });
  });
};

exports.requestUpload = function(req, res) {
  var callback = function(err, transaction) {
    if (err) {
      return next(err);
    }
    return res.status(201).send(transaction);
  };
  storageRequest.uploadRequest(req.headers.authorization, 'POST', conf.domain + '/cloud/api/disk/dir/' + req.parent.id + '/subfile/', null, callback);
};

exports.requestDownload = function(req, res) {
  var callback = function(err, transaction) {
    if (err) {
      return next(err);
    }
    return res.status(201).send(transaction);
  };
  var fileName = req.file.fileObject.name;
  storageRequest.downloadRequest(req.file.fileObject.storage_box_id, req.file.fileObject.storage_object_id, fileName, callback);
};

exports.move = function(req, res, next) {

  var sourceDir = req.sourceDirectory;
  var targetDir = req.targetDirectory;

  var file = req.file;


  if (targetDir._id.equals(sourceDir._id) ||
    !_.some(sourceDir.subFiles, {
      _id: file._id
    }) ||
    !sourceDir.user.equals(req.user._id) ||
    !targetDir.user.equals(req.user._id) ||
    _.some(targetDir.subFiles, {
      _id: file._id
    })) {
    return next({
      message: 'not allowed'
    });
  }

  Directory.findByIdAndUpdate(targetDir._id, {
      $push: {
        subFiles: file._id
      }
    }, {
      new: true
    })
    .populate('subDirectories')
    .populate('subFiles')
    .populate('subFiles.fileObject')
    .exec(function(outerError, newTargetDir) {
      if (outerError) {
        return next(outerError);
      }
      Directory.findByIdAndUpdate(sourceDir._id, {
          $pull: {
            subFiles: file._id
          }
        }, {
          new: true
        })
        .populate('subDirectories')
        .populate('subFiles')
        .populate('subFiles.fileObject')
        .exec(function(err, newSourceDir) {
          if (err) {
            return next(err);
          }

          var ret = {};
          ret.source = populateParentToSubfiles(newSourceDir);
          ret.target = populateParentToSubfiles(newTargetDir);
          ret.file = populateParentToFile(file, req.targetDirectory);

          return res.status(200).json(ret);
        });
    });
};

exports.parentCheck = function(req, res, next) {
  var parent = req.parent.toObject();
  var file = req.file.toObject();
  if (_.some(parent.subFiles, {
      _id: file._id
    })) {
    return next();
  } else {
    return next({
      status: 'failure',
      message: 'parentCheck failed'
    });
  }
};

exports.fileByID = function(req, res, next, id) {
  File.findById(id)
    .populate('fileObject')
    .exec(function(err, file) {
      if (err) {
        return next(err);
      }
      if (!file) {
        return next({
          message: 'disk file specified does not exist'
        });
      }

      req.file = file;
      return next();
    });
};
