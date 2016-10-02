var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var deptSchema = new Schema({
    name: String,
    startDate : String,
    startTime: String,
    priority: String,
    message: String,
    interval: String,
    remark : String,
    stopAfter : String,
    receivers : [],
    performedBy : {type : mongoose.Schema.Types.ObjectId , ref : 'User'}
},{timestamps: true});

var blogBost = mongoose.model('Reminder', deptSchema);
module.exports = blogBost;