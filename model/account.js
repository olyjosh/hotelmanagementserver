var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var sch = new Schema({
    alis: String,
    accountName : String,
    accountType: String,
    firstName: String,
    lastName: String,
    address: {
        one : String,
        two : String
    },
    city : String,
    zip : String,
    state : String,
    country : String,
    email : String,
    phone : String,
    website : String,
    rep :  String,//{type : mongoose.Schema.Types.ObjectId , ref : 'User'},
    cred : {
        accountNo : String,
        creditLimit : Number,
        openBalance : Number,
        paymentTerm : String
    },
    performedBy : {type : mongoose.Schema.Types.ObjectId , ref : 'User'}
},{timestamps: true});

var mod = mongoose.model('Account', sch);
module.exports = mod;