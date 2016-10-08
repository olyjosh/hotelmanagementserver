var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var tranSchema = new Schema({
  desc: String,
  type: String,
  performedBy: {type : mongoose.Schema.Types.ObjectId , ref : 'User'},
  performedOn : {type : mongoose.Schema.Types.ObjectId , ref : 'User'}
},{timestamps: true});

var mod = mongoose.model('Transaction', tranSchema);
module.exports = mod;