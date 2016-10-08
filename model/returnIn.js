var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var sch = new Schema({
    alias: String,
    name: String,
    extraCharge: String,
    desc: String,
    image: String,
    performedBy : {type : mongoose.Schema.Types.ObjectId , ref : 'User'}
},{timestamps: true});

var mod = mongoose.model('ReturnIn', sch);
module.exports = mod;