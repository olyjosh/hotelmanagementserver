var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var sch = new Schema({
    channel : String,
    guest : {
      firstName : String,
      lastName : String ,
      phone : String,
      
    },
    orderId :{type: Number, default: 1, required: true},
    amount : Number,
    payment : Boolean, // represent paid or not
    status : String, // pending, cancel, preparing, done
    orders: [{
        price: Number,
        qty:Number,
        food: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Meal'
        }
    }]
//    orderBy : {type : mongoose.Schema.Types.ObjectId , ref : 'User'}
},{timestamps: true});

sch.plugin(autoIncrement.plugin, { model: 'MealOrder', field: 'orderId' });

var mod = mongoose.model('MealOrder', sch);
module.exports = mod;