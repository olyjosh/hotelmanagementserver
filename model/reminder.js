var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var sch = new Schema({
    name: String,
    startTime: String,
    priority: String,
    message: String,
    interval: String,
    remark : String,
    stopAfter : String,
    receivers : [],
    performedBy : {type : mongoose.Schema.Types.ObjectId , ref : 'User'}
},{timestamps: true});

var mod = mongoose.model('Reminders', sch);
module.exports = mod;