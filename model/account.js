var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var deptSchema = new Schema({
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
    website : String,
    rep :  {type : mongoose.Schema.Types.ObjectId , ref : 'User'},
    cred : {
        accountNo : String,
        creditLimit : String,
        openBalance : String,
        paymentTerm : String
    },
    performedBy : {type : mongoose.Schema.Types.ObjectId , ref : 'User'}
},{timestamps: true});

var blogBost = mongoose.model('Reminder', deptSchema);
module.exports = blogBost;