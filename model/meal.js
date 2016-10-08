var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var MealSchema = new Schema({
    name : String,
    img : String,
    video : String, /* This is the link to the preparation video if any */
    article : { link: String, type : String /* can be website or just text*/ },
    nutriDetait : String
},{timestamps: true});

var mod = mongoose.model('Meal', MealSchema);
module.exports = mod;