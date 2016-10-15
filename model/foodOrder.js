var mongoose = require('mongoose');
var Schema = mongoose.Schema;
require('./meal');
var autoIncrement = require('mongoose-auto-increment');

var sch = new Schema({
    channel : String,
    guest : {
      firstName : String,
      lastName : String ,
      phone : String
    },
    orderId :{type: Number, default: 1, required: true},
    amount : Number,
    payment : {type: Boolean, default: false}, // represent paid or not
    balance : Number,    
    status : {type: Number, default: 0},// pending, cancel, preparing, done
    cancelBy : {type : mongoose.Schema.Types.ObjectId , ref : 'User'},    
    orders: [{
        price: Number,
        qty:Number,
        food: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Meal'
        }
    }]
    ,performedBy : {type : mongoose.Schema.Types.ObjectId , ref : 'User'}
},{timestamps: true});

//
//sch.methods.pay = function(amtPaid) {
//    this.payment = true;
//    this.balance -=amtPaid;
//};


sch.plugin(autoIncrement.plugin, { model: 'MealOrder', field: 'orderId' });
var mod = mongoose.model('MealOrder', sch);
module.exports = mod;