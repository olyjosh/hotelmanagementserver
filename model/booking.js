var mongoose = require('mongoose');
var Schema = mongoose.Schema;
require('./facility'); // this the same as room model
require('./guest');

var bookingSchema = new Schema({
  status: String,// Can be reserved, booked,dueout,vacant,
  room : {type : mongoose.Schema.Types.ObjectId , ref : 'Facility'},
  channel : String /* any of mobile,online, web, frontDesk*/,
  performedBy : {type : mongoose.Schema.Types.ObjectId , ref : 'User'},
//  customer : {type : mongoose.Schema.Types.ObjectId , ref : 'User'}, // Useful for a sign up customers
  guestId : {type : mongoose.Schema.Types.ObjectId , ref : 'Guest'},
  guest : {
      firstName : String,
      lastName : String ,
      phone : String,
  }, // Now I'm using phone number as unique id
  checkIn : Date,
  checkOut : Date,
  arrival : Date,
  amount : Number,
  discount : Number,
  isCheckIn : Boolean,
  isCancel : { type: Boolean, default: false } ,
  payment : { 
      paid : Boolean, 
      amount : Number,
      type : String,/*Cash, Online, Mobile, Pos*/
      tax : Number,
      refId : Number,
      time : Date
  }
},{timestamps: true});


bookingSchema.plugin(autoIncrement.plugin,'Booking');
var mod = mongoose.model('Booking', bookingSchema);
module.exports = mod;