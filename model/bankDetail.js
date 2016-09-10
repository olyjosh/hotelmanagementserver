var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var bankDetailSchema = new Schema({
    accNo : String,
    bankName : String,
    accName : String,
    staff : {type : mongoose.Schema.Types.ObjectId , ref : 'User'}
});


var Post = mongoose.model('BankDetail', bankDetailSchema);

module.exports = Post;