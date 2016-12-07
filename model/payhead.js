var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var autoIncrement = require('mongoose-auto-increment');

var sch = new Schema({
  payName : String,
  payDesc : String,
  payType : Boolean,
  performedBy: {type : mongoose.Schema.Types.ObjectId , ref : 'User'}
},{timestamps: true});

sch.plugin(autoIncrement.plugin,'PayHead');
var mod = mongoose.model('PayHead', sch);
module.exports = mod;