var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var deptSchema = new Schema({
  name: String,
  shortName: String,
},{timestamps: true});

var blogBost = mongoose.model('Department', deptSchema);
module.exports = blogBost;