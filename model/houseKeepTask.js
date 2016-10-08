var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var sch = new Schema({
    date: Date,
    endDate : Date,
    desc: String,
    room: {type : mongoose.Schema.Types.ObjectId , ref : 'Facility'},
    interval : Number,
    reminder : Number, // hours or minutes before time 
    maids : [],//[{type : mongoose.Schema.Types.ObjectId , ref : 'User'}],
    performedBy : {type : mongoose.Schema.Types.ObjectId , ref : 'User'}
},{timestamps: true});

var mod = mongoose.model('HouseKeepTask', sch);
module.exports = mod;