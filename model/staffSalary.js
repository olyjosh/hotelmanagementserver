var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var autoIncrement = require('mongoose-auto-increment');

var sch = new Schema({
  staffDept : String,
  staffName : String,
  month : String,
  date : Date,
  performedBy: {type : mongoose.Schema.Types.ObjectId , ref : 'User'}
},{timestamps: true});

sch.plugin(autoIncrement.plugin,'SatffSalary');
var mod = mongoose.model('SatffSalary', sch);
module.exports = mod;