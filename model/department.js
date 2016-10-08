var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var sch = new Schema({
  name: String,
  shortName: String,
},{timestamps: true});

var mod = mongoose.model('Department', sch);
module.exports = mod;