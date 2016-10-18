var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var autoIncrement = require('mongoose-auto-increment');

var sch = new Schema({

  balance : {type: Number},
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

sch.plugin(autoIncrement.plugin,'Folio');
var mod = mongoose.model('Folio', sch);
module.exports = mod;