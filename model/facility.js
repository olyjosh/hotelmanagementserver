
var mongoose = require('mongoose');
var k = require('./const');
var Schema = mongoose.Schema;
require('./floors');
require('./roomType');



var facilitySchema = new Schema({
  alias : {type: String, required: true, unique: true},
  name: {type: String, required: true},
  desc: String,
  roomType : {type : mongoose.Schema.Types.ObjectId , ref : 'RoomType'},
  floor : {type : mongoose.Schema.Types.ObjectId , ref : 'Floor'},
  roomStatus : { 
      state : { type: String, default: k.RM_GOOD }  /* Can be any of dirty, disOrder, ok*/, 
      bookedStatus : { type: String, default: k.RM_VACANT } /* booked, reserved, checkedIn, vacant,dueOut*/
  }
},{timestamps: true});


var mod = mongoose.model('Facility', facilitySchema);
//var Friend = mongoose.Model('RoomType', roomType);
module.exports = mod;