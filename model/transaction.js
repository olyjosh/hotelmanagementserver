var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var autoIncrement = require('mongoose-auto-increment');

var sch = new Schema({
  desc : String,
  amount : Number,
  discount : Number,
  tax : Number,    // Should be 0 if it's just a payment on 
  total : Number,
  paid : Number,
  purchaseId : String,
  fors : String, // Can be laundry, Restaurant, Bar, Booking, othersales// the amount paid yet
  //balance : Number,  // projection will do this
  guestId : {type : mongoose.Schema.Types.ObjectId , ref : 'Guest'},
  guest : {
      name :{
        firstName : String,
        lastName : String 
     },
      phone : String,
  },
  performedBy: {type : mongoose.Schema.Types.ObjectId , ref : 'User'},
},{timestamps: true});

sch.plugin(autoIncrement.plugin,'Transaction');
var mod = mongoose.model('Transaction', sch);
module.exports = mod;