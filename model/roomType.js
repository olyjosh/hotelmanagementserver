var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var roomTypeSchema = new Schema({
  alias : String,  
  name: String,
  desc: String,
  rate: {
      cost : Number,
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
  displayColor : String,
  images: [String]
},{timestamps: true});

var mod = mongoose.model('RoomType', roomTypeSchema);
module.exports = mod;