var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var sch = new Schema({
    ref: {type : mongoose.Schema.Types.ObjectId , ref : 'User'},
    title : String,
    firstName: String,
    lastName: String,
    gender: String,
    contact: {
        mobile: String,
        workPhone: String,
        residence: String,
        email: String,
        address: String,
        city: String,
        state: String,
        zip: String,
        country: String
    },
    remarks : String,
    performedBy : {type : mongoose.Schema.Types.ObjectId , ref : 'User'}
},{timestamps: true});

var blogBost = mongoose.model('Phone', sch);
module.exports = blogBost;