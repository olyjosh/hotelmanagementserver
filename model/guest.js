var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UserSchema = new Schema({
    name: {
        firstName: {type: String},
        lastName: {type: String},
    },
    email: {type: String, unique: true},
    phone: {type: String,required: true, unique: true},
    address: String,
    sex : String,
    dob : Date,
    country : String,
//    hash: String,
//    salt: String
},{timestamps: true});


var User = mongoose.model('Guest', UserSchema);
module.exports = User;
