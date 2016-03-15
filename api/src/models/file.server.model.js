var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

var FileSchema = new Schema({
  name: {
    type: String
  },
  created: {
    type: Date,
    default: Date.now
  },
  user: {
    type: Schema.ObjectId,
    ref: 'User',
    required: true
  },
  fileObject: {
    type: Schema.ObjectId,
    ref: 'FileObject'
  }
});

FileSchema.path('name').validate(function(value) {
  if (!value) return false;

  var lengthCheck = value.length <= 128 && value.length >= 1;
  if (!lengthCheck) return false;

  return true;
}, 'Invalid name');

module.exports = function() {
  mongoose.model('File', FileSchema);
};
