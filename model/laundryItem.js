var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var sch = new Schema({
    alias: String,
    name: String,
    code: String,
    category: String,
    visibility: Boolean,
    itemImage: String,
    desc:String,
    performedBy : {type : mongoose.Schema.Types.ObjectId , ref : 'User'}
},{timestamps: true});

var blogBost = mongoose.model('LaundryItem', sch);
module.exports = blogBost;