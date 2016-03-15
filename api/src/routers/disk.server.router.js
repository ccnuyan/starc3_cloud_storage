var directory = require('../controllers/directories.server.controller');
var file = require('../controllers/files.server.controller');
var express = require('express');
var router = express.Router();

router.route('/root')
  .get(directory.root);

router.route('/dir/:parentId/subdir/')
  .post(directory.create);

router.route('/dir/:parentId/subdir/:directoryId').all(directory.parentCheck)
  .get(directory.read)
  .put(directory.update)
  .delete(directory.delete);

router.route('/dir/:parentId/subfile/:fileId').all(file.parentCheck)
  .get(file.read)
  .put(file.update)
  .delete(file.delete);

router.route('/dir/:parentId/subfile/')
  .post(file.create);

//return transaction
router.route('/request/upload/dir/:parentId/subfile/')
  .post(file.requestUpload);
//return transaction
router.route('/request/download/dir/:parentId/subfile/:fileId').all(file.parentCheck)
  .post(file.requestDownload);

router.route('/move/:fileId/from/:sourceDirectoryId/to/:targetDirectoryId')
  .put(file.move);

router.param('directoryId', directory.dirByID);
router.param('parentId', directory.parentByID);
router.param('sourceDirectoryId', directory.sourceByID);
router.param('targetDirectoryId', directory.targetByID);
router.param('fileId', file.fileByID);

module.exports = router;
