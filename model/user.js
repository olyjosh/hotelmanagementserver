var crypto = require('crypto');
var jwt = require('jsonwebtoken');

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var autoIncrement = require('mongoose-auto-increment');


var UserSchema = new Schema({
    name: {
        firstName: {type: String},
        lastName: {type: String},
        username: {type: String}
    }
    ,
    email: {type: String, required: [true, 'email is required'], unique:[ true, 'email already exist']},
    phone: {type: String,required: [true, 'phone is required'], unique:[ true, 'phone already exist']},
    staff : {
        isStaff : Boolean, 
        staffId : Number,
        privilege : String,
//        depart : String,
    },
    sex : String,
    dob : Date,
    country : String,
    hash: String,
    salt: String
},{timestamps: true});

UserSchema.methods.setPassword = function(password){
  this.salt = crypto.randomBytes(16).toString('hex');
  this.hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64).toString('hex');
};

UserSchema.methods.validPassword = function(password) {
  var hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64).toString('hex');
  return this.hash === hash;
};

UserSchema.methods.generateJWT = function() {
  var expiry = new Date();
  expiry.setDate(expiry.getDate() + 7);

  return jwt.sign({
    _id: this._id,
    email: this.email,
    name: this.name,
    exp: parseInt(expiry.getTime() / 1000),
  }, "JOSH_SECRET"); // DO NOT KEEP YOUR SECRET IN THE CODE!
};


UserSchema.plugin(autoIncrement.plugin, { model: 'User', field: 'staffId' });
var User = mongoose.model('User', UserSchema);
module.exports = User;
