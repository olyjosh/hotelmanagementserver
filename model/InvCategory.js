var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var autoIncrement = require('mongoose-auto-increment');

var sch = new Schema({
    vendor : String,
    catName : String,
    performedBy: {type : mongoose.Schema.Types.ObjectId , ref : 'User'}
},{timestamps: true});

sch.plugin(autoIncrement.plugin,'InvCategory');
var mod = mongoose.model('InvCategory', sch);
module.exports = mod;