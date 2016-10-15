var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var tranSchema = new Schema({
  desc: String,
  amount: Number,
  discount : Number,
  tax : Number,    // Should be 0 if it's just a payment on 
  total : Number,
  paid : Number, // the amount paid yet
  //balance : Number,  // projection will do this
  guest : {
      firstName : String,
      lastName : String ,
      phone : String,
  },
  performedBy: {type : mongoose.Schema.Types.ObjectId , ref : 'User'},
},{timestamps: true});

var mod = mongoose.model('Transaction', tranSchema);
module.exports = mod;