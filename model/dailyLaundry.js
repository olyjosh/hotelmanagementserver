var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var sch = new Schema({
    sn : Number,
    date : Date,
    item : String,
    user : String,
    status : String,
    laundryService : String,  // This should be the id of the laundry service
    hotelService : String, // This should be the id of the laundry service
    returnIn : String, // This should be the id of the laundry service
    returned : String,
    bill : Number,
    amonunt : Number,
    balance : Number,
    remark : String,
    performedBy : {type : mongoose.Schema.Types.ObjectId , ref : 'User'}
},{timestamps: true});

var mod = mongoose.model('DailyLaundry', sch);
module.exports = mod;