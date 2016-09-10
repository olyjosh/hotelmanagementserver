var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var facilitySchema = new Schema({
  facility: String,
  roomNumber: Number,
  roomStatus : { 
      state : String /* Can be any of dirty, disOrder, clean*/, 
      bookedStatus : String /* booked, reserved, checkedIn, checkedOut none*/
  }
},{timestamps: true});

var blogBost = mongoose.model('Facility', facilitySchema);
module.exports = blogBost;