var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var sch = new Schema({
  name: String,
  shortName: String,
},{timestamps: true});

var blogBost = mongoose.model('Department', sch);
module.exports = blogBost;