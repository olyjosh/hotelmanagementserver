var mongoose = require('mongoose');
require('./booking');
require('./facility');
var Schema = mongoose.Schema;
var autoIncrement = require('mongoose-auto-increment');
var sch = new Schema({
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
    discount : Number,
    //To be able to have coperate in thesame collection
    isCoperate : Boolean, 
    coperate : {
        alis: String,
        accountName : String,
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
//            accountNo : String,
            creditLimit : Number,
            openBalance : Number,
            paymentTerm : String
        },
        performedBy : {type : mongoose.Schema.Types.ObjectId , ref : 'User'},
    }

},{timestamps: true});

var handleE11000 = function(error, res, next) {
  if (error.name === 'MongoError' && error.code === 11000) {
      
    next(new Error('Email or Phone Already exist'));
    
    console.log(""+error);
  } else {
    next();
  }
};

sch.post('save', handleE11000);
//sch.post('update', handleE11000);
//sch.post('findOneAndUpdate', handleE11000);
//sch.post('insertMany', handleE11000);

sch.plugin(autoIncrement.plugin,'Guest');
var User = mongoose.model('Guest', sch);
module.exports = User;
