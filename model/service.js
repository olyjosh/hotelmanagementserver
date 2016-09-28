var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var deptSchema = new Schema({
    alias: String,
    name: String,
    extraCharge: String,
    desc: String,
    image: String,
    service : String,
    performedBy : {type : mongoose.Schema.Types.ObjectId , ref : 'User'}
},{timestamps: true});

var blogBost = mongoose.model('Service', deptSchema);
module.exports = blogBost;