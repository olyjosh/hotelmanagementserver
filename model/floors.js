var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var floorSchema = new Schema({
  alias : String,  
  name: String,
  desc: String,
},{timestamps: true});

var blogBost = mongoose.model('Floor', floorSchema);
module.exports = blogBost;