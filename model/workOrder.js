var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var sch = new Schema({
    date: String,
    type: String,
    workOrderNo: String,
    priority: String,
    desc: String,
    assignedTo: String,
    residence: String,
    room: String,
    status: String,
    dueDate: String,
    remarks: String,
    performedBy: {type: mongoose.Schema.Types.ObjectId, ref: 'User'}
}, {timestamps: true});

var mod = mongoose.model('WorkOrder', sch);
module.exports = mod;