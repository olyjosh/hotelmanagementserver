var mongoose = require('mongoose');
var Schema = mongoose.Schema;
require('./user');

var schema = new Schema({
    staff : String,
    comment : String,
    performedBy : {type : mongoose.Schema.Types.ObjectId , ref : 'User'}
    
},{timestamps: true});

var mod = mongoose.model('StaffComments', schema);
module.exports = mod;