var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var sch = new Schema({
    alias: String,
    compName: String,
    contPerson: String,
    city: String,
    phone: String,
    email: String,
    plan: String,
    planValue: String,
    performedBy: {type: mongoose.Schema.Types.ObjectId, ref: 'User'}
}, {timestamps: true});

var mod = mongoose.model('BusinessSource', sch);
module.exports = mod;