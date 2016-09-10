var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var bookingSchema = new Schema({
  status: String,
  room : {type : mongoose.Schema.Types.ObjectId , ref : 'Facility'},
  customer : {type : mongoose.Schema.Types.ObjectId , ref : 'User'},
  channel : String /* any of online, web, frontDesk*/,
  performedBy : {type : mongoose.Schema.Types.ObjectId , ref : 'User'},
  amount : Number,
  discount : Number,
  tax : Number,
  payment : { 
      paid : Boolean, 
      amount : Number,
      type : String,/*Cash, online, Mobile, Pos*/
      tax : Number,
      refId : Number,
      time : Date
  }
},{timestamps: true});

var blogBost = mongoose.model('Booking', bookingSchema);
module.exports = blogBost;