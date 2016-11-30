var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var autoIncrement = require('mongoose-auto-increment');

var sch = new Schema({
  dept : String,
  staffName: String,
  payHead : {type: mongoose.Schema.Types.ObjectId, ref: 'PayHead'},
  unit : String,
  type : String,

  performedBy: {type : mongoose.Schema.Types.ObjectId , ref : 'User'}
},{timestamps: true});

sch.plugin(autoIncrement.plugin,'Salary');
var mod = mongoose.model('Salary', sch);
module.exports = mod;