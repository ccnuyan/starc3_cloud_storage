var _ = require('lodash');
module.exports = {
  populateParentToFile: function(file, parent) {
    var fileObj = file.toObject();
    fileObj.parent = parent.id;
    return fileObj;
  },
  populateParentToSubfiles: function(directory) {
    var dirObj = directory.toObject();
    dirObj.subFiles = _.map(dirObj.subFiles, function(file) {
      file.parent = dirObj._id;
      return file;
    });
    return dirObj;
  }
};
