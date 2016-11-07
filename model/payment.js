var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var autoIncrement = require('mongoose-auto-increment');

var sch = new Schema({
  amount : { type: Number, required : true},
  desc : String,
  channel : String,
  refNo : String,  // Can be Pos number or Bank transfer Id
  payFor : String,
  orderId : String,
  dept : Number,
  guestId : {type : mongoose.Schema.Types.ObjectId , ref : 'Guest'},
  guest : {
      name :{
        firstName : String,
        lastName : String 
     },
      phone : String
  },
  performedBy: {type : mongoose.Schema.Types.ObjectId , ref : 'User'}
},{timestamps: true});

sch.plugin(autoIncrement.plugin,'Payment');
var mod = mongoose.model('Payment', sch);
module.exports = mod;