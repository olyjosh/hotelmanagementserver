var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var MealSchema = new Schema({
    type : String,
    orderBy : {type : mongoose.Schema.Types.ObjectId , ref : 'User'}
},{timestamps: true});

var mod = mongoose.model('Meal', MealSchema);
module.exports = mod;