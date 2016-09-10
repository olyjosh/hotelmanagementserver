var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var floorSchema = new Schema({
  name: String,
  desc: String,
  noOfRooms : Number
},{timestamps: true});

var blogBost = mongoose.model('Floor', floorSchema);
module.exports = blogBost;