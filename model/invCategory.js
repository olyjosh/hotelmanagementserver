var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var autoIncrement = require('mongoose-auto-increment');

var sch = new Schema({
    compName : String,
    compPhone : String,
    compPhone : String,
    country : String,
    state : String,
    city : String,
    contactPerson : {
        name : String, 
        address : String,
        phone : String
    },
    bank : {
        name : String, 
        branch : String, 
        accountNo : String, 
        sortCode : String
    },
    performedBy: {type : mongoose.Schema.Types.ObjectId , ref : 'User'}
},{timestamps: true});

sch.plugin(autoIncrement.plugin,'Vendor');
var mod = mongoose.model('Vendor', sch);
module.exports = mod;