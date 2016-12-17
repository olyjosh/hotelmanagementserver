var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var sch = new Schema({
    alias : String,
    name : String,
    desc : String,
    from : Date,
    to : Date,
    data : [{
        product: String,
        id : String,
        price : {
           adult : Number,
           children : Number,
        },
        type : String  // This can be restaurant, BAr, laundry or room
    }],
    performedBy : {type : mongoose.Schema.Types.ObjectId , ref : 'User'}
},{timestamps: true});

var mod = mongoose.model('Season', sch);
module.exports = mod;