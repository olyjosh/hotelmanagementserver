var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var roomTypeSchema = new Schema({
  alias : String,  
  name: String,
  desc: String,
  rate: {
      rate : Number,
      adult : Number,
      child : Number,
      overBookingPercentage : Number
  },
  pax : {
      baseAdult : Number,
      baseChild : Number,
      maxAdult : Number,
      maxChild : Number
  },
  displayColor : String
},{timestamps: true});

var blogBost = mongoose.model('RoomType', roomTypeSchema);
module.exports = blogBost;