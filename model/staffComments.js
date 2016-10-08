var mongoose = require('mongoose');
var Schema = mongoose.Schema;
require('./user');

var schema = new Schema({
    Staff : {type : mongoose.Schema.Types.ObjectId , ref : 'User'},
    performedBy : {type : mongoose.Schema.Types.ObjectId , ref : 'User'},
    comment : String
},{timestamps: true});

var mod = mongoose.model('StaffComments', schema);
module.exports = mod;