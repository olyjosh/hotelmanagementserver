var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var floorSchema = new Schema({
  alias : String,  
  name: String,
  desc: String,
},{timestamps: true});

var mod = mongoose.model('Floor', floorSchema);
module.exports = mod;