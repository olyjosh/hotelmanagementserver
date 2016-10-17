var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var MealSchema = new Schema({
    name : String,
    desc : String,
    img : String,
    price : Number,
    alcohol : Number,
    video : String, /* This is the link to the preparations video if any */
    article : String, /* can be website link*/ 
},{timestamps: true});

var mod = mongoose.model('Drink', MealSchema);
module.exports = mod;