var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var autoIncrement = require('mongoose-auto-increment');

var sch = new Schema({
    vendor : String,
    category : String,
    itemName : String,
    qty : Number,
    free : String,
    discount : Number,
    mrp : String,
    rate : Number,
    performedBy: {type : mongoose.Schema.Types.ObjectId , ref : 'User'}
},{timestamps: true});

sch.plugin(autoIncrement.plugin,'InvItem');
var mod = mongoose.model('InvItem', sch);
module.exports = mod;