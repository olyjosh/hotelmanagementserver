var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var deptSchema = new Schema({
    alias: String,
    name: String,
    extraCharge: String,
    desc: String,
    image: String,
    performedBy : {type : mongoose.Schema.Types.ObjectId , ref : 'User'}
},{timestamps: true});

var blogBost = mongoose.model('ReturnIn', deptSchema);
module.exports = blogBost;